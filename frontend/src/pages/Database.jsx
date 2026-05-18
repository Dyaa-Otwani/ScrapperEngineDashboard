// src/pages/Database.jsx — Live view + inline edit/delete for listing_master table
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Edit2, Trash2, Save, X, RefreshCw, Database as DBIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFetch } from '../hooks/useFetch'
import api from '../services/api'

const SOURCES = ['', 'Google Maps', 'Justdial', 'Sulekha']
const PAGE    = 50

function FieldInput({ field, value, onChange }) {
  return (
    <input
      className="w-full bg-slate-700/60 border border-slate-600 rounded-lg px-2 py-1 text-xs text-slate-100 outline-none focus:border-indigo-500"
      value={value ?? ''}
      onChange={e => onChange(field, e.target.value)}
    />
  )
}

export default function Database() {
  const [skip,   setSkip]   = useState(0)
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('')
  const [editing, setEditing] = useState(null)   // { id, data: {...} }
  const [saving,  setSaving]  = useState(false)

  const fetcher = useCallback(
    () => api.get('/api/db/listings', { params: { skip, limit: PAGE, search: search || undefined, source: source || undefined } }),
    [skip, search, source]
  )
  const { data: resp, loading, reload } = useFetch(fetcher, [skip, search, source])
  const rows  = resp?.records ?? []
  const total = resp?.total   ?? 0

  const startEdit = (row) => {
    setEditing({ id: row.id, data: { ...row } })
  }
  const cancelEdit = () => setEditing(null)

  const saveEdit = async () => {
    setSaving(true)
    try {
      const { id, data } = editing
      const payload = { ...data }
      delete payload.id
      delete payload.created_at
      await api.put(`/api/db/listings/${id}`, payload)
      toast.success(`Record #${id} updated ✓`)
      setEditing(null)
      reload()
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const deleteRow = async (id) => {
    if (!confirm(`Delete record #${id}? This cannot be undone.`)) return
    try {
      await api.delete(`/api/db/listings/${id}`)
      toast.success(`Record #${id} deleted`)
      reload()
    } catch {
      toast.error('Delete failed')
    }
  }

  const updateField = (field, value) => {
    setEditing(e => ({ ...e, data: { ...e.data, [field]: value } }))
  }

  const editable = ['business_name', 'category', 'city', 'address', 'phone',
                    'rating', 'reviews_count', 'website', 'source', 'business_status']

  return (
    <div className="space-y-4 animate-slide-up">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <DBIcon size={20} className="text-indigo-400" /> Database Records
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Live view of <span className="text-indigo-400 font-mono">listing_master</span> — click ✏️ to edit any row inline.
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input pl-8 py-2 text-sm w-52" placeholder="Search name…"
              value={search} onChange={e => { setSearch(e.target.value); setSkip(0) }} />
          </div>
          <select className="input py-2 text-sm bg-slate-800 w-36" value={source}
            onChange={e => { setSource(e.target.value); setSkip(0) }}>
            {SOURCES.map(s => <option key={s} value={s}>{s || 'All Sources'}</option>)}
          </select>
          <button onClick={reload} className="btn-ghost text-sm">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-xs text-slate-500">
        <span>Total: <b className="text-slate-300">{total.toLocaleString()}</b></span>
        <span>Showing: <b className="text-slate-300">{rows.length}</b></span>
        <span>Page: <b className="text-slate-300">{Math.floor(skip / PAGE) + 1}</b></span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-900/70 border-b border-slate-800">
              <tr>
                {['ID','Business Name','Category','City','Rating','Source','Phone','Status','Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500">Loading…</td></tr>
              ) : rows.map((row) => {
                const isEditing = editing?.id === row.id
                return (
                  <motion.tr key={row.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${isEditing ? 'bg-indigo-950/30' : ''}`}>
                    <td className="px-3 py-2.5 text-slate-600 font-mono">{row.id}</td>

                    {isEditing ? (
                      <>
                        <td className="px-2 py-1.5"><FieldInput field="business_name"  value={editing.data.business_name}  onChange={updateField} /></td>
                        <td className="px-2 py-1.5"><FieldInput field="category"       value={editing.data.category}       onChange={updateField} /></td>
                        <td className="px-2 py-1.5"><FieldInput field="city"           value={editing.data.city}           onChange={updateField} /></td>
                        <td className="px-2 py-1.5"><FieldInput field="rating"         value={editing.data.rating}         onChange={updateField} /></td>
                        <td className="px-2 py-1.5">
                          <select className="w-full bg-slate-700/60 border border-slate-600 rounded-lg px-2 py-1 text-xs text-slate-100 outline-none focus:border-indigo-500"
                            value={editing.data.source} onChange={e => updateField('source', e.target.value)}>
                            {['Google Maps','Justdial','Sulekha'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-1.5"><FieldInput field="phone"          value={editing.data.phone}          onChange={updateField} /></td>
                        <td className="px-2 py-1.5"><FieldInput field="business_status" value={editing.data.business_status} onChange={updateField} /></td>
                        <td className="px-2 py-1.5">
                          <div className="flex gap-1">
                            <button onClick={saveEdit} disabled={saving}
                              className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-medium transition-colors">
                              {saving ? '…' : <><Save size={10} /> Save</>}
                            </button>
                            <button onClick={cancelEdit}
                              className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-[11px] transition-colors">
                              <X size={10} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2.5 text-slate-200 max-w-[160px] truncate font-medium">{row.business_name}</td>
                        <td className="px-3 py-2.5 text-slate-400">{row.category}</td>
                        <td className="px-3 py-2.5 text-slate-400">{row.city}</td>
                        <td className="px-3 py-2.5">
                          {row.rating > 0 ? (
                            <span className="badge bg-amber-500/15 text-amber-400">⭐ {Number(row.rating).toFixed(1)}</span>
                          ) : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`badge text-[10px] ${
                            row.source === 'Google Maps' ? 'bg-emerald-500/15 text-emerald-400' :
                            row.source === 'Justdial'   ? 'bg-orange-500/15 text-orange-400'  :
                            'bg-purple-500/15 text-purple-400'}`}>{row.source}</span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{row.phone || '—'}</td>
                        <td className="px-3 py-2.5">
                          <span className={`badge text-[10px] ${row.business_status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                            {row.business_status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1.5">
                            <button onClick={() => startEdit(row)} title="Edit"
                              className="p-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-400 transition-colors">
                              <Edit2 size={11} />
                            </button>
                            <button onClick={() => deleteRow(row.id)} title="Delete"
                              className="p-1.5 rounded-lg bg-rose-600/15 hover:bg-rose-600/30 text-rose-400 transition-colors">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </motion.tr>
                )
              })}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
          <p className="text-xs text-slate-500">Showing {skip + 1}–{Math.min(skip + PAGE, total)} of {total.toLocaleString()} records</p>
          <div className="flex gap-2">
            <button onClick={() => setSkip(s => Math.max(0, s - PAGE))} disabled={skip === 0}
              className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button>
            <button onClick={() => setSkip(s => s + PAGE)} disabled={skip + PAGE >= total}
              className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">Next →</button>
          </div>
        </div>
      </div>

      {/* Help box */}
      <div className="card p-4 border border-indigo-500/20 bg-indigo-950/20">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="text-indigo-300 font-semibold">💡 Tip:</span> Click <b className="text-indigo-400">✏️ Edit</b> on any row to modify fields directly.
          Changes are saved to the <span className="font-mono text-indigo-400">listing_master</span> table and reflect instantly in your Dashboard &amp; Analytics charts.
          You can also access the full Swagger UI at <span className="font-mono text-emerald-400">http://localhost:8000/docs</span> for raw API access.
        </p>
      </div>
    </div>
  )
}
