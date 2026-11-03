import { useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { library } from '../lib/art'
import { collectedPictures, type Collected } from '../lib/gallery'
import type { Habit } from '../lib/habits'
import { areaHeight, clampPos, defaultPos, tiltFor, type Pos } from '../lib/stickers'
import { Sticker } from './Sticker'

interface Props {
  habits: Habit[]
  threshold: number
  positions: Record<string, Pos>
  onMove: (key: string, pos: Pos) => void
  onOpenHabit: (habitId: string) => void
}

interface Drag {
  key: string
  startX: number
  startY: number
  origX: number
  origY: number
  moved: boolean
}

/** Finished pictures as stickers on the page's squared paper. Drag them anywhere; tap for details. */
export function Stickers({ habits, threshold, positions, onMove, onOpenHabit }: Props) {
  const collected = collectedPictures(habits, threshold)
  const [open, setOpen] = useState<Collected | null>(null)
  const [live, setLive] = useState<Record<string, Pos>>({})
  const area = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)

  const place = (c: Collected, i: number): Pos => live[c.key] ?? positions[c.key] ?? defaultPos(i, c.key)
  const all = collected.map(place)
  const height = areaHeight(collected.length, all)
  const topZ = Math.max(0, ...Object.values(positions).map((p) => p.z ?? 0), ...Object.values(live).map((p) => p.z ?? 0))

  function down(e: PointerEvent<HTMLDivElement>, c: Collected, i: number) {
    const p = place(c, i)
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { key: c.key, startX: e.clientX, startY: e.clientY, origX: p.x, origY: p.y, moved: false }
  }

  function move(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current
    const el = area.current
    if (!d || !el) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 6) return
    d.moved = true
    const w = el.getBoundingClientRect().width
    setLive((l) => ({ ...l, [d.key]: clampPos({ x: d.origX + dx / w, y: d.origY + dy, z: topZ + 1 }, height + 400) }))
  }

  function up(e: PointerEvent<HTMLDivElement>, c: Collected) {
    const d = drag.current
    drag.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    if (!d) return
    if (d.moved) {
      const p = live[d.key]
      if (p) onMove(d.key, p)
      setLive(({ [d.key]: _gone, ...rest }) => rest)
    } else {
      setOpen(c)
    }
  }

  function key(e: KeyboardEvent<HTMLDivElement>, c: Collected) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(c)
    }
  }

  return (
    <section aria-label="Completed pictures">
      <div className="row-between section-head">
        <h2>Completed</h2>
        <span className="muted">
          {new Set(collected.map((c) => c.art.id)).size} of {library.length} pictures
        </span>
      </div>
      {collected.length === 0 ? (
        <p className="muted empty">Finish a picture and it lands here as a sticker. You can drag it anywhere.</p>
      ) : (
        <>
          <p className="muted">Drag the stickers around. Tap one for details.</p>
          <div ref={area} className="sticker-area" style={{ height }}>
            {collected.map((c, i) => {
              const p = place(c, i)
              const dragging = live[c.key] !== undefined
              return (
                <div
                  key={c.key}
                  className={`sk ${dragging ? 'lifted' : ''}`}
                  style={{ left: `${p.x * 100}%`, top: p.y, zIndex: p.z ?? 0, '--tilt': `${tiltFor(c.key)}deg` } as CSSProperties}
                  role="button"
                  tabIndex={0}
                  aria-label={`${c.art.name} sticker, from ${c.habitName}. Drag to move, press Enter for details.`}
                  onPointerDown={(e) => down(e, c, i)}
                  onPointerMove={move}
                  onPointerUp={(e) => up(e, c)}
                  onPointerCancel={() => { drag.current = null; setLive(({ [c.key]: _gone, ...rest }) => rest) }}
                  onKeyDown={(e) => key(e, c)}
                >
                  <Sticker art={c.art} compact />
                </div>
              )
            })}
          </div>
        </>
      )}

      {open && (
        <div className="scrim celebrate" onClick={() => setOpen(null)}>
          <div className="sheet" role="dialog" aria-label={open.art.name} onClick={(e) => e.stopPropagation()}>
            <Sticker art={open.art} habitName={open.habitName} date={open.completedAt} board />
            <div className="actions" style={{ justifyContent: 'center' }}>
              <button
                className="btn primary"
                onClick={() => {
                  const id = open.habitId
                  setOpen(null)
                  onOpenHabit(id)
                }}
              >
                Open habit
              </button>
              <button className="btn" onClick={() => setOpen(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
