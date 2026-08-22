import Link from 'next/link'
import {
  Cpu,
  FlaskConical,
  ScanEye,
  ShieldCheck,
  Sparkles,
  Terminal,
  Activity,
  CheckCircle2,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SiteHeader } from '@/components/site-header'
import { TelemetryBackground } from '@/components/telemetry-background'
import { HeroTelemetry } from '@/components/hero-telemetry'
import { SystemIntro } from '@/components/system-intro'

const PIPELINE = [
  {
    icon: Cpu,
    step: '01',
    label: 'Deterministic Engine',
    title: 'axe-core in Real Chromium',
    body: 'Every target executes in an isolated headless browser with the full axe-core WCAG 2.2 rule set. Findings are objective facts, not probabilistic guesses.',
    badge: 'Deterministic',
    badgeClass: 'border-border bg-surface-elevated text-muted-foreground',
  },
  {
    icon: FlaskConical,
    step: '02',
    label: 'Custom ML Models',
    title: 'DistilBERT & EfficientNet via ONNX',
    body: 'Trained sequence and vision classifiers evaluate finding severity and screenshot layout density locally via onnxruntime-node, never substituting fake heuristics.',
    badge: 'Custom ML',
    badgeClass: 'border-primary/40 bg-primary/10 text-primary',
  },
  {
    icon: Sparkles,
    step: '03',
    label: 'LLM Explanation Layer',
    title: 'Grounded Remediation Synthesis',
    body: 'Groq-served models synthesize structured findings into plain-language developer explanations and remediation patches, strictly constrained from inventing issues.',
    badge: 'AI-Generated',
    badgeClass: 'border-severity-moderate/40 bg-severity-moderate/10 text-severity-moderate',
  },
] as const

const TRUST_FACTORS = [
  {
    icon: ShieldCheck,
    title: 'Detection is Never Hallucinated',
    body: 'Issues originate exclusively from deterministic axe-core checks and custom ML classifiers. The LLM only explains what the engines validated.',
  },
  {
    icon: Activity,
    title: 'Transparent Provenance Tagging',
    body: 'Deterministic, Custom ML, and AI-Generated insights carry explicit badges so engineers know exactly how every insight was produced.',
  },
  {
    icon: Terminal,
    title: 'Hardened SSRF & Target Security',
    body: 'Comprehensive URL validation blocks private IP ranges, cloud metadata endpoints, loopback interfaces, and invalid host schemes.',
  },
  {
    icon: Cpu,
    title: 'Strict Non-Heuristic Degradation',
    body: 'If custom ONNX models are unavailable, the report transparently indicates fallback rather than inventing synthetic predictions.',
  },
] as const

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col">
      {/* 2-3s Cinematic Opening Sequence */}
      <SystemIntro />

      {/* Living Atmospheric Telemetry Background (Landing Variant) */}
      <TelemetryBackground variant="landing" />

      <SiteHeader />

      <main className="relative z-10 flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="relative border-b border-border py-16 md:py-24">
          <div className="mx-auto flex max-w-7xl flex-col lg:flex-row items-center gap-12 lg:gap-16 px-4 md:px-8">
            {/* Hero Left (Content) */}
            <div className="flex flex-1 flex-col gap-5 animate-rise">
              <div className="inline-flex w-fit items-center gap-2 rounded-xs border border-primary/30 bg-primary/5 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">
                <ScanEye className="size-3.5" aria-hidden="true" />
                <span>Accessibility Intelligence Instrument</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-foreground leading-[1.08]">
                Find real accessibility barriers.{' '}
                <span className="text-primary">
                  Understand every one.
                </span>
              </h1>

              {/* Refined Supporting Description */}
              <p className="max-w-lg text-sm sm:text-base leading-relaxed text-muted-foreground font-normal">
                AUDEXIFY combines deterministic WCAG 2.2 browser inspection, local INT8 machine
                learning classification, and grounded AI remediation guidance into an
                infrastructure-grade platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/audit"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'h-11 px-7 text-xs font-mono tracking-wider uppercase transition-all shadow-[0_0_16px_-4px_rgba(199,243,107,0.3)] hover:shadow-[0_0_20px_-2px_rgba(199,243,107,0.5)]',
                  )}
                >
                  Start Site Audit →
                </Link>
                <Link
                  href="/screenshot"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'h-11 px-7 text-xs font-mono tracking-wider uppercase',
                  )}
                >
                  Analyze Screenshot
                </Link>
              </div>

              {/* Telemetry Status Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/70 font-mono text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 rounded-xs border border-border bg-surface-elevated px-2.5 py-1">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-foreground font-semibold">SYSTEM STATUS // ONLINE</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xs border border-border bg-surface-elevated px-2.5 py-1">
                  <CheckCircle2 className="size-3 text-primary" />
                  <span>ANALYSIS ENGINE // READY</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xs border border-border bg-surface-elevated px-2.5 py-1">
                  <CheckCircle2 className="size-3 text-primary" />
                  <span>VISION // ONNX READY</span>
                </div>
              </div>
            </div>

            {/* Hero Right (Telemetry HUD Scene) */}
            <div className="w-full lg:w-[48%] relative flex items-center justify-center animate-rise-delay-1">
              <HeroTelemetry />
            </div>
          </div>
        </section>

        {/* 3-Stage Pipeline Architecture */}
        <section aria-labelledby="pipeline-heading" className="border-b border-border py-16 md:py-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 md:px-8 animate-rise-delay-2">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
                Multi-Engine Architecture
              </span>
              <h2 id="pipeline-heading" className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Three-Stage Intelligence Pipeline
              </h2>
              <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Each subsystem operates strictly within its verified domain: deterministic detection,
                custom model scoring, and grounded AI explanation.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {PIPELINE.map((stage) => (
                <div
                  key={stage.step}
                  className="card-lift flex flex-col gap-4 rounded-sm border border-border bg-[#0D100E] p-6 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-xs border border-primary/30 bg-primary/10 text-primary">
                      <stage.icon className="size-4" aria-hidden="true" />
                    </span>
                    <span
                      className={cn(
                        'rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase font-semibold',
                        stage.badgeClass,
                      )}
                    >
                      {stage.badge}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-muted-foreground">
                    STAGE {stage.step} // {stage.label}
                  </span>

                  <h3 className="font-display text-base font-bold text-foreground">
                    {stage.title}
                  </h3>

                  <p className="text-xs leading-relaxed text-muted-foreground">{stage.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Reliability Bento Grid */}
        <section aria-labelledby="trust-heading" className="py-16 md:py-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 md:px-8 animate-rise-delay-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
              <h2 id="trust-heading" className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Engineered for Integrity
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {TRUST_FACTORS.map((factor) => (
                <div
                  key={factor.title}
                  className="card-lift flex flex-col gap-2.5 rounded-sm border border-border bg-[#0D100E] p-6"
                >
                  <div className="flex items-center gap-2 text-primary">
                    <factor.icon className="size-4" />
                    <h3 className="font-display text-base font-bold text-foreground">
                      {factor.title}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{factor.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Call to Action */}
        <section className="border-t border-border py-16">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 md:px-8 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground max-w-xl">
              Initiate Your First Accessibility Audit
            </h2>
            <p className="max-w-lg text-xs sm:text-sm text-muted-foreground leading-relaxed">
              No account creation required. Point AUDEXIFY at any public URL or upload a UI
              screenshot for instant, labeled remediation intelligence.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/audit"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'h-11 px-8 font-mono text-xs uppercase tracking-wider',
                )}
              >
                Start Website Audit →
              </Link>
              <Link
                href="/screenshot"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'h-11 px-8 font-mono text-xs uppercase tracking-wider',
                )}
              >
                Analyze Screenshot
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Technical Footer */}
      <footer className="border-t border-border bg-[#08090B] py-8">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-8 font-mono text-xs text-muted-foreground">
          <div>© 2026 AUDEXIFY // Accessibility Intelligence Platform</div>
          <div className="flex items-center gap-4">
            <Link href="/audit" className="hover:text-primary transition-colors">
              Site Audit
            </Link>
            <span>·</span>
            <Link href="/screenshot" className="hover:text-primary transition-colors">
              Screenshot Mode
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
