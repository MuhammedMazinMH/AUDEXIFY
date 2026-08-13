import type { AuditResult } from '@/types/audit'
import { ScoreGauge } from './score-gauge'
import { IssueCard } from './issue-card'
import { SourceBadge } from './source-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuditResults({ result }: { result: AuditResult }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="text-lg">Audit results</CardTitle>
          <p className="text-sm text-muted-foreground break-all">
            {result.pageTitle ? `${result.pageTitle} — ` : ''}
            {result.finalUrl}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <ScoreGauge score={result.score} />
          <p className="text-xs text-muted-foreground">
            axe-core v{result.engine.axeVersion} ·{' '}
            {result.engine.nlp.available
              ? `ML severity model: ${result.engine.nlp.model}`
              : 'ML classification unavailable'}{' '}
            ·{' '}
            {result.engine.llmModel
              ? `AI explanation by ${result.engine.llmModel}`
              : 'AI explanation is temporarily unavailable'}{' '}
            · completed in {(result.durationMs / 1000).toFixed(1)}s
          </p>
          {!result.engine.nlp.available && (
            <p className="rounded-md border border-border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">ML classification is unavailable.</strong> The
              trained DistilBERT severity model is not deployed on this server
              {result.engine.nlp.reason ? ` (${result.engine.nlp.reason})` : ''}. All findings
              below come from deterministic axe-core detection; no heuristic predictions were
              substituted.
            </p>
          )}
        </CardContent>
      </Card>

      {result.summary && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg">Executive summary</CardTitle>
            <SourceBadge kind="ai" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="font-medium text-pretty">{result.summary.headline}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{result.summary.overview}</p>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Top priorities</h3>
              <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                {result.summary.topPriorities.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      <section aria-label="Issues found" className="flex flex-col gap-4">
        <h2 className="font-serif text-lg font-semibold">
          {result.issues.length === 0
            ? 'No issues detected'
            : `${result.issues.length} issue${result.issues.length === 1 ? '' : 's'} found`}
        </h2>
        {result.issues.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            No violations were detected by the automated checks. Automated audits catch roughly a
            third of accessibility barriers, so manual testing with a screen reader and keyboard is
            still recommended.
          </p>
        ) : (
          result.issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
        )}
      </section>
    </div>
  )
}
