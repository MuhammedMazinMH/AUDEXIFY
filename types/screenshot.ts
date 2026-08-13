import type { Severity } from './audit'
import type { VisionClassification } from './ml'

export interface ScreenshotFinding {
  id: string
  title: string
  severity: Severity
  region: string
  observation: string
  recommendation: string
  aiGenerated: true
}

export interface ScreenshotAnalysisResult {
  analyzedAt: string
  durationMs: number
  vision: VisionClassification[]
  findings: ScreenshotFinding[]
  overallAssessment: string
  engine: {
    visionModel: string
    llmModel: string | null
  }
}
