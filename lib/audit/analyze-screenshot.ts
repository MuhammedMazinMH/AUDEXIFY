import 'server-only'
import sharp, { type Metadata, type Region } from 'sharp'
import type { ScreenshotAnalysisResult, ScreenshotFinding } from '@/types/screenshot'
import { classifyImage } from '@/lib/ml/vision'
import { explainScreenshot } from '@/lib/ai/explain'

/**
 * Screenshot analysis pipeline:
 * 1. Validate + decode the uploaded image with sharp
 * 2. Classify the full image and quadrants with the trained EfficientNet-B0
 *    ONNX model. STRICT: if the model is unavailable, classifyImage throws
 *    ModelUnavailableError, which propagates to the API route — heuristics
 *    never run and the UI states that ML classification is unavailable.
 * 3. LLM enrichment: interpret classifier output as review items (best-effort)
 */

const MAX_DIMENSION = 4096

export class ScreenshotValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ScreenshotValidationError'
  }
}

export async function analyzeScreenshot(imageBuffer: Buffer): Promise<ScreenshotAnalysisResult> {
  const started = Date.now()

  let meta: Metadata
  try {
    meta = await sharp(imageBuffer).metadata()
  } catch {
    throw new ScreenshotValidationError('The uploaded file is not a valid image.')
  }
  if (!meta.width || !meta.height) {
    throw new ScreenshotValidationError('Could not read image dimensions.')
  }
  if (meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION) {
    throw new ScreenshotValidationError(`Image dimensions must be at most ${MAX_DIMENSION}px.`)
  }

  // Classify the whole screenshot plus quadrants for regional signal.
  // ModelUnavailableError from classifyImage propagates intentionally.
  const half = { w: Math.floor(meta.width / 2), h: Math.floor(meta.height / 2) }
  const regions = [
    { name: 'full image', extract: null as null | Region },
    { name: 'top-left', extract: { left: 0, top: 0, width: half.w, height: half.h } },
    { name: 'top-right', extract: { left: half.w, top: 0, width: half.w, height: half.h } },
    { name: 'bottom-left', extract: { left: 0, top: half.h, width: half.w, height: half.h } },
    { name: 'bottom-right', extract: { left: half.w, top: half.h, width: half.w, height: half.h } },
  ]

  const classifications = await Promise.all(
    regions.map(async (region) => {
      const buffer = region.extract
        ? await sharp(imageBuffer).extract(region.extract).png().toBuffer()
        : imageBuffer
      return { region: region.name, classification: await classifyImage(buffer) }
    }),
  )

  const stats = await sharp(imageBuffer).greyscale().stats()
  const contrastSpread = stats.channels[0].stdev / 255

  const primary = classifications[0].classification

  const result: ScreenshotAnalysisResult = {
    analyzedAt: new Date(started).toISOString(),
    durationMs: 0,
    vision: classifications.map((c) => c.classification),
    findings: [],
    overallAssessment: '',
    engine: {
      visionModel: primary.model,
      llmModel: null,
    },
  }

  try {
    const { analysis, model } = await explainScreenshot({
      classification: primary,
      imageStats: { width: meta.width, height: meta.height, contrastSpread },
    })
    result.overallAssessment = analysis.overallAssessment
    result.findings = analysis.findings.map(
      (f, i): ScreenshotFinding => ({
        id: `ss-${i}`,
        title: f.title,
        severity: f.severity,
        region: f.region,
        observation: f.observation,
        recommendation: f.recommendation,
        aiGenerated: true,
      }),
    )
    result.engine.llmModel = model
  } catch (error) {
    console.error('[audexify] Screenshot LLM enrichment failed:', error)
    const rateLimited = /rate.?limit|429/i.test(
      (error as { message?: string })?.message ?? String(error),
    )
    result.overallAssessment = rateLimited
      ? `The vision classifier identified this screenshot as "${primary.label}" with ${Math.round(primary.score * 100)}% confidence. The AI explanation was skipped because the AI Gateway free-tier rate limit was hit — add AI Gateway credits (or an AI_GATEWAY_API_KEY) and re-run for the full narrative.`
      : `The vision classifier identified this screenshot as "${primary.label}" with ${Math.round(primary.score * 100)}% confidence. AI explanation is temporarily unavailable; review the classification directly.`
  }

  result.durationMs = Date.now() - started
  return result
}
