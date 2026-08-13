import type { Severity } from '@/types/audit'
import { cn } from '@/lib/utils'

const STYLES: Record<Severity, string> = {
  critical: 'bg-severity-critical/15 text-severity-critical border-severity-critical/40',
  serious: 'bg-severity-serious/15 text-severity-serious border-severity-serious/40',
  moderate: 'bg-severity-moderate/15 text-severity-moderate border-severity-moderate/40',
  minor: 'bg-severity-minor/15 text-severity-minor border-severity-minor/40',
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
        STYLES[severity],
        className,
      )}
    >
      {severity}
    </span>
  )
}
