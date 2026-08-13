import 'server-only'
import type { AuditIssue, Severity, WcagReference } from '@/types/audit'
import { getRuleKnowledge } from './knowledge'
import type { RawAxeViolation } from './axe'

/**
 * Normalizes raw axe violations into the unified AuditIssue shape consumed
 * by the scorer, the ML severity classifier, the LLM enricher, and the UI.
 */

const AXE_TAG_TO_WCAG: Record<string, WcagReference> = {
  'wcag111': { criterion: '1.1.1', name: 'Non-text Content', level: 'A' },
  'wcag131': { criterion: '1.3.1', name: 'Info and Relationships', level: 'A' },
  'wcag141': { criterion: '1.4.1', name: 'Use of Color', level: 'A' },
  'wcag143': { criterion: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
  'wcag1410': { criterion: '1.4.10', name: 'Reflow', level: 'AA' },
  'wcag1412': { criterion: '1.4.12', name: 'Text Spacing', level: 'AA' },
  'wcag211': { criterion: '2.1.1', name: 'Keyboard', level: 'A' },
  'wcag241': { criterion: '2.4.1', name: 'Bypass Blocks', level: 'A' },
  'wcag242': { criterion: '2.4.2', name: 'Page Titled', level: 'A' },
  'wcag244': { criterion: '2.4.4', name: 'Link Purpose (In Context)', level: 'A' },
  'wcag246': { criterion: '2.4.6', name: 'Headings and Labels', level: 'AA' },
  'wcag247': { criterion: '2.4.7', name: 'Focus Visible', level: 'AA' },
  'wcag258': { criterion: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
  'wcag311': { criterion: '3.1.1', name: 'Language of Page', level: 'A' },
  'wcag312': { criterion: '3.1.2', name: 'Language of Parts', level: 'AA' },
  'wcag332': { criterion: '3.3.2', name: 'Labels or Instructions', level: 'A' },
  'wcag412': { criterion: '4.1.2', name: 'Name, Role, Value', level: 'A' },
}

function wcagFromTags(tags: string[]): WcagReference[] {
  return tags
    .map((t) => AXE_TAG_TO_WCAG[t])
    .filter((ref): ref is WcagReference => Boolean(ref))
}

export function normalizeAxeViolations(violations: RawAxeViolation[]): AuditIssue[] {
  return violations.map((v, index) => {
    const knowledge = getRuleKnowledge(v.id)
    return {
      id: `axe-${v.id}-${index}`,
      ruleId: v.id,
      name: knowledge?.name ?? v.help,
      description: knowledge?.description ?? v.description,
      severity: (v.impact ?? 'moderate') as Severity,
      source: 'deterministic',
      wcag: knowledge?.wcag?.length ? knowledge.wcag : wcagFromTags(v.tags),
      nodes: v.nodes.map((n) => ({
        target: n.target.join(' '),
        html: n.html,
        failureSummary: n.failureSummary,
      })),
      confidence: 1,
    }
  })
}

export function severityRank(severity: Severity): number {
  return { critical: 4, serious: 3, moderate: 2, minor: 1 }[severity]
}

export function sortIssues(issues: AuditIssue[]): AuditIssue[] {
  return [...issues].sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.nodes.length - a.nodes.length)
}
