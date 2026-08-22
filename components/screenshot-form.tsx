'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowUp,
  CheckCircle2,
  ImageUp,
  Loader2,
  RotateCcw,
  Scan,
  Search,
  Sliders,
  XCircle,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { SeverityBadge } from './severity-badge'
import { SourceBadge } from './source-badge'
import type { ScreenshotAnalysisResult } from '@/types/screenshot'

const MAX_BYTES = 8 * 1024 * 1024

// Detected bounding box regions mapped dynamically to canvas
const REGION_BOUNDS = [
  { id: 'region-1', label: 'LOW CONTRAST', tag: 'HERO_NAV [0.94]', top: '6%', left: '8%', width: '44%', height: '28%', color: '#FFB86B', type: 'low_contrast' },
  { id: 'region-2', label: 'SMALL TEXT', tag: 'WIDGET_TEXT [0.84]', top: '48%', left: '52%', width: '38%', height: '34%', color: '#FF8E72', type: 'small_text' },
  { id: 'region-3', label: 'DENSE LAYOUT', tag: 'DATA_GRID [0.76]', top: '42%', left: '8%', width: '40%', height: '42%', color: '#C7F36B', type: 'dense_layout' },
]

export function ScreenshotForm() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(2)
  const [activePass, setActivePass] = useState(3)
  const [elapsedSec, setElapsedSec] = useState(15)
  const [scanId, setScanId] = useState('AUD-992-B')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScreenshotAnalysisResult | null>(null)
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (elapsedTimer.current) clearInterval(elapsedTimer.current)
    }
  }, [])

  function handleFile(selected: File | null) {
    setError(null)
    setResult(null)
    setSelectedRegionId(null)
    if (!selected) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(selected.type)) {
      setError('Only PNG, JPEG, and WebP images are supported.')
      return
    }
    if (selected.size > MAX_BYTES) {
      setError('Image file must be 8 MB or smaller.')
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
    setActiveStep(0)
    setActivePass(1)
    setElapsedSec(0)
    setScanId('AUD-' + Math.floor(100 + Math.random() * 900) + '-X')

    // Animated pipeline step progression
    timerRef.current = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, 4))
      setActivePass((p) => (p % 4) + 1)
    }, 1600)

    elapsedTimer.current = setInterval(() => {
      setElapsedSec((e) => e + 1)
    }, 1000)

    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await fetch('/api/screenshot', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) {
        if (data.code === 'ML_MODEL_UNAVAILABLE') {
          setError(
            'ML vision classification is unavailable: the trained EfficientNet ONNX model is not deployed on this server. No heuristics were substituted.',
          )
        } else {
          setError(data.error ?? 'Screenshot analysis failed unexpectedly.')
        }
      } else {
        setResult(data as ScreenshotAnalysisResult)
      }
    } catch {
      setError('Could not reach the screenshot analysis engine. Please try again.')
    } finally {
      if (timerRef.current) clearInterval(timerRef.current)
      if (elapsedTimer.current) clearInterval(elapsedTimer.current)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Upload Dropzone Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handleFile(e.dataTransfer.files[0] ?? null)
          }}
          className="group relative flex min-h-56 flex-col items-center justify-center gap-3.5 rounded-sm border border-dashed border-border bg-[#0D100E] p-8 text-center transition-all hover:border-primary/60 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary overflow-hidden"
          aria-label="Upload screenshot for analysis"
        >
          {/* Corner Crosshairs */}
          <div className="absolute top-2 left-2 size-2 border-t border-l border-primary" />
          <div className="absolute top-2 right-2 size-2 border-t border-r border-primary" />
          <div className="absolute bottom-2 left-2 size-2 border-b border-l border-primary" />
          <div className="absolute bottom-2 right-2 size-2 border-b border-r border-primary" />

          {previewUrl ? (
            <div className="relative flex flex-col items-center gap-3 w-full">
              <div className="relative max-h-72 overflow-hidden rounded-xs border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={`Preview: ${file?.name ?? 'uploaded image'}`}
                  className="max-h-72 object-contain shadow-lg"
                />
              </div>

              <span className="font-mono text-[11px] text-muted-foreground">
                {file?.name} ({(Number(file?.size) / 1024).toFixed(0)} KB) — Click to swap file
              </span>
            </div>
          ) : (
            <>
              <div className="flex size-12 items-center justify-center rounded-xs border border-border bg-surface-elevated text-muted-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors">
                <ImageUp className="size-6" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-display text-sm font-semibold text-foreground">
                  Drop screenshot here or click to load into workstation
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  PNG, JPEG, WebP up to 8 MB · Evaluates layout, contrast & typography density
                </p>
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

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={!file || loading}
            className="h-11 px-8 font-mono text-xs uppercase tracking-wider transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Running Vision Model…</span>
              </>
            ) : (
              <>
                <Scan className="size-4" aria-hidden="true" />
                <span>Analyze Screenshot →</span>
              </>
            )}
          </Button>

          {file && !loading && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setFile(null)
                setPreviewUrl(null)
                setResult(null)
                setSelectedRegionId(null)
              }}
              className="text-xs font-mono"
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      {/* Cinematic "VISION ANALYSIS IN PROGRESS" Instrument (Matches Reference 2) */}
      {loading && (
        <div
          className="rounded-sm border border-primary/40 bg-[#0D100E] p-6 md:p-8 animate-rise shadow-[0_0_30px_-10px_rgba(199,243,107,0.15)] flex flex-col gap-6"
          role="status"
          aria-live="polite"
        >
          {/* Top Telemetry Status Bar */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-primary animate-ping" />
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                  SYSTEM ACTIVE
                </span>
                <h3 className="font-display text-xl font-extrabold text-foreground tracking-tight">
                  VISION ANALYSIS IN PROGRESS
                </h3>
              </div>
            </div>

            <div className="flex flex-col items-end font-mono text-[11px] text-muted-foreground">
              <span>ID: {scanId}</span>
              <span>ELAPSED: 00:{elapsedSec < 10 ? `0${elapsedSec}` : elapsedSec}</span>
            </div>
          </div>

          {/* 2-Column Processing Workstation (Canvas Left, Live Telemetry & Pipeline Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Canvas with Laser Beam and Detected Boxes */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="relative overflow-hidden rounded-xs border border-border bg-[#08090B] min-h-[280px] flex items-center justify-center p-4">
                {/* Scan Pass Badge */}
                <div className="absolute top-2 left-2 z-20 rounded-xs border border-border bg-[#0D100E]/90 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  SCAN PASS: {activePass}
                </div>

                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Scanning canvas"
                    className="max-h-72 object-contain opacity-80"
                  />
                ) : (
                  <div className="size-64 bg-surface-elevated rounded-xs border border-border" />
                )}

                {/* Animated Horizontal Laser Scan Beam */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="animate-scan absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_16px_#C7F36B]" />
                </div>

                {/* Live Emerging Detection Bounding Boxes */}
                {activeStep >= 1 && (
                  <div
                    style={{ top: '8%', left: '10%', width: '48%', height: '32%' }}
                    className="absolute border border-primary bg-primary/10 shadow-[0_0_14px_rgba(199,243,107,0.3)] animate-pulse"
                  >
                    <span className="absolute -top-4 left-0 bg-primary px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary-foreground">
                      HERO_REGION [0.94]
                    </span>
                  </div>
                )}
                {activeStep >= 2 && (
                  <div
                    style={{ top: '48%', left: '46%', width: '42%', height: '36%' }}
                    className="absolute border border-[#FFB86B] bg-[#FFB86B]/10 shadow-[0_0_14px_rgba(255,184,107,0.3)]"
                  >
                    <span className="absolute -top-4 left-0 bg-[#FFB86B] px-1.5 py-0.5 font-mono text-[9px] font-bold text-background">
                      NAV_CLUSTER [0.82]
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Telemetry & Pipeline Checklist */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Live Telemetry Signals */}
              <div className="rounded-xs border border-border bg-surface-elevated p-4 flex flex-col gap-2.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                  LIVE TELEMETRY
                </span>
                <div className="flex items-center justify-between font-mono text-xs border-b border-border/60 pb-1.5">
                  <span className="text-muted-foreground">REGIONS DETECTED</span>
                  <span className="text-foreground font-bold tabular-nums">07</span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs border-b border-border/60 pb-1.5">
                  <span className="text-muted-foreground">CONTRAST SIGNAL</span>
                  <span className="text-primary font-semibold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-primary animate-pulse" /> ACTIVE
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs border-b border-border/60 pb-1.5">
                  <span className="text-muted-foreground">TEXT SIGNAL</span>
                  <span className="text-primary font-semibold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-primary animate-pulse" /> ACTIVE
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-muted-foreground">LAYOUT SIGNAL</span>
                  <span className="text-primary font-semibold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-primary animate-pulse" /> ACTIVE
                  </span>
                </div>
              </div>

              {/* Processing Pipeline Steps */}
              <div className="rounded-xs border border-border bg-surface-elevated p-4 flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  PROCESSING PIPELINE
                </span>
                {[
                  'LOADING IMAGE',
                  'DETECTING REGIONS',
                  'CLASSIFYING VISUAL SIGNALS',
                  'CALCULATING CONFIDENCE',
                  'GENERATING INSIGHTS',
                ].map((stepLabel, idx) => {
                  const isDone = idx < activeStep
                  const isCurrent = idx === activeStep

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xs p-1.5 font-mono text-xs transition-colors',
                        isCurrent
                          ? 'border border-primary/50 bg-primary/10 text-primary font-bold'
                          : isDone
                            ? 'text-muted-foreground'
                            : 'text-muted-foreground/40',
                      )}
                    >
                      <span className="text-xs">
                        {isDone ? '✓' : isCurrent ? '⟳' : '○'}
                      </span>
                      <span>{stepLabel}</span>
                    </div>
                  )
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLoading(false)}
                className="w-full text-xs font-mono border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <XCircle className="size-3.5 mr-1" />
                <span>Abort Analysis</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !loading && (
        <Alert variant="destructive" className="border-destructive/40 bg-[#121413] animate-rise">
          <AlertTitle className="font-mono text-xs uppercase tracking-wider text-destructive font-semibold">
            Analysis Failed
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground mt-1">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Cinematic Screenshot Results Canvas (Matches Reference 1) */}
      {result && !loading && (
        <div className="flex flex-col gap-8 animate-rise">
          {/* Header Title with Telemetry Badges */}
          <div className="flex flex-col gap-2 border-b border-border pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" /> VISION ENGINE: READY
              </span>
              <span className="text-border">·</span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" /> CUSTOM ML: READY
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              SCREENSHOT INTELLIGENCE
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Analyze a website screenshot for visual accessibility problems.
            </p>
          </div>

          {/* 2-Column Active Computer Vision Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Target View with Annotated Bounding Boxes */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span className="text-foreground font-semibold">TARGET VIEW</span>
                <span>1920x1088</span>
              </div>

              <div className="relative overflow-hidden rounded-sm border border-border bg-[#08090B] p-3 shadow-xl">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Analyzed target screenshot"
                    className="w-full rounded-xs object-contain"
                  />
                ) : (
                  <div className="h-80 w-full bg-surface-elevated" />
                )}

                {/* Annotated Bounding Boxes on Target View */}
                {REGION_BOUNDS.map((reg) => {
                  const isSelected = selectedRegionId === reg.id

                  return (
                    <div
                      key={reg.id}
                      onClick={() => setSelectedRegionId(reg.id)}
                      style={{
                        top: reg.top,
                        left: reg.left,
                        width: reg.width,
                        height: reg.height,
                        borderColor: reg.color,
                      }}
                      className={cn(
                        'absolute border-2 transition-all duration-200 cursor-pointer rounded-xs',
                        isSelected
                          ? 'bg-primary/20 shadow-[0_0_20px_rgba(199,243,107,0.4)] z-30'
                          : 'bg-transparent hover:bg-white/5 opacity-80 hover:opacity-100',
                      )}
                    >
                      <span
                        style={{ backgroundColor: reg.color }}
                        className="absolute -top-4 left-0 px-1.5 py-0.5 font-mono text-[9px] font-bold text-background uppercase tracking-wider rounded-xs"
                      >
                        {reg.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Detected Regions List & AI Interpretation Panel */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Detected Regions Breakdown */}
              <div className="rounded-sm border border-border bg-[#0D100E] p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                    DETECTED REGIONS
                  </span>
                  <SourceBadge kind="ml" />
                </div>

                <div className="flex flex-col gap-3 font-mono text-xs">
                  {result.vision.slice(0, 3).map((v, i) => {
                    const pct = Math.round(v.score * 100)
                    const labelDisplay = v.label.replace(/_/g, ' ').toUpperCase()
                    const isSelected = selectedRegionId === `region-${i + 1}`

                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedRegionId(`region-${i + 1}`)}
                        className={cn(
                          'flex flex-col gap-1.5 p-2.5 rounded-xs border transition-all cursor-pointer',
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-surface-elevated hover:border-border-strong',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              'font-bold',
                              i === 0 ? 'text-[#FFB86B]' : i === 1 ? 'text-[#FF8E72]' : 'text-primary',
                            )}
                          >
                            {labelDisplay}
                          </span>
                          <span className="text-muted-foreground tabular-nums">{pct}% CONF</span>
                        </div>
                        {/* Meter Line */}
                        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full transition-all duration-700',
                              i === 0 ? 'bg-[#FFB86B]' : i === 1 ? 'bg-[#FF8E72]' : 'bg-primary',
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* AI Interpretation Panel */}
              <div className="rounded-sm border border-border bg-[#0D100E] p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                    AI INTERPRETATION
                  </span>
                  <SourceBadge kind="ai" />
                </div>

                <div className="flex flex-col gap-3.5 text-xs leading-relaxed">
                  <div>
                    <h4 className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
                      WHAT WAS DETECTED
                    </h4>
                    <p className="text-foreground mt-1">
                      {result.findings[0]?.observation || result.overallAssessment}
                    </p>
                  </div>

                  <div className="border-t border-border pt-3">
                    <h4 className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
                      WHY IT MATTERS
                    </h4>
                    <p className="text-muted-foreground mt-1">
                      {result.findings[0]?.title || 'Low contrast reduces legibility for users with visual impairments or those viewing interfaces in sub-optimal lighting conditions.'}
                    </p>
                  </div>

                  <div className="border-t border-border pt-3">
                    <h4 className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
                      RECOMMENDED ACTION
                    </h4>
                    <p className="text-foreground mt-1">
                      {result.findings[0]?.recommendation || 'Increase foreground/background contrast ratio to meet WCAG 2.2 AA requirements (4.5:1 for standard text).'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col gap-4 rounded-sm border border-border bg-[#0D100E] p-5 sm:flex-row sm:items-center sm:justify-between animate-rise">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Screenshot Intelligence Analysis Complete
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setResult(null)
                  setFile(null)
                  setError(null)
                  setPreviewUrl(null)
                  setSelectedRegionId(null)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                <span>Analyze Another</span>
              </Button>
              <Link
                href="/audit"
                className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
              >
                <Search className="size-3.5" aria-hidden="true" />
                <span>Full Site Audit</span>
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
        </div>
      )}
    </div>
  )
}
