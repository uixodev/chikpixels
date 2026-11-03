import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { library } from '../lib/art'
import { collectedPictures, lockedPictures, type Collected } from '../lib/gallery'
import type { Habit } from '../lib/habits'
import { Sticker } from './Sticker'

/** A steady, slightly different angle per sticker, so the board looks hand-placed. */
function tilt(key: string): number {
  let h = 0
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return (h % 15) - 7
}

export function Gallery({ habits, threshold }: { habits: Habit[]; threshold: number }) {
  const [open, setOpen] = useState<Collected | null>(null)
  const collected = useMemo(() => collectedPictures(habits, threshold), [habits, threshold])
  const locked = useMemo(() => lockedPictures(collected), [collected])
  const distinct = library.length - locked.length

  return (
    <main>
      <div className="row-between">
        <h1>Gallery</h1>
        <span className="muted">
          {distinct} of {library.length} collected
        </span>
      </div>

      <div className="whiteboard-wrap">
        <div className="whiteboard">
          {collected.length === 0 && <p className="wb-empty">Finish a picture and it gets stuck on the board.</p>}
          <div className="wb-grid">
            {collected.map((c) => (
              <button key={c.key} className="wb-item" style={{ '--tilt': `${tilt(c.key)}deg` } as CSSProperties} onClick={() => setOpen(c)} aria-label={`${c.art.name}, from ${c.habitName}`}>
                <Sticker art={c.art} compact />
              </button>
            ))}
          </div>
          {locked.length > 0 && (
            <div className="wb-locked">
              <p className="wb-note">Still to find · {locked.length}</p>
              <div className="wb-locked-grid">
                {locked.map((a) => (
                  <div key={a.id} className="wb-blank" aria-label="Not collected yet">
                    ?
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="wb-tray" aria-hidden="true">
          <i className="mk m1" />
          <i className="mk m2" />
          <i className="mk m3" />
          <i className="eraser" />
        </div>
      </div>

      {open && (
        <div className="scrim celebrate" onClick={() => setOpen(null)}>
          <div className="sheet" role="dialog" aria-label={open.art.name} onClick={(e) => e.stopPropagation()}>
            <Sticker art={open.art} habitName={open.habitName} date={open.completedAt} board />
            <p className="muted">Move your finger or mouse over the sticker.</p>
            <button className="btn primary" onClick={() => setOpen(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
