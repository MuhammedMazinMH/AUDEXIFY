import type { Severity } from '@/types/audit'
import { cn } from '@/lib/utils'

const STYLES: Record<Severity, string> = {
  critical: 'bg-[#FF6B6B]/15 text-[#FF6B6B] border-[#FF6B6B]/40',
  serious: 'bg-[#FF8E72]/15 text-[#FF8E72] border-[#FF8E72]/40',
  moderate: 'bg-[#FFB86B]/15 text-[#FFB86B] border-[#FFB86B]/40',
  minor: 'bg-[#8E937F]/15 text-[#C4C9B3] border-[#8E937F]/40',
}

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-xs border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
        STYLES[severity],
        className,
      )}
    >
      <span
        className={cn('size-1.5 rounded-full', {
          'bg-[#FF6B6B]': severity === 'critical',
          'bg-[#FF8E72]': severity === 'serious',
          'bg-[#FFB86B]': severity === 'moderate',
          'bg-[#8E937F]': severity === 'minor',
        })}
        aria-hidden="true"
      />
      {severity}
    </span>
  )
}
