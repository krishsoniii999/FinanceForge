import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { StockSearch } from '../market/StockSearch'
import { ChatPanel } from '../ai/ChatPanel'
import { TradeModal } from '../trade/TradeModal'
import { OnboardingModal } from '../onboarding/OnboardingModal'

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  return (
    <div className="h-full flex relative">
      {/* Ambient background */}
      <div className="ambient-bg">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="ambient-orb-3" />
      </div>

      {/* Noise texture for depth */}
      <div className="noise-overlay" />

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopBar
          onSearchOpen={() => setSearchOpen(true)}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Global search overlay */}
      <StockSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* AI Chat panel */}
      <ChatPanel />

      {/* Trade modal */}
      <TradeModal />

      {/* Onboarding for new users */}
      <OnboardingModal />
    </div>
  )
}
