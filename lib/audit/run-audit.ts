import 'server-only'
import type { AuditResult } from '@/types/audit'
import { validateAuditUrl } from '@/lib/security/url-guard'
import { openPage } from './browser'
import { runAxe } from './axe'
import { normalizeAxeViolations, sortIssues } from './normalize'
import { calculateScore } from './score'
import { classifyFindingSeverity, getNlpModelStatus } from '@/lib/ml/nlp'
import { summarizeAudit, explainIssue } from '@/lib/ai/explain'

/**
 * Full audit pipeline:
 * 1. Validate URL (SSRF guard)
 * 2. Load the page in a headless browser
 * 3. Run axe-core (deterministic detection)
 * 4. Classify each finding's severity with the trained DistilBERT model.
 *    STRICT: if the real model is unavailable, no ML metadata is attached
 *    and engine.nlp reports the structured reason — heuristics never run.
 * 5. Compute deterministic score from axe findings
 * 6. LLM enrichment: executive summary + explanations for top issues
 */

const EXPLAIN_TOP_N = 5

export async function runAudit(rawUrl: string): Promise<AuditResult> {
  const started = Date.now()
  const { url } = await validateAuditUrl(rawUrl)

  const session = await openPage(url.toString())
  try {
    const axeOutput = await runAxe(session.page)
    const finalUrl = session.page.url()
    const pageTitle = await session.page.title()
    await session.close()

    const issues = sortIssues(normalizeAxeViolations(axeOutput.violations))
    const score = calculateScore(issues, axeOutput.passes.length)

    // Real DistilBERT severity classification — never heuristic.
    const nlpStatus = await getNlpModelStatus()
    if (nlpStatus.available) {
      for (const issue of issues) {
        try {
          const prediction = await classifyFindingSeverity(
            `Accessibility finding. ${issue.description}`,
          )
          issue.ml = {
            model: prediction.model,
            predictedSeverity: prediction.severity,
            score: prediction.score,
          }
          issue.source = 'hybrid'
        } catch (error) {
          // A per-issue inference failure is logged but never substituted.
          console.error(`[audexify] NLP inference failed for ${issue.ruleId}:`, error)
        }
      }
    }

    const result: AuditResult = {
      url: url.toString(),
      finalUrl,
      pageTitle,
      fetchedAt: new Date(started).toISOString(),
      durationMs: 0,
      score,
      issues,
      engine: {
        axeVersion: axeOutput.testEngine.version,
        nlp: {
          available: nlpStatus.available,
          model: nlpStatus.available ? 'audexify-distilbert-severity-int8' : null,
          reason: nlpStatus.reason,
        },
        llmModel: null,
      },
    }

    // LLM enrichment — non-fatal: the audit stands on its own if the LLM fails.
    // Calls run sequentially to stay within gateway rate limits; each issue
    // explanation is independently best-effort.
    try {
      const summaryOut = await summarizeAudit({ url: result.url, pageTitle, score, issues })
      result.summary = summaryOut.summary
      result.engine.llmModel = summaryOut.model
    } catch (error) {
      console.error('[audexify] LLM summary failed; returning unenriched audit:', error)
    }

    for (const issue of issues.slice(0, EXPLAIN_TOP_N)) {
      try {
        const { explanation } = await explainIssue(issue)
        issue.explanation = explanation
      } catch (error) {
        console.error(`[audexify] LLM explanation failed for ${issue.ruleId}:`, error)
        break // rate-limited or unavailable — stop making further calls
      }
    }

    result.durationMs = Date.now() - started
    return result
  } finally {
    await session.close()
  }
}
