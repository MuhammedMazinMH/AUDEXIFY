import Link from 'next/link'
import { ArrowRight, Cpu, FlaskConical, ScanEye, ShieldCheck, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SiteHeader } from '@/components/site-header'

const PIPELINE = [
  {
    icon: Cpu,
    label: 'Deterministic engine',
    title: 'axe-core in a real browser',
    body: 'Every page loads in a headless Chromium instance and runs the full axe-core WCAG 2.2 rule set. Findings here are facts, not predictions.',
    badge: 'Deterministic',
    badgeClass: 'bg-success/15 text-success',
  },
  {
    icon: FlaskConical,
    label: 'Custom ML models',
    title: 'Quality, not just presence',
    body: 'A trained DistilBERT model independently assesses the severity of each detected finding, and a trained EfficientNet vision model classifies screenshot regions - both running locally via ONNX, never as heuristics.',
    badge: 'Custom ML',
    badgeClass: 'bg-severity-minor/15 text-severity-minor',
  },
  {
    icon: Sparkles,
    label: 'LLM explanation layer',
    title: 'Grounded AI narration',
    body: 'A Groq-served LLM turns structured findings into plain-language explanations, remediation steps, and executive summaries. It never invents issues - it only explains what the engines found.',
    badge: 'AI-generated',
    badgeClass: 'bg-severity-moderate/15 text-severity-moderate',
  },
] as const

const PRINCIPLES = [
  {
    title: 'Detection is never hallucinated',
    body: 'Issues come exclusively from axe-core and the custom classifiers. The LLM receives findings as structured data and is prompted to never alter severities, counts, or rules.',
  },
  {
    title: 'Every claim is labeled by provenance',
    body: 'Deterministic, Custom ML, and AI-generated content each carry a distinct badge in the report, so you always know how a statement was produced.',
  },
  {
    title: 'Graceful degradation, never fabrication',
    body: 'If a trained ONNX model is unavailable, the report says so plainly — heuristic guesses are never substituted. If the LLM is unreachable, the audit still returns complete deterministic results.',
  },
  {
    title: 'Hardened by default',
    body: 'SSRF-guarded URL validation, DNS resolution checks against private ranges, strict upload limits, and schema-validated LLM outputs.',
  },
] as const

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="hero-grid absolute inset-0" aria-hidden="true" />
          <div
            className="absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[110px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-20 md:px-6 md:py-28">
            <div className="flex max-w-3xl flex-col gap-6">
              <p className="animate-rise flex items-center gap-2 text-sm font-medium text-primary">
                <ScanEye className="size-4" aria-hidden="true" />
                Accessibility intelligence, three engines deep
              </p>
              <h1 className="animate-rise-delay-1 text-4xl font-bold leading-tight text-balance md:text-6xl">
                Find real accessibility issues.{' '}
                <span className="bg-gradient-to-r from-primary via-severity-minor to-primary bg-clip-text text-transparent">
                  Understand every one of them.
                </span>
              </h1>
              <p className="animate-rise-delay-2 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                AUDEXIFY audits any web page with deterministic WCAG checks, assesses severity with
                trained machine-learning models, and explains each finding in plain language — with
                the provenance of every claim clearly labeled.
              </p>
              <div className="animate-rise-delay-3 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/audit"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'h-12 gap-2 px-7 text-base shadow-[0_0_28px_-6px_var(--glow)] transition-shadow hover:shadow-[0_0_36px_-4px_var(--glow)]',
                  )}
                >
                  Audit a website
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/screenshot"
                  className={cn(
                    buttonVariants({ size: 'lg', variant: 'outline' }),
                    'h-12 bg-transparent px-7 text-base',
                  )}
                >
                  Analyze a screenshot
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pipeline */}
        <section aria-labelledby="pipeline-heading" className="border-b border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:px-6 md:py-20">
            <div className="flex flex-col gap-2">
              <h2 id="pipeline-heading" className="text-2xl font-bold md:text-3xl">
                A three-stage pipeline
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Each stage does what it is best at — and nothing more.
              </p>
            </div>
            <ol className="flex flex-col gap-6 md:flex-row">
              {PIPELINE.map((stage, i) => (
                <li
                  key={stage.label}
                  className="card-lift flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <stage.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium',
                        stage.badgeClass,
                      )}
                    >
                      {stage.badge}
                    </span>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Stage {i + 1} · {stage.label}
                  </span>
                  <h3 className="text-lg font-semibold">{stage.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{stage.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Principles */}
        <section aria-labelledby="principles-heading">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:px-6 md:py-20">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
              <h2 id="principles-heading" className="text-2xl font-bold md:text-3xl">
                Built for trust
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {PRINCIPLES.map((principle) => (
                <div
                  key={principle.title}
                  className="card-lift flex flex-col gap-2 rounded-xl border border-border bg-card p-6"
                >
                  <h3 className="text-base font-semibold">{principle.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{principle.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section aria-labelledby="cta-heading" className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:px-6">
            <h2 id="cta-heading" className="text-2xl font-bold text-balance md:text-3xl">
              Run your first audit in seconds
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              No signup required. Point AUDEXIFY at any public URL and get a fully labeled,
              plain-language accessibility report.
            </p>
            <Link
              href="/audit"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-12 gap-2 px-7 text-base shadow-[0_0_28px_-6px_var(--glow)]',
              )}
            >
              Start an audit
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-xs text-muted-foreground md:flex-row md:px-6">
            <p>AUDEXIFY — AI-powered web accessibility intelligence.</p>
            <p>
              Automated checks catch a fraction of barriers. Always pair audits with manual testing.
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}
