import { cn } from '../../lib/utils'
import { formatCurrency, formatPercent, formatChange } from '../../lib/formatters'
import { MiniChart } from '../charts/MiniChart'
import type { StockQuote } from '../../hooks/useStockQuote'
import { useTradeStore } from '../../stores/useTradeStore'
import { TrendingUp, TrendingDown, ChevronRight, ArrowLeftRight } from 'lucide-react'
import { motion } from 'motion/react'

interface WatchlistRowProps {
  symbol: string
  quote?: StockQuote
  onClick?: () => void
}

export function WatchlistRow({ symbol, quote, onClick }: WatchlistRowProps) {
  const openTrade = useTradeStore((s) => s.open)

  if (!quote) return null

  const isPositive = quote.changePercent >= 0

  const handleTrade = (e: React.MouseEvent) => {
    e.stopPropagation()
    openTrade(symbol)
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
      whileTap={{ scale: 0.995 }}
      className="w-full flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-3.5 transition-colors group text-left relative"
    >
      {/* Symbol badge */}
      <div className="flex-shrink-0 w-auto sm:w-28">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
            isPositive ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
          )}>
            {quote.symbol.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold font-display">{quote.symbol}</div>
            <div className="text-[10px] text-text-tertiary truncate max-w-[60px] sm:max-w-[80px]">{quote.name}</div>
          </div>
        </div>
      </div>

      {/* Mini chart - hidden on very small screens */}
      <div className="hidden xs:block flex-1 h-10 min-w-[60px] sm:min-w-[80px]">
        <MiniChart positive={isPositive} />
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0 ml-auto sm:ml-0">
        <div className="text-sm font-bold tabular-nums font-display">
          {formatCurrency(quote.price)}
        </div>
        <div
          className={cn(
            'flex items-center gap-1 justify-end text-xs font-medium tabular-nums',
            isPositive ? 'text-gain' : 'text-loss'
          )}
        >
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          <span className="hidden sm:inline">
            {formatChange(quote.change)} ({formatPercent(quote.changePercent)})
          </span>
          <span className="sm:hidden">
            {formatPercent(quote.changePercent)}
          </span>
        </div>
      </div>

      {/* Trade button - hidden on mobile (use tap to navigate instead) */}
      <motion.button
        onClick={handleTrade}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-8 h-8 rounded-lg bg-accent-blue/10 hover:bg-accent-blue/20 items-center justify-center text-accent-blue"
      >
        <ArrowLeftRight size={14} />
      </motion.button>

      {/* Arrow */}
      <ChevronRight size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hidden sm:block" />
    </motion.button>
  )
}
