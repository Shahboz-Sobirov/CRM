import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  CreditCard,
  UserCog,
} from 'lucide-react'

// roles: which roles can see the item. Empty => everyone authenticated.
export const NAV_ITEMS = [
  { to: '/', label: 'Boshqaruv paneli', icon: LayoutDashboard, roles: [] },
  { to: '/students', label: "O'quvchilar", icon: GraduationCap, roles: [] },
  { to: '/teachers', label: "O'qituvchilar", icon: Users, roles: ['admin', 'manager'] },
  { to: '/groups', label: 'Guruhlar', icon: BookOpen, roles: [] },
  { to: '/attendance', label: 'Davomat', icon: CalendarCheck, roles: [] },
  { to: '/payments', label: "To'lovlar", icon: CreditCard, roles: [] },
  { to: '/users', label: 'Foydalanuvchilar', icon: UserCog, roles: ['admin'] },
]

export function visibleNavItems(role) {
  return NAV_ITEMS.filter((item) => item.roles.length === 0 || item.roles.includes(role))
}
