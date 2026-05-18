// src/components/StatCard.jsx
import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, title, value, color = 'indigo', sub, delay = 0 }) {
  const colors = {
    indigo:  { bg: 'from-indigo-500 to-violet-600',  ring: 'shadow-indigo-500/20' },
    emerald: { bg: 'from-emerald-500 to-teal-500',   ring: 'shadow-emerald-500/20' },
    orange:  { bg: 'from-orange-500 to-amber-500',   ring: 'shadow-orange-500/20' },
    rose:    { bg: 'from-rose-500 to-pink-500',      ring: 'shadow-rose-500/20'   },
    cyan:    { bg: 'from-cyan-500 to-sky-500',       ring: 'shadow-cyan-500/20'   },
  }
  const c = colors[color] || colors.indigo

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card group"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.bg} shadow-lg ${c.ring} flex items-center justify-center`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-slate-100 mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </motion.div>
  )
}
