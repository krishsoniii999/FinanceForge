import { PageTransition } from '../components/layout/PageTransition'
import { GlassCard } from '../components/ui/GlassCard'
import { Button } from '../components/ui/Button'
import { usePortfolioStore } from '../stores/usePortfolioStore'
import { useWatchlistStore } from '../stores/useWatchlistStore'
import { useLessonStore } from '../stores/useLessonStore'
import { useOnboardingStore } from '../stores/useOnboardingStore'
import { formatCurrency } from '../lib/formatters'
import { STARTING_CASH } from '../lib/constants'
import {
  Settings as SettingsIcon,
  RotateCcw,
  Info,
  GraduationCap,
} from 'lucide-react'

export function Settings() {
  const { cashBalance, holdings, transactions, reset: resetPortfolio } =
    usePortfolioStore()
  const { symbols } = useWatchlistStore()
  const { progress } = useLessonStore()
  const { reset: resetOnboarding } = useOnboardingStore()
  const completedLessons = Object.values(progress).filter(
    (p) => p.completed
  ).length

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Account overview */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Info size={16} className="text-accent-blue" />
            <h2 className="text-sm font-semibold">Account Overview</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-tertiary text-xs uppercase tracking-wider">
                Cash Balance
              </span>
              <p className="font-semibold tabular-nums mt-1">
                {formatCurrency(cashBalance)}
              </p>
            </div>
            <div>
              <span className="text-text-tertiary text-xs uppercase tracking-wider">
                Holdings
              </span>
              <p className="font-semibold mt-1">{holdings.length} stocks</p>
            </div>
            <div>
              <span className="text-text-tertiary text-xs uppercase tracking-wider">
                Total Trades
              </span>
              <p className="font-semibold mt-1">{transactions.length}</p>
            </div>
            <div>
              <span className="text-text-tertiary text-xs uppercase tracking-wider">
                Watchlist
              </span>
              <p className="font-semibold mt-1">{symbols.length} symbols</p>
            </div>
            <div>
              <span className="text-text-tertiary text-xs uppercase tracking-wider">
                Lessons Completed
              </span>
              <p className="font-semibold mt-1">{completedLessons}</p>
            </div>
            <div>
              <span className="text-text-tertiary text-xs uppercase tracking-wider">
                Starting Cash
              </span>
              <p className="font-semibold tabular-nums mt-1">
                {formatCurrency(STARTING_CASH)}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Reset portfolio */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <RotateCcw size={16} className="text-accent-blue" />
            <h2 className="text-sm font-semibold">Reset Portfolio</h2>
          </div>
          <p className="text-xs text-text-secondary mb-4">
            Reset your portfolio back to {formatCurrency(STARTING_CASH)} starting
            cash. All holdings and trade history will be cleared.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (
                confirm(
                  'Are you sure? This will clear all your trades and reset to $100K.'
                )
              ) {
                resetPortfolio()
              }
            }}
          >
            <RotateCcw size={14} />
            Reset Portfolio
          </Button>
        </GlassCard>

        {/* Replay Tutorial */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={16} className="text-accent-blue" />
            <h2 className="text-sm font-semibold">Tutorial</h2>
          </div>
          <p className="text-xs text-text-secondary mb-4">
            Replay the onboarding tutorial to learn about FinanceForge features.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => resetOnboarding()}
          >
            <GraduationCap size={14} />
            Replay Tutorial
          </Button>
        </GlassCard>

        {/* About */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon size={16} className="text-accent-blue" />
            <h2 className="text-sm font-semibold">About FinanceForge</h2>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            FinanceForge is a paper trading and financial education platform.
            Practice investing with virtual money while learning the fundamentals
            of the stock market. All market data is real-time from Yahoo Finance.
            No real money is involved.
          </p>
          <div className="mt-3 text-xs text-text-tertiary">
            Version 1.0.0
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  )
}
