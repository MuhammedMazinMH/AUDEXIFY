'use client'

import { useEffect, useState } from 'react'
import type { AuditScore } from '@/types/audit'
import { cn } from '@/lib/utils'

function useCountUp(target: number, durationMs = 1000): number {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const startVal = 0

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1)
      const easeOutQuad = 1 - (1 - progress) * (1 - progress)
      setCurrent(Math.round(startVal + (target - startVal) * easeOutQuad))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    const animId = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(animId)
  }, [target, durationMs])

  return current
}

function scoreTheme(overall: number): { text: string; stroke: string; glow: string } {
  if (overall >= 75) {
    return {
      text: 'text-primary',
      stroke: 'stroke-[#C7F36B]',
      glow: 'drop-shadow-[0_0_12px_rgba(199,243,107,0.35)]',
    }
  }
  if (overall >= 50) {
    return {
      text: 'text-[#FFB86B]',
      stroke: 'stroke-[#FFB86B]',
      glow: 'drop-shadow-[0_0_12px_rgba(255,184,107,0.35)]',
    }
  }
  return {
    text: 'text-[#FF6B6B]',
    stroke: 'stroke-[#FF6B6B]',
    glow: 'drop-shadow-[0_0_12px_rgba(255,107,107,0.35)]',
  }
}

export function ScoreGauge({ score }: { score: AuditScore }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const [animatedFilled, setAnimatedFilled] = useState(0)

  const animatedScore = useCountUp(score.overall, 1100)
  const animatedCritical = useCountUp(score.severityCounts.critical, 700)
  const animatedSerious = useCountUp(score.severityCounts.serious, 800)
  const animatedModerate = useCountUp(score.severityCounts.moderate, 900)
  const animatedMinor = useCountUp(score.severityCounts.minor, 1000)

  useEffect(() => {
    // Trigger stroke animation on mount
    const timer = setTimeout(() => {
      setAnimatedFilled((score.overall / 100) * circumference)
    }, 50)
    return () => clearTimeout(timer)
  }, [score.overall, circumference])

  const theme = scoreTheme(score.overall)

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      {/* Radial Instrument Ring */}
      <div className="flex items-center gap-6">
        <div
          className="relative size-32 shrink-0 sm:size-36"
          role="img"
          aria-label={`Accessibility score ${score.overall} out of 100, grade ${score.grade}`}
        >
          <svg viewBox="0 0 144 144" className="size-full -rotate-90">
            {/* Background Track */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              fill="none"
              strokeWidth="9"
              className="stroke-muted/80"
            />
            {/* Value Track with Smooth CSS Transition */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${animatedFilled} ${circumference - animatedFilled}`}
              className={cn(
                'transition-[stroke-dasharray] duration-1000 ease-out',
                theme.stroke,
                theme.glow,
              )}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={cn('font-display text-4xl font-extrabold tabular-nums tracking-tight', theme.text)}>
              {animatedScore}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Grade {score.grade}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
              Accessibility Index
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
            Composite score evaluated against WCAG 2.2 rules and severity impact deductions.
          </p>
        </div>
      </div>

      {/* Structured Telemetry Breakdown */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
        <div className="card-lift flex flex-col gap-1 rounded-xs border border-border bg-surface-elevated p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Critical
            </span>
            <span className="size-1.5 rounded-full bg-[#FF6B6B]" aria-hidden="true" />
          </div>
          <span className="font-display text-xl font-bold tabular-nums text-[#FF6B6B]">
            {animatedCritical}
          </span>
        </div>

        <div className="card-lift flex flex-col gap-1 rounded-xs border border-border bg-surface-elevated p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Serious
            </span>
            <span className="size-1.5 rounded-full bg-[#FF8E72]" aria-hidden="true" />
          </div>
          <span className="font-display text-xl font-bold tabular-nums text-[#FF8E72]">
            {animatedSerious}
          </span>
        </div>

        <div className="card-lift flex flex-col gap-1 rounded-xs border border-border bg-surface-elevated p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Moderate
            </span>
            <span className="size-1.5 rounded-full bg-[#FFB86B]" aria-hidden="true" />
          </div>
          <span className="font-display text-xl font-bold tabular-nums text-[#FFB86B]">
            {animatedModerate}
          </span>
        </div>

        <div className="card-lift flex flex-col gap-1 rounded-xs border border-border bg-surface-elevated p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Minor
            </span>
            <span className="size-1.5 rounded-full bg-[#8E937F]" aria-hidden="true" />
          </div>
          <span className="font-display text-xl font-bold tabular-nums text-[#C4C9B3]">
            {animatedMinor}
          </span>
        </div>
      </div>
    </div>
  )
}
