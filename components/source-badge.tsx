import { Cpu, FlaskConical, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type SourceKind = 'deterministic' | 'ml' | 'ai'

const CONFIG: Record<SourceKind, { label: string; icon: typeof Cpu; className: string }> = {
  deterministic: {
    label: 'Deterministic',
    icon: Cpu,
    className: 'text-muted-foreground border-border',
  },
  ml: {
    label: 'Custom ML',
    icon: FlaskConical,
    className: 'text-primary border-primary/40',
  },
  ai: {
    label: 'AI-generated',
    icon: Sparkles,
    className: 'text-severity-moderate border-severity-moderate/40',
  },
}

/**
 * Transparency label distinguishing how a piece of content was produced:
 * deterministic engine, custom ML classifier, or LLM narrative.
 */
export function SourceBadge({ kind, className }: { kind: SourceKind; className?: string }) {
  const { label, icon: Icon, className: kindClass } = CONFIG[kind]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs',
        kindClass,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}
