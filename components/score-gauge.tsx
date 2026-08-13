import type { AuditScore } from '@/types/audit'
import { cn } from '@/lib/utils'

function scoreColor(overall: number): string {
  if (overall >= 90) return 'text-success'
  if (overall >= 75) return 'text-severity-minor'
  if (overall >= 60) return 'text-severity-moderate'
  if (overall >= 40) return 'text-severity-serious'
  return 'text-severity-critical'
}

export function ScoreGauge({ score }: { score: AuditScore }) {
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const filled = (score.overall / 100) * circumference
  const color = scoreColor(score.overall)

  return (
    <div className="flex items-center gap-6">
      <div className="relative size-36 shrink-0" role="img" aria-label={`Accessibility score ${score.overall} out of 100, grade ${score.grade}`}>
        <svg viewBox="0 0 144 144" className="size-full -rotate-90">
          <circle cx="72" cy="72" r={radius} fill="none" strokeWidth="10" className="stroke-muted" />
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference - filled}`}
            className={cn('transition-all duration-700', color)}
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-serif text-4xl font-bold tabular-nums', color)}>{score.overall}</span>
          <span className="text-xs text-muted-foreground">Grade {score.grade}</span>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-severity-critical" aria-hidden="true" />
          <dt className="text-muted-foreground">Critical</dt>
          <dd className="ml-auto font-medium tabular-nums">{score.severityCounts.critical}</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-severity-serious" aria-hidden="true" />
          <dt className="text-muted-foreground">Serious</dt>
          <dd className="ml-auto font-medium tabular-nums">{score.severityCounts.serious}</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-severity-moderate" aria-hidden="true" />
          <dt className="text-muted-foreground">Moderate</dt>
          <dd className="ml-auto font-medium tabular-nums">{score.severityCounts.moderate}</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-severity-minor" aria-hidden="true" />
          <dt className="text-muted-foreground">Minor</dt>
          <dd className="ml-auto font-medium tabular-nums">{score.severityCounts.minor}</dd>
        </div>
        <div className="col-span-2 mt-1 flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
          <span>{score.passedRules} rules passed</span>
          <span aria-hidden="true">·</span>
          <span>{score.failedRules} issues found</span>
        </div>
      </dl>
    </div>
  )
}
