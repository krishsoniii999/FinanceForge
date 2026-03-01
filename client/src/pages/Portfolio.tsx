import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { PageTransition } from '../components/layout/PageTransition'
import { GlassCard } from '../components/ui/GlassCard'
import { MetricCard } from '../components/ui/MetricCard'
import { Button } from '../components/ui/Button'
import { AllocationPie } from '../components/charts/AllocationPie'
import { usePortfolioStore } from '../stores/usePortfolioStore'
import { useTradeStore } from '../stores/useTradeStore'
import { useStockQuotes } from '../hooks/useStockQuote'
import { formatCurrency, formatPercent } from '../lib/formatters'
import { cardVariants, staggerContainer } from '../styles/animations'
import { getPortfolioDoctor } from '../lib/api'
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  RotateCcw,
  Stethoscope,
  Loader2,
  Star,
  ArrowUp,
  Lightbulb,
} from 'lucide-react'

type DoctorData = { grade: string; summary: string; strengths: string[]; improvements: string[]; tip: string }

const gradeColor: Record<string, string> = { A: 'text-gain', B: 'text-accent-blue', C: 'text-yellow-400', D: 'text-loss' }
const gradeBg: Record<string, string> = { A: 'bg-gain/10 border-gain/20', B: 'bg-accent-blue/10 border-accent-blue/20', C: 'bg-yellow-400/10 border-yellow-400/20', D: 'bg-loss/10 border-loss/20' }

export function Portfolio() {
  const navigate = useNavigate()
  const { cashBalance, holdings, reset } = usePortfolioStore()
  const openTrade = useTradeStore((s) => s.open)
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null)
  const [doctorLoading, setDoctorLoading] = useState(false)

  const holdingSymbols = holdings.map((h) => h.symbol)
  const { data: quotes } = useStockQuotes(holdingSymbols)

  const portfolioMetrics = useMemo(() => {
    if (!quotes || holdings.length === 0) {
      return {
        totalValue: cashBalance,
        investedValue: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        holdingsWithPnL: [],
      }
    }

    const holdingsWithPnL = holdings.map((h) => {
      const quote = quotes.find((q) => q.symbol === h.symbol)
      const currentPrice = quote?.price || h.avgCostBasis
      const currentValue = currentPrice * h.shares
      const costBasis = h.avgCostBasis * h.shares
      const pnl = currentValue - costBasis
      const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0

      return {
        ...h,
        currentPrice,
        currentValue,
        costBasis,
        pnl,
        pnlPercent,
        quote,
      }
    })

    const investedValue = holdingsWithPnL.reduce(
      (sum, h) => sum + h.currentValue,
      0
    )
    const totalCostBasis = holdingsWithPnL.reduce(
      (sum, h) => sum + h.costBasis,
      0
    )
    const totalValue = cashBalance + investedValue
    const totalPnL = investedValue - totalCostBasis
    const totalPnLPercent =
      totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0

    return {
      totalValue,
      investedValue,
      totalPnL,
      totalPnLPercent,
      holdingsWithPnL,
    }
  }, [cashBalance, holdings, quotes])

  const allocationData = portfolioMetrics.holdingsWithPnL.map((h) => ({
    name: h.symbol,
    value: h.currentValue,
    color: '',
  }))

  if (cashBalance > 0) {
    allocationData.push({ name: 'Cash', value: cashBalance, color: '#64748b' })
  }

  const handleDoctorAnalysis = async () => {
    if (doctorLoading) return
    setDoctorLoading(true)
    try {
      const result = await getPortfolioDoctor({
        holdings: portfolioMetrics.holdingsWithPnL,
        cashBalance,
        totalValue: portfolioMetrics.totalValue,
        totalPnL: portfolioMetrics.totalPnL,
        totalPnLPercent: portfolioMetrics.totalPnLPercent,
      })
      setDoctorData(result)
    } catch {
      // silently fail
    } finally {
      setDoctorLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Portfolio</h1>
            <p className="text-sm text-text-secondary mt-1">
              Track your paper trading performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (confirm('Reset portfolio to $100K? All trades will be cleared.')) {
                  reset()
                }
              }}
            >
              <RotateCcw size={14} />
              Reset
            </Button>
            <Button size="sm" onClick={() => openTrade('AAPL')}>
              <ArrowLeftRight size={14} />
              Trade
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4"
        >
          <motion.div variants={cardVariants} custom={0}>
            <MetricCard
              label="Total Value"
              value={formatCurrency(portfolioMetrics.totalValue)}
              icon={<Briefcase size={16} />}
            />
          </motion.div>
          <motion.div variants={cardVariants} custom={1}>
            <MetricCard
              label="Cash"
              value={formatCurrency(cashBalance)}
              icon={<DollarSign size={16} />}
            />
          </motion.div>
          <motion.div variants={cardVariants} custom={2}>
            <MetricCard
              label="Invested"
              value={formatCurrency(portfolioMetrics.investedValue)}
              icon={<TrendingUp size={16} />}
            />
          </motion.div>
          <motion.div variants={cardVariants} custom={3}>
            <MetricCard
              label="Total P&L"
              value={formatCurrency(portfolioMetrics.totalPnL)}
              change={formatPercent(portfolioMetrics.totalPnLPercent)}
              changePercent={portfolioMetrics.totalPnLPercent}
              icon={
                portfolioMetrics.totalPnL >= 0 ? (
                  <TrendingUp size={16} className="text-gain" />
                ) : (
                  <TrendingDown size={16} className="text-loss" />
                )
              }
            />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Holdings table */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            custom={4}
            className="lg:col-span-2"
          >
            <GlassCard padding="none">
              <div className="p-4 border-b border-white/[0.06]">
                <h2 className="text-sm font-semibold">Holdings</h2>
              </div>
              {holdings.length === 0 ? (
                <div className="p-8 text-center">
                  <DollarSign
                    size={32}
                    className="text-text-tertiary mx-auto mb-2"
                  />
                  <p className="text-sm text-text-tertiary">
                    No holdings yet
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate('/trade')}
                  >
                    Start Trading
                  </Button>
                </div>
              ) : (
                <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-text-tertiary uppercase tracking-wider">
                        <th className="text-left p-4 font-medium">Symbol</th>
                        <th className="text-right p-4 font-medium">Shares</th>
                        <th className="text-right p-4 font-medium">Avg Cost</th>
                        <th className="text-right p-4 font-medium">Current</th>
                        <th className="text-right p-4 font-medium">Value</th>
                        <th className="text-right p-4 font-medium">P&L</th>
                        <th className="p-4 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {portfolioMetrics.holdingsWithPnL.map((h) => (
                        <tr
                          key={h.symbol}
                          className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                          onClick={() => navigate(`/stock/${h.symbol}`)}
                        >
                          <td className="p-4 font-semibold">{h.symbol}</td>
                          <td className="p-4 text-right tabular-nums">{h.shares}</td>
                          <td className="p-4 text-right tabular-nums text-text-secondary">{formatCurrency(h.avgCostBasis)}</td>
                          <td className="p-4 text-right tabular-nums">{formatCurrency(h.currentPrice)}</td>
                          <td className="p-4 text-right tabular-nums">{formatCurrency(h.currentValue)}</td>
                          <td className="p-4 text-right">
                            <div className={`tabular-nums ${h.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>{formatCurrency(h.pnl)}</div>
                            <div className={`text-xs tabular-nums ${h.pnlPercent >= 0 ? 'text-gain' : 'text-loss'}`}>{formatPercent(h.pnlPercent)}</div>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); openTrade(h.symbol, 'sell') }}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-loss/10 text-loss hover:bg-loss/20 transition-colors"
                            >
                              Sell
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden divide-y divide-white/[0.04]">
                  {portfolioMetrics.holdingsWithPnL.map((h) => (
                    <div
                      key={h.symbol}
                      className="p-3 cursor-pointer active:bg-white/[0.02] transition-colors"
                      onClick={() => navigate(`/stock/${h.symbol}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{h.symbol}</span>
                          <span className="text-xs text-text-tertiary">{h.shares} shares</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); openTrade(h.symbol, 'sell') }}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-loss/10 text-loss"
                        >
                          Sell
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="text-text-secondary">
                          <span>Avg {formatCurrency(h.avgCostBasis)}</span>
                          <span className="mx-1.5">·</span>
                          <span>Now {formatCurrency(h.currentPrice)}</span>
                        </div>
                        <div className={`font-medium tabular-nums ${h.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                          {formatCurrency(h.pnl)} ({formatPercent(h.pnlPercent)})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </>
              )}
            </GlassCard>
          </motion.div>

          {/* Allocation chart */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            custom={5}
          >
            <GlassCard>
              <h2 className="text-sm font-semibold mb-4">Allocation</h2>
              {allocationData.length > 0 ? (
                <>
                  <AllocationPie data={allocationData} />
                  <div className="mt-4 space-y-2">
                    {allocationData.map((item, i) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                item.color ||
                                [
                                  '#3b82f6',
                                  '#06b6d4',
                                  '#8b5cf6',
                                  '#f59e0b',
                                  '#22c55e',
                                  '#ef4444',
                                  '#ec4899',
                                  '#64748b',
                                ][i % 8],
                            }}
                          />
                          <span className="text-text-secondary">
                            {item.name}
                          </span>
                        </div>
                        <span className="tabular-nums">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-xs text-text-tertiary">
                  Start trading to see your allocation
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Portfolio Doctor */}
        <motion.div variants={cardVariants} initial="initial" animate="animate" custom={6}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Stethoscope size={16} className="text-accent-blue" />
                <h2 className="text-sm font-semibold">Portfolio Doctor</h2>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDoctorAnalysis}
                disabled={doctorLoading || holdings.length === 0}
              >
                {doctorLoading ? (
                  <><Loader2 size={13} className="animate-spin" /> Analyzing...</>
                ) : (
                  <><Stethoscope size={13} /> {doctorData ? 'Re-analyze' : 'Analyze My Portfolio'}</>
                )}
              </Button>
            </div>

            {!doctorData && !doctorLoading && (
              <p className="text-xs text-text-tertiary text-center py-4">
                {holdings.length === 0
                  ? 'Add holdings before running an analysis.'
                  : 'Get an AI-powered health check of your portfolio — strengths, risks, and a learning tip.'}
              </p>
            )}

            {doctorLoading && (
              <div className="flex items-center justify-center gap-2 py-8 text-text-secondary text-sm">
                <Loader2 size={16} className="animate-spin text-accent-blue" />
                Analyzing your portfolio...
              </div>
            )}

            <AnimatePresence>
              {doctorData && !doctorLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Grade + summary */}
                  <div className={`flex items-start gap-3 p-3 rounded-xl border ${gradeBg[doctorData.grade] ?? 'bg-white/5 border-white/10'}`}>
                    <div className={`text-3xl font-black ${gradeColor[doctorData.grade] ?? 'text-text-primary'}`}>
                      {doctorData.grade}
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed pt-1">{doctorData.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Strengths */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Star size={12} className="text-gain" />
                        <span className="text-xs font-semibold text-gain uppercase tracking-wider">Strengths</span>
                      </div>
                      <ul className="space-y-1">
                        {doctorData.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                            <span className="text-gain mt-0.5 shrink-0">✓</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <ArrowUp size={12} className="text-yellow-400" />
                        <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Improve</span>
                      </div>
                      <ul className="space-y-1">
                        {doctorData.improvements.map((s, i) => (
                          <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                            <span className="text-yellow-400 mt-0.5 shrink-0">→</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Learning tip */}
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-accent-blue/5 border border-accent-blue/15">
                    <Lightbulb size={13} className="text-accent-blue shrink-0 mt-0.5" />
                    <p className="text-xs text-text-secondary leading-relaxed">
                      <span className="text-accent-blue font-semibold">Tip: </span>
                      {doctorData.tip}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>
      </div>
    </PageTransition>
  )
}
