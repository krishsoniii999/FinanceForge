import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Search, TrendingUp, ArrowRight } from 'lucide-react'
import { useStockSearch } from '../../hooks/useStockSearch'

interface StockSearchProps {
  open: boolean
  onClose: () => void
}

export function StockSearch({ open, onClose }: StockSearchProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { data: results, isLoading } = useStockSearch(query)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) {
          onClose()
        } else {
          // parent will handle opening
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleSelect = (symbol: string) => {
    onClose()
    navigate(`/stock/${symbol}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="glass-card relative z-10 w-full max-w-xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
              <Search size={18} className="text-text-tertiary flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stocks, ETFs, crypto..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
              <kbd className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] text-text-tertiary font-medium">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading && query.length > 0 && (
                <div className="p-4 text-sm text-text-tertiary text-center">
                  Searching...
                </div>
              )}

              {results && results.length > 0 && (
                <div className="p-2">
                  {results.map((result) => (
                    <button
                      key={result.symbol}
                      onClick={() => handleSelect(result.symbol)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/[0.06] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp size={14} className="text-accent-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{result.symbol}</div>
                        <div className="text-xs text-text-tertiary truncate">
                          {result.name}
                        </div>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
              )}

              {results && results.length === 0 && query.length > 0 && !isLoading && (
                <div className="p-8 text-sm text-text-tertiary text-center">
                  No results found for "{query}"
                </div>
              )}

              {query.length === 0 && (
                <div className="p-4 text-xs text-text-tertiary text-center">
                  Type to search for stocks, ETFs, and more
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
