import { GlassCard } from './GlassCard'
import { cn } from '../../lib/utils'
import { motion, AnimatePresence } from 'motion/react'

interface MetricCardProps {
  label: string
  value: string
  change?: string
  changePercent?: number
  icon?: React.ReactNode
  accentColor?: 'blue' | 'green' | 'red' | 'purple'
  className?: string
}

const accentMap = {
  blue: 'from-accent-blue/10 to-transparent',
  green: 'from-gain/10 to-transparent',
  red: 'from-loss/10 to-transparent',
  purple: 'from-accent-purple/10 to-transparent',
}

export function MetricCard({
  label,
  value,
  change,
  changePercent,
  icon,
  accentColor = 'blue',
  className,
}: MetricCardProps) {
  const isPositive = changePercent !== undefined ? changePercent >= 0 : undefined

  return (
    <GlassCard hover className={cn('flex flex-col gap-3 relative', className)}>
      {/* Accent gradient glow */}
      <div
        className={cn(
          'absolute top-0 right-0 w-32 h-32 bg-gradient-radial rounded-full opacity-50 blur-2xl pointer-events-none',
          isPositive === true && 'bg-gain/8',
          isPositive === false && 'bg-loss/8',
          isPositive === undefined && 'bg-accent-blue/8'
        )}
      />

      <div className="flex items-center justify-between relative">
        <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
          {label}
        </span>
        {icon && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.2 }}
          >
            {icon}
          </motion.span>
        )}
      </div>
      <div className="flex items-end gap-2.5 relative">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="text-lg sm:text-2xl font-bold tabular-nums text-text-primary font-display tracking-tight"
          >
            {value}
          </motion.span>
        </AnimatePresence>
        {change && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className={cn(
              'text-xs font-semibold tabular-nums pb-1',
              isPositive === true && 'text-gain',
              isPositive === false && 'text-loss'
            )}
          >
            {change}
          </motion.span>
        )}
      </div>
    </GlassCard>
  )
}
