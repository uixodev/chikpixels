import { useRef } from 'react'
import type { PointerEvent, ReactNode } from 'react'

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Holographic foil for finished pictures: a drifting rainbow sheen, a diamond lattice and
 * sparkles. The shine follows the pointer and the card tilts slightly, like a trading card.
 */
export function Holo({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  function move(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el || reduced()) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${Math.round(x * 100)}%`)
    el.style.setProperty('--my', `${Math.round(y * 100)}%`)
    el.style.setProperty('--rx', `${((0.5 - y) * 12).toFixed(1)}deg`)
    el.style.setProperty('--ry', `${((x - 0.5) * 12).toFixed(1)}deg`)
  }

  function leave() {
    const el = ref.current
    if (!el) return
    for (const v of ['--mx', '--my', '--rx', '--ry']) el.style.removeProperty(v)
  }

  return (
    <div ref={ref} className={`holo ${className}`} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </div>
  )
}
