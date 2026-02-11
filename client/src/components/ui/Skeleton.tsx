import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'shimmer',
        {
          'h-4 rounded-lg': variant === 'text',
          'rounded-full': variant === 'circular',
          'rounded-2xl': variant === 'rectangular',
        },
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-4 space-y-3">
      <Skeleton className="w-1/3 h-3" />
      <Skeleton className="w-2/3 h-6" />
      <Skeleton className="w-1/2 h-3" />
    </div>
  )
}
