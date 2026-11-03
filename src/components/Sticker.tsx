import { useMemo, useRef } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
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
  /** Grid view: just the sticker and the habit name. */
  compact?: boolean
  /** Put the sticker on a sheet of notebook paper. */
  board?: boolean
}

/**
 * A finished picture as a die-cut sticker: a white outline that follows the pixel shape and a
 * gloss that slides across only the picture. The gloss follows the pointer and drifts at rest.
 */
export function Sticker({ art, habitName, date, compact, board }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const number = library.findIndex((a) => a.id === art.id) + 1

  // The picture's silhouette, used to keep the gloss inside the pixels.
  const mask = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = art.width * 16
    c.height = art.height * 16
    const g = c.getContext('2d')
    if (!g) return undefined
    g.fillStyle = '#000'
    for (const p of art.pixels) g.fillRect(p.x * 16, p.y * 16, 16, 16)
    return `url(${c.toDataURL('image/png')})`
  }, [art])

  function move(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el || reduced()) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.dataset.active = '1'
    el.style.setProperty('--mx', `${Math.round(x * 100)}%`)
    el.style.setProperty('--my', `${Math.round(y * 100)}%`)
    el.style.setProperty('--rx', `${((0.5 - y) * 12).toFixed(1)}deg`)
    el.style.setProperty('--ry', `${((x - 0.5) * 12).toFixed(1)}deg`)
  }

  function leave() {
    const el = ref.current
    if (!el) return
    delete el.dataset.active
    for (const v of ['--mx', '--my', '--rx', '--ry']) el.style.removeProperty(v)
  }

  const sheen = mask ? ({ WebkitMaskImage: mask, maskImage: mask } as CSSProperties) : undefined

  return (
    <div className={`st-wrap ${board ? 'board' : ''} ${compact ? 'compact' : ''}`}>
      <div ref={ref} className="st" onPointerMove={move} onPointerLeave={leave}>
        <div className="st-art">
          <PixelCanvas art={art} full bare label={art.name} />
          <div className="st-sheen" style={sheen} />
        </div>
        <div className="st-pill">{art.name} · done</div>
      </div>
      {habitName && <p className="st-meta">From “{habitName}”</p>}
      {!compact && (
        <p className="st-meta muted">
          No. {pad(number)}/{pad(library.length)}
          {date ? ` · ${pretty(date)}` : ''}
        </p>
      )}
    </div>
  )
}
