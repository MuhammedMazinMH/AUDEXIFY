import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1.5 rounded-xs border font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors select-none px-2 py-0.5',
  {
    variants: {
      variant: {
        default:
          'border-primary/40 bg-primary/10 text-primary',
        secondary:
          'border-border bg-surface-elevated text-muted-foreground',
        destructive:
          'border-destructive/40 bg-destructive/15 text-destructive',
        outline:
          'border-border text-foreground',
        ghost:
          'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  })
}

export { Badge, badgeVariants }
