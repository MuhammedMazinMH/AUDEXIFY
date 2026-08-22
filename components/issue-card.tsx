'use client'

import { useState } from 'react'
import { Check, Copy, Sparkles, Terminal } from 'lucide-react'
import type { AuditIssue } from '@/types/audit'
import { SeverityBadge } from './severity-badge'
import { SourceBadge } from './source-badge'
import { CodeAgentModal } from './code-agent-modal'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function IssueCard({
  issue,
  targetUrl,
  isHighlighted = false,
}: {
  issue: AuditIssue
  targetUrl?: string
  isHighlighted?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const severityStripe = {
    critical: 'border-l-[#FF6B6B]',
    serious: 'border-l-[#FF8E72]',
    moderate: 'border-l-[#FFB86B]',
    minor: 'border-l-[#8E937F]',
  }[issue.severity]

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <article
        id={`issue-${issue.id}`}
        className={cn(
          'group rounded-sm border border-border border-l-4 bg-card transition-all hover:border-border-strong card-lift',
          severityStripe,
          isHighlighted && 'ring-1 ring-primary border-primary bg-primary/5 shadow-[0_0_20px_rgba(199,243,107,0.2)]',
        )}
      >
        <div className="flex flex-col gap-3.5 p-5">
          {/* Top Badges Header */}
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={issue.severity} />
            <SourceBadge kind={issue.source === 'deterministic' ? 'deterministic' : 'ml'} />

            {issue.ml && (
              <span className="rounded-xs border border-primary/30 bg-primary/5 px-2 py-0.5 font-mono text-[10px] text-primary">
                ML: {issue.ml.predictedSeverity} ({Math.round(issue.ml.score * 100)}% conf)
              </span>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(true)}
                className="h-6 px-2 text-[10px] font-mono gap-1 text-primary border-primary/40 hover:bg-primary/10 hover:border-primary uppercase tracking-wider"
              >
                <Sparkles className="size-3" />
                <span>Code-Agent Fix</span>
              </Button>
              <span className="font-mono text-[11px] text-muted-foreground">
                {issue.nodes.length} node{issue.nodes.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Issue Name & Description */}
          <div>
            <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
              {issue.name}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{issue.description}</p>
          </div>

          {/* WCAG Criteria Tags */}
          {issue.wcag.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="WCAG criteria">
              {issue.wcag.map((w) => (
                <li
                  key={w.criterion}
                  className="rounded-xs border border-border bg-surface-elevated px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  WCAG {w.criterion} · {w.name} ({w.level})
                </li>
              ))}
            </ul>
          )}

          {/* Expandable Technical Intelligence */}
          <Accordion className="w-full">
            {issue.explanation && (
              <AccordionItem value="explanation" className="border-border">
                <AccordionTrigger className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  <span className="flex items-center gap-2">
                    <span>Remediation Protocol</span>
                    <SourceBadge kind="ai" />
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-3.5 rounded-sm border border-border bg-surface-elevated p-4 text-xs leading-relaxed">
                    <div>
                      <h4 className="font-semibold text-foreground">{issue.explanation.title}</h4>
                      <p className="mt-1 text-muted-foreground">{issue.explanation.summary}</p>
                    </div>

                    <div className="grid gap-2 border-t border-border pt-3 sm:grid-cols-2">
                      <div>
                        <strong className="font-mono text-[11px] uppercase tracking-wider text-primary">
                          Impact / Why It Matters:
                        </strong>
                        <p className="mt-0.5 text-muted-foreground">{issue.explanation.whyItMatters}</p>
                      </div>
                      <div>
                        <strong className="font-mono text-[11px] uppercase tracking-wider text-primary">
                          Affected User Groups:
                        </strong>
                        <p className="mt-0.5 text-muted-foreground">{issue.explanation.affectedUsers}</p>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <strong className="font-mono text-[11px] uppercase tracking-wider text-primary">
                        Recommended Fix:
                      </strong>
                      <p className="mt-0.5 text-foreground">{issue.explanation.recommendedFix}</p>
                    </div>

                    {issue.explanation.codeExample && (
                      <div className="relative mt-2">
                        <div className="flex items-center justify-between rounded-t-sm border border-b-0 border-border bg-[#08090B] px-3 py-1.5 font-mono text-[10px] uppercase text-muted-foreground">
                          <span>Code Remediation Patch</span>
                          <button
                            type="button"
                            onClick={() => copyCode(issue.explanation?.codeExample ?? '')}
                            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {copied ? (
                              <>
                                <Check className="size-3 text-primary" />
                                <span className="text-primary">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3" />
                                <span>Copy Patch</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="overflow-x-auto rounded-b-sm border border-border bg-[#08090B] p-3 font-mono text-xs leading-relaxed text-[#F1F0EA]">
                          <code>{issue.explanation.codeExample}</code>
                        </pre>
                      </div>
                    )}

                    {issue.explanation.wcagReferences.length > 0 && (
                      <p className="font-mono text-[10px] text-muted-foreground/80">
                        Validated References: WCAG {issue.explanation.wcagReferences.join(', WCAG ')}
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="elements" className="border-border">
              <AccordionTrigger className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
                Affected DOM Elements ({issue.nodes.length})
              </AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col gap-2.5 pt-1">
                  {issue.nodes.map((node, i) => (
                    <li key={i} className="rounded-xs border border-border bg-surface-elevated p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          Selector:
                        </span>
                        <span className="font-mono text-[10px] text-primary truncate max-w-[80%]">
                          {node.target}
                        </span>
                      </div>
                      <pre className="mt-2 overflow-x-auto rounded-xs border border-border bg-[#08090B] p-2.5 font-mono text-[11px] leading-relaxed text-[#C4C9B3]">
                        <code>{node.html}</code>
                      </pre>
                      {node.failureSummary && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          <strong className="text-foreground">Failure summary:</strong> {node.failureSummary}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </article>

      <CodeAgentModal
        issue={issue}
        targetUrl={targetUrl}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
