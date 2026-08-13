import type { AuditIssue, AuditScore, SeverityCounts } from '@/types/audit'

/**
 * Deterministic scoring model.
 *
 * Starts at 100 and deducts weighted penalties per issue, scaled by how
 * many elements each issue affects (with diminishing returns so a single
 * repeated template bug does not zero the score).
 */

const SEVERITY_WEIGHT = { critical: 12, serious: 7, moderate: 3, minor: 1 } as const

export function calculateScore(issues: AuditIssue[], passedRules: number): AuditScore {
  const severityCounts: SeverityCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 }

  let penalty = 0
  for (const issue of issues) {
    severityCounts[issue.severity] += 1
    const nodeFactor = 1 + Math.log2(Math.max(issue.nodes.length, 1))
    // ML findings are weighted by their confidence
    const confidenceFactor = issue.source === 'ml' ? issue.confidence : 1
    penalty += SEVERITY_WEIGHT[issue.severity] * nodeFactor * confidenceFactor
  }

  const overall = Math.max(0, Math.round(100 - penalty))

  const grade: AuditScore['grade'] =
    overall >= 90 ? 'A' : overall >= 75 ? 'B' : overall >= 60 ? 'C' : overall >= 40 ? 'D' : 'F'

  return {
    overall,
    grade,
    severityCounts,
    passedRules,
    failedRules: issues.length,
  }
}
