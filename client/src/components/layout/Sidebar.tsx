import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Briefcase,
  GraduationCap,
  Settings,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Newspaper,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/trade', icon: ArrowLeftRight, label: 'Trade' },
  { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { path: '/research', icon: Sparkles, label: 'Research' },
  { path: '/news', icon: Newspaper, label: 'News' },
  { path: '/lessons', icon: GraduationCap, label: 'Lessons' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()

  const sidebarContent = (isMobile: boolean) => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-14 sm:h-16 border-b border-white/[0.06]">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        >
          <TrendingUp size={18} className="text-white" />
        </motion.div>
        {(isMobile || !collapsed) && (
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="text-sm font-bold tracking-tight font-display gradient-text-blue"
          >
            FinanceForge
          </motion.span>
        )}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="ml-auto p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04] transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path)

          return (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className="block relative"
              onClick={isMobile ? onMobileClose : undefined}
            >
              <motion.div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 relative',
                  isActive
                    ? 'text-white'
                    : 'text-text-secondary hover:text-text-primary'
                )}
                whileHover={!isActive ? { x: 4, backgroundColor: 'rgba(255,255,255,0.04)' } : undefined}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {isActive && (
                  <motion.div
                    layoutId={isMobile ? 'sidebar-active-mobile' : 'sidebar-active'}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-blue/20 to-accent-purple/10 border border-accent-blue/25"
                    style={{
                      boxShadow: '0 0 20px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <Icon size={18} className={cn('flex-shrink-0 relative z-10', isActive && 'text-accent-blue')} />
                {(isMobile || !collapsed) && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="relative z-10"
                  >
                    {label}
                  </motion.span>
                )}
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse toggle - desktop only */}
      {!isMobile && (
        <div className="p-3 border-t border-white/[0.06]">
          <motion.button
            onClick={onToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center p-2 rounded-xl text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04] transition-all duration-200"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </motion.button>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex h-full flex-col border-r border-white/[0.06] bg-bg-secondary/60 backdrop-blur-2xl relative z-10"
      >
        {sidebarContent(false)}
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-[280px] flex flex-col border-r border-white/[0.06] bg-bg-primary/95 backdrop-blur-2xl z-50 md:hidden"
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
