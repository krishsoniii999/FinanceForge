import { useState } from 'react'
import { PageTransition } from '../components/layout/PageTransition'
import { NewsFeed } from '../components/news/NewsFeed'
import { Tabs } from '../components/ui/Tabs'
import { useWatchlistStore } from '../stores/useWatchlistStore'
import { Newspaper } from 'lucide-react'

export function News() {
  const watchlistSymbols = useWatchlistStore((s) => s.symbols)
  const [activeSymbol, setActiveSymbol] = useState(watchlistSymbols[0] || 'AAPL')

  const symbols = watchlistSymbols.length > 0 ? watchlistSymbols : ['AAPL', 'MSFT', 'GOOGL']

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper size={20} className="text-accent-blue" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">News</h1>
          </div>
          <p className="text-sm text-text-secondary">
            Latest financial news from your watchlist
          </p>
        </div>

        <Tabs
          tabs={symbols as readonly string[]}
          active={activeSymbol}
          onChange={setActiveSymbol}
        />

        <NewsFeed symbol={activeSymbol} />
      </div>
    </PageTransition>
  )
}
