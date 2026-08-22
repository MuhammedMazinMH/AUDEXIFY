import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent font-mono text-xs font-semibold uppercase tracking-wider transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_-4px_var(--glow)]',
        outline:
          'border-border bg-card/60 text-foreground hover:border-primary/60 hover:bg-muted hover:text-primary',
        secondary:
          'border border-border bg-surface-elevated text-foreground hover:border-border-strong hover:bg-surface-overlay',
        ghost:
          'text-muted-foreground hover:bg-muted hover:text-foreground',
        destructive:
          'border border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/25',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 gap-2 px-4 py-2',
        xs: 'h-6 gap-1 px-2 text-[10px]',
        sm: 'h-7 gap-1.5 px-3 text-[11px]',
        lg: 'h-11 gap-2.5 px-6 text-sm',
        icon: 'size-9',
        'icon-xs': 'size-6',
        'icon-sm': 'size-7',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
