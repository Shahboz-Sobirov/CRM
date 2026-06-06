import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Ghost } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 text-center">
      <div className="aurora" />
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-glow-lg"
      >
        <Ghost size={48} className="text-white" />
      </motion.div>
      <motion.h1
        className="text-7xl font-extrabold gradient-text"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        404
      </motion.h1>
      <p className="mt-3 text-lg text-slate-400">Bu sahifa topilmadi</p>
      <Link to="/" className="btn-primary mt-8">
        <Home size={18} /> Bosh sahifaga qaytish
      </Link>
    </div>
  )
}
