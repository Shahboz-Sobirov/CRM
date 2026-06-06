import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, LogOut, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { visibleNavItems } from './navItems'

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth()
  const items = visibleNavItems(user?.role)
  const location = useLocation()

  const navRef = useRef(null)
  const linkRefs = useRef({})
  const [indicator, setIndicator] = useState({ top: 0, height: 0, visible: false })

  // Find which nav item matches the current path
  const activeTo = (() => {
    const match = items.find((it) =>
      it.to === '/' ? location.pathname === '/' : location.pathname.startsWith(it.to)
    )
    return match?.to
  })()

  useEffect(() => {
    const el = activeTo ? linkRefs.current[activeTo] : null
    const navEl = navRef.current
    if (el && navEl) {
      setIndicator({
        top: el.offsetTop,
        height: el.offsetHeight,
        visible: true,
      })
    } else {
      setIndicator((prev) => ({ ...prev, visible: false }))
    }
  }, [activeTo, items.length])

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-glow">
          <GraduationCap size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold leading-tight text-white">Oxford</h1>
          <p className="text-[11px] font-medium uppercase tracking-widest text-brand-300">CRM</p>
        </div>
      </div>

      {/* Nav */}
      <nav ref={navRef} className="relative flex-1 space-y-1.5 overflow-y-auto px-4 py-2">
        {/* Sliding active indicator */}
        <motion.div
          className="pointer-events-none absolute left-4 right-4 rounded-xl bg-gradient-to-r from-brand-600/80 to-purple-600/60 shadow-glow"
          initial={false}
          animate={{
            top: indicator.top,
            height: indicator.height,
            opacity: indicator.visible ? 1 : 0,
          }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        />

        {items.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <NavLink
              to={item.to}
              end={item.to === '/'}
              onClick={onNavigate}
              ref={(node) => {
                if (node) linkRefs.current[item.to] = node
              }}
              className={({ isActive }) =>
                `group relative z-10 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={19} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-purple-500 text-sm font-bold text-white">
            {user?.first_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.full_name}</p>
            <p className="truncate text-xs capitalize text-brand-300">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10"
        >
          <LogOut size={18} />
          Chiqish
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-ink-800/60 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-ink-800 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-6 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
