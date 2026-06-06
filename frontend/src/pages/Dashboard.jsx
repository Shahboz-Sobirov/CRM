import { motion } from 'framer-motion'
import {
  GraduationCap,
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts'
import { studentsApi, teachersApi, groupsApi, paymentsApi } from '../api/services'
import useFetch, { asList } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/ui/StatCard'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import PageHeader from '../components/ui/PageHeader'

const COLORS = ['#10b981', '#f59e0b', '#f43f5e']

function countOf(data) {
  if (!data) return 0
  if (typeof data.count === 'number') return data.count
  return asList(data).length
}

export default function Dashboard() {
  const { user } = useAuth()
  const isStaff = ['admin', 'manager'].includes(user?.role)

  const { data: students, loading: lStudents } = useFetch(() => studentsApi.list(), [])
  const { data: groups, loading: lGroups } = useFetch(() => groupsApi.list(), [])
  const { data: teachers } = useFetch(
    () => (isStaff ? teachersApi.list() : Promise.resolve({ data: [] })),
    [isStaff]
  )
  const { data: payments } = useFetch(() => paymentsApi.list(), [])
  const { data: stats, loading: lStats } = useFetch(
    () => (isStaff ? paymentsApi.statistics() : Promise.resolve({ data: null })),
    [isStaff]
  )

  const recentPayments = asList(payments).slice(0, 5)

  const pieData = stats
    ? [
        { name: 'Tasdiqlangan', value: stats.approved_payments || 0 },
        { name: 'Kutilmoqda', value: stats.pending_payments || 0 },
        { name: 'Rad etilgan', value: stats.rejected_payments || 0 },
      ]
    : []

  // Synthesized monthly trend from recent payments (visual flair)
  const trendData = buildTrend(asList(payments))

  return (
    <div>
      <PageHeader
        title="Boshqaruv paneli"
        subtitle="Tizimning umumiy ko'rsatkichlari bir qarashda"
        icon={TrendingUp}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={GraduationCap}
          label="O'quvchilar"
          value={countOf(students)}
          color="brand"
          index={0}
        />
        <StatCard icon={BookOpen} label="Guruhlar" value={countOf(groups)} color="purple" index={1} />
        {isStaff ? (
          <StatCard icon={Users} label="O'qituvchilar" value={countOf(teachers)} color="cyan" index={2} />
        ) : (
          <StatCard
            icon={CreditCard}
            label="To'lovlar"
            value={countOf(payments)}
            color="cyan"
            index={2}
          />
        )}
        {isStaff && stats ? (
          <StatCard
            icon={Wallet}
            label="Umumiy summa"
            value={Number(stats.total_amount) || 0}
            color="emerald"
            suffix=" so'm"
            index={3}
          />
        ) : (
          <StatCard
            icon={CreditCard}
            label="To'lovlar"
            value={countOf(payments)}
            color="emerald"
            index={3}
          />
        )}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend area chart */}
        <motion.div
          className="card lg:col-span-2"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-white">To'lovlar oqimi</h3>
            <Badge status="active">Oxirgi davr</Badge>
          </div>
          {lStudents ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,16,32,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: '#e2e8f0',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#a855f7"
                  strokeWidth={3}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Payment status pie */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="mb-4 font-bold text-white">To'lov holatlari</h3>
          {isStaff && stats ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,16,32,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-2">
                <StatusRow icon={CheckCircle2} color="text-emerald-400" label="Tasdiqlangan" value={stats.approved_payments} />
                <StatusRow icon={Clock} color="text-amber-400" label="Kutilmoqda" value={stats.pending_payments} />
                <StatusRow icon={XCircle} color="text-rose-400" label="Rad etilgan" value={stats.rejected_payments} />
              </div>
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
              <CreditCard size={32} className="text-slate-600" />
              Statistika faqat menejer va adminlarga ko'rinadi
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent payments */}
      <motion.div
        className="card mt-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="mb-4 font-bold text-white">So'nggi to'lovlar</h3>
        {recentPayments.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Hozircha to'lovlar yo'q</p>
        ) : (
          <div className="space-y-3">
            {recentPayments.map((p, i) => (
              <motion.div
                key={p.id}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.06 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/30 to-purple-500/20 text-brand-300">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {p.student_name || `O'quvchi #${p.student}`}
                    </p>
                    <p className="text-xs text-slate-500">{p.payment_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">
                    {Number(p.amount).toLocaleString()} so'm
                  </span>
                  <Badge status={p.status} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function StatusRow({ icon: Icon, color, label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-slate-400">
        <Icon size={16} className={color} />
        {label}
      </span>
      <span className="font-semibold text-white">{value || 0}</span>
    </div>
  )
}

function buildTrend(payments) {
  // Group by month label
  const map = {}
  payments.forEach((p) => {
    if (!p.payment_date) return
    const d = new Date(p.payment_date)
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    map[label] = (map[label] || 0) + Number(p.amount || 0)
  })
  const entries = Object.entries(map).map(([label, amount]) => ({ label, amount }))
  if (entries.length === 0) {
    // placeholder shape so the chart isn't empty
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label) => ({ label, amount: 0 }))
  }
  return entries
}
