import 'server-only'
import { generateObject } from 'ai'
import { PRIMARY_MODEL, FALLBACK_MODEL, GATEWAY_OPTIONS } from './model'
import { explanationSchema, summarySchema, screenshotAnalysisSchema } from './schemas'
import type { AuditIssue, AuditScore, AuditSummary, IssueExplanation } from '@/types/audit'
import type { VisionClassification } from '@/types/ml'
import { getRuleKnowledge } from '@/lib/audit/knowledge'
import type { z } from 'zod'

/**
 * LLM explanation layer.
 *
 * The LLM NEVER detects issues. It receives deterministic findings
 * (axe-core + custom ML classifiers) and produces structured, grounded
 * explanations via generateObject. Every output is marked aiGenerated.
 */

const SYSTEM_PROMPT = `You are the explanation layer of AUDEXIFY, an accessibility intelligence platform.
You receive structured, deterministic audit findings produced by axe-core and custom ML classifiers.
Your ONLY job is to explain those findings clearly for developers and product teams.

Rules:
- Never invent issues that are not in the provided findings.
- Never change severities, counts, or rule IDs.
- Ground explanations in the WCAG criteria referenced by the finding.
- Be specific and actionable, referencing the provided HTML snippets when available.
- Use plain, professional language with no hype.`

/** True when an error is a gateway free-tier rate limit (HTTP 429). */
function isRateLimit(error: unknown): boolean {
  const e = error as { statusCode?: number; lastError?: { statusCode?: number }; message?: string }
  return (
    e?.statusCode === 429 ||
    e?.lastError?.statusCode === 429 ||
    /rate.?limit/i.test(e?.message ?? '')
  )
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function generateGrounded<T>(
  schema: z.ZodType<T>,
  prompt: string,
): Promise<{ object: T; model: string }> {
  const run = async (model: string): Promise<T> => {
    const { object } = await generateObject({
      model,
      system: SYSTEM_PROMPT,
      prompt,
      schema: schema as z.ZodType<Record<string, unknown>>,
      temperature: 0.2,
      // Disable the SDK's own fast internal retries; we manage spacing below
      // so free-tier per-minute limits have time to replenish.
      maxRetries: 0,
      providerOptions: GATEWAY_OPTIONS,
    })
    return schema.parse(object)
  }

  // Try primary then fallback model; on a 429 rate limit, retry once with a
  // short backoff. Kept deliberately snappy: the deterministic audit + ML
  // results are already complete, so a stalled explanation should fail fast
  // rather than block the whole response for tens of seconds.
  const models = [PRIMARY_MODEL, FALLBACK_MODEL]
  const backoffMs = [0, 1500]
  let lastError: unknown

  for (const model of models) {
    for (const wait of backoffMs) {
      if (wait > 0) await sleep(wait)
      try {
        return { object: await run(model), model }
      } catch (error) {
        lastError = error
        if (!isRateLimit(error)) break // non-quota error: move to next model
        console.warn(`[audexify] ${model} rate-limited; backing off before retry.`)
      }
    }
  }
  throw lastError
}

/** Generates a grounded explanation for a single audit issue. */
export async function explainIssue(
  issue: AuditIssue,
): Promise<{ explanation: IssueExplanation; model: string }> {
  const knowledge = getRuleKnowledge(issue.ruleId)
  const sampleNode = issue.nodes[0]

  const prompt = `Explain this accessibility finding.

Finding (deterministic - do not alter):
- Rule ID: ${issue.ruleId}
- Name: ${issue.name}
- Severity: ${issue.severity} (your "priority" field MUST equal exactly this value)
- Detection source: ${issue.source}${issue.ml ? ` (trained ML model "${issue.ml.model}" independently assessed severity as "${issue.ml.predictedSeverity}" with ${Math.round(issue.ml.score * 100)}% confidence)` : ''}
- Description: ${issue.description}
- WCAG criteria (the ONLY references you may cite): ${issue.wcag.map((w) => `${w.criterion} ${w.name} (Level ${w.level})`).join('; ') || 'none mapped — return an empty wcagReferences array'}
- Elements affected: ${issue.nodes.length}
- Example element HTML: ${sampleNode?.html ?? 'n/a'}
- Example selector: ${sampleNode?.target ?? 'n/a'}
- Failure detail: ${sampleNode?.failureSummary ?? 'n/a'}

${knowledge ? `Knowledge base entry (verified reference material):\n${JSON.stringify(knowledge)}` : 'No knowledge base entry exists for this rule.'}

Produce the structured explanation.`

  const { object, model } = await generateGrounded(explanationSchema, prompt)

  // Grounding enforcement — the LLM may not alter the deterministic finding:
  // priority is forced back to the detected severity, and WCAG references
  // are filtered to the criteria actually present in the finding.
  const allowedCriteria = new Set(issue.wcag.map((w) => w.criterion))
  const explanation: IssueExplanation = {
    ...object,
    priority: issue.severity,
    wcagReferences: object.wcagReferences.filter((ref) =>
      [...allowedCriteria].some((c) => ref.includes(c)),
    ),
    aiGenerated: true,
  }
  return { explanation, model }
}

/** Generates an executive summary for a completed audit. */
export async function summarizeAudit(input: {
  url: string
  pageTitle: string
  score: AuditScore
  issues: AuditIssue[]
}): Promise<{ summary: AuditSummary; model: string }> {
  const topIssues = input.issues.slice(0, 8).map((i) => ({
    ruleId: i.ruleId,
    name: i.name,
    severity: i.severity,
    source: i.source,
    elementsAffected: i.nodes.length,
    wcag: i.wcag.map((w) => w.criterion),
  }))

  const prompt = `Summarize this accessibility audit for a product team.

Audit results (deterministic - do not alter):
- URL: ${input.url}
- Page title: ${input.pageTitle}
- Score: ${input.score.overall}/100 (grade ${input.score.grade})
- Severity counts: ${JSON.stringify(input.score.severityCounts)}
- Passed rules: ${input.score.passedRules}, failed rules: ${input.score.failedRules}
- Top issues: ${JSON.stringify(topIssues)}

Produce the structured summary with the most impactful priorities first.`

  const { object, model } = await generateGrounded(summarySchema, prompt)
  return { summary: { ...object, aiGenerated: true }, model }
}

export type ScreenshotAnalysis = z.infer<typeof screenshotAnalysisSchema>

/**
 * Explains the output of the custom vision classifier for a screenshot.
 * The LLM does not see the image; it interprets the classifier output
 * plus computed image statistics.
 */
export async function explainScreenshot(input: {
  classification: VisionClassification
  imageStats: { width: number; height: number; contrastSpread: number }
}): Promise<{ analysis: ScreenshotAnalysis; model: string }> {
  const prompt = `A custom vision classifier (EfficientNet-based, NOT you) analyzed a UI screenshot. You have NOT seen the image. Interpret the classifier output for an accessibility review.

Classifier output (deterministic - do not alter):
- Predicted class: ${input.classification.label} (class index ${input.classification.classIndex}; possible classes: dense_layout, low_contrast, normal, small_text)
- Confidence: ${Math.round(input.classification.score * 100)}%
- Model: ${input.classification.model}

Computed image statistics:
- Dimensions: ${input.imageStats.width}x${input.imageStats.height}
- Greyscale contrast spread (stdev/255): ${input.imageStats.contrastSpread.toFixed(3)}

Explain what this classification suggests about the UI's visual accessibility, what likely triggered it, and what the team should verify manually. Phrase findings as items for manual review, not confirmed violations.`

  const { object, model } = await generateGrounded(screenshotAnalysisSchema, prompt)
  return { analysis: object, model }
}
