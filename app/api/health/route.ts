import { NextResponse } from 'next/server'
import { getNlpModelStatus } from '@/lib/ml/nlp'
import { getVisionModelStatus } from '@/lib/ml/vision'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [nlp, vision] = await Promise.all([getNlpModelStatus(), getVisionModelStatus()])

  return NextResponse.json({
    status: 'ok',
    ml: {
      nlp,
      vision,
      policy:
        'Strict: if a trained model is missing or fails to load, ML classification is reported unavailable. Heuristic predictions are never substituted.',
    },
    llm: {
      transport: 'vercel-ai-gateway',
      primaryModel: 'openai/gpt-oss-120b',
      fallbackModel: 'openai/gpt-oss-20b',
    },
  })
}
