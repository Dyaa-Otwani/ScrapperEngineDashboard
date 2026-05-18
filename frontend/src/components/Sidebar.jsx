// src/components/Sidebar.jsx — Collapsible, fully responsive sidebar
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Cpu, BarChart3,
  Download, Database, ChevronLeft, ChevronRight
} from 'lucide-react'

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/scraper',   icon: Cpu,             label: 'Scraper'    },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics'  },
  { to: '/database',  icon: Database,        label: 'Database'   },
  { to: '/export',    icon: Download,        label: 'Export'     },
]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const content = (isMobile = false) => (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25">
            <Cpu size={15} className="text-white" />
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                key="label"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <p className="font-bold text-sm text-white whitespace-nowrap leading-tight">ScraperEngine</p>
                <p className="text-[10px] text-slate-500 whitespace-nowrap">Analytics Pro</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={isMobile ? onMobileClose : undefined}
          >
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: (!collapsed || isMobile) ? 3 : 0 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150 cursor-pointer
                  ${isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                title={collapsed && !isMobile ? label : undefined}
              >
                <Icon size={17} className="shrink-0" />
                <AnimatePresence>
                  {(!collapsed || isMobile) && (
                    <motion.span
                      key="text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Toggle button - desktop only */}
      {!isMobile && (
        <div className="p-3 border-t border-slate-800/60 shrink-0">
          <button
            onClick={onToggle}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span className="text-xs">Collapse</span></>}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:block h-screen border-r border-slate-800/60 shrink-0 overflow-hidden relative z-20"
      >
        {content(false)}
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-64 h-full z-10 shadow-2xl border-r border-slate-800 bg-slate-900"
            >
              {content(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
