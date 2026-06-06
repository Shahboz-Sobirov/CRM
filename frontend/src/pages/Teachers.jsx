import { useState } from 'react'
import { Users, Plus, Search, Pencil, Trash2, Mail, BookMarked } from 'lucide-react'
import toast from 'react-hot-toast'
import { teachersApi, authApi } from '../api/services'
import useFetch, { asList } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Field, firstError } from './Students'

const EMPTY = { user: '', specialty: '', bio: '', hire_date: '' }

export default function Teachers() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const { data, loading, refetch } = useFetch(() => teachersApi.list(), [])
  const { data: usersData } = useFetch(
    () => (isAdmin ? authApi.listUsers() : Promise.resolve({ data: [] })),
    [isAdmin]
  )
  const teachers = asList(data)
  const teacherUsers = asList(usersData).filter((u) => u.role === 'teacher')

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = teachers.filter(
    (t) =>
      (t.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.specialty || '').toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  const openEdit = (t) => {
    setEditing(t)
    setForm({
      user: t.user || '',
      specialty: t.specialty || '',
      bio: t.bio || '',
      hire_date: t.hire_date || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await teachersApi.update(editing.id, {
          specialty: form.specialty,
          bio: form.bio,
          hire_date: form.hire_date,
        })
        toast.success("O'qituvchi yangilandi")
      } else {
        await teachersApi.create(form)
        toast.success("O'qituvchi qo'shildi 🎉")
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
      await teachersApi.remove(deleteTarget.id)
      toast.success("O'qituvchi o'chirildi")
      setDeleteTarget(null)
      refetch()
    } catch {
      toast.error("O'chirishda xatolik")
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'full_name',
      header: "O'qituvchi",
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/40 to-sky-500/30 text-xs font-bold text-cyan-200">
            {(t.full_name || '?')[0]}
          </div>
          <span className="font-semibold text-white">{t.full_name}</span>
        </div>
      ),
    },
    {
      key: 'specialty',
      header: 'Mutaxassislik',
      render: (t) => (
        <span className="flex items-center gap-1.5 text-slate-300">
          <BookMarked size={14} className="text-brand-300" /> {t.specialty}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (t) => (
        <span className="flex items-center gap-1.5 text-slate-400">
          <Mail size={14} /> {t.email}
        </span>
      ),
    },
    { key: 'hire_date', header: 'Ishga olingan', render: (t) => t.hire_date || '—' },
  ]

  if (isAdmin) {
    columns.push({
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (t) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => openEdit(t)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-500/20 hover:text-brand-300"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(t)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/20 hover:text-rose-300"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    })
  }

  return (
    <div>
      <PageHeader
        title="O'qituvchilar"
        subtitle={`Jami ${teachers.length} ta o'qituvchi`}
        icon={Users}
        action={
          isAdmin && (
            <button onClick={openCreate} className="btn-primary">
              <Plus size={18} /> Yangi o'qituvchi
            </button>
          )
        }
      />

      <div className="card">
        <div className="mb-5">
          <div className="relative max-w-sm">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish..."
              className="input-field pl-10 py-2.5"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          emptyIcon={Users}
          emptyTitle="O'qituvchilar topilmadi"
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Tahrirlash" : "Yangi o'qituvchi"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <Field label="Foydalanuvchi (teacher roli)">
              <select
                required
                value={form.user}
                onChange={(e) => setForm({ ...form, user: e.target.value })}
                className="input-field"
              >
                <option value="">— Tanlang —</option>
                {teacherUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
              {teacherUsers.length === 0 && (
                <p className="mt-1.5 text-xs text-amber-400">
                  Avval "Foydalanuvchilar" bo'limida teacher rolli foydalanuvchi yarating
                </p>
              )}
            </Field>
          )}
          <Field label="Mutaxassislik">
            <input
              required
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              placeholder="Masalan: Matematika"
              className="input-field"
            />
          </Field>
          <Field label="Ishga olingan sana">
            <input
              required
              type="date"
              value={form.hire_date}
              onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
              className="input-field"
            />
          </Field>
          <Field label="Bio">
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="input-field resize-none"
            />
          </Field>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`"${deleteTarget?.full_name}" o'qituvchisini o'chirmoqchimisiz?`}
      />
    </div>
  )
}
