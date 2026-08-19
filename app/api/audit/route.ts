import { NextResponse } from 'next/server'
import { z } from 'zod'
import { runAudit } from '@/lib/audit/run-audit'
import { UrlValidationError } from '@/lib/security/url-guard'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const requestSchema = z.object({
  url: z.string().min(1).max(2048),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be JSON.' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'A "url" string is required.' }, { status: 400 })
  }

  try {
    const result = await runAudit(parsed.data.url)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof UrlValidationError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 422 })
    }
    console.error('[audexify] Audit failed:', error)
    const message =
      error instanceof Error && /timeout/i.test(error.message)
        ? 'The page took too long to load. Try again or audit a different page.'
        : 'The audit could not be completed. The page may be unreachable or blocking automated browsers.'
    // Sanitized diagnostic: error class + first line of the message, with
    // absolute filesystem paths stripped. No stack traces are exposed.
    const detail =
      error instanceof Error
        ? `${error.constructor.name}: ${error.message.split('\n')[0].replace(/\/[\w./-]+/g, '[path]').slice(0, 200)}`
        : String(error).slice(0, 200)
    return NextResponse.json({ error: message, detail }, { status: 502 })
  }
}
