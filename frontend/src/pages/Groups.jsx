import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Plus,
  Users2,
  Pencil,
  Trash2,
  UserPlus,
  Calendar,
  GraduationCap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { groupsApi, teachersApi, studentsApi } from '../api/services'
import useFetch, { asList } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { Field, firstError } from './Students'

const EMPTY = { name: '', teacher: '', start_date: '', end_date: '', is_active: true }

export default function Groups() {
  const { user } = useAuth()
  const canManage = ['admin', 'manager'].includes(user?.role)

  const { data, loading, refetch } = useFetch(() => groupsApi.list(), [])
  const { data: teachersData } = useFetch(
    () => (canManage ? teachersApi.list() : Promise.resolve({ data: [] })),
    [canManage]
  )
  const groups = asList(data)
  const teachers = asList(teachersData)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [studentsModal, setStudentsModal] = useState(null)

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  const openEdit = (g) => {
    setEditing(g)
    setForm({
      name: g.name || '',
      teacher: g.teacher || '',
      start_date: g.start_date || '',
      end_date: g.end_date || '',
      is_active: g.is_active ?? true,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, teacher: form.teacher || null, end_date: form.end_date || null }
      if (editing) {
        await groupsApi.update(editing.id, payload)
        toast.success('Guruh yangilandi')
      } else {
        await groupsApi.create(payload)
        toast.success("Guruh yaratildi 🎉")
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(firstError(err) || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await groupsApi.remove(deleteTarget.id)
      toast.success("Guruh o'chirildi")
      setDeleteTarget(null)
      refetch()
    } catch {
      toast.error("O'chirishda xatolik")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Guruhlar"
        subtitle={`Jami ${groups.length} ta guruh`}
        icon={BookOpen}
        action={
          canManage && (
            <button onClick={openCreate} className="btn-primary">
              <Plus size={18} /> Yangi guruh
            </button>
          )
        }
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size={48} />
        </div>
      ) : groups.length === 0 ? (
        <div className="card">
          <EmptyState icon={BookOpen} title="Guruhlar topilmadi" description="Yangi guruh yaratish uchun tugmani bosing" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((g, i) => (
            <motion.div
              key={g.id}
              className="card group relative overflow-hidden"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', damping: 18 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40" />

              <div className="relative">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-glow">
                    <BookOpen size={22} className="text-white" />
                  </div>
                  <Badge status={g.is_active ? 'active' : 'inactive'}>
                    {g.is_active ? 'Faol' : 'Nofaol'}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-white">{g.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                  <GraduationCap size={15} /> {g.teacher_name || "O'qituvchi tayinlanmagan"}
                </p>

                <div className="mt-4 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Users2 size={15} className="text-brand-300" />
                    {g.student_count ?? 0} o'quvchi
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={15} /> {g.start_date}
                  </span>
                </div>

                <div className="mt-5 flex gap-2 border-t border-white/5 pt-4">
                  <button
                    onClick={() => setStudentsModal(g)}
                    className="btn-ghost flex-1 py-2 text-sm"
                  >
                    <Users2 size={15} /> O'quvchilar
                  </button>
                  {canManage && (
                    <>
                      <button
                        onClick={() => openEdit(g)}
                        className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:bg-brand-500/20 hover:text-brand-300"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(g)}
                        className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:bg-rose-500/20 hover:text-rose-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Guruhni tahrirlash' : 'Yangi guruh'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Guruh nomi">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Masalan: Ingliz tili A1"
              className="input-field"
            />
          </Field>
          <Field label="O'qituvchi">
            <select
              value={form.teacher}
              onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              className="input-field"
            >
              <option value="">— Tanlanmagan —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.specialty})
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Boshlanish sanasi">
              <input
                required
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="input-field"
              />
            </Field>
            <Field label="Tugash sanasi">
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="input-field"
              />
            </Field>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded accent-brand-500"
            />
            <span className="text-sm text-slate-300">Faol guruh</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost flex-1">
              Bekor qilish
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </Modal>

      {studentsModal && (
        <GroupStudentsModal
          group={studentsModal}
          canManage={canManage}
          onClose={() => setStudentsModal(null)}
          onChanged={refetch}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`"${deleteTarget?.name}" guruhini o'chirmoqchimisiz?`}
      />
    </div>
  )
}

function GroupStudentsModal({ group, canManage, onClose, onChanged }) {
  const { data, loading, refetch } = useFetch(() => groupsApi.students(group.id), [group.id])
  const { data: allStudents } = useFetch(
    () => (canManage ? studentsApi.list() : Promise.resolve({ data: [] })),
    [canManage]
  )
  const members = asList(data)
  const memberIds = new Set(members.map((m) => m.id))
  const available = asList(allStudents).filter((s) => !memberIds.has(s.id))

  const [selected, setSelected] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    if (!selected) return
    setAdding(true)
    try {
      await groupsApi.addStudent(group.id, Number(selected))
      toast.success("O'quvchi qo'shildi")
      setSelected('')
      refetch()
      onChanged?.()
    } catch (err) {
      toast.error(firstError(err) || 'Xatolik')
    } finally {
      setAdding(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={`${group.name} — o'quvchilar`} maxWidth="max-w-lg">
      {canManage && (
        <div className="mb-5 flex gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="input-field py-2.5"
          >
            <option value="">— O'quvchi tanlang —</option>
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
          <button onClick={handleAdd} disabled={adding || !selected} className="btn-primary shrink-0">
            <UserPlus size={18} /> Qo'shish
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-10">
          <Spinner />
        </div>
      ) : members.length === 0 ? (
        <EmptyState icon={Users2} title="Guruhda o'quvchilar yo'q" />
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {members.map((s, i) => (
            <motion.div
              key={s.id}
              className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/40 to-purple-500/30 text-xs font-bold text-brand-200">
                {(s.full_name || '?')[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{s.full_name}</p>
                {s.phone && <p className="text-xs text-slate-500">{s.phone}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Modal>
  )
}
