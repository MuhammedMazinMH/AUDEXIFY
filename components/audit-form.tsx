'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowUp,
  CheckCircle2,
  Edit3,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Terminal,
  XCircle,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuditResults } from './audit-results'
import { cn } from '@/lib/utils'
import type { AuditResult } from '@/types/audit'

const AUDIT_STAGES = [
  { id: '1', label: 'CONNECTING', detail: 'Validating host scheme, DNS resolution, and SSRF restrictions' },
  { id: '2', label: 'LOADING PAGE', detail: 'Launching Chromium in isolated sandbox and capturing DOM tree' },
  { id: '3', label: 'INSPECTING DOM', detail: 'Parsing accessibility tree, ARIA attributes, and computed styles' },
  { id: '4', label: 'RUNNING WCAG RULES', detail: 'Evaluating full deterministic WCAG 2.2 criteria via axe-core' },
  { id: '5', label: 'CLASSIFYING FINDINGS', detail: 'Running DistilBERT sequence model for severity impact analysis' },
  { id: '6', label: 'GENERATING REPORT', detail: 'Synthesizing plain-language remediation protocols' },
]

export function AuditForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [stageIndex, setStageIndex] = useState(0)
  const [rulesCount, setRulesCount] = useState(0)
  const [progressPct, setProgressPct] = useState(12)
  const [sessionId, setSessionId] = useState('8A9B-42F1')
  const [error, setError] = useState<{ message: string; code?: string; targetUrl: string } | null>(null)
  const [result, setResult] = useState<AuditResult | null>(null)

  const stageTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const rulesTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (stageTimer.current) clearInterval(stageTimer.current)
      if (progressTimer.current) clearInterval(progressTimer.current)
      if (rulesTimer.current) clearInterval(rulesTimer.current)
    }
  }, [])

  async function executeAudit(targetUrl: string) {
    if (!targetUrl.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    setStageIndex(0)
    setRulesCount(0)
    setProgressPct(8)
    setSessionId(Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase())

    abortControllerRef.current = new AbortController()

    // Stage progression
    stageTimer.current = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, AUDIT_STAGES.length - 1))
    }, 4000)

    // Progress percentage interpolation
    progressTimer.current = setInterval(() => {
      setProgressPct((p) => Math.min(p + Math.floor(Math.random() * 6) + 3, 94))
    }, 600)

    // Rules evaluated counter
    rulesTimer.current = setInterval(() => {
      setRulesCount((r) => Math.min(r + Math.floor(Math.random() * 5) + 2, 78))
    }, 350)

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl.trim() }),
        signal: abortControllerRef.current.signal,
      })
      const data = await response.json()
      if (!response.ok) {
        setError({
          message: data.error ?? 'Unable to analyze the target website. Check the URL and try again.',
          code: data.code ?? 'ERR_CONNECTION_REFUSED',
          targetUrl: targetUrl.trim(),
        })
      } else {
        setProgressPct(100)
        setResult(data as AuditResult)
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        setError({
          message: 'The audit was aborted by user.',
          code: 'AUDIT_ABORTED',
          targetUrl: targetUrl.trim(),
        })
      } else {
        setError({
          message: 'Unable to analyze the target website. Check the URL and try again.',
          code: 'ERR_CONNECTION_REFUSED',
          targetUrl: targetUrl.trim(),
        })
      }
    } finally {
      if (stageTimer.current) clearInterval(stageTimer.current)
      if (progressTimer.current) clearInterval(progressTimer.current)
      if (rulesTimer.current) clearInterval(rulesTimer.current)
      setLoading(false)
    }
  }

  function handleAbort() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setLoading(false)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading || !url.trim()) return
    executeAudit(url)
  }

  function handleEditUrl() {
    setError(null)
    setResult(null)
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 50)
  }

  function handleRetry() {
    if (error?.targetUrl) {
      executeAudit(error.targetUrl)
    } else if (url.trim()) {
      executeAudit(url)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Command Center URL Input Bar */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row items-stretch">
        <label htmlFor="audit-url" className="sr-only">
          Website URL to audit
        </label>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            <Terminal className="size-4 text-primary" aria-hidden="true" />
          </div>
          <Input
            ref={inputRef}
            id="audit-url"
            type="text"
            inputMode="url"
            placeholder="Enter public target (e.g. example.com or https://site.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="h-12 pl-10 pr-4 font-mono text-sm bg-[#0D100E] border-border text-foreground focus-visible:border-primary focus-visible:ring-primary/40 rounded-sm"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !url.trim()}
          className="h-12 px-8 font-mono text-xs uppercase tracking-wider transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Analyzing…</span>
            </>
          ) : (
            <>
              <Search className="size-4" aria-hidden="true" />
              <span>Run Audit →</span>
            </>
          )}
        </Button>
      </form>

      {/* Cinematic "SYSTEM AUDIT INITIATED" Instrument View (Matches Reference 3) */}
      {loading && (
        <div
          className="relative overflow-hidden rounded-sm border border-border bg-[#0D100E] p-6 md:p-10 shadow-[0_0_30px_-10px_rgba(199,243,107,0.15)] animate-rise flex flex-col gap-8 min-h-[420px]"
          role="status"
          aria-live="polite"
        >
          {/* Subtle Horizontal Scanline Grid */}
          <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-30" />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-primary/20 shadow-[0_0_8px_rgba(199,243,107,0.4)]" />

          {/* Top Status Bar */}
          <div className="flex items-center justify-between border-b border-border pb-4 z-10">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                SYSTEM AUDIT INITIATED
              </h2>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                TARGET: <span className="text-primary font-semibold">{url}</span>
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 text-primary">
                <span className="size-2 rounded-full bg-primary animate-ping" />
                <span className="font-bold tracking-wider uppercase">ANALYZING STATE</span>
              </div>
              <span className="text-muted-foreground">SESSION: {sessionId}</span>
            </div>
          </div>

          {/* 3-Column Instrument HUD (Stages Left, Circular Progress Center, Telemetry Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-8 py-4 z-10">
            {/* Left Column: Stages Sequence */}
            <div className="flex flex-col gap-4">
              {AUDIT_STAGES.slice(0, 3).map((stg, idx) => {
                const isCurrent = stageIndex === idx
                const isDone = stageIndex > idx

                return (
                  <div key={stg.id} className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex size-5 items-center justify-center rounded-full text-[10px] font-mono transition-colors',
                        isCurrent
                          ? 'bg-primary text-primary-foreground font-bold animate-pulse'
                          : isDone
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground/40',
                      )}
                    >
                      {isDone ? '✓' : stg.id}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          'font-mono text-xs uppercase tracking-wider',
                          isCurrent ? 'text-primary font-bold' : isDone ? 'text-foreground' : 'text-muted-foreground/50',
                        )}
                      >
                        STAGE {stg.id} // {stg.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {stg.detail}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Center Column: Big Glowing Circular Progress with Cardinal Pips */}
            <div className="flex justify-center items-center">
              <div className="relative size-56 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg viewBox="0 0 160 160" className="size-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    fill="none"
                    strokeWidth="3"
                    className="stroke-muted/40"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    fill="none"
                    strokeWidth="3.5"
                    strokeDasharray={`${(progressPct / 100) * 402} 402`}
                    strokeLinecap="round"
                    className="stroke-primary drop-shadow-[0_0_12px_rgba(199,243,107,0.5)] transition-all duration-300"
                  />
                </svg>

                {/* Cardinal Telemetry Pips */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 size-2 rounded-full bg-primary" />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 size-2 rounded-full bg-primary" />
                <div className="absolute left-1 top-1/2 -translate-y-1/2 size-2 rounded-full bg-primary" />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 size-2 rounded-full bg-primary" />

                {/* Inner Square Telemetry Box */}
                <div className="absolute size-36 rounded-xs border border-border bg-[#08090B] flex flex-col items-center justify-center p-4 shadow-xl text-center">
                  <span className="font-display text-3xl font-extrabold text-foreground tabular-nums">
                    {progressPct}%
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
                    PROCESSING
                  </span>
                  <div className="flex items-center gap-1 mt-2 text-primary font-mono text-[10px]">
                    <span className="size-1.5 rounded-full bg-primary animate-ping" />
                    <span>@ DOM ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Telemetry Tiles */}
            <div className="flex flex-col gap-3">
              <div className="rounded-xs border border-border bg-surface-elevated p-3 flex flex-col gap-0.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  ENGINE
                </span>
                <span className="font-mono text-xs font-bold text-foreground flex items-center justify-between">
                  <span>AXE-CORE RUNNING</span>
                  <span className="text-primary animate-spin">⚙</span>
                </span>
              </div>

              <div className="rounded-xs border border-border bg-surface-elevated p-3 flex flex-col gap-0.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  STANDARD
                </span>
                <span className="font-mono text-xs font-bold text-foreground">
                  WCAG 2.2 RUNNING
                </span>
              </div>

              <div className="rounded-xs border border-border bg-surface-elevated p-3 flex flex-col gap-0.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  RULES PROCESSED
                </span>
                <span className="font-display text-lg font-bold text-primary tabular-nums">
                  {rulesCount} <span className="text-xs text-muted-foreground font-mono">/ 78</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Toolbar Bar */}
          <div className="flex items-center justify-between border-t border-border pt-4 z-10 font-mono text-[11px]">
            <div className="flex items-center gap-6 text-muted-foreground">
              <span>FINDINGS: <span className="text-primary font-semibold">ANALYZING…</span></span>
              <span>SCORE: <span className="text-primary font-semibold">CALCULATING…</span></span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAbort}
              className="text-xs font-mono border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <XCircle className="size-3.5 mr-1" />
              <span>Abort Audit</span>
            </Button>
          </div>
        </div>
      )}

      {/* Cinematic Failure State (Matches Reference 4) */}
      {error && !loading && (
        <div
          className="relative rounded-sm border border-destructive/50 bg-[#0D100E] p-8 md:p-12 animate-rise flex flex-col items-center text-center gap-6 shadow-[0_0_30px_-6px_rgba(255,107,107,0.25)] animate-pulse-error"
          role="alert"
        >
          {/* Geometric Triangle Warning Bracket */}
          <div className="relative flex size-14 items-center justify-center rounded-sm border border-destructive/60 bg-destructive/10 text-destructive">
            <AlertTriangle className="size-7" aria-hidden="true" />
            <div className="absolute top-0.5 left-0.5 size-1.5 border-t border-l border-destructive" />
            <div className="absolute top-0.5 right-0.5 size-1.5 border-t border-r border-destructive" />
            <div className="absolute bottom-0.5 left-0.5 size-1.5 border-b border-l border-destructive" />
            <div className="absolute bottom-0.5 right-0.5 size-1.5 border-b border-r border-destructive" />
          </div>

          <div className="flex flex-col gap-2 max-w-lg">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-destructive">
              {error.code || 'ERR_CONNECTION_REFUSED'}
            </span>
            <h3 className="font-display text-3xl font-extrabold text-foreground tracking-tight">
              AUDIT FAILED
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
              {error.message}
            </p>
          </div>

          {/* Target URL Pill */}
          <div className="rounded-xs border border-border bg-[#08090B] px-4 py-2 font-mono text-xs text-muted-foreground max-w-xl truncate">
            <span className="size-1.5 inline-block rounded-full bg-destructive mr-2" />
            <span>TARGET_URL: </span>
            <span className="text-foreground font-semibold">{error.targetUrl}</span>
          </div>

          {/* Action Recovery Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              onClick={handleRetry}
              className="gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              <span>Retry Audit</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleEditUrl}
              className="gap-2 font-mono text-xs uppercase tracking-wider"
            >
              <Edit3 className="size-3.5" aria-hidden="true" />
              <span>Edit Target URL</span>
            </Button>
            <Link
              href="/screenshot"
              className={cn(buttonVariants({ variant: 'ghost' }), 'gap-2 font-mono text-xs')}
            >
              <ImageIcon className="size-3.5" aria-hidden="true" />
              <span>Try Screenshot Mode</span>
            </Link>
          </div>
        </div>
      )}

      {/* Audit Results Dashboard */}
      {result && !loading && (
        <>
          <AuditResults result={result} />

          {/* Post-Audit Actions Bar */}
          <div className="flex flex-col gap-4 rounded-sm border border-border bg-[#0D100E] p-5 sm:flex-row sm:items-center sm:justify-between animate-rise">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Audit Complete for {result.finalUrl}
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setResult(null)
                  setUrl('')
                  setError(null)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                <span>New Audit</span>
              </Button>
              <Link
                href="/screenshot"
                className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
              >
                <ImageIcon className="size-3.5" aria-hidden="true" />
                <span>Screenshot Mode</span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                className="gap-1.5"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <ArrowUp className="size-3.5" aria-hidden="true" />
                <span>Top</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
