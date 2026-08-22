import { SiteHeader } from '@/components/site-header'
import { ScreenshotForm } from '@/components/screenshot-form'
import { TelemetryBackground } from '@/components/telemetry-background'
import { ScanEye, Cpu, Eye } from 'lucide-react'

export const metadata = {
  title: 'Screenshot Analysis — AUDEXIFY',
  description:
    'Computer-vision accessibility analysis using local EfficientNet ONNX models and multimodal evaluation.',
}

export default function ScreenshotPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col">
      {/* Living Atmospheric Telemetry Background (Vision Analysis Variant) */}
      <TelemetryBackground variant="screenshot" />

      <SiteHeader />

      <main className="relative z-10 flex-grow py-10 md:py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-8 flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col gap-3 border-b border-border pb-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
                Computer-Vision Neural Engine
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Screenshot Intelligence
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Upload a full-page or component screenshot for visual accessibility analysis.
              AUDEXIFY evaluates color contrast, typographic hierarchy, layout density, and touch target
              spacing using local vision models and multimodal inspection.
            </p>

            {/* Subsystem Readiness Signals */}
            <div className="flex flex-wrap gap-2 pt-2 font-mono text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-surface-elevated px-2.5 py-1">
                <ScanEye className="size-3 text-primary" />
                <span>Vision Pipeline: Initialized</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-surface-elevated px-2.5 py-1">
                <Cpu className="size-3 text-primary" />
                <span>ONNX Runtime: Ready</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-surface-elevated px-2.5 py-1">
                <Eye className="size-3 text-primary" />
                <span>Contrast Matrix: Calibrated</span>
              </span>
            </div>
          </div>

          {/* Core Interactive Screenshot Form & Canvas */}
          <ScreenshotForm />
        </div>
      </main>

      <footer className="relative z-10 border-t border-border bg-[#08090B] py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 md:px-8 font-mono text-xs text-muted-foreground">
          <div>© 2026 AUDEXIFY // Vision Intelligence Module</div>
          <div>WCAG 2.2 Visual Presentation Standard</div>
        </div>
      </footer>
    </div>
  )
}
