import { Phone } from 'lucide-react'

const PREFIX = '+998'

// Extract up to 9 local digits from any stored value
function toDigits(value) {
  if (!value) return ''
  let d = String(value).replace(/\D/g, '')
  if (d.startsWith('998')) d = d.slice(3)
  return d.slice(0, 9)
}

// Format 9 digits as: 90 123 45 67
function formatDigits(d) {
  const parts = []
  if (d.length > 0) parts.push(d.slice(0, 2))
  if (d.length > 2) parts.push(d.slice(2, 5))
  if (d.length > 5) parts.push(d.slice(5, 7))
  if (d.length > 7) parts.push(d.slice(7, 9))
  return parts.join(' ')
}

/**
 * Controlled phone input.
 * - Always prefixed with +998
 * - Accepts max 9 digits
 * - onChange receives the full E.164-like value: "+998901234567" (or '' when empty)
 */
export default function PhoneInput({ value, onChange, className = '', required = false, ...rest }) {
  const digits = toDigits(value)

  const handleChange = (e) => {
    const next = toDigits(e.target.value)
    onChange(next ? `${PREFIX}${next}` : '')
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-slate-400">
        <Phone size={16} className="text-slate-500" />
        <span className="font-medium">{PREFIX}</span>
      </span>
      <input
        type="tel"
        inputMode="numeric"
        value={formatDigits(digits)}
        onChange={handleChange}
        placeholder="90 123 45 67"
        required={required}
        className={`input-field pl-[5.25rem] ${className}`}
        {...rest}
      />
    </div>
  )
}
