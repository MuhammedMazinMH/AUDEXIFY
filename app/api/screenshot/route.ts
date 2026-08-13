import { NextResponse } from 'next/server'
import { analyzeScreenshot, ScreenshotValidationError } from '@/lib/audit/analyze-screenshot'
import { ModelUnavailableError } from '@/lib/ml/errors'

export const maxDuration = 120
export const dynamic = 'force-dynamic'

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data with an "image" file.' }, { status: 400 })
  }

  const file = formData.get('image')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'An "image" file field is required.' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Only PNG, JPEG, and WebP images are supported.' }, { status: 415 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be 8 MB or smaller.' }, { status: 413 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await analyzeScreenshot(buffer)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ScreenshotValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }
    if (error instanceof ModelUnavailableError) {
      return NextResponse.json(
        {
          error:
            'ML classification is unavailable: the trained vision model is not deployed on this server.',
          code: error.code,
          model: { id: error.modelId, path: error.modelPath, reason: error.reason },
        },
        { status: 503 },
      )
    }
    console.error('[audexify] Screenshot analysis failed:', error)
    return NextResponse.json({ error: 'The screenshot could not be analyzed.' }, { status: 500 })
  }
}
