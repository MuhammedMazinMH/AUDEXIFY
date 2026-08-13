import type { Severity } from './audit'

/**
 * Label maps for the trained Audexify models. The index positions MUST
 * match the training label mapping exactly — do not reorder.
 */

/** DistilBERT INT8 severity classifier: 0=critical, 1=minor, 2=moderate, 3=serious */
export const NLP_CLASS_LABELS: readonly Severity[] = ['critical', 'minor', 'moderate', 'serious']

/** EfficientNet-B0 screenshot classifier: 0=dense_layout, 1=low_contrast, 2=normal, 3=small_text */
export const VISION_CLASS_LABELS = ['dense_layout', 'low_contrast', 'normal', 'small_text'] as const
export type VisionLabel = (typeof VISION_CLASS_LABELS)[number]

export interface NlpSeverityClassification {
  /** Predicted severity from the trained DistilBERT model */
  severity: Severity
  /** Raw argmax class index (0=critical, 1=minor, 2=moderate, 3=serious) */
  classIndex: number
  /** Softmax probability of the predicted class, in [0, 1] */
  score: number
  /** Model identifier */
  model: string
  /** Absolute path of the ONNX file that produced this prediction */
  modelPath: string
}

export interface VisionClassification {
  label: VisionLabel
  /** Raw argmax class index (0=dense_layout, 1=low_contrast, 2=normal, 3=small_text) */
  classIndex: number
  score: number
  model: string
  modelPath: string
}

/** Structured availability report for a production model. */
export interface ModelStatus {
  id: 'nlp' | 'vision'
  available: boolean
  modelPath: string
  sizeBytes: number | null
  /** Human-readable reason when available is false */
  reason: string | null
}
