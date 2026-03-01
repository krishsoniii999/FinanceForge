import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { HelpCircle, Loader2, X } from 'lucide-react'
import { explainTerm } from '../../lib/api'

interface MetricTooltipProps {
  term: string
  context?: string
  children: React.ReactNode
}

export function MetricTooltip({ term, context, children }: MetricTooltipProps) {
  const [open, setOpen] = useState(false)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (open) { setOpen(false); return }
    setOpen(true)
    if (explanation) return
    setLoading(true)
    try {
      const data = await explainTerm(term, context)
      setExplanation(data.explanation)
    } catch {
      setExplanation('Unable to load explanation right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <span ref={ref} className="relative inline-flex items-center gap-1 group">
      {children}
      <button
        onClick={handleClick}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-accent-blue"
        title={`Explain ${term}`}
      >
        <HelpCircle size={12} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 z-50 w-64 glass-card rounded-2xl border border-white/[0.12] p-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <HelpCircle size={12} className="text-accent-blue shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-accent-blue uppercase tracking-wider">{term}</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
                <X size={12} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-text-secondary text-xs py-1">
                <Loader2 size={12} className="animate-spin text-accent-blue" />
                Loading explanation...
              </div>
            ) : (
              <p className="text-xs text-text-secondary leading-relaxed">{explanation}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
