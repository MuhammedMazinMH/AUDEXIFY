/**
 * Typed accessor for the static accessibility rule knowledge base.
 * The knowledge base is grounding information for the LLM and the UI —
 * WCAG mappings in it are verified; missing mappings are left empty.
 */

import rulesJson from '@/data/accessibility-rules.json'
import type { WcagReference } from '@/types/audit'

export interface RuleKnowledge {
  ruleId: string
  name: string
  description: string
  whyItMatters: string
  wcag: WcagReference[]
  impact: string
  commonCauses: string[]
  recommendedFix: string
  codeExample: string
  developerGuidance: string
}

const rules = rulesJson as Record<string, RuleKnowledge>

export function getRuleKnowledge(ruleId: string): RuleKnowledge | null {
  return rules[ruleId] ?? null
}

export function getAllRuleIds(): string[] {
  return Object.keys(rules)
}
