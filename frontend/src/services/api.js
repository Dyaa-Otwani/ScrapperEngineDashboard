// src/services/api.js — Axios instance + all API helpers
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE, timeout: 30_000 })

// ── Analytics ─────────────────────────────────────────────────────────────────
export const getAnalytics     = () => api.get('/api/analytics')
export const getCityCount     = () => api.get('/api/dashboard/city-count')
export const getCategoryCount = () => api.get('/api/dashboard/category-count')
export const getSourceCount   = () => api.get('/api/dashboard/source-count')

// ── Scraper ───────────────────────────────────────────────────────────────────
export const startScrape     = (payload) => api.post('/api/scrape/start', payload)
export const getScrapeStatus = (jobId)   => api.get(`/api/scrape/status/${jobId}`)

// ── Export ────────────────────────────────────────────────────────────────────
export const exportFile  = (type) => `${BASE}/api/export/${type}`
export const exportDbCsv = ()     => `${BASE}/api/export/db/csv`

export default api
