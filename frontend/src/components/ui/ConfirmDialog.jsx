import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Tasdiqlash', message, confirmText = "O'chirish", loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
          <AlertTriangle size={28} />
        </div>
        <p className="mb-6 text-sm text-slate-300">{message}</p>
        <div className="flex w-full gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2.5 font-semibold text-white shadow-lg transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Bajarilmoqda...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
