import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = "Ma'lumot yo'q", description }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-3 py-16 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-slate-500">
        <Icon size={28} />
      </div>
      <h4 className="text-base font-semibold text-slate-300">{title}</h4>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
    </motion.div>
  )
}
