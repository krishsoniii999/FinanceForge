import { cn } from '../../lib/utils'

interface SentimentBadgeProps {
  sentiment: 'bullish' | 'bearish' | 'neutral'
}

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider',
        sentiment === 'bullish' && 'bg-gain/15 text-gain border border-gain/20',
        sentiment === 'bearish' && 'bg-loss/15 text-loss border border-loss/20',
        sentiment === 'neutral' && 'bg-white/[0.06] text-text-tertiary border border-white/[0.06]'
      )}
    >
      {sentiment}
    </span>
  )
}
