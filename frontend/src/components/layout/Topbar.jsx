import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { NAV_ITEMS } from './navItems'

const ROLE_LABEL = {
  admin: 'Administrator',
  manager: 'Menejer',
  teacher: "O'qituvchi",
  parent: 'Ota-ona',
}

export default function Topbar({ onMenu }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find((i) => (i.to === '/' ? pathname === '/' : pathname.startsWith(i.to)))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli kech'

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-ink-900/70 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 lg:hidden"
        >
          <Menu size={22} />
        </button>
        <div>
          <p className="text-xs text-slate-400">
            {greeting}, {user?.first_name} 👋
          </p>
          <h2 className="text-base font-bold text-white sm:text-lg">{current?.label || 'Oxford CRM'}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-white">{user?.full_name}</p>
          <p className="text-xs text-brand-300">{ROLE_LABEL[user?.role] || user?.role}</p>
        </div>
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-purple-500 font-bold text-white">
            {user?.first_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-900 bg-emerald-400" />
        </div>
      </div>
    </header>
  )
}
