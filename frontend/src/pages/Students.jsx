import { useState } from 'react'
import { GraduationCap, Plus, Search, Pencil, Trash2, Phone, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { studentsApi, authApi } from '../api/services'
import useFetch, { asList } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PhoneInput from '../components/ui/PhoneInput'

const EMPTY = { first_name: '', last_name: '', birth_date: '', parent: '', phone: '', address: '' }

export default function Students() {
  const { user } = useAuth()
  const canManage = ['admin', 'manager'].includes(user?.role)

  const { data, loading, refetch } = useFetch(() => studentsApi.list(), [])
  const { data: usersData } = useFetch(
    () => (canManage ? authApi.listUsers() : Promise.resolve({ data: [] })),
    [canManage]
  )
  const students = asList(data)
  const parents = asList(usersData).filter((u) => u.role === 'parent')

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = students.filter((s) =>
    (s.full_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  const openEdit = (s) => {
    setEditing(s)
    setForm({
      first_name: s.first_name || '',
      last_name: s.last_name || '',
      birth_date: s.birth_date || '',
      parent: s.parent || '',
      phone: s.phone || '',
      address: s.address || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, parent: form.parent || null }
      if (editing) {
        await studentsApi.update(editing.id, payload)
        toast.success("O'quvchi yangilandi")
      } else {
        await studentsApi.create(payload)
        toast.success("O'quvchi qo'shildi 🎉")
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
      await studentsApi.remove(deleteTarget.id)
      toast.success("O'quvchi o'chirildi")
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
      header: "O'quvchi",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/40 to-purple-500/30 text-xs font-bold text-brand-200">
            {(s.full_name || '?')[0]}
          </div>
          <span className="font-semibold text-white">{s.full_name}</span>
        </div>
      ),
    },
    {
      key: 'birth_date',
      header: "Tug'ilgan sana",
      render: (s) => (
        <span className="flex items-center gap-1.5 text-slate-400">
          <Calendar size={14} /> {s.birth_date || '—'}
        </span>
      ),
    },
    { key: 'parent_name', header: 'Ota-ona', render: (s) => s.parent_name || '—' },
    {
      key: 'phone',
      header: 'Telefon',
      render: (s) =>
        s.phone ? (
          <span className="flex items-center gap-1.5 text-slate-400">
            <Phone size={14} /> {s.phone}
          </span>
        ) : (
          '—'
        ),
    },
  ]

  if (canManage) {
    columns.push({
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => openEdit(s)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-500/20 hover:text-brand-300"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(s)}
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
        title="O'quvchilar"
        subtitle={`Jami ${students.length} ta o'quvchi`}
        icon={GraduationCap}
        action={
          canManage && (
            <button onClick={openCreate} className="btn-primary">
              <Plus size={18} /> Yangi o'quvchi
            </button>
          )
        }
      />

      <div className="card">
        <div className="mb-5 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
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
          emptyIcon={GraduationCap}
          emptyTitle="O'quvchilar topilmadi"
          emptyDescription="Yangi o'quvchi qo'shish uchun tugmani bosing"
        />
      </div>

      {/* Create / Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ism">
              <input
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="input-field"
              />
            </Field>
            <Field label="Familiya">
              <input
                required
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="input-field"
              />
            </Field>
          </div>
          <Field label="Tug'ilgan sana">
            <input
              required
              type="date"
              value={form.birth_date}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              className="input-field"
            />
          </Field>
          <Field label="Ota-ona">
            <select
              value={form.parent}
              onChange={(e) => setForm({ ...form, parent: e.target.value })}
              className="input-field"
            >
              <option value="">— Tanlanmagan —</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.email})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Telefon">
            <PhoneInput
              value={form.phone}
              onChange={(val) => setForm({ ...form, phone: val })}
            />
          </Field>
          <Field label="Manzil">
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
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
        message={`"${deleteTarget?.full_name}" o'quvchisini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
      />
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      {children}
    </div>
  )
}

export function firstError(err) {
  const data = err.response?.data
  if (!data) return null
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  const firstKey = Object.keys(data)[0]
  if (!firstKey) return null
  const val = data[firstKey]
  return Array.isArray(val) ? `${firstKey}: ${val[0]}` : `${firstKey}: ${val}`
}
