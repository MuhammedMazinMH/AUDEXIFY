'use client'

import { memo } from 'react'
import { NeonMesh } from '@/components/ui/neon-mesh'

export interface TelemetryBackgroundProps {
  variant?: 'landing' | 'audit' | 'screenshot' | 'results' | 'failure'
}

export const TelemetryBackground = memo(function TelemetryBackground({
  variant = 'landing',
}: TelemetryBackgroundProps) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Layer 1: Deep Near-Black Canvas */}
      <div className="absolute inset-0 bg-[#08090B]" />

      {/* Layer 2: 3D Kinetic Verlet Physics Wireframe Mesh */}
      <NeonMesh variant={variant} />

      {/* Layer 3: Technical Dot-Matrix Coordinate Grid */}
      <div className="bg-dot-pattern absolute inset-0 opacity-30" />

      {/* Layer 4: Ambient Spotlights */}
      {variant === 'failure' ? (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-[450px] w-[700px] rounded-full bg-[#FF6B6B]/[0.02] blur-[150px]" />
      ) : (
        <>
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[450px] w-[750px] rounded-full bg-primary/[0.02] blur-[140px] animate-pulse-slow" />
          <div className="absolute top-1/3 -right-32 size-[400px] rounded-full bg-[#38BDF8]/[0.012] blur-[150px]" />
        </>
      )}

      {/* Layer 5: Diagonal Sweep Scanning Beam */}
      <div className="animate-sweep-beam absolute -inset-full opacity-10 bg-gradient-to-b from-transparent via-primary/[0.08] to-transparent transform -rotate-45" />

      {/* Layer 6: Peripheral Structural Graphs (2xl gutters) */}
      <div className="hidden 2xl:block">
        {variant === 'landing' && (
          <>
            {/* DOM Tree Hierarchy (Left Margin) */}
            <div className="absolute left-8 top-36 flex flex-col gap-2 opacity-35">
              <svg width="180" height="240" viewBox="0 0 180 240" className="stroke-[#2E342D] fill-none">
                <path d="M 20 20 L 20 220" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 20 50 L 70 50" strokeWidth="1" />
                <path d="M 20 110 L 85 110" strokeWidth="1" />
                <path d="M 20 170 L 65 170" strokeWidth="1" />
                <path d="M 70 50 L 140 80" strokeWidth="1" strokeDasharray="2 2" />

                <circle cx="20" cy="20" r="3" className="fill-primary/60 stroke-primary/80" />
                <circle cx="70" cy="50" r="2.5" className="fill-[#1F2229] stroke-primary/50" />
                <circle cx="85" cy="110" r="2.5" className="fill-[#1F2229] stroke-[#38BDF8]/50" />
                <circle cx="65" cy="170" r="2.5" className="fill-[#1F2229] stroke-primary/50" />
                <circle cx="140" cy="80" r="2" className="fill-[#1F2229] stroke-[#8B8F98]/40" />
              </svg>
              <div className="flex flex-col gap-0.5 font-mono text-[9px] text-[#8B8F98]/50 tracking-wider">
                <span>DOM_GRAPH // TREE_ACTIVE</span>
                <span>NODES // EVALUATING</span>
              </div>
            </div>

            {/* Waveform Telemetry (Right Margin) */}
            <div className="absolute right-8 top-40 flex flex-col items-end gap-2 opacity-35">
              <div className="flex flex-col items-end gap-0.5 font-mono text-[9px] text-[#8B8F98]/50 tracking-wider text-right">
                <span>INT8_INFERENCE // ONNX_READY</span>
                <span>WCAG_2.2 // RULESET_PARSED</span>
                <span>LATENCY // 1.2ms</span>
              </div>
              <svg width="140" height="30" viewBox="0 0 140 30" className="stroke-primary/40 fill-none mt-1">
                <path
                  d="M 0 15 Q 20 2, 40 15 T 80 15 T 120 8 L 140 15"
                  strokeWidth="1"
                  className="animate-waveform"
                />
              </svg>
            </div>
          </>
        )}

        {variant === 'audit' && (
          <div className="absolute left-8 top-40 flex flex-col gap-2 opacity-30 font-mono text-[9px] text-[#8B8F98]/50">
            <span>CHROMIUM_SANDBOX // ACTIVE</span>
            <span>AXE_CORE // v4.10.2</span>
            <span>WCAG_CRITERIA // 78 RULES</span>
          </div>
        )}

        {variant === 'screenshot' && (
          <div className="absolute right-8 top-40 flex flex-col items-end gap-2 opacity-30 font-mono text-[9px] text-[#8B8F98]/50 text-right">
            <span>CV_PIPELINE // EFFICIENTNET</span>
            <span>CONTRAST_MATRIX // CALIBRATING</span>
            <span>VISION_FIELD // 1920x1080</span>
          </div>
        )}
      </div>

      {/* Layer 7: Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,9,11,0.65)_100%)] pointer-events-none" />
    </div>
  )
})
