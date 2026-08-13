import type { AuditIssue } from '@/types/audit'
import { SeverityBadge } from './severity-badge'
import { SourceBadge } from './source-badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function IssueCard({ issue }: { issue: AuditIssue }) {
  return (
    <article className="rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={issue.severity} />
          <SourceBadge kind={issue.source === 'deterministic' ? 'deterministic' : 'ml'} />
          {issue.ml && (
            <span className="text-xs text-muted-foreground">
              ML severity: {issue.ml.predictedSeverity} ({Math.round(issue.ml.score * 100)}%
              confidence)
            </span>
          )}
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {issue.nodes.length} element{issue.nodes.length === 1 ? '' : 's'}
          </span>
        </div>
        <div>
          <h3 className="text-base font-semibold">{issue.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{issue.description}</p>
        </div>
        {issue.wcag.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="WCAG criteria">
            {issue.wcag.map((w) => (
              <li
                key={w.criterion}
                className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                WCAG {w.criterion} · {w.name} ({w.level})
              </li>
            ))}
          </ul>
        )}

        <Accordion className="w-full">
          {issue.explanation && (
            <AccordionItem value="explanation">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  AI explanation and fix
                  <SourceBadge kind="ai" />
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3 text-sm leading-relaxed">
                  <p className="font-medium">{issue.explanation.title}</p>
                  <p>{issue.explanation.summary}</p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Why it matters:</strong>{' '}
                    {issue.explanation.whyItMatters}
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Who this affects:</strong>{' '}
                    {issue.explanation.affectedUsers}
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Recommended fix:</strong>{' '}
                    {issue.explanation.recommendedFix}
                  </p>
                  {issue.explanation.codeExample && (
                    <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">
                      <code>{issue.explanation.codeExample}</code>
                    </pre>
                  )}
                  {issue.explanation.wcagReferences.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      References: WCAG {issue.explanation.wcagReferences.join(', WCAG ')}
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          <AccordionItem value="elements">
            <AccordionTrigger className="text-sm">Affected elements</AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-3">
                {issue.nodes.map((node, i) => (
                  <li key={i} className="rounded-md border border-border bg-muted/50 p-3">
                    <p className="font-mono text-xs text-muted-foreground break-all">{node.target}</p>
                    <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed">
                      <code>{node.html}</code>
                    </pre>
                    {node.failureSummary && (
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {node.failureSummary}
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
  )
}
