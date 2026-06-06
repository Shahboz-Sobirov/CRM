import { motion } from 'framer-motion'

export default function Spinner({ size = 40 }) {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        style={{ width: size, height: size }}
        className="rounded-full border-[3px] border-white/10 border-t-brand-400"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      />
    </div>
  )
}

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="aurora" />
      <Spinner size={56} />
      <motion.p
        className="text-sm text-slate-400"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        Yuklanmoqda...
      </motion.p>
    </div>
  )
}
