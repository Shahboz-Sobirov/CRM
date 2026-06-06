import { motion } from 'framer-motion'
import Spinner from './Spinner'
import EmptyState from './EmptyState'

/**
 * columns: [{ key, header, render?(row), className? }]
 * rows: array of objects
 */
export default function DataTable({ columns, rows, loading, emptyTitle, emptyDescription, emptyIcon }) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={48} />
      </div>
    )
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              key={row.id ?? i}
              className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3.5 text-sm text-slate-200 ${col.className || ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
