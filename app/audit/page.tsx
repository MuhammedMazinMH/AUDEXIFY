import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { AuditForm } from '@/components/audit-form'

export const metadata: Metadata = {
  title: 'Site Audit — AUDEXIFY',
  description:
    'Run a full accessibility audit on any public web page: deterministic axe-core checks, trained ML severity classification, and AI-generated remediation guidance.',
}

export default function AuditPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-balance md:text-3xl">Site audit</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Enter a public URL. AUDEXIFY loads it in a real headless browser, runs the full
            axe-core WCAG rule set, assesses each finding&apos;s severity with a trained DistilBERT
            model when deployed, and explains every finding in plain language.
          </p>
        </div>
        <AuditForm />
      </main>
    </>
  )
}
