import 'server-only'
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import type { ModelStatus, NlpSeverityClassification } from '@/types/ml'
import { NLP_CLASS_LABELS } from '@/types/ml'
import { ModelUnavailableError } from './errors'
import { WordPieceTokenizer } from './tokenizer'

/**
 * Audexify NLP severity classifier.
 *
 * Runs the trained DistilBERT INT8 sequence-classification model
 * (model_int8.onnx, label map 0=critical, 1=minor, 2=moderate, 3=serious)
 * locally with onnxruntime-node.
 *
 * STRICT CONTRACT: if the model file or its tokenizer vocab is missing or
 * fails to load, classification throws ModelUnavailableError. There is NO
 * heuristic fallback — callers must surface "ML classification unavailable"
 * to the user instead of substituting fake predictions.
 */

const MODEL_PATH =
  process.env.NLP_MODEL_PATH ?? path.join(process.cwd(), 'models', 'nlp', 'model_int8.onnx')
const VOCAB_PATH = process.env.NLP_VOCAB_PATH ?? path.join(path.dirname(MODEL_PATH), 'vocab.txt')
const MODEL_NAME = 'audexify-distilbert-severity-int8'

type Loaded = {
  ort: typeof import('onnxruntime-node')
  session: import('onnxruntime-node').InferenceSession
  tokenizer: WordPieceTokenizer
}

let loadPromise: Promise<Loaded> | null = null

function loadSession(): Promise<Loaded> {
  if (!loadPromise) {
    loadPromise = (async () => {
      if (!existsSync(MODEL_PATH)) {
        throw new ModelUnavailableError('nlp', MODEL_PATH, 'model file not found')
      }
      const tokenizer = WordPieceTokenizer.tryLoad(VOCAB_PATH)
      if (!tokenizer) {
        throw new ModelUnavailableError('nlp', MODEL_PATH, `tokenizer vocab not found at ${VOCAB_PATH}`)
      }
      try {
        const ort = await import('onnxruntime-node')
        const session = await ort.InferenceSession.create(MODEL_PATH)
        return { ort, session, tokenizer }
      } catch (error) {
        throw new ModelUnavailableError(
          'nlp',
          MODEL_PATH,
          `ONNX session failed to load: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    })()
    // Allow retry on a later call if the load failed
    loadPromise.catch(() => {
      loadPromise = null
    })
  }
  return loadPromise
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits)
  const exps = logits.map((l) => Math.exp(l - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / sum)
}

/**
 * Classifies the severity of an accessibility finding using the trained
 * DistilBERT model. Throws ModelUnavailableError when the real model
 * cannot be used — never returns a heuristic prediction.
 */
export async function classifyFindingSeverity(text: string): Promise<NlpSeverityClassification> {
  const { ort, session, tokenizer } = await loadSession()

  const { inputIds, attentionMask } = tokenizer.encode(text)
  const seqLen = inputIds.length

  const feeds: Record<string, import('onnxruntime-node').Tensor> = {
    input_ids: new ort.Tensor('int64', BigInt64Array.from(inputIds), [1, seqLen]),
    attention_mask: new ort.Tensor('int64', BigInt64Array.from(attentionMask), [1, seqLen]),
  }

  const results = await session.run(feeds)
  const outputName = session.outputNames[0]
  const logits = Array.from(results[outputName].data as Float32Array)
  const probs = softmax(logits.slice(0, NLP_CLASS_LABELS.length))
  const classIndex = probs.indexOf(Math.max(...probs))

  return {
    severity: NLP_CLASS_LABELS[classIndex],
    classIndex,
    score: probs[classIndex],
    model: MODEL_NAME,
    modelPath: MODEL_PATH,
  }
}

/** Structured availability report — never throws. */
export async function getNlpModelStatus(): Promise<ModelStatus> {
  const base: ModelStatus = {
    id: 'nlp',
    available: false,
    modelPath: MODEL_PATH,
    sizeBytes: existsSync(MODEL_PATH) ? statSync(MODEL_PATH).size : null,
    reason: null,
  }
  try {
    await loadSession()
    return { ...base, available: true }
  } catch (error) {
    return {
      ...base,
      reason: error instanceof ModelUnavailableError ? error.reason : String(error),
    }
  }
}
