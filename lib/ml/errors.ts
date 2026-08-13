/**
 * Structured error thrown when a required production ML model is missing
 * or fails to load. Production code paths MUST surface this to the caller
 * instead of silently substituting heuristic predictions.
 */
export class ModelUnavailableError extends Error {
  readonly code = 'ML_MODEL_UNAVAILABLE' as const

  constructor(
    public readonly modelId: 'nlp' | 'vision',
    public readonly modelPath: string,
    public readonly reason: string,
  ) {
    super(`${modelId} model unavailable at ${modelPath}: ${reason}`)
    this.name = 'ModelUnavailableError'
  }
}
