import { motion } from 'framer-motion'

export default function PageHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <motion.div
      className="mb-8 flex flex-wrap items-center justify-between gap-4"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-glow">
            <Icon size={24} className="text-white" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </motion.div>
  )
}
