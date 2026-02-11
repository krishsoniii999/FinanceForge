import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { useAnalystRatings } from '../../hooks/useAnalystRatings'
import { formatCurrency } from '../../lib/formatters'
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface AnalystRatingsProps {
  symbol: string
}

export function AnalystRatings({ symbol }: AnalystRatingsProps) {
  const { data: ratings, isLoading } = useAnalystRatings(symbol)

  if (isLoading) {
    return (
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="w-32 h-4" />
        </div>
        <Skeleton className="w-full h-8 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </GlassCard>
    )
  }

  if (!ratings) return null

  const currentTrend = ratings.trend?.[0]
  const total = currentTrend
    ? currentTrend.strongBuy + currentTrend.buy + currentTrend.hold + currentTrend.sell + currentTrend.strongSell
    : 0

  const segments = currentTrend ? [
    { label: 'Strong Buy', count: currentTrend.strongBuy, color: 'bg-emerald-500' },
    { label: 'Buy', count: currentTrend.buy, color: 'bg-green-400' },
    { label: 'Hold', count: currentTrend.hold, color: 'bg-amber-400' },
    { label: 'Sell', count: currentTrend.sell, color: 'bg-orange-400' },
    { label: 'Strong Sell', count: currentTrend.strongSell, color: 'bg-red-500' },
  ] : []

  const recColor = {
    buy: 'text-gain',
    strong_buy: 'text-gain',
    hold: 'text-amber-400',
    sell: 'text-loss',
    strong_sell: 'text-loss',
    underperform: 'text-loss',
    outperform: 'text-gain',
  }[ratings.recommendation] || 'text-text-secondary'

  const RecIcon = ratings.recommendation?.includes('buy') || ratings.recommendation === 'outperform'
    ? TrendingUp
    : ratings.recommendation?.includes('sell') || ratings.recommendation === 'underperform'
    ? TrendingDown
    : Minus

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-accent-blue" />
          <h3 className="text-sm font-semibold">Analyst Ratings</h3>
        </div>
        {ratings.recommendation && (
          <div className={cn('flex items-center gap-1.5 text-sm font-semibold', recColor)}>
            <RecIcon size={14} />
            {ratings.recommendation.replace('_', ' ').toUpperCase()}
          </div>
        )}
      </div>

      {/* Ratings bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex rounded-full overflow-hidden h-2.5 bg-white/[0.04]">
            {segments.map((seg) =>
              seg.count > 0 ? (
                <div
                  key={seg.label}
                  className={cn('h-full transition-all', seg.color)}
                  style={{ width: `${(seg.count / total) * 100}%` }}
                />
              ) : null
            )}
          </div>
          <div className="flex justify-between mt-2">
            {segments.map((seg) => (
              <div key={seg.label} className="text-center">
                <div className="text-xs font-semibold tabular-nums">{seg.count}</div>
                <div className="text-[9px] text-text-tertiary">{seg.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price targets */}
      {(ratings.targetMeanPrice || ratings.targetHighPrice || ratings.targetLowPrice) && (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
          {ratings.targetLowPrice && (
            <div className="text-center">
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Low</div>
              <div className="text-sm font-semibold tabular-nums text-loss">
                {formatCurrency(ratings.targetLowPrice)}
              </div>
            </div>
          )}
          {ratings.targetMeanPrice && (
            <div className="text-center">
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Average</div>
              <div className="text-sm font-semibold tabular-nums text-accent-blue">
                {formatCurrency(ratings.targetMeanPrice)}
              </div>
            </div>
          )}
          {ratings.targetHighPrice && (
            <div className="text-center">
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">High</div>
              <div className="text-sm font-semibold tabular-nums text-gain">
                {formatCurrency(ratings.targetHighPrice)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent upgrades/downgrades */}
      {ratings.upgrades?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">Recent Changes</div>
          <div className="space-y-2">
            {ratings.upgrades.slice(0, 3).map((u, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-text-secondary font-medium">{u.firm}</span>
                <div className="flex items-center gap-1.5">
                  {u.fromGrade && (
                    <span className="text-text-tertiary">{u.fromGrade}</span>
                  )}
                  {u.fromGrade && <span className="text-text-tertiary">→</span>}
                  <span className={cn(
                    'font-medium',
                    u.action === 'up' ? 'text-gain' : u.action === 'down' ? 'text-loss' : 'text-text-secondary'
                  )}>
                    {u.toGrade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  )
}
