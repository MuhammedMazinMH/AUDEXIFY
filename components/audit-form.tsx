'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowUp, ImageIcon, Loader2, RotateCcw, Search } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AuditResults } from './audit-results'
import { cn } from '@/lib/utils'
import type { AuditResult } from '@/types/audit'

const STAGES = [
  'Validating URL…',
  'Loading page in headless browser…',
  'Running axe-core rules…',
  'Assessing severity with trained ML model…',
  'Generating AI explanations…',
]

export function AuditForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [stageIndex, setStageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AuditResult | null>(null)
  const stageTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading || !url.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    setStageIndex(0)
    stageTimer.current = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1))
    }, 6000)

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'The audit failed unexpectedly.')
      } else {
        setResult(data as AuditResult)
      }
    } catch {
      setError('Could not reach the audit service. Please try again.')
    } finally {
      if (stageTimer.current) clearInterval(stageTimer.current)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="audit-url" className="sr-only">
          Website URL to audit
        </label>
        <Input
          id="audit-url"
          type="text"
          inputMode="url"
          placeholder="example.com or https://example.com/page"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="h-11 flex-1"
          required
        />
        <Button type="submit" disabled={loading || !url.trim()} className="h-11 px-6">
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="size-4" aria-hidden="true" />
          )}
          {loading ? 'Auditing…' : 'Run audit'}
        </Button>
      </form>

      {loading && (
        <div
          className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-10 text-center"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm font-medium">{STAGES[stageIndex]}</p>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            A real browser is loading the page and running the full deterministic axe-core rule
            set; findings are then classified and explained. Complex pages can take up to a minute.
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Audit failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <>
          <AuditResults result={result} />
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Done reviewing this report?</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2 bg-transparent"
                onClick={() => {
                  setResult(null)
                  setUrl('')
                  setError(null)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Run another audit
              </Button>
              <Link
                href="/screenshot"
                className={cn(buttonVariants({ variant: 'outline' }), 'gap-2 bg-transparent')}
              >
                <ImageIcon className="size-4" aria-hidden="true" />
                Analyze a screenshot
              </Link>
              <Button
                type="button"
                variant="ghost"
                className="gap-2"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <ArrowUp className="size-4" aria-hidden="true" />
                Back to top
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
