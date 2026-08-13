import 'server-only'

/**
 * LLM configuration for AUDEXIFY.
 *
 * Models are served through the Vercel AI Gateway, pinned to Groq as the
 * inference provider. The primary model handles all structured-output
 * generation; the gateway automatically falls back to the secondary model
 * when the primary is unavailable.
 */

export const PRIMARY_MODEL = process.env.AUDEXIFY_LLM_MODEL ?? 'openai/gpt-oss-120b'
export const FALLBACK_MODEL = process.env.AUDEXIFY_LLM_FALLBACK_MODEL ?? 'openai/gpt-oss-20b'

/** providerOptions passed to every AI SDK call */
export const GATEWAY_OPTIONS = {
  gateway: {
    /** Pin inference to Groq */
    only: ['groq'],
    /** Fall back to the smaller model if the primary is unavailable */
    models: [FALLBACK_MODEL],
  },
}
