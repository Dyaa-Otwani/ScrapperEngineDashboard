// src/components/Skeleton.jsx — loading skeleton placeholders
export function SkeletonCard() {
  return (
    <div className="card p-6 animate-pulse space-y-3">
      <div className="w-10 h-10 rounded-xl bg-slate-700" />
      <div className="h-3 w-20 bg-slate-700 rounded" />
      <div className="h-6 w-28 bg-slate-700 rounded" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <tr className="border-b border-slate-800">
      {Array(6).fill(0).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-slate-800 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonChart() {
  return (
    <div className="card p-6 h-72 animate-pulse flex flex-col gap-4">
      <div className="h-4 w-32 bg-slate-700 rounded" />
      <div className="flex-1 bg-slate-800/60 rounded-xl" />
    </div>
  )
}
