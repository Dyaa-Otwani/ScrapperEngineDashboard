// src/components/Topbar.jsx
import { Sun, Moon, RefreshCw, Menu } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'

export default function Topbar({ title, onRefresh, onMobileToggle }) {
  const { dark, toggle } = useTheme()

  return (
    <header className="h-14 flex items-center justify-between px-5 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-sm shrink-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileToggle}
          className="md:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Open Menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="font-semibold text-sm text-slate-200">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {onRefresh && (
          <motion.button
            whileTap={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={onRefresh}
            className="p-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </motion.button>
        )}
        <button
          onClick={toggle}
          className="p-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  )
}

