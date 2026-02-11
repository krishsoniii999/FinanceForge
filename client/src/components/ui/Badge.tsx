import { cn } from '../../lib/utils'

interface BadgeProps {
  variant?: 'default' | 'gain' | 'loss' | 'info'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium tabular-nums',
        {
          'bg-white/[0.06] text-text-secondary': variant === 'default',
          'bg-gain/15 text-gain': variant === 'gain',
          'bg-loss/15 text-loss': variant === 'loss',
          'bg-accent-blue/15 text-accent-blue': variant === 'info',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
