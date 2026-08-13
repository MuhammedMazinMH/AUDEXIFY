'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowUp, ImageUp, Loader2, RotateCcw, Search } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SeverityBadge } from './severity-badge'
import { SourceBadge } from './source-badge'
import type { ScreenshotAnalysisResult } from '@/types/screenshot'

const MAX_BYTES = 8 * 1024 * 1024

export function ScreenshotForm() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScreenshotAnalysisResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(selected: File | null) {
    setError(null)
    setResult(null)
    if (!selected) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(selected.type)) {
      setError('Only PNG, JPEG, and WebP images are supported.')
      return
    }
    if (selected.size > MAX_BYTES) {
      setError('Image must be 8 MB or smaller.')
      return
    }
    setFile(selected)
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old)
      return URL.createObjectURL(selected)
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await fetch('/api/screenshot', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) {
        if (data.code === 'ML_MODEL_UNAVAILABLE') {
          setError(
            'ML classification is unavailable: the trained vision model is not deployed on this server. No heuristic analysis was substituted.',
          )
        } else {
          setError(data.error ?? 'Analysis failed unexpectedly.')
        }
      } else {
        setResult(data as ScreenshotAnalysisResult)
      }
    } catch {
      setError('Could not reach the analysis service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handleFile(e.dataTransfer.files[0] ?? null)
          }}
          className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-card p-6 text-center transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Upload a screenshot for analysis"
        >
          {previewUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={previewUrl || "/placeholder.svg"}
              alt={`Preview of selected screenshot: ${file?.name ?? 'uploaded image'}`}
              className="max-h-60 rounded-md border border-border object-contain"
            />
          ) : (
            <>
              <ImageUp className="size-8 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">Drop a screenshot here or click to browse</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPEG, or WebP up to 8 MB</p>
              </div>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          tabIndex={-1}
          aria-hidden="true"
        />
        <Button type="submit" disabled={!file || loading} className="h-11 self-start px-6">
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {loading ? 'Analyzing…' : 'Analyze screenshot'}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Analysis failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-lg">Vision classification</CardTitle>
              <SourceBadge kind="ml" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ul className="flex flex-col gap-2">
                {result.vision.map((v, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm"
                  >
                    <span className="capitalize">
                      {i === 0 ? 'Full image' : ['Top-left', 'Top-right', 'Bottom-left', 'Bottom-right'][i - 1]}
                      {': '}
                      <span className="font-medium">{v.label.replace(/_/g, ' ')}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {Math.round(v.score * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Model: {result.engine.visionModel} · analyzed in {(result.durationMs / 1000).toFixed(1)}s
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-lg">AI interpretation</CardTitle>
              <SourceBadge kind="ai" />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed">{result.overallAssessment}</p>
              {result.findings.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {result.findings.map((finding) => (
                    <li key={finding.id} className="rounded-lg border border-border bg-muted/40 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={finding.severity} />
                        <h3 className="text-sm font-semibold">{finding.title}</h3>
                        <span className="ml-auto text-xs text-muted-foreground">{finding.region}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {finding.observation}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed">
                        <strong>Recommendation:</strong> {finding.recommendation}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-foreground">
                These are items for manual review, not confirmed violations. Screenshot analysis
                cannot inspect the DOM, so pair it with a full site audit.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Done reviewing this analysis?</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2 bg-transparent"
                onClick={() => {
                  setResult(null)
                  setFile(null)
                  setError(null)
                  setPreviewUrl((old) => {
                    if (old) URL.revokeObjectURL(old)
                    return null
                  })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Analyze another
              </Button>
              <Link
                href="/audit"
                className={cn(buttonVariants({ variant: 'outline' }), 'gap-2 bg-transparent')}
              >
                <Search className="size-4" aria-hidden="true" />
                Run a full site audit
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
        </div>
      )}
    </div>
  )
}
