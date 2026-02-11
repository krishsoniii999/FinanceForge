import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { PageTransition } from '../components/layout/PageTransition'
import { GlassCard } from '../components/ui/GlassCard'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Tabs } from '../components/ui/Tabs'
import { Skeleton } from '../components/ui/Skeleton'
import { StockChart } from '../components/charts/StockChart'
import { IndicatorPanel } from '../components/charts/IndicatorPanel'
import { RSIChart } from '../components/charts/RSIChart'
import { MACDChart } from '../components/charts/MACDChart'
import { VolumeChart } from '../components/charts/VolumeChart'
import { NewsFeed } from '../components/news/NewsFeed'
import { AnalystRatings } from '../components/news/AnalystRatings'
import { MetricExplainer } from '../components/education/MetricExplainer'
import { useStockQuote } from '../hooks/useStockQuote'
import { useStockChart } from '../hooks/useStockChart'
import { useChartSettingsStore } from '../stores/useChartSettingsStore'
import { useChatStore } from '../stores/useChatStore'
import { formatCurrency, formatLargeNumber, formatPercent, formatChange } from '../lib/formatters'
import { TIME_RANGES, type TimeRange } from '../lib/constants'
import { useWatchlistStore } from '../stores/useWatchlistStore'
import { useTradeStore } from '../stores/useTradeStore'
import { cardVariants } from '../styles/animations'
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Star,
  StarOff,
  ArrowLeftRight,
} from 'lucide-react'

export function StockDetail() {
  const { symbol = '' } = useParams()
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState<TimeRange>('1M')
  const [chartType, setChartType] = useState<'area' | 'candlestick'>('area')

  const { activeIndicators } = useChartSettingsStore()
  const setCurrentSymbol = useChatStore((s) => s.setCurrentSymbol)

  // Set current symbol for AI context
  useEffect(() => {
    if (symbol) setCurrentSymbol(symbol.toUpperCase())
    return () => setCurrentSymbol(null)
  }, [symbol, setCurrentSymbol])

  const { data: quote, isLoading: quoteLoading } = useStockQuote(symbol)
  const { data: chartResponse, isLoading: chartLoading } = useStockChart(symbol, timeRange, activeIndicators)

  const { symbols: watchlist, addSymbol, removeSymbol } = useWatchlistStore()
  const openTrade = useTradeStore((s) => s.open)
  const isWatched = watchlist.includes(symbol.toUpperCase())

  const { isMobile, isTablet } = useBreakpoint()
  const isPositive = (quote?.changePercent ?? 0) >= 0
  const chartHeight = isMobile ? 250 : isTablet ? 300 : 400

  const hasRSI = activeIndicators.includes('rsi')
  const hasMACD = activeIndicators.includes('macd')
  const hasVolume = activeIndicators.includes('volume')

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Back button + header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              Back
            </button>

            {quoteLoading ? (
              <div className="space-y-2">
                <Skeleton className="w-24 h-8" />
                <Skeleton className="w-48 h-4" />
              </div>
            ) : quote ? (
              <div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {quote.symbol}
                  </h1>
                  <Badge variant="info">{quote.name}</Badge>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold tabular-nums">
                    {formatCurrency(quote.price)}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      isPositive ? 'text-gain' : 'text-loss'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    <span className="tabular-nums">
                      {formatChange(quote.change)} (
                      {formatPercent(quote.changePercent)})
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                isWatched
                  ? removeSymbol(symbol.toUpperCase())
                  : addSymbol(symbol.toUpperCase())
              }
            >
              {isWatched ? <StarOff size={14} /> : <Star size={14} />}
              {isWatched ? 'Remove' : 'Watch'}
            </Button>
            <Button
              size="sm"
              onClick={() => openTrade(symbol)}
            >
              <ArrowLeftRight size={14} />
              Trade
            </Button>
          </div>
        </div>

        {/* Chart */}
        <motion.div variants={cardVariants} initial="initial" animate="animate" custom={0}>
          <GlassCard padding="none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 sm:p-4 border-b border-white/[0.06]">
              <Tabs
                tabs={TIME_RANGES}
                active={timeRange}
                onChange={setTimeRange}
              />
              <Tabs
                tabs={['area', 'candlestick'] as const}
                active={chartType}
                onChange={setChartType}
              />
            </div>

            {/* Indicator toggles */}
            <div className="px-3 sm:px-4 pt-3">
              <IndicatorPanel />
            </div>

            <div className="p-3 sm:p-4">
              {chartLoading || !chartResponse?.candles?.length ? (
                <Skeleton className="w-full h-[250px] sm:h-[350px] md:h-[400px]" variant="rectangular" />
              ) : (
                <>
                  <StockChart
                    data={chartResponse.candles}
                    indicators={chartResponse.indicators}
                    activeIndicators={activeIndicators}
                    type={chartType}
                    height={chartHeight}
                  />

                  {/* Sub-charts */}
                  {hasVolume && chartResponse.indicators?.volume && (
                    <VolumeChart data={chartResponse.indicators.volume} />
                  )}
                  {hasRSI && chartResponse.indicators?.rsi && (
                    <RSIChart data={chartResponse.indicators.rsi} />
                  )}
                  {hasMACD && chartResponse.indicators?.macd && (
                    <MACDChart data={chartResponse.indicators.macd} />
                  )}
                </>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Analyst Ratings + News */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <motion.div variants={cardVariants} initial="initial" animate="animate" custom={1}>
            <AnalystRatings symbol={symbol} />
          </motion.div>
          <motion.div variants={cardVariants} initial="initial" animate="animate" custom={2}>
            <NewsFeed symbol={symbol} limit={5} />
          </motion.div>
        </div>

        {/* Fundamentals grid */}
        {quote && (
          <motion.div variants={cardVariants} initial="initial" animate="animate" custom={3}>
            <h2 className="text-sm font-semibold mb-3 text-text-secondary uppercase tracking-wider">
              Key Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <FundamentalCard
                label="Market Cap"
                value={formatLargeNumber(quote.marketCap)}
                metricKey="marketCap"
              />
              <FundamentalCard
                label="Volume"
                value={formatLargeNumber(quote.volume)}
                metricKey="volume"
              />
              <FundamentalCard
                label="Open"
                value={formatCurrency(quote.open)}
                metricKey="open"
              />
              <FundamentalCard
                label="Previous Close"
                value={formatCurrency(quote.previousClose)}
                metricKey="previousClose"
              />
              <FundamentalCard
                label="Day High"
                value={formatCurrency(quote.dayHigh)}
                metricKey="dayHigh"
              />
              <FundamentalCard
                label="Day Low"
                value={formatCurrency(quote.dayLow)}
                metricKey="dayLow"
              />
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}

function FundamentalCard({
  label,
  value,
  metricKey,
}: {
  label: string
  value: string
  metricKey: string
}) {
  return (
    <GlassCard className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-secondary uppercase tracking-wider">
          {label}
        </span>
        <MetricExplainer metricKey={metricKey} />
      </div>
      <span className="text-lg font-semibold tabular-nums">{value}</span>
    </GlassCard>
  )
}
