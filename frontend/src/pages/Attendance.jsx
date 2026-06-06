import { useState } from 'react'
import { CalendarCheck, Plus, Filter, ClipboardCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { attendanceApi, groupsApi } from '../api/services'
import useFetch, { asList } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import { Field, firstError } from './Students'

const STATUS_OPTIONS = [
  { value: 'present', label: 'Bor' },
  { value: 'absent', label: "Yo'q" },
  { value: 'late', label: 'Kechikdi' },
  { value: 'excused', label: 'Sababli' },
]

export default function Attendance() {
  const { user } = useAuth()
  const canMark = ['admin', 'manager', 'teacher'].includes(user?.role)

  const [filterGroup, setFilterGroup] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const { data: groupsData } = useFetch(() => groupsApi.list(), [])
  const groups = asList(groupsData)

  const { data, loading, refetch } = useFetch(
    () =>
      attendanceApi.list({
        ...(filterGroup && { group: filterGroup }),
        ...(filterDate && { date: filterDate }),
      }),
    [filterGroup, filterDate]
  )
  const records = asList(data)

  const [bulkOpen, setBulkOpen] = useState(false)

  const columns = [
    {
      key: 'student_name',
      header: "O'quvchi",
      render: (r) => <span className="font-semibold text-white">{r.student_name}</span>,
    },
    { key: 'group_name', header: 'Guruh' },
    { key: 'date', header: 'Sana' },
    {
      key: 'status',
      header: 'Holat',
      render: (r) => <Badge status={r.status} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Davomat"
        subtitle={`${records.length} ta yozuv`}
        icon={CalendarCheck}
        action={
          canMark && (
            <button onClick={() => setBulkOpen(true)} className="btn-primary">
              <ClipboardCheck size={18} /> Davomat olish
            </button>
          )
        }
      />

      <div className="card">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-slate-400">
            <Filter size={16} /> Filtrlar:
          </span>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="input-field max-w-[200px] py-2"
          >
            <option value="">Barcha guruhlar</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input-field max-w-[180px] py-2"
          />
          {(filterGroup || filterDate) && (
            <button
              onClick={() => {
                setFilterGroup('')
                setFilterDate('')
              }}
              className="text-sm text-brand-300 hover:text-brand-200"
            >
              Tozalash
            </button>
          )}
        </div>

        <DataTable
          columns={columns}
          rows={records}
          loading={loading}
          emptyIcon={CalendarCheck}
          emptyTitle="Davomat yozuvlari yo'q"
          emptyDescription="Davomat olish uchun yuqoridagi tugmadan foydalaning"
        />
      </div>

      {bulkOpen && (
        <BulkAttendanceModal groups={groups} onClose={() => setBulkOpen(false)} onDone={refetch} />
      )}
    </div>
  )
}

function BulkAttendanceModal({ groups, onClose, onDone }) {
  const [groupId, setGroupId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [statuses, setStatuses] = useState({})
  const [saving, setSaving] = useState(false)

  const { data: studentsData, loading } = useFetch(
    () => (groupId ? groupsApi.students(groupId) : Promise.resolve({ data: [] })),
    [groupId]
  )
  const students = asList(studentsData)

  const setStatus = (id, value) => setStatuses((prev) => ({ ...prev, [id]: value }))

  const handleSubmit = async () => {
    if (!groupId) return toast.error('Guruhni tanlang')
    if (students.length === 0) return toast.error("Guruhda o'quvchilar yo'q")
    setSaving(true)
    try {
      const attendance_records = students.map((s) => ({
        student_id: s.id,
        status: statuses[s.id] || 'present',
      }))
      await attendanceApi.bulkMark({ group: Number(groupId), date, attendance_records })
      toast.success('Davomat saqlandi ✅')
      onClose()
      onDone?.()
    } catch (err) {
      toast.error(firstError(err) || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Davomat olish" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Guruh">
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="input-field">
              <option value="">— Tanlang —</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sana">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
          </Field>
        </div>

        {groupId && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-1">
            {loading ? (
              <div className="py-8">
                <Spinner />
              </div>
            ) : students.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Guruhda o'quvchilar yo'q</p>
            ) : (
              <div className="max-h-72 space-y-1.5 overflow-y-auto p-2">
                {students.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] p-2.5"
                  >
                    <span className="text-sm font-medium text-white">{s.full_name}</span>
                    <div className="flex gap-1">
                      {STATUS_OPTIONS.map((opt) => {
                        const active = (statuses[s.id] || 'present') === opt.value
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setStatus(s.id, opt.value)}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                              active
                                ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-glow'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-ghost flex-1">
            Bekor qilish
          </button>
          <button onClick={handleSubmit} disabled={saving || !groupId} className="btn-primary flex-1">
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
