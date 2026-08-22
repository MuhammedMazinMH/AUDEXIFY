import { SiteHeader } from '@/components/site-header'
import { AuditForm } from '@/components/audit-form'
import { TelemetryBackground } from '@/components/telemetry-background'
import { ShieldCheck, Activity, Terminal } from 'lucide-react'

export const metadata = {
  title: 'Site Audit — AUDEXIFY',
  description: 'Deterministic WCAG 2.2 browser inspection, ML scoring, and AI explanation.',
}

export default function AuditPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col">
      {/* Living Atmospheric Telemetry Background (Audit Scanning Variant) */}
      <TelemetryBackground variant="audit" />

      <SiteHeader />

      <main className="relative z-10 flex-grow py-10 md:py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-8 flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col gap-3 border-b border-border pb-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
                Deterministic Inspection Engine
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Site Accessibility Audit
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Enter any publicly reachable URL. AUDEXIFY navigates in real headless Chromium,
              runs axe-core WCAG 2.2 checks, scores severity with local ONNX models, and synthesizes
              structured remediation protocols.
            </p>

            {/* Subsystem Readiness Signals */}
            <div className="flex flex-wrap gap-2 pt-2 font-mono text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-surface-elevated px-2.5 py-1">
                <Terminal className="size-3 text-primary" />
                <span>Chromium Engine: Active</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-surface-elevated px-2.5 py-1">
                <Activity className="size-3 text-primary" />
                <span>axe-core: v4.10.2 Loaded</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-surface-elevated px-2.5 py-1">
                <ShieldCheck className="size-3 text-primary" />
                <span>SSRF Hardening: Active</span>
              </span>
            </div>
          </div>

          {/* Core Interactive Audit Terminal Form */}
          <AuditForm />
        </div>
      </main>

      <footer className="relative z-10 border-t border-border bg-[#08090B] py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 md:px-8 font-mono text-xs text-muted-foreground">
          <div>© 2026 AUDEXIFY // Site Audit Module</div>
          <div>WCAG 2.2 AA / AAA Compliant Standard</div>
        </div>
      </footer>
    </div>
  )
}
