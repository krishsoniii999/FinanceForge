import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTradeStore } from '../../stores/useTradeStore'
import { usePortfolioStore } from '../../stores/usePortfolioStore'
import { useStockQuote } from '../../hooks/useStockQuote'
import { executeTrade, getTradeCoach } from '../../lib/api'
import { formatCurrency, formatPercent } from '../../lib/formatters'
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  BookOpen,
  AlertTriangle,
} from 'lucide-react'

type CoachData = {
  whatTheyDo: string
  whatItMeans: string
  thingsToKnow: string[]
  riskLevel: 'Low' | 'Medium' | 'High'
  riskReason: string
}

const riskConfig = {
  Low:    { color: 'text-gain',         bg: 'bg-gain/10',         border: 'border-gain/20',         icon: Shield },
  Medium: { color: 'text-yellow-400',   bg: 'bg-yellow-400/10',   border: 'border-yellow-400/20',   icon: AlertTriangle },
  High:   { color: 'text-loss',         bg: 'bg-loss/10',         border: 'border-loss/20',         icon: AlertCircle },
}

export function TradeModal() {
  const { isOpen, symbol, defaultAction, close } = useTradeStore()
  const { cashBalance, holdings } = usePortfolioStore()
  const queryClient = useQueryClient()

  const [action, setAction] = useState<'buy' | 'sell'>('buy')
  const [shares, setShares] = useState(1)
  const [step, setStep] = useState<'input' | 'coach' | 'confirm' | 'success' | 'error'>('input')
  const [errorMessage, setErrorMessage] = useState('')
  const [coachData, setCoachData] = useState<CoachData | null>(null)
  const [coachLoading, setCoachLoading] = useState(false)

  const { data: quote, isLoading: quoteLoading } = useStockQuote(symbol || '')

  useEffect(() => {
    if (isOpen) {
      setAction(defaultAction)
      setShares(1)
      setStep('input')
      setErrorMessage('')
      setCoachData(null)
    }
  }, [isOpen, defaultAction])

  const currentHolding = holdings.find((h) => h.symbol === symbol)
  const maxShares = useMemo(() => {
    if (!quote) return 0
    return action === 'buy'
      ? Math.floor(cashBalance / quote.price)
      : currentHolding?.shares || 0
  }, [action, cashBalance, quote, currentHolding])

  const totalCost = useMemo(() => shares * (quote?.price || 0), [shares, quote])

  const tradeMutation = useMutation({
    mutationFn: executeTrade,
    onSuccess: (data) => {
      usePortfolioStore.getState().setCashBalance(data.portfolio.cashBalance)
      usePortfolioStore.getState().setHoldings(data.portfolio.holdings)
      usePortfolioStore.getState().addTransaction(data.trade)
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      setStep('success')
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.error || 'Trade failed. Please try again.')
      setStep('error')
    },
  })

  const handleReviewOrder = async () => {
    if (!symbol || !quote) return
    setCoachLoading(true)
    setStep('coach')
    try {
      const data = await getTradeCoach({ symbol, action, shares, price: quote.price, totalCost, cashBalance })
      setCoachData(data)
    } catch {
      // If coach fails, just skip to confirm
      setStep('confirm')
    } finally {
      setCoachLoading(false)
    }
  }

  const handleConfirm = () => {
    if (!symbol || shares <= 0) return
    tradeMutation.mutate({ symbol, action, shares })
  }

  const isPositive = (quote?.changePercent ?? 0) >= 0

  if (!isOpen || !symbol) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={close}
        />

        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative z-10 w-full max-w-md mx-4 sm:mx-0"
        >
          <div className="glass-card overflow-hidden rounded-3xl border border-white/[0.08]">
            {/* Header */}
            <div className="relative p-6 pb-4 border-b border-white/[0.06]">
              <button
                onClick={close}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-text-tertiary hover:text-text-primary"
              >
                <X size={20} />
              </button>

              {quoteLoading ? (
                <div className="animate-pulse">
                  <div className="h-6 w-20 bg-white/10 rounded mb-2" />
                  <div className="h-10 w-32 bg-white/10 rounded" />
                </div>
              ) : quote ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold font-display">{quote.symbol}</span>
                    <span className="text-sm text-text-secondary">{quote.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold tabular-nums font-display">
                      {formatCurrency(quote.price)}
                    </span>
                    <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-gain' : 'text-loss'}`}>
                      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span className="tabular-nums">{formatPercent(quote.changePercent)}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">

              {/* ── Step 1: Input ── */}
              {step === 'input' && (
                <motion.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.04] rounded-2xl">
                    <button onClick={() => setAction('buy')} className={`py-3 rounded-xl text-sm font-semibold transition-all ${action === 'buy' ? 'bg-gain text-black shadow-lg shadow-gain/25' : 'text-text-tertiary hover:text-text-secondary'}`}>Buy</button>
                    <button onClick={() => setAction('sell')} className={`py-3 rounded-xl text-sm font-semibold transition-all ${action === 'sell' ? 'bg-loss text-white shadow-lg shadow-loss/25' : 'text-text-tertiary hover:text-text-secondary'}`}>Sell</button>
                  </div>

                  <div className="text-center">
                    <label className="text-xs text-text-tertiary uppercase tracking-wider mb-3 block">Shares</label>
                    <div className="flex items-center justify-center gap-6">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShares(Math.max(1, shares - 1))} className="w-12 h-12 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors" disabled={shares <= 1}>
                        <Minus size={20} className={shares <= 1 ? 'text-text-tertiary' : ''} />
                      </motion.button>
                      <motion.div key={shares} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24">
                        <input type="number" value={shares} onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))} className="w-full text-center text-5xl font-bold tabular-nums bg-transparent focus:outline-none font-display" min={1} max={maxShares} />
                      </motion.div>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShares(Math.min(maxShares, shares + 1))} className="w-12 h-12 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors" disabled={shares >= maxShares}>
                        <Plus size={20} className={shares >= maxShares ? 'text-text-tertiary' : ''} />
                      </motion.button>
                    </div>
                    <button onClick={() => setShares(maxShares)} className="mt-3 text-xs text-accent-blue hover:text-accent-blue/80 transition-colors">Max: {maxShares.toLocaleString()} shares</button>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex justify-between text-sm mb-2"><span className="text-text-secondary">Market price</span><span className="tabular-nums">{formatCurrency(quote?.price || 0)}</span></div>
                    <div className="flex justify-between text-sm mb-3"><span className="text-text-secondary">Shares</span><span className="tabular-nums">&times; {shares}</span></div>
                    <div className="h-px bg-white/[0.08] mb-3" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{action === 'buy' ? 'Total Cost' : 'Total Credit'}</span>
                      <motion.span key={totalCost} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-xl font-bold tabular-nums font-display">{formatCurrency(totalCost)}</motion.span>
                    </div>
                  </div>

                  <div className="text-center text-xs text-text-tertiary">
                    {action === 'buy' ? (<>Cash available: <span className="text-text-primary">{formatCurrency(cashBalance)}</span>{totalCost > cashBalance && <span className="text-loss ml-2">(Insufficient funds)</span>}</>) : (<>Shares owned: <span className="text-text-primary">{currentHolding?.shares || 0}</span>{shares > (currentHolding?.shares || 0) && <span className="text-loss ml-2">(Not enough shares)</span>}</>)}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleReviewOrder}
                    disabled={shares <= 0 || !quote || (action === 'buy' && totalCost > cashBalance) || (action === 'sell' && shares > (currentHolding?.shares || 0))}
                    className={`w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${action === 'buy' ? 'bg-gain text-black hover:bg-gain/90 disabled:bg-gain/30 disabled:text-black/50' : 'bg-loss text-white hover:bg-loss/90 disabled:bg-loss/30 disabled:text-white/50'}`}
                  >
                    Review Order <ChevronRight size={16} />
                  </motion.button>
                </motion.div>
              )}

              {/* ── Step 2: Trade Coach ── */}
              {step === 'coach' && (
                <motion.div key="coach" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={16} className="text-accent-blue" />
                    <span className="text-sm font-semibold text-accent-blue uppercase tracking-wider">Trade Coach</span>
                  </div>

                  {coachLoading ? (
                    <div className="space-y-3 py-4">
                      <div className="flex items-center gap-3 text-text-secondary text-sm">
                        <Loader2 size={16} className="animate-spin text-accent-blue" />
                        Analyzing this trade for you...
                      </div>
                      {[1,2,3].map(i => <div key={i} className="h-4 bg-white/[0.06] rounded animate-pulse" style={{ width: `${75 + i * 7}%` }} />)}
                    </div>
                  ) : coachData ? (
                    <>
                      {/* Risk badge */}
                      {(() => {
                        const cfg = riskConfig[coachData.riskLevel]
                        const Icon = cfg.icon
                        return (
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                            <Icon size={14} className={cfg.color} />
                            <span className={`text-xs font-semibold ${cfg.color}`}>{coachData.riskLevel} Risk</span>
                            <span className="text-xs text-text-secondary">— {coachData.riskReason}</span>
                          </div>
                        )
                      })()}

                      {/* What the company does */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">About {symbol}</p>
                        <p className="text-sm text-text-primary leading-relaxed">{coachData.whatTheyDo}</p>
                      </div>

                      {/* What this trade means */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">What this means</p>
                        <p className="text-sm text-text-primary leading-relaxed">{coachData.whatItMeans}</p>
                      </div>

                      {/* Things to know */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Things to know</p>
                        <ul className="space-y-1.5">
                          {coachData.thingsToKnow.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                              <span className="text-accent-blue mt-0.5 shrink-0">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : null}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep('input')} className="py-4 rounded-2xl font-semibold text-sm bg-white/[0.06] hover:bg-white/[0.1] transition-colors">
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setStep('confirm')}
                      disabled={coachLoading}
                      className={`py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 ${action === 'buy' ? 'bg-gain text-black hover:bg-gain/90 disabled:opacity-50' : 'bg-loss text-white hover:bg-loss/90 disabled:opacity-50'}`}
                    >
                      Got it, Continue <ChevronRight size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Confirm ── */}
              {step === 'confirm' && (
                <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-6">
                  <div className="text-center py-4">
                    <h3 className="text-lg font-semibold mb-1">Confirm {action === 'buy' ? 'Purchase' : 'Sale'}</h3>
                    <p className="text-sm text-text-secondary">You're about to {action} {shares} share{shares > 1 ? 's' : ''} of {symbol}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Symbol</span><span className="font-semibold">{symbol}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Action</span><span className={`font-semibold ${action === 'buy' ? 'text-gain' : 'text-loss'}`}>{action.toUpperCase()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Shares</span><span className="tabular-nums">{shares}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Price per share</span><span className="tabular-nums">{formatCurrency(quote?.price || 0)}</span></div>
                    <div className="h-px bg-white/[0.08]" />
                    <div className="flex justify-between"><span className="font-medium">Total</span><span className="text-lg font-bold tabular-nums">{formatCurrency(totalCost)}</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep('coach')} className="py-4 rounded-2xl font-semibold text-sm bg-white/[0.06] hover:bg-white/[0.1] transition-colors">Back</motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleConfirm}
                      disabled={tradeMutation.isPending}
                      className={`py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 ${action === 'buy' ? 'bg-gain text-black hover:bg-gain/90' : 'bg-loss text-white hover:bg-loss/90'}`}
                    >
                      {tradeMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : `Confirm ${action === 'buy' ? 'Buy' : 'Sell'}`}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Success ── */}
              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 text-center py-12">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }} className="w-16 h-16 mx-auto mb-4 rounded-full bg-gain/20 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-gain" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">Order Executed!</h3>
                  <p className="text-sm text-text-secondary mb-6">You {action === 'buy' ? 'bought' : 'sold'} {shares} share{shares > 1 ? 's' : ''} of {symbol} for {formatCurrency(totalCost)}</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={close} className="px-8 py-3 rounded-2xl font-semibold text-sm bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors">Done</motion.button>
                </motion.div>
              )}

              {/* ── Step 5: Error ── */}
              {step === 'error' && (
                <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 text-center py-12">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }} className="w-16 h-16 mx-auto mb-4 rounded-full bg-loss/20 flex items-center justify-center">
                    <AlertCircle size={32} className="text-loss" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">Trade Failed</h3>
                  <p className="text-sm text-text-secondary mb-6">{errorMessage}</p>
                  <div className="flex gap-3 justify-center">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={close} className="px-6 py-3 rounded-2xl font-semibold text-sm bg-white/[0.06] hover:bg-white/[0.1] transition-colors">Cancel</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep('input')} className="px-6 py-3 rounded-2xl font-semibold text-sm bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors">Try Again</motion.button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
