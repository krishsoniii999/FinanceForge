import { cn } from '../../lib/utils'
import { motion } from 'motion/react'

interface TabsProps<T extends string> {
  tabs: readonly T[]
  active: T
  onChange: (tab: T) => void
  className?: string
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-x-auto max-w-full scrollbar-none',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            'relative px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 whitespace-nowrap flex-shrink-0',
            active === tab ? 'text-white' : 'text-text-tertiary hover:text-text-secondary'
          )}
        >
          {active === tab && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 bg-accent-blue/20 border border-accent-blue/30 rounded-lg"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  )
}
