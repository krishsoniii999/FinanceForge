import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '../../stores/useOnboardingStore'
import { useTradeStore } from '../../stores/useTradeStore'
import {
  Rocket,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  BarChart3,
  Wallet,
  GraduationCap,
} from 'lucide-react'

const STEPS = [
  {
    id: 'welcome',
    icon: Rocket,
    iconBg: 'from-accent-blue to-accent-purple',
    title: 'Welcome to FinanceForge',
    subtitle: 'Your journey to financial mastery starts here',
    description:
      "You're about to learn investing by doing it. We've given you $100,000 in virtual money to practice with real market data.",
    tip: 'No risk, all learning. Your virtual trades use real stock prices.',
  },
  {
    id: 'watchlist',
    icon: BarChart3,
    iconBg: 'from-cyan-500 to-blue-500',
    title: 'Track What Matters',
    subtitle: 'Your watchlist is your radar',
    description:
      "We've added some popular stocks to get you started. Click any stock to see detailed charts, news, and analyst ratings.",
    tip: 'Use the search bar (⌘K) to find and add any stock to your watchlist.',
  },
  {
    id: 'trading',
    icon: TrendingUp,
    iconBg: 'from-gain to-emerald-400',
    title: 'Make Your First Trade',
    subtitle: 'Buy low, sell high (hopefully)',
    description:
      'When you find a stock you like, click Trade to open the order panel. Choose how many shares you want and confirm your order.',
    tip: 'Start small. Even Warren Buffett started with his first share.',
  },
  {
    id: 'portfolio',
    icon: Wallet,
    iconBg: 'from-amber-500 to-orange-500',
    title: 'Track Your Performance',
    subtitle: 'See your gains (and learn from losses)',
    description:
      "Your portfolio shows all your holdings with real-time profit & loss. Watch how your decisions play out with actual market movements.",
    tip: 'Check your portfolio daily to understand how markets move.',
  },
  {
    id: 'learn',
    icon: GraduationCap,
    iconBg: 'from-purple-500 to-pink-500',
    title: 'Learn As You Go',
    subtitle: 'Education meets experience',
    description:
      "Our lessons teach you investing concepts with interactive examples. Plus, our AI assistant can answer any question about your portfolio or the markets.",
    tip: 'Press ⌘J anytime to ask our AI about stocks or strategies.',
  },
  {
    id: 'ready',
    icon: Sparkles,
    iconBg: 'from-accent-blue via-purple-500 to-pink-500',
    title: "You're Ready!",
    subtitle: 'Time to start your investing journey',
    description:
      "You've got $100K virtual dollars waiting. Explore the markets, make trades, learn from the results. The best investors learn by doing.",
    tip: null,
  },
]

export function OnboardingModal() {
  const { completed, complete } = useOnboardingStore()
  const navigate = useNavigate()
  const openTrade = useTradeStore((s) => s.open)
  const [currentStep, setCurrentStep] = useState(0)

  if (completed) return null

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      complete()
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep((s) => s - 1)
    }
  }

  const handleSkip = () => {
    complete()
  }

  const handleQuickAction = () => {
    complete()
    if (step.id === 'trading') {
      openTrade('AAPL')
    } else if (step.id === 'learn') {
      navigate('/lessons')
    } else if (step.id === 'portfolio') {
      navigate('/portfolio')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-accent-blue/30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="glass-card rounded-3xl overflow-hidden border border-white/[0.1]">
          {/* Progress bar */}
          <div className="h-1 bg-white/[0.06]">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-blue to-accent-purple"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.iconBg} flex items-center justify-center shadow-lg`}
                  style={{
                    boxShadow: `0 8px 32px -8px rgba(59, 130, 246, 0.5)`,
                  }}
                >
                  <step.icon size={36} className="text-white" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-bold font-display mb-2"
                >
                  {step.title}
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-accent-blue font-medium text-sm mb-4"
                >
                  {step.subtitle}
                </motion.p>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-text-secondary text-sm leading-relaxed mb-6"
                >
                  {step.description}
                </motion.p>

                {/* Tip */}
                {step.tip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl bg-accent-blue/5 border border-accent-blue/10 text-xs text-text-secondary"
                  >
                    <span className="text-accent-blue font-semibold">Pro tip:</span> {step.tip}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  Back
                </motion.button>
              )}
              {isFirstStep && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 rounded-xl text-sm text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  Skip tutorial
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentStep
                        ? 'bg-accent-blue w-6'
                        : i < currentStep
                        ? 'bg-accent-blue/50'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent-blue to-accent-purple text-white flex items-center gap-2 shadow-lg shadow-accent-blue/25"
              >
                {isLastStep ? (
                  <>
                    <Check size={14} />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={14} />
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Quick action for specific steps */}
          {['trading', 'learn', 'portfolio'].includes(step.id) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-6 pb-6"
            >
              <button
                onClick={handleQuickAction}
                className="w-full py-3 rounded-xl text-sm font-medium text-accent-blue bg-accent-blue/5 hover:bg-accent-blue/10 border border-accent-blue/10 transition-colors"
              >
                {step.id === 'trading' && 'Try it now: Trade AAPL'}
                {step.id === 'learn' && 'Try it now: View lessons'}
                {step.id === 'portfolio' && 'Try it now: View portfolio'}
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
