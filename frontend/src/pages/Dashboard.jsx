// src/pages/Dashboard.jsx — KPI Overview + Source Gauge + Top Cities bar + Category Donut
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, LabelList
} from 'recharts'
import { Database, Globe, MapPin, Tags, TrendingUp, Activity, Star, Hash } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { getAnalytics } from '../services/api'
import StatCard from '../components/StatCard'
import { SkeletonCard, SkeletonChart } from '../components/Skeleton'

const COLORS = ['#6366f1','#10b981','#f97316','#a855f7','#06b6d4','#f59e0b','#ef4444','#3b82f6']

/* ── Custom Tooltip ── */
const HoverTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-indigo-500/30 rounded-xl px-4 py-3 shadow-2xl shadow-indigo-900/40 text-sm backdrop-blur-sm">
      <p className="text-slate-300 font-medium mb-1">{label || payload[0]?.name}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color || '#6366f1' }}>
          {p.name}: {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

/* ── Donut center label ── */
const DonutLabel = ({ cx, cy, total }) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
    <tspan x={cx} dy="-8" fontSize={28} fontWeight="700" fill="#f1f5f9">{total.toLocaleString()}</tspan>
    <tspan x={cx} dy={24} fontSize={11} fill="#94a3b8">Total</tspan>
  </text>
)

/* ── Progress bar row ── */
const ProgressRow = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="text-slate-500">{value.toLocaleString()} ({pct}%)</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data, loading } = useFetch(getAnalytics)

  const googleCount   = data?.by_source?.find(s => s.name === 'Google Maps')?.value ?? 0
  const justdialCount = data?.by_source?.find(s => s.name === 'Justdial')?.value   ?? 0
  const sulekhaCount  = data?.by_source?.find(s => s.name === 'Sulekha')?.value    ?? 0
  const total         = data?.total_listings ?? 0
  const top5Cities    = (data?.by_city ?? []).slice(0, 5)
  const top5Category  = (data?.by_category ?? []).slice(0, 5)
  const allCategories = data?.by_category ?? []
  const maxCity       = top5Cities.length ? top5Cities[0].value : 1

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart /><SkeletonChart />
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-slide-up">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Database}   title="Total Listings"  value={total.toLocaleString()}            color="indigo"  delay={0}    sub="All sources combined" />
        <StatCard icon={Globe}      title="Google Maps"     value={googleCount.toLocaleString()}       color="emerald" delay={0.05} sub="Search engine listings" />
        <StatCard icon={TrendingUp} title="Justdial"        value={justdialCount.toLocaleString()}     color="orange"  delay={0.10} sub="Indian directory" />
        <StatCard icon={Activity}   title="Sulekha"         value={sulekhaCount.toLocaleString()}      color="rose"    delay={0.15} sub="Service platform" />
      </div>

      {/* ── Row 2: Donut + City Progress Bars ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Category Donut */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="card p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Tags size={15} className="text-purple-400" /> Category Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={allCategories} cx="50%" cy="50%"
                innerRadius={75} outerRadius={108}
                paddingAngle={2} dataKey="value" nameKey="name" stroke="none">
                {allCategories.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer" />
                ))}
                <LabelList dataKey="name" position="outside" style={{ fontSize: 10, fill: '#94a3b8' }} />
              </Pie>
              <Tooltip content={<HoverTooltip />} />
              {total > 0 && <DonutLabel cx={215} cy={130} total={total} />}
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top 5 Cities — horizontal progress bars */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
          className="card p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <MapPin size={15} className="text-orange-400" /> Top Cities by Volume
          </h2>
          <div className="space-y-4 mt-1">
            {top5Cities.map((c, i) => (
              <ProgressRow key={c.name} label={c.name} value={c.value} max={maxCity}
                color={COLORS[i % COLORS.length]} />
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-auto">Showing top {top5Cities.length} cities</p>
        </motion.div>
      </div>

      {/* ── Row 3: Source horizontal bar + Category leaderboard ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Source Horizontal Bar */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="card p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Globe size={15} className="text-indigo-400" /> Listings by Source
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data?.by_source ?? []} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill:'#94a3b8', fontSize:12 }}
                axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<HoverTooltip />} cursor={{ fill:'rgba(99,102,241,0.08)' }} />
              <Bar dataKey="value" name="Listings" radius={[0,6,6,0]} maxBarSize={36}>
                {(data?.by_source ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
                <LabelList dataKey="value" position="right" style={{ fill:'#94a3b8', fontSize:11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Leaderboard */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          className="card p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Hash size={15} className="text-emerald-400" /> Category Leaderboard
          </h2>
          <div className="space-y-2.5">
            {top5Category.map((cat, i) => (
              <div key={cat.name}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-colors group">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: COLORS[i % COLORS.length] + '25', color: COLORS[i % COLORS.length] }}>
                  {i + 1}
                </span>
                <span className="text-sm text-slate-300 flex-1 font-medium group-hover:text-white transition-colors">{cat.name}</span>
                <span className="text-sm font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                  {cat.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  )
}
