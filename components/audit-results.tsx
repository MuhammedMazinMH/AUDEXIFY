'use client'

import { useState, useMemo } from 'react'
import type { AuditResult, Severity } from '@/types/audit'
import { ScoreGauge } from './score-gauge'
import { IssueCard } from './issue-card'
import { SourceBadge } from './source-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  Download,
  FileText,
  Filter,
  Printer,
  Search,
  Sparkles,
} from 'lucide-react'
import { exportAuditAsMarkdown, downloadFile } from '@/lib/audit/report-generator'
import { cn } from '@/lib/utils'

export function AuditResults({ result }: { result: AuditResult }) {
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [exportMenuOpen, setExportMenuOpen] = useState(false)

  const filteredIssues = useMemo(() => {
    return result.issues.filter((issue) => {
      const matchesSeverity = selectedSeverity === 'all' || issue.severity === selectedSeverity
      const matchesSearch =
        searchQuery.trim() === '' ||
        issue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.wcag.some((w) => w.criterion.includes(searchQuery) || w.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesSeverity && matchesSearch
    })
  }, [result.issues, selectedSeverity, searchQuery])

  function handleExportMarkdown() {
    const md = exportAuditAsMarkdown(result)
    const hostname = new URL(result.finalUrl).hostname.replace(/[^a-zA-Z0-9]/g, '_')
    downloadFile(`AUDEXIFY_Audit_${hostname}.md`, md, 'text/markdown')
    setExportMenuOpen(false)
  }

  function handleExportJSON() {
    const jsonStr = JSON.stringify(result, null, 2)
    const hostname = new URL(result.finalUrl).hostname.replace(/[^a-zA-Z0-9]/g, '_')
    downloadFile(`AUDEXIFY_Audit_${hostname}.json`, jsonStr, 'application/json')
    setExportMenuOpen(false)
  }

  function handlePrintPDF() {
    setExportMenuOpen(false)
    window.print()
  }

  return (
    <div className="flex flex-col gap-8 animate-rise">
      {/* Target & Score Telemetry Panel */}
      <Card className="tech-panel border-border shadow-[0_0_24px_-8px_rgba(199,243,107,0.12)]">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-3.5 text-primary" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                  AUDIT COMPLETE // SYSTEM REPORT GENERATED
                </span>
              </div>
              <CardTitle className="mt-1 text-lg">
                {result.pageTitle ? `${result.pageTitle}` : 'Target Host'}
              </CardTitle>
              <p className="font-mono text-xs text-muted-foreground break-all mt-0.5">
                {result.finalUrl}
              </p>
            </div>

            {/* Export Report Actions Dropdown */}
            <div className="relative flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="gap-2 font-mono text-xs uppercase tracking-wider border-primary/40 text-primary hover:bg-primary/10"
              >
                <Download className="size-3.5" />
                <span>Export Report</span>
              </Button>

              {exportMenuOpen && (
                <div className="absolute right-0 top-10 z-30 flex flex-col w-52 rounded-sm border border-border bg-[#0D100E] p-1.5 shadow-2xl animate-rise font-mono text-xs">
                  <button
                    type="button"
                    onClick={handlePrintPDF}
                    className="flex items-center gap-2 p-2 rounded-xs hover:bg-surface-elevated text-foreground text-left transition-colors"
                  >
                    <Printer className="size-3.5 text-primary" />
                    <span>Print to PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="flex items-center gap-2 p-2 rounded-xs hover:bg-surface-elevated text-foreground text-left transition-colors"
                  >
                    <FileText className="size-3.5 text-primary" />
                    <span>Export Markdown (.md)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="flex items-center gap-2 p-2 rounded-xs hover:bg-surface-elevated text-foreground text-left transition-colors"
                  >
                    <Download className="size-3.5 text-primary" />
                    <span>Export JSON Data (.json)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 flex flex-col gap-6">
          <ScoreGauge score={result.score} />

          {/* Engine Specifications Footer */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-4 font-mono text-[11px] text-muted-foreground">
            <span>axe-core v{result.engine.axeVersion}</span>
            <span>·</span>
            <span>
              {result.engine.nlp.available
                ? `ML Model: ${result.engine.nlp.model}`
                : 'ML Classifier Unavailable'}
            </span>
            <span>·</span>
            <span>
              {result.engine.llmModel
                ? `AI Engine: ${result.engine.llmModel}`
                : 'AI Explanation Standby'}
            </span>
          </div>

          {!result.engine.nlp.available && (
            <div className="rounded-xs border border-border bg-surface-elevated p-3 text-xs leading-relaxed text-muted-foreground font-mono">
              <strong className="text-foreground">ML Notice:</strong> Trained DistilBERT ONNX
              model not loaded on server. Findings reflect pure deterministic axe-core checks
              with zero heuristic fabrication.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Executive Summary with AI Provenance */}
      {result.summary && (
        <Card className="tech-panel border-border animate-rise-delay-1">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                Executive Synthesis
              </span>
            </div>
            <SourceBadge kind="ai" />
          </CardHeader>
          <CardContent className="pt-5 flex flex-col gap-4 text-sm leading-relaxed">
            <p className="font-display font-semibold text-foreground text-base">
              {result.summary.headline}
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {result.summary.overview}
            </p>

            {result.summary.topPriorities.length > 0 && (
              <div className="border-t border-border pt-3">
                <h4 className="font-mono text-xs uppercase tracking-wider text-primary font-semibold mb-2">
                  Top Priority Remediation Items:
                </h4>
                <ol className="flex flex-col gap-1.5 pl-4 list-decimal text-xs text-muted-foreground">
                  {result.summary.topPriorities.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Findings Section with Filter Controls & Code Agent Tools */}
      <section aria-label="Accessibility Findings" className="flex flex-col gap-4 animate-rise-delay-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <h3 className="font-display text-lg font-bold text-foreground">
              Accessibility Findings ({result.issues.length})
            </h3>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter findings…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 rounded-xs border border-border bg-surface-elevated pl-7 pr-3 font-mono text-[11px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1">
              <Filter className="size-3 text-muted-foreground" />
              {(['all', 'critical', 'serious', 'moderate', 'minor'] as const).map((sev) => {
                const active = selectedSeverity === sev
                const count =
                  sev === 'all'
                    ? result.issues.length
                    : result.issues.filter((i) => i.severity === sev).length

                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSelectedSeverity(sev)}
                    className={cn(
                      'rounded-xs border px-2.5 py-1 font-mono text-[10px] uppercase transition-all',
                      active
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-[0_0_8px_rgba(199,243,107,0.2)]'
                        : 'border-border bg-surface-elevated text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {sev} ({count})
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Issue Cards */}
        {filteredIssues.length === 0 ? (
          <div className="rounded-sm border border-border bg-card p-8 text-center text-xs text-muted-foreground">
            {result.issues.length === 0 ? (
              <p>
                No WCAG accessibility violations detected by automated checks. Manual keyboard &
                screen reader testing is always recommended.
              </p>
            ) : (
              <p>No issues match the current filter selection.</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                targetUrl={result.finalUrl}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
