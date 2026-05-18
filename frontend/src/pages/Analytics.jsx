// src/pages/Analytics.jsx — Deep multi-chart analytics (completely different from Dashboard)
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, LabelList,
  PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
  ResponsiveContainer
} from 'recharts'
import { BarChart3, Cpu, Target, TrendingUp } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { getAnalytics } from '../services/api'
import { SkeletonChart } from '../components/Skeleton'

const COLORS = ['#6366f1','#10b981','#f97316','#a855f7','#06b6d4','#f59e0b','#ef4444','#3b82f6']
const SOURCE_COLORS = { 'Google Maps': '#10b981', 'Justdial': '#f97316', 'Sulekha': '#6366f1' }

/* ── Tooltip ── */
const HoverTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-violet-500/30 rounded-xl px-4 py-3 shadow-2xl shadow-violet-900/30 text-sm backdrop-blur-sm min-w-[140px]">
      {label && <p className="text-slate-300 font-semibold mb-2">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color || p.fill || '#6366f1' }} />
          <span className="text-slate-400 text-xs">{p.name}:</span>
          <span className="font-bold text-slate-100 ml-auto pl-2">{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function ChartCard({ title, icon: Icon, iconColor, children, delay = 0, span = '' }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay, duration: 0.4 }}
      className={`card p-6 ${span}`}>
      <h2 className="text-sm font-semibold text-slate-300 mb-5 flex items-center gap-2">
        {Icon && <Icon size={15} className={iconColor} />} {title}
      </h2>
      {children}
    </motion.div>
  )
}

export default function Analytics() {
  const { data, loading } = useFetch(getAnalytics)

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(5)].map((_, i) => <SkeletonChart key={i} />)}
    </div>
  )

  const sourceData   = data?.by_source   ?? []
  const cityData     = (data?.by_city     ?? []).slice(0, 8)
  const categoryData = data?.by_category ?? []
  const ratingData   = data?.rating_dist ?? []
  const stackedCity  = (data?.stacked_city ?? []).slice(0, 6)
  const avgRating    = data?.avg_rating_by_source ?? []

  return (
    <div className="space-y-6 animate-slide-up">

      {/* ── Summary row: source pills ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sourceData.map((s, i) => (
          <motion.div key={s.name}
            initial={{ opacity:0, scale:0.93 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay: i * 0.07 }}
            className="card p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
            <div className="w-3 h-12 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{s.name}</p>
              <p className="text-3xl font-extrabold text-slate-100 tabular-nums">{s.value.toLocaleString()}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {data?.total_listings ? Math.round((s.value / data.total_listings) * 100) : 0}% of total
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Stacked Bar — city by source */}
        <ChartCard title="📊 City × Source Breakdown" icon={BarChart3} iconColor="text-indigo-400" delay={0.1}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stackedCity} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill:'#94a3b8', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#94a3b8', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<HoverTooltip />} cursor={{ fill:'rgba(99,102,241,0.06)' }} />
              <Legend wrapperStyle={{ fontSize:11, color:'#94a3b8' }} />
              {['Google Maps','Justdial','Sulekha'].map(src => (
                <Bar key={src} dataKey={src} stackId="a" fill={SOURCE_COLORS[src]}
                  radius={src === 'Sulekha' ? [4,4,0,0] : [0,0,0,0]} maxBarSize={44} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Radar — category distribution */}
        <ChartCard title="🕸️ Category Radar" icon={Target} iconColor="text-violet-400" delay={0.15}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={categoryData.slice(0, 8)}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="name" tick={{ fill:'#94a3b8', fontSize:10 }} />
              <PolarRadiusAxis angle={90} tick={{ fill:'#64748b', fontSize:9 }} />
              <Radar name="Listings" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.35}
                dot={{ fill:'#a855f7', r:3 }} activeDot={{ r:5 }} />
              <Tooltip content={<HoverTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Area chart — rating distribution */}
        <ChartCard title="⭐ Rating Distribution" icon={TrendingUp} iconColor="text-amber-400" delay={0.2}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={ratingData} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<HoverTooltip />} cursor={{ stroke:'#f59e0b', strokeWidth:1, strokeDasharray:'4 4' }} />
              <Area type="monotone" dataKey="value" name="Listings" stroke="#f59e0b" strokeWidth={2.5}
                fill="url(#ratingGrad)" dot={{ fill:'#f59e0b', strokeWidth:2, r:4 }}
                activeDot={{ r:6, stroke:'#f59e0b', strokeWidth:2, fill:'#0f172a' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Pie — avg rating per source */}
        <ChartCard title="🎯 Avg Rating per Source" icon={Cpu} iconColor="text-cyan-400" delay={0.25}>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={240}>
              <PieChart>
                <Pie data={avgRating} cx="50%" cy="50%" outerRadius={90}
                  dataKey="value" nameKey="name" stroke="none" paddingAngle={3}>
                  {avgRating.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]}
                      className="hover:opacity-75 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip content={<HoverTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {avgRating.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-slate-400 flex-1">{s.name}</span>
                  <span className="text-sm font-bold text-slate-100">⭐ {s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

      </div>

      {/* 5. Full-width: top-8 cities bar */}
      <ChartCard title="🏙️ All Cities — Listing Count" delay={0.3}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={cityData} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<HoverTooltip />} cursor={{ fill:'rgba(99,102,241,0.07)' }} />
            <Bar dataKey="value" name="Listings" radius={[5,5,0,0]} maxBarSize={50}>
              {cityData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]}
                  className="hover:opacity-80 transition-opacity" />
              ))}
              <LabelList dataKey="value" position="top" style={{ fill:'#64748b', fontSize:10 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  )
}
