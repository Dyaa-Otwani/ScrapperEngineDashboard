// src/pages/Export.jsx — Download center for CSV, Excel, JSON
import { motion } from 'framer-motion'
import { Download, FileSpreadsheet, FileJson, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { exportFile } from '../services/api'

const EXPORTS = [
  {
    title:  'Combined CSV',
    desc:   'All scraped business data in one CSV file — import into Excel or Google Sheets',
    icon:   FileText,
    color:  'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/20',
    type:   'csv',
  },
  {
    title:  'Excel Workbook',
    desc:   'Fully formatted .xlsx file ready for Microsoft Excel',
    icon:   FileSpreadsheet,
    color:  'from-green-500 to-lime-600',
    shadow: 'shadow-green-500/20',
    type:   'excel',
  },
  {
    title:  'JSON File',
    desc:   'Raw structured data in JSON format for developers and APIs',
    icon:   FileJson,
    color:  'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/20',
    type:   'json',
  },
]

export default function Export() {
  const handle = (type) => {
    const url = exportFile(type)
    window.open(url, '_blank')
    toast.success(`Downloading ${type.toUpperCase()} file…`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Download Center</h2>
        <p className="text-sm text-slate-400 mt-1">Export your scraped business data in multiple formats.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {EXPORTS.map((ex, i) => (
          <motion.div
            key={ex.type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-6 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ex.color} shadow-lg ${ex.shadow} flex items-center justify-center`}>
              <ex.icon size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200">{ex.title}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{ex.desc}</p>
            </div>
            <button
              onClick={() => handle(ex.type)}
              className="btn-primary mt-auto justify-center"
            >
              <Download size={14} /> Download
            </button>
          </motion.div>
        ))}
      </div>

      <div className="card p-5 border border-slate-700/50">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="text-slate-300 font-medium">Note:</span> Files are generated after a scraping job completes.
          If no data has been scraped yet, please run the scraper first from the Scraper page.
        </p>
      </div>
    </div>
  )
}
