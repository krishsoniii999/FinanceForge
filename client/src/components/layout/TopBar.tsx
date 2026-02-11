import { Search, Command, Sparkles, Menu } from 'lucide-react'
import { useChatStore } from '../../stores/useChatStore'

interface TopBarProps {
  onSearchOpen: () => void
  onMobileMenuOpen?: () => void
}

export function TopBar({ onSearchOpen, onMobileMenuOpen }: TopBarProps) {
  const toggleChat = useChatStore((s) => s.toggleOpen)

  return (
    <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 border-b border-white/[0.06] bg-bg-secondary/30 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuOpen}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors md:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-medium text-text-secondary hidden sm:block">
          Welcome back
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search trigger */}
        <button
          onClick={onSearchOpen}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-tertiary hover:text-text-secondary hover:bg-white/[0.06] transition-all duration-200"
        >
          <Search size={14} />
          <span className="text-xs hidden sm:inline">Search stocks...</span>
          <div className="hidden sm:flex items-center gap-0.5 ml-2">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-medium">
              <Command size={10} className="inline" />
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-medium">
              K
            </kbd>
          </div>
        </button>

        {/* AI Chat toggle */}
        <button
          onClick={toggleChat}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue hover:bg-accent-blue/20 transition-all duration-200"
        >
          <Sparkles size={14} />
          <span className="text-xs font-medium">AI</span>
          <div className="hidden sm:flex items-center gap-0.5 ml-1">
            <kbd className="px-1.5 py-0.5 rounded bg-accent-blue/10 border border-accent-blue/20 text-[10px] font-medium">
              <Command size={10} className="inline" />
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-accent-blue/10 border border-accent-blue/20 text-[10px] font-medium">
              J
            </kbd>
          </div>
        </button>

        {/* Market status indicator - hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="w-2 h-2 rounded-full bg-gain animate-pulse" />
          <span className="text-xs text-text-secondary">Market Open</span>
        </div>
      </div>
    </header>
  )
}
