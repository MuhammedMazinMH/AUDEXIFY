import { Cpu, FlaskConical, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type SourceKind = 'deterministic' | 'ml' | 'ai'

const CONFIG: Record<SourceKind, { label: string; icon: typeof Cpu; className: string }> = {
  deterministic: {
    label: 'Deterministic Engine',
    icon: Cpu,
    className: 'text-muted-foreground border-border bg-surface-elevated',
  },
  ml: {
    label: 'Custom ML (ONNX)',
    icon: FlaskConical,
    className: 'text-primary border-primary/40 bg-primary/10',
  },
  ai: {
    label: 'AI Explanation',
    icon: Sparkles,
    className: 'text-severity-moderate border-severity-moderate/40 bg-severity-moderate/10',
  },
}

/**
 * Transparency label distinguishing how a piece of content was produced:
 * deterministic axe-core, custom ML classifier, or LLM narrative.
 */
export function SourceBadge({ kind, className }: { kind: SourceKind; className?: string }) {
  const { label, icon: Icon, className: kindClass } = CONFIG[kind]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xs border px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide uppercase',
        kindClass,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}
