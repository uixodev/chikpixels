import { useRef } from 'react'
import type { PointerEvent } from 'react'
import { library, type Art } from '../lib/art'
import { PixelCanvas } from './PixelCanvas'

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const pad = (n: number) => String(n).padStart(String(library.length).length, '0')
const pretty = (iso?: string) =>
  iso ? new Date(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

interface Props {
  art: Art
  habitName?: string
  /** Finish date, YYYY-MM-DD. */
  date?: string
  className?: string
}

/**
 * A collector card for a finished picture. A rainbow foil and glare are blended over the art
 * itself, and shift with the pointer (or drift on their own at rest), like a holo trading card.
 */
export function HoloCard({ art, habitName, date, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const number = library.findIndex((a) => a.id === art.id) + 1

  function move(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el || reduced()) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.dataset.active = '1'
    el.style.setProperty('--mx', `${Math.round(x * 100)}%`)
    el.style.setProperty('--my', `${Math.round(y * 100)}%`)
    el.style.setProperty('--rx', `${((0.5 - y) * 14).toFixed(1)}deg`)
    el.style.setProperty('--ry', `${((x - 0.5) * 14).toFixed(1)}deg`)
  }

  function leave() {
    const el = ref.current
    if (!el) return
    delete el.dataset.active
    for (const v of ['--mx', '--my', '--rx', '--ry']) el.style.removeProperty(v)
  }

  return (
    <div className={`hc-wrap ${className}`}>
      <div ref={ref} className="hc" onPointerMove={move} onPointerLeave={leave}>
        <div className="hc-face">
          <div className="hc-head">
            <strong>{art.name}</strong>
            <span aria-hidden="true">★</span>
          </div>
          <div className="hc-window">
            <div className="hc-bg" />
            <PixelCanvas art={art} full bare label={art.name} className="hc-art" />
            <div className="hc-foil" />
            <div className="hc-glare" />
            <div className="hc-sparkle" />
          </div>
          <div className="hc-foot">
            {habitName && <span className="hc-habit">From “{habitName}”</span>}
            <span className="hc-meta">
              No. {pad(number)}/{pad(library.length)}
              {date ? ` · ${pretty(date)}` : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
