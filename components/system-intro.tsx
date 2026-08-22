'use client'

import { useEffect, useState } from 'react'
import { ScanEye, Terminal } from 'lucide-react'

export function SystemIntro({ onComplete }: { onComplete?: () => void }) {
  const [phase, setPhase] = useState<
    'init' | 'indicator' | 'scan' | 'telemetry' | 'brand' | 'engine' | 'complete' | 'hidden'
  >('init')

  useEffect(() => {
    // Check if user has already experienced intro in this browser session
    const hasSeen = sessionStorage.getItem('audexify_intro_seen')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (hasSeen || prefersReducedMotion) {
      setPhase('hidden')
      onComplete?.()
      return
    }

    // Sequence timings (2.6s total duration)
    const t1 = setTimeout(() => setPhase('indicator'), 300)
    const t2 = setTimeout(() => setPhase('scan'), 600)
    const t3 = setTimeout(() => setPhase('telemetry'), 900)
    const t4 = setTimeout(() => setPhase('brand'), 1200)
    const t5 = setTimeout(() => setPhase('engine'), 1500)
    const t6 = setTimeout(() => setPhase('complete'), 2200)
    const t7 = setTimeout(() => {
      setPhase('hidden')
      sessionStorage.setItem('audexify_intro_seen', 'true')
      onComplete?.()
    }, 2700)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
      clearTimeout(t6)
      clearTimeout(t7)
    }
  }, [onComplete])

  if (phase === 'hidden') return null

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08090B] transition-opacity duration-500 ${
        phase === 'complete' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {/* Background Micro Grid */}
      <div className="bg-dot-pattern absolute inset-0 opacity-40" />

      {/* Thin Scanline passing through */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-scan absolute inset-x-0 h-[1px] bg-primary/60 shadow-[0_0_12px_#C7F36B]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        {/* System Indicator Icon */}
        <div
          className={`flex size-12 items-center justify-center rounded-xs border border-primary/40 bg-primary/10 text-primary transition-all duration-500 ${
            phase !== 'init' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <ScanEye className="size-6" />
        </div>

        {/* Brand & Subtitle Reveal */}
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={`font-display text-2xl md:text-3xl font-extrabold tracking-tight text-foreground transition-all duration-500 ${
              phase === 'brand' || phase === 'engine' || phase === 'complete'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
          >
            AUDEXIFY
          </div>

          <div
            className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary font-semibold transition-all duration-500 ${
              phase === 'engine' || phase === 'complete'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
          >
            <span className="size-1.5 rounded-full bg-primary animate-ping" />
            <span>A11Y INTELLIGENCE ENGINE // ONLINE</span>
          </div>
        </div>

        {/* Diagnostic Loading Telemetry Stream */}
        <div
          className={`mt-3 flex items-center gap-3 font-mono text-[10px] text-muted-foreground/60 transition-opacity duration-300 ${
            phase === 'telemetry' || phase === 'brand' || phase === 'engine'
              ? 'opacity-100'
              : 'opacity-0'
          }`}
        >
          <Terminal className="size-3 text-primary/70" />
          <span>INITIALIZING ONNX RUNTIME & AXE CORE</span>
        </div>
      </div>
    </div>
  )
}
