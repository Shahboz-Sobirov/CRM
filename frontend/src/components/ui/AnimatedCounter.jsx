import { useEffect, useRef, useState } from 'react'

export default function AnimatedCounter({ value = 0, duration = 1200, decimals = 0, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef(null)
  const fromRef = useRef(0)

  useEffect(() => {
    const target = Number(value) || 0
    const from = fromRef.current
    startRef.current = null
    let raf

    const step = (ts) => {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setDisplay(from + (target - from) * eased)
      if (progress < 1) {
        raf = requestAnimationFrame(step)
      } else {
        fromRef.current = target
      }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
