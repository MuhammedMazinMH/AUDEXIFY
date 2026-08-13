export type Severity = 'critical' | 'serious' | 'moderate' | 'minor'

export type DetectionSource = 'deterministic' | 'ml' | 'hybrid'

export interface WcagReference {
  criterion: string
  name: string
  level: 'A' | 'AA' | 'AAA'
}

export interface IssueNode {
  /** CSS selector targeting the offending element */
  target: string
  /** Truncated outer HTML snippet of the element */
  html: string
  /** axe failure summary for this node, when available */
  failureSummary?: string
}

export interface AuditIssue {
  id: string
  ruleId: string
  name: string
  description: string
  severity: Severity
  source: DetectionSource
  wcag: WcagReference[]
  nodes: IssueNode[]
  /** Confidence score in [0, 1]. 1 for deterministic findings. */
  confidence: number
  /**
   * Severity assessment from the trained DistilBERT model. Present only
   * when the real ONNX model ran — never populated by heuristics.
   */
  ml?: {
    model: string
    /** Model-predicted severity (may differ from the deterministic severity above) */
    predictedSeverity: Severity
    score: number
  }
  /** LLM-generated explanation. Present only after enrichment. */
  explanation?: IssueExplanation
}

export interface IssueExplanation {
  title: string
  summary: string
  whyItMatters: string
  affectedUsers: string
  recommendedFix: string
  codeExample: string
  /** Always equals the deterministic severity — the LLM may not change it */
  priority: Severity
  /** WCAG criteria echoed from the finding; validated against the input, never invented */
  wcagReferences: string[]
  /** Marks this content as AI-generated for UI transparency labels */
  aiGenerated: true
}

export interface SeverityCounts {
  critical: number
  serious: number
  moderate: number
  minor: number
}

export interface AuditScore {
  /** Overall score in [0, 100] */
  overall: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  severityCounts: SeverityCounts
  passedRules: number
  failedRules: number
}

export interface AuditSummary {
  headline: string
  overview: string
  topPriorities: string[]
  aiGenerated: true
}

export interface AuditResult {
  url: string
  finalUrl: string
  pageTitle: string
  fetchedAt: string
  durationMs: number
  score: AuditScore
  issues: AuditIssue[]
  summary?: AuditSummary
  engine: {
    axeVersion: string
    /** Structured status of the trained NLP severity model */
    nlp: {
      available: boolean
      model: string | null
      /** Reason the model is unavailable, when available is false */
      reason: string | null
    }
    llmModel: string | null
  }
}
