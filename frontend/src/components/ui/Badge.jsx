const STYLES = {
  // payment / generic statuses
  approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  rejected: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  cancelled: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  // attendance
  present: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  absent: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  late: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  excused: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  // roles
  admin: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  manager: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
  teacher: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  parent: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  inactive: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

const LABELS = {
  // payment / generic statuses
  approved: 'Tasdiqlangan',
  completed: 'Bajarilgan',
  pending: 'Kutilmoqda',
  rejected: 'Rad etilgan',
  cancelled: 'Bekor qilingan',
  // attendance
  present: 'Bor',
  absent: "Yo'q",
  late: 'Kechikdi',
  excused: 'Sababli',
  // roles
  admin: 'Administrator',
  manager: 'Menejer',
  teacher: "O'qituvchi",
  parent: 'Ota-ona',
  active: 'Faol',
  inactive: 'Nofaol',
}

export default function Badge({ status, children, className = '' }) {
  const style = STYLES[status] || 'bg-white/10 text-slate-300 border-white/20'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style} ${className}`}
    >
      {children || LABELS[status] || status}
    </span>
  )
}
