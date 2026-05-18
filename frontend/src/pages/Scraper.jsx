// src/pages/Scraper.jsx — Full scraper control panel with live terminal
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Square, CheckSquare2, Loader2, Terminal } from 'lucide-react'
import toast from 'react-hot-toast'
import { startScrape, getScrapeStatus } from '../services/api'

const SOURCES = ['Google Maps', 'Justdial', 'Sulekha']

export default function Scraper() {
  const [form, setForm] = useState({ city: 'All', category: 'All', count: 900 })
  const [sources, setSources] = useState(['Google Maps', 'Justdial', 'Sulekha'])
  const [jobId, setJobId] = useState(null)
  const [job, setJob] = useState(null)
  const termRef = useRef(null)

  const toggle = (src) =>
    setSources(s => s.includes(src) ? s.filter(x => x !== src) : [...s, src])

  const handleStart = async () => {
    if (!form.city || !form.category) return toast.error('City and Category are required.')
    if (!sources.length) return toast.error('Select at least one source.')
    try {
      const res = await startScrape({ ...form, count: Number(form.count), sources })
      setJobId(res.data.job_id)
      setJob({ status: 'Starting', progress: 0, total: form.count, logs: ['Connecting to scraping engine…'] })
      toast.success('Scraping job started!')
    } catch {
      toast.error('Failed to start scraping. Is the backend running?')
    }
  }

  // Poll job status every 2 s
  useEffect(() => {
    if (!jobId) return
    if (job?.status === 'Completed' || job?.status === 'Failed') return

    const id = setInterval(async () => {
      try {
        const res = await getScrapeStatus(jobId)
        setJob(res.data)
        if (res.data.status === 'Completed') { toast.success('Scraping completed!'); clearInterval(id) }
        if (res.data.status === 'Failed') { toast.error('Scraping job failed!'); clearInterval(id) }
      } catch { clearInterval(id) }
    }, 2000)

    return () => clearInterval(id)
  }, [jobId, job?.status])

  // Auto-scroll terminal
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [job?.logs])

  const pct = job ? Math.min(100, Math.round((job.progress / job.total) * 100)) : 0

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="card p-6 space-y-5 lg:col-span-1">
          <h2 className="font-semibold text-slate-200 border-b border-slate-800 pb-3">Configuration</h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">City</label>
            <input className="input" placeholder="e.g. Ahmedabad"
              value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Category</label>
            <input className="input" placeholder="e.g. Restaurants"
              value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Target Records</label>
            <input type="number" className="input" min={10} max={2000}
              value={form.count} onChange={e => setForm(f => ({ ...f, count: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sources</label>
            {SOURCES.map(src => (
              <button
                key={src}
                onClick={() => toggle(src)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all
                  ${sources.includes(src)
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}
              >
                <CheckSquare2 size={16} className={sources.includes(src) ? 'text-indigo-400' : 'text-slate-600'} />
                <span className="text-sm font-medium">{src}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleStart}
            disabled={job?.status === 'Running' || job?.status === 'Starting'}
            className="btn-primary w-full justify-center"
          >
            {job?.status === 'Running' || job?.status === 'Starting'
              ? <><Loader2 size={16} className="animate-spin" /> Scraping…</>
              : <><Play size={16} /> Start Scraping</>
            }
          </button>
        </div>

        {/* Status + Terminal */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-200">Job Status</h2>
              <span className={`badge ${!job ? 'bg-slate-700/50 text-slate-400' :
                  job.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    job.status === 'Failed' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-indigo-500/20 text-indigo-400 animate-pulse'
                }`}>
                {job?.status ?? 'Idle'}
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Progress</span>
              <span>{job?.progress ?? 0} / {job?.total ?? form.count} records</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-right">{pct}%</p>
          </div>

          {/* Terminal */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs ml-2">
                <Terminal size={12} /> scraper-engine — live output
              </div>
            </div>
            <div
              ref={termRef}
              className="h-72 overflow-y-auto p-4 font-mono text-xs bg-[#0a0f1e] text-emerald-400/90 leading-relaxed"
            >
              {job?.logs?.length
                ? job.logs.map((log, i) => (
                  <div key={i} className="mb-1">
                    <span className="text-slate-600 mr-3 select-none">$</span>{log}
                  </div>
                ))
                : <span className="text-slate-600">Waiting for job to start…</span>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
