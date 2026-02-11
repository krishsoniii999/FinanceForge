import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { PageTransition } from '../components/layout/PageTransition'
import { GlassCard } from '../components/ui/GlassCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { StockChart } from '../components/charts/StockChart'
import { Tabs } from '../components/ui/Tabs'
import { useStockQuote } from '../hooks/useStockQuote'
import { useStockChart } from '../hooks/useStockChart'
import { useStockSearch } from '../hooks/useStockSearch'
import { usePortfolioStore } from '../stores/usePortfolioStore'
import { formatCurrency, formatPercent } from '../lib/formatters'
import { TIME_RANGES, type TimeRange } from '../lib/constants'
import { cardVariants } from '../styles/animations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { executeTrade } from '../lib/api'
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Search,
} from 'lucide-react'

export function PaperTrading() {
  const { symbol: paramSymbol } = useParams()
  const [symbol, setSymbol] = useState(paramSymbol?.toUpperCase() || '')
  const [searchInput, setSearchInput] = useState(paramSymbol?.toUpperCase() || '')
  const [showSearch, setShowSearch] = useState(false)
  const [action, setAction] = useState<'buy' | 'sell'>('buy')
  const [shares, setShares] = useState('')
  const [timeRange, setTimeRange] = useState<TimeRange>('1M')
  const [tradeResult, setTradeResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const queryClient = useQueryClient()
  const { data: quote } = useStockQuote(symbol)
  const { data: chartData } = useStockChart(symbol, timeRange)
  const { data: searchResults } = useStockSearch(searchInput)
  const { cashBalance, holdings } = usePortfolioStore()

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const tradeMutation = useMutation({
    mutationFn: executeTrade,
    onSuccess: (data) => {
      setTradeResult({ success: true, message: `Trade executed! ${action === 'buy' ? 'Bought' : 'Sold'} ${shares} shares of ${symbol}` })
      usePortfolioStore.getState().setCashBalance(data.portfolio.cashBalance)
      usePortfolioStore.getState().setHoldings(data.portfolio.holdings)
      usePortfolioStore.getState().addTransaction(data.trade)
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      setShares('')
    },
    onError: (error: any) => {
      setTradeResult({
        success: false,
        message: error.response?.data?.error || 'Trade failed. Please try again.',
      })
    },
  })

  const sharesNum = parseInt(shares) || 0
  const totalCost = sharesNum * (quote?.price || 0)
  const currentHolding = holdings.find((h) => h.symbol === symbol)
  const maxBuyShares = quote?.price ? Math.floor(cashBalance / quote.price) : 0
  const maxSellShares = currentHolding?.shares || 0

  const handleTrade = () => {
    if (!symbol || sharesNum <= 0) return
    setTradeResult(null)
    tradeMutation.mutate({ symbol, action, shares: sharesNum })
  }

  const { isMobile } = useBreakpoint()
  const isPositive = (quote?.changePercent ?? 0) >= 0

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Paper Trading</h1>
          <p className="text-sm text-text-secondary mt-1">
            Practice trading with $100K virtual money. No risk, all learning.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Order form */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            custom={0}
          >
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <ArrowLeftRight size={16} className="text-accent-blue" />
                <h2 className="text-sm font-semibold">Place Order</h2>
              </div>

              <div className="space-y-4">
                {/* Symbol search with dropdown */}
                <div ref={searchRef} className="relative">
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Symbol</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search stocks..."
                      value={searchInput}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase()
                        setSearchInput(val)
                        setShowSearch(val.length > 0)
                      }}
                      onFocus={() => searchInput.length > 0 && setShowSearch(true)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/40 focus:ring-1 focus:ring-accent-blue/20 transition-all"
                    />
                    {symbol && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-accent-blue font-semibold">
                        {symbol}
                      </span>
                    )}
                  </div>
                  <AnimatePresence>
                    {showSearch && searchResults && searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-30 top-full mt-1 w-full rounded-xl bg-bg-secondary/95 backdrop-blur-xl border border-white/[0.08] shadow-xl max-h-48 overflow-y-auto"
                      >
                        {searchResults.map((result) => (
                          <button
                            key={result.symbol}
                            onClick={() => {
                              setSymbol(result.symbol)
                              setSearchInput(result.symbol)
                              setShowSearch(false)
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors first:rounded-t-xl last:rounded-b-xl"
                          >
                            <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center text-xs font-bold text-accent-blue flex-shrink-0">
                              {result.symbol.slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold">{result.symbol}</div>
                              <div className="text-[10px] text-text-tertiary truncate">{result.name}</div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Buy/Sell toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAction('buy')}
                    className={`py-2 rounded-xl text-sm font-medium transition-all ${
                      action === 'buy'
                        ? 'bg-gain/20 text-gain border border-gain/30'
                        : 'bg-white/[0.04] text-text-tertiary border border-white/[0.06] hover:bg-white/[0.06]'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setAction('sell')}
                    className={`py-2 rounded-xl text-sm font-medium transition-all ${
                      action === 'sell'
                        ? 'bg-loss/20 text-loss border border-loss/30'
                        : 'bg-white/[0.04] text-text-tertiary border border-white/[0.06] hover:bg-white/[0.06]'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                <Input
                  label="Shares"
                  type="number"
                  placeholder="0"
                  min="1"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                />

                {/* Max button */}
                <div className="flex justify-end">
                  <button
                    onClick={() =>
                      setShares(
                        String(action === 'buy' ? maxBuyShares : maxSellShares)
                      )
                    }
                    className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
                  >
                    Max: {action === 'buy' ? maxBuyShares : maxSellShares} shares
                  </button>
                </div>

                {/* Cost preview */}
                {quote && sharesNum > 0 && (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Price per share</span>
                      <span className="tabular-nums">{formatCurrency(quote.price)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Shares</span>
                      <span className="tabular-nums">{sharesNum}</span>
                    </div>
                    <div className="h-px bg-white/[0.06]" />
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Total</span>
                      <span className="tabular-nums">
                        {formatCurrency(totalCost)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Trade result */}
                {tradeResult && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
                      tradeResult.success
                        ? 'bg-gain/10 text-gain border border-gain/20'
                        : 'bg-loss/10 text-loss border border-loss/20'
                    }`}
                  >
                    {tradeResult.success ? (
                      <CheckCircle size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    {tradeResult.message}
                  </div>
                )}

                <Button
                  className="w-full"
                  variant={action === 'buy' ? 'primary' : 'danger'}
                  onClick={handleTrade}
                  disabled={
                    !symbol ||
                    sharesNum <= 0 ||
                    tradeMutation.isPending ||
                    !quote
                  }
                >
                  {tradeMutation.isPending
                    ? 'Executing...'
                    : `${action === 'buy' ? 'Buy' : 'Sell'} ${symbol || '...'}`}
                </Button>

                {/* Cash balance */}
                <div className="text-center text-xs text-text-tertiary">
                  Available: {formatCurrency(cashBalance)}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Chart + quote info */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            custom={1}
            className="lg:col-span-2"
          >
            <GlassCard padding="none">
              {symbol && quote ? (
                <>
                  <div className="p-4 border-b border-white/[0.06]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{quote.symbol}</span>
                          <span className="text-sm text-text-secondary">
                            {quote.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xl sm:text-2xl font-bold tabular-nums">
                            {formatCurrency(quote.price)}
                          </span>
                          <Badge variant={isPositive ? 'gain' : 'loss'}>
                            {isPositive ? (
                              <TrendingUp size={10} className="mr-1" />
                            ) : (
                              <TrendingDown size={10} className="mr-1" />
                            )}
                            {formatPercent(quote.changePercent)}
                          </Badge>
                        </div>
                      </div>
                      <Tabs
                        tabs={TIME_RANGES}
                        active={timeRange}
                        onChange={setTimeRange}
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    {chartData?.candles?.length ? (
                      <StockChart data={chartData.candles} type="area" height={isMobile ? 220 : 350} />
                    ) : (
                      <Skeleton
                        className="w-full h-[350px]"
                        variant="rectangular"
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[250px] sm:h-[350px] lg:h-[450px] text-text-tertiary text-sm">
                  Enter a stock symbol to see its chart
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Order History */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          custom={2}
        >
          <OrderHistory />
        </motion.div>
      </div>
    </PageTransition>
  )
}

function OrderHistory() {
  const { transactions } = usePortfolioStore()

  return (
    <GlassCard padding="none">
      <div className="p-4 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold">Order History</h2>
      </div>
      {transactions.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-tertiary">
          No trades yet. Place your first order above!
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {transactions.slice(0, 20).map((tx) => (
            <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-4 py-3 gap-1 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Badge variant={tx.type === 'buy' ? 'gain' : 'loss'}>
                  {tx.type.toUpperCase()}
                </Badge>
                <div>
                  <span className="text-sm font-medium">{tx.symbol}</span>
                  <span className="text-xs text-text-tertiary ml-2">
                    {tx.shares} shares @ {formatCurrency(tx.price)}
                  </span>
                </div>
              </div>
              <div className="text-right sm:text-right ml-auto sm:ml-0">
                <div className="text-sm font-medium tabular-nums">
                  {formatCurrency(tx.total)}
                </div>
                <div className="text-xs text-text-tertiary">
                  {new Date(tx.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
