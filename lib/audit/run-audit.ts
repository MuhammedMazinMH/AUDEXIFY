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
/** Concurrent local ONNX severity inferences (CPU-bound, no rate limits). */
const NLP_CONCURRENCY = 4
/** Concurrent LLM enrichment calls (bounded to stay friendly to the gateway). */
const LLM_CONCURRENCY = 3

/**
 * Runs the given task thunks with a bounded number in flight at once.
 * Replaces sequential await-in-loop so independent work overlaps.
 */
async function runWithConcurrency(tasks: Array<() => Promise<void>>, limit: number): Promise<void> {
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (cursor < tasks.length) {
      const index = cursor++
      await tasks[index]()
    }
  })
  await Promise.all(workers)
}

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
    // Inferences run concurrently (bounded) since each finding is independent.
    const nlpStatus = await getNlpModelStatus()
    if (nlpStatus.available) {
      await runWithConcurrency(
        issues.map((issue) => async () => {
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
        }),
        NLP_CONCURRENCY,
      )
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
    // The summary and each top-issue explanation are independent, so they run
    // concurrently (bounded) instead of in a sequential chain. Each task is
    // self-contained and best-effort; a failure never aborts the others.
    const enrichmentTasks: Array<() => Promise<void>> = [
      async () => {
        try {
          const summaryOut = await summarizeAudit({ url: result.url, pageTitle, score, issues })
          result.summary = summaryOut.summary
          result.engine.llmModel = summaryOut.model
        } catch (error) {
          console.error('[audexify] LLM summary failed; returning unenriched audit:', error)
        }
      },
      ...issues.slice(0, EXPLAIN_TOP_N).map((issue) => async () => {
        try {
          const { explanation, model } = await explainIssue(issue)
          issue.explanation = explanation
          result.engine.llmModel ??= model
        } catch (error) {
          console.error(`[audexify] LLM explanation failed for ${issue.ruleId}:`, error)
        }
      }),
    ]
    await runWithConcurrency(enrichmentTasks, LLM_CONCURRENCY)

    result.durationMs = Date.now() - started
    return result
  } finally {
    await session.close()
  }
}
