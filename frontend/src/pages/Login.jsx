import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import PhoneInput from '../components/ui/PhoneInput'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!phone || phone.replace(/\D/g, '').length < 12) {
      toast.error("Telefon raqamini to'liq kiriting")
      return
    }
    setLoading(true)
    try {
      await login(phone, password)
      toast.success('Xush kelibsiz! 🎉')
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || "Telefon raqami yoki parol noto'g'ri"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="aurora" />
      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-40" />

      {/* Floating orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-brand-400/30 to-purple-500/20 blur-2xl"
          style={{
            width: 80 + i * 40,
            height: 80 + i * 40,
            left: `${10 + i * 15}%`,
            top: `${(i * 17) % 80}%`,
          }}
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 6 + i, ease: 'easeInOut', delay: i * 0.4 }}
        />
      ))}

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      >
        <div className="glass-strong rounded-3xl p-8 shadow-glow-lg sm:p-10">
          {/* Logo */}
          <motion.div
            className="mb-8 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <motion.div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-glow"
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            >
              <GraduationCap size={32} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white">
              Oxford <span className="gradient-text">CRM</span>
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
              <Sparkles size={14} className="text-brand-300" />
              Maktab boshqaruv tizimiga kirish
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Telefon raqami</label>
              <PhoneInput value={phone} onChange={setPhone} required />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Parol</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-field px-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              {loading ? (
                <motion.span
                  className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                />
              ) : (
                <>
                  Kirish
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <motion.p
            className="mt-6 text-center text-xs text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            © {new Date().getFullYear()} Oxford CRM · Maktab boshqaruv tizimi
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
