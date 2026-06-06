import { motion } from 'framer-motion'
import AnimatedCounter from './AnimatedCounter'

const GRADIENTS = {
  brand: 'from-brand-500 to-indigo-600',
  purple: 'from-purple-500 to-fuchsia-600',
  emerald: 'from-emerald-500 to-teal-600',
  amber: 'from-amber-500 to-orange-600',
  rose: 'from-rose-500 to-pink-600',
  cyan: 'from-cyan-500 to-sky-600',
}

export default function StatCard({ icon: Icon, label, value, color = 'brand', decimals = 0, prefix = '', suffix = '', index = 0 }) {
  return (
    <motion.div
      className="card group relative overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', damping: 18 }}
      whileHover={{ y: -4 }}
    >
      {/* glow blob */}
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${GRADIENTS[color]} opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-white">
            <AnimatedCounter value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${GRADIENTS[color]} shadow-lg`}
        >
          {Icon && <Icon size={22} className="text-white" />}
        </div>
      </div>
    </motion.div>
  )
}
