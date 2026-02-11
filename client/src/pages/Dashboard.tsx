import { motion } from 'motion/react'
import { GlassCard } from '../components/ui/GlassCard'
import { MetricCard } from '../components/ui/MetricCard'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { PageTransition } from '../components/layout/PageTransition'
import { WatchlistRow } from '../components/market/WatchlistRow'
import { useStockQuotes } from '../hooks/useStockQuote'
import { useWatchlistStore } from '../stores/useWatchlistStore'
import { usePortfolioStore } from '../stores/usePortfolioStore'
import { MARKET_INDICES } from '../lib/constants'
import { formatCurrency, formatPercent, formatChange } from '../lib/formatters'
import { cardVariants, staggerContainer, heroVariants } from '../styles/animations'
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  DollarSign,
  BarChart3,
  Plus,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const navigate = useNavigate()
  const watchlistSymbols = useWatchlistStore((s) => s.symbols)
  const { cashBalance, holdings } = usePortfolioStore()

  const allSymbols = [
    ...MARKET_INDICES.map((i) => i.symbol),
    ...watchlistSymbols,
  ]
  const uniqueSymbols = [...new Set(allSymbols)]
  const { data: quotes, isLoading } = useStockQuotes(uniqueSymbols)

  const indexQuotes = MARKET_INDICES.map((idx) => ({
    ...idx,
    quote: quotes?.find((q) => q.symbol === idx.symbol),
  }))

  const watchlistQuotes = watchlistSymbols.map((symbol) => ({
    symbol,
    quote: quotes?.find((q) => q.symbol === symbol),
  }))

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-7xl mx-auto">
        {/* Hero header */}
        <motion.div
          variants={heroVariants}
          initial="initial"
          animate="animate"
          className="relative"
        >
          <div className="relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight font-display"
            >
              <span className="gradient-text">Good to see you</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-text-secondary mt-2 flex items-center gap-2"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
              Markets are live. Here's your overview.
            </motion.p>
          </div>
        </motion.div>

        {/* Market indices */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"
        >
          {indexQuotes.map((idx, i) => (
            <motion.div key={idx.symbol} variants={cardVariants} custom={i}>
              {isLoading || !idx.quote ? (
                <GlassCard>
                  <Skeleton className="w-20 h-3 mb-3" />
                  <Skeleton className="w-32 h-7 mb-2" />
                  <Skeleton className="w-24 h-3" />
                </GlassCard>
              ) : (
                <MetricCard
                  label={idx.name}
                  value={formatCurrency(idx.quote.price)}
                  change={`${formatChange(idx.quote.change)} (${formatPercent(idx.quote.changePercent)})`}
                  changePercent={idx.quote.changePercent}
                  icon={
                    idx.quote.changePercent >= 0 ? (
                      <TrendingUp size={18} className="text-gain" />
                    ) : (
                      <TrendingDown size={18} className="text-loss" />
                    )
                  }
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Watchlist */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            custom={3}
            className="lg:col-span-2"
          >
            <GlassCard padding="none">
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent-blue/15 flex items-center justify-center">
                    <BarChart3 size={14} className="text-accent-blue" />
                  </div>
                  <h2 className="text-sm font-semibold font-display">Watchlist</h2>
                  <Badge>{watchlistSymbols.length}</Badge>
                </div>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4">
                        <Skeleton className="w-8 h-8" variant="rectangular" />
                        <div className="flex-1">
                          <Skeleton className="w-20 h-4 mb-1.5" />
                          <Skeleton className="w-14 h-3" />
                        </div>
                        <Skeleton className="w-20 h-10" variant="rectangular" />
                        <div className="text-right">
                          <Skeleton className="w-16 h-4 mb-1 ml-auto" />
                          <Skeleton className="w-20 h-3 ml-auto" />
                        </div>
                      </div>
                    ))
                  : watchlistQuotes.map(({ symbol, quote }) => (
                      <WatchlistRow
                        key={symbol}
                        symbol={symbol}
                        quote={quote}
                        onClick={() => navigate(`/stock/${symbol}`)}
                      />
                    ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Portfolio + Quick Actions */}
          <div className="space-y-6">
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              custom={4}
            >
              <GlassCard className="relative overflow-visible">
                {/* Accent glow */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-2 mb-5 relative">
                  <div className="w-7 h-7 rounded-lg bg-accent-blue/15 flex items-center justify-center">
                    <Briefcase size={14} className="text-accent-blue" />
                  </div>
                  <h2 className="text-sm font-semibold font-display">Portfolio</h2>
                </div>

                <div className="space-y-4 relative">
                  <div>
                    <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
                      Cash Balance
                    </span>
                    <p className="text-2xl font-bold tabular-nums mt-1 font-display">
                      {formatCurrency(cashBalance)}
                    </p>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

                  <div>
                    <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
                      Holdings
                    </span>
                    {holdings.length === 0 ? (
                      <div className="mt-3 text-center py-6">
                        <DollarSign
                          size={24}
                          className="text-text-tertiary mx-auto mb-2"
                        />
                        <p className="text-xs text-text-tertiary">
                          No positions yet
                        </p>
                        <motion.button
                          onClick={() => navigate('/trade')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-accent-blue bg-accent-blue/10 rounded-xl border border-accent-blue/20 hover:bg-accent-blue/15 transition-colors"
                        >
                          <Plus size={12} />
                          Make your first trade
                        </motion.button>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2.5">
                        {holdings.slice(0, 5).map((h) => (
                          <motion.div
                            key={h.symbol}
                            whileHover={{ x: 2 }}
                            className="flex items-center justify-between py-1 cursor-pointer"
                            onClick={() => navigate(`/stock/${h.symbol}`)}
                          >
                            <span className="text-sm font-semibold font-display">
                              {h.symbol}
                            </span>
                            <span className="text-xs text-text-secondary tabular-nums">
                              {h.shares} shares @ {formatCurrency(h.avgCostBasis)}
                            </span>
                          </motion.div>
                        ))}
                        {holdings.length > 5 && (
                          <button
                            onClick={() => navigate('/portfolio')}
                            className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors flex items-center gap-1"
                          >
                            View all {holdings.length} holdings
                            <ArrowUpRight size={10} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <motion.button
                    onClick={() => navigate('/portfolio')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 text-xs font-semibold text-accent-blue bg-accent-blue/8 hover:bg-accent-blue/12 rounded-xl transition-colors border border-accent-blue/10"
                  >
                    View Full Portfolio
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>

            {/* Quick action: AI Research */}
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              custom={5}
            >
              <GlassCard
                hover
                className="cursor-pointer"
                onClick={() => navigate('/research')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center">
                    <Sparkles size={18} className="text-accent-blue" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold font-display">AI Research</h3>
                    <p className="text-[11px] text-text-tertiary mt-0.5">
                      Ask about any stock or get portfolio advice
                    </p>
                  </div>
                  <ArrowUpRight size={14} className="text-text-tertiary" />
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
