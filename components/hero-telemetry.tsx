'use client'

import { useEffect, useState } from 'react'
import { Activity, ShieldCheck, Sparkles, Terminal } from 'lucide-react'

export function HeroTelemetry() {
  const [pulseCount, setPulseCount] = useState(42)
  const [activeScanPass, setActiveScanPass] = useState(3)
  const [latency, setLatency] = useState(1.4)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScanPass((p) => (p % 6) + 1)
      setLatency(+(1.1 + Math.random() * 0.4).toFixed(1))
    }, 3600)

    const rulesTimer = setInterval(() => {
      setPulseCount((c) => (c === 42 ? 43 : 42))
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(rulesTimer)
    }
  }, [])

  return (
    <div className="w-full relative rounded-sm border border-border bg-[#0D100E] p-6 sm:p-8 overflow-hidden shadow-2xl transition-all hover:border-border-strong group">
      {/* Corner Crosshairs */}
      <div className="absolute top-2 left-2 size-2 border-t border-l border-primary" />
      <div className="absolute top-2 right-2 size-2 border-t border-r border-primary" />
      <div className="absolute bottom-2 left-2 size-2 border-b border-l border-primary" />
      <div className="absolute bottom-2 right-2 size-2 border-b border-r border-primary" />

      {/* Internal Laser Scan Line */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
        <div className="animate-scan absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_8px_#C7F36B]" />
      </div>

      <div className="flex flex-col gap-6">
        {/* Header Metadata */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-primary font-bold">
              LIVE INSTRUMENT TELEMETRY
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
            SCAN PASS // 0{activeScanPass} · {latency}ms
          </span>
        </div>

        {/* Central Composite Index Gauge Block */}
        <div className="flex items-center justify-between gap-6 rounded-xs border border-border bg-surface-elevated p-5 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                COMPOSITE INDEX
              </span>
              <span className="size-1 rounded-full bg-primary" />
            </div>
            <div className="font-display text-5xl font-extrabold text-primary tabular-nums mt-1">
              94.8
            </div>
            <span className="font-mono text-[11px] text-muted-foreground mt-0.5 block">
              WCAG 2.2 Level AA Standard
            </span>
          </div>

          <div className="flex flex-col gap-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="text-muted-foreground tabular-nums">{pulseCount} Rules Evaluated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">DistilBERT Conf: 98%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#FF8E72]" />
              <span className="text-foreground font-semibold">2 Action Items Found</span>
            </div>
          </div>
        </div>

        {/* Telemetry Sensor Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-[11px]">
          <div className="rounded-xs border border-border bg-surface-elevated p-2.5 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[10px]">DOM TREE</span>
              <Terminal className="size-3 text-muted-foreground/60" />
            </div>
            <span className="text-foreground font-semibold mt-0.5">PARSED (0.4s)</span>
          </div>

          <div className="rounded-xs border border-border bg-surface-elevated p-2.5 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[10px]">CONTRAST</span>
              <Activity className="size-3 text-primary/70" />
            </div>
            <span className="text-primary font-semibold mt-0.5">PASS (4.8:1)</span>
          </div>

          <div className="rounded-xs border border-border bg-surface-elevated p-2.5 flex flex-col col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[10px]">REMEDIATION</span>
              <Sparkles className="size-3 text-severity-moderate/70" />
            </div>
            <span className="text-severity-moderate font-semibold mt-0.5">SYNTHESIZED</span>
          </div>
        </div>

        {/* Live SVG Signal Waveform Feed */}
        <div className="flex items-center justify-between border-t border-border pt-3 font-mono text-[10px] text-muted-foreground/80">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3 text-primary" />
            <span>HEURISTIC INTEGRITY GUARD // VERIFIED</span>
          </span>
          <span className="text-primary font-semibold">ONLINE</span>
        </div>
      </div>
    </div>
  )
}
