import { useState } from 'react'
import { CreditCard, Plus, Check, X, Trash2, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { paymentsApi, studentsApi } from '../api/services'
import useFetch, { asList } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Badge from '../components/ui/Badge'
import { Field, firstError } from './Students'

const METHOD_LABEL = { cash: 'Naqd', card: 'Karta', bank_transfer: "Bank o'tkazmasi" }

const EMPTY = {
  student: '',
  amount: '',
  payment_date: new Date().toISOString().slice(0, 10),
  payment_method: 'cash',
  description: '',
}

export default function Payments() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const canManage = ['admin', 'manager'].includes(user?.role)

  const { data, loading, refetch } = useFetch(() => paymentsApi.list(), [])
  const { data: studentsData } = useFetch(
    () => (canManage ? studentsApi.list() : Promise.resolve({ data: [] })),
    [canManage]
  )
  const payments = asList(data)
  const students = asList(studentsData)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await paymentsApi.create({ ...form, amount: Number(form.amount) })
      toast.success("To'lov qo'shildi 🎉")
      setModalOpen(false)
      setForm(EMPTY)
      refetch()
    } catch (err) {
      toast.error(firstError(err) || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async (p) => {
    try {
      await paymentsApi.approve(p.id)
      toast.success('To\'lov tasdiqlandi ✅')
      refetch()
    } catch {
      toast.error('Xatolik')
    }
  }

  const handleReject = async (p) => {
    try {
      await paymentsApi.reject(p.id)
      toast.success('To\'lov rad etildi')
      refetch()
    } catch {
      toast.error('Xatolik')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await paymentsApi.remove(deleteTarget.id)
      toast.success("To'lov o'chirildi")
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
      key: 'student_name',
      header: "O'quvchi",
      render: (p) => <span className="font-semibold text-white">{p.student_name || `#${p.student}`}</span>,
    },
    {
      key: 'amount',
      header: 'Summa',
      render: (p) => (
        <span className="font-bold text-emerald-300">{Number(p.amount).toLocaleString()} so'm</span>
      ),
    },
    { key: 'payment_date', header: 'Sana' },
    {
      key: 'payment_method',
      header: 'Usul',
      render: (p) => <span className="text-slate-400">{METHOD_LABEL[p.payment_method] || p.payment_method}</span>,
    },
    { key: 'status', header: 'Holat', render: (p) => <Badge status={p.status} /> },
  ]

  if (canManage) {
    columns.push({
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p) => (
        <div className="flex justify-end gap-1.5">
          {isAdmin && p.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(p)}
                className="rounded-lg p-2 text-emerald-400 transition hover:bg-emerald-500/20"
                title="Tasdiqlash"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => handleReject(p)}
                className="rounded-lg p-2 text-amber-400 transition hover:bg-amber-500/20"
                title="Rad etish"
              >
                <X size={16} />
              </button>
            </>
          )}
          <button
            onClick={() => setDeleteTarget(p)}
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
        title="To'lovlar"
        subtitle={`Jami ${payments.length} ta to'lov`}
        icon={CreditCard}
        action={
          canManage && (
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus size={18} /> Yangi to'lov
            </button>
          )
        }
      />

      <div className="card">
        <DataTable
          columns={columns}
          rows={payments}
          loading={loading}
          emptyIcon={Receipt}
          emptyTitle="To'lovlar topilmadi"
          emptyDescription="Yangi to'lov qo'shish uchun tugmani bosing"
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Yangi to'lov">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="O'quvchi">
            <select
              required
              value={form.student}
              onChange={(e) => setForm({ ...form, student: e.target.value })}
              className="input-field"
            >
              <option value="">— Tanlang —</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Summa (so'm)">
              <input
                required
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="500000"
                className="input-field"
              />
            </Field>
            <Field label="Sana">
              <input
                required
                type="date"
                value={form.payment_date}
                onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                className="input-field"
              />
            </Field>
          </div>
          <Field label="To'lov usuli">
            <select
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="input-field"
            >
              <option value="cash">Naqd</option>
              <option value="card">Karta</option>
              <option value="bank_transfer">Bank o'tkazmasi</option>
            </select>
          </Field>
          <Field label="Izoh">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
        message={`Bu to'lovni o'chirmoqchimisiz? (${Number(deleteTarget?.amount || 0).toLocaleString()} so'm)`}
      />
    </div>
  )
}
