import { useState } from 'react'
import { UserCog, Plus, Search, Trash2, Mail, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../api/services'
import useFetch, { asList } from '../hooks/useFetch'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Badge from '../components/ui/Badge'
import PhoneInput from '../components/ui/PhoneInput'
import { Field, firstError } from './Students'

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Menejer' },
  { value: 'teacher', label: "O'qituvchi" },
  { value: 'parent', label: 'Ota-ona' },
]

const EMPTY = {
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  role: 'parent',
  password: '',
}

export default function UsersPage() {
  const { data, loading, refetch } = useFetch(() => authApi.listUsers(), [])
  const users = asList(data)

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = users.filter(
    (u) =>
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone || form.phone.replace(/\D/g, '').length < 12) {
      toast.error("Telefon raqamini to'liq kiriting")
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, email: form.email || null }
      await authApi.createUser(payload)
      toast.success('Foydalanuvchi qo\'shildi 🎉')
      setModalOpen(false)
      setForm(EMPTY)
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
      await authApi.deleteUser(deleteTarget.id)
      toast.success("Foydalanuvchi o'chirildi")
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
      header: 'Foydalanuvchi',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/40 to-fuchsia-500/30 text-xs font-bold text-purple-200">
            {(u.full_name || u.email || '?')[0]?.toUpperCase()}
          </div>
          <span className="font-semibold text-white">{u.full_name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (u) => (
        <span className="flex items-center gap-1.5 text-slate-400">
          <Mail size={14} /> {u.email}
        </span>
      ),
    },
    { key: 'phone', header: 'Telefon', render: (u) => u.phone || '—' },
    { key: 'role', header: 'Rol', render: (u) => <Badge status={u.role} /> },
    {
      key: 'is_active',
      header: 'Holat',
      render: (u) => <Badge status={u.is_active ? 'active' : 'inactive'}>{u.is_active ? 'Faol' : 'Nofaol'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (u) => (
        <button
          onClick={() => setDeleteTarget(u)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/20 hover:text-rose-300"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Foydalanuvchilar"
        subtitle={`Jami ${users.length} ta foydalanuvchi`}
        icon={UserCog}
        action={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={18} /> Yangi foydalanuvchi
          </button>
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
          emptyIcon={UserCog}
          emptyTitle="Foydalanuvchilar topilmadi"
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Yangi foydalanuvchi">
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
          <Field label="Email (ixtiyoriy)">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
              className="input-field"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefon *">
              <PhoneInput
                value={form.phone}
                onChange={(val) => setForm({ ...form, phone: val })}
              />
            </Field>
            <Field label="Rol">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="input-field"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Parol">
              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Kamida 8 ta belgi"
                className="input-field"
              />
            </Field>
          </div>
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
        message={`"${deleteTarget?.full_name}" foydalanuvchisini o'chirmoqchimisiz?`}
      />
    </div>
  )
}
