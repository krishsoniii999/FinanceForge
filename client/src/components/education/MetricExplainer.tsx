import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { metricGlossary } from '../../data/metric-glossary'

interface MetricExplainerProps {
  metricKey: string
}

export function MetricExplainer({ metricKey }: MetricExplainerProps) {
  const [open, setOpen] = useState(false)
  const metric = metricGlossary[metricKey]

  if (!metric) return null

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-text-tertiary hover:text-accent-blue transition-colors p-0.5"
        aria-label={`Learn about ${metric.name}`}
      >
        <HelpCircle size={12} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-2 z-50 w-64 glass-card p-3 text-left"
            >
              <h4 className="text-xs font-semibold text-accent-blue mb-1">
                {metric.name}
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                {metric.description}
              </p>
              {metric.whyItMatters && (
                <p className="text-xs text-text-tertiary mt-2 leading-relaxed">
                  <span className="font-medium text-text-secondary">
                    Why it matters:{' '}
                  </span>
                  {metric.whyItMatters}
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
