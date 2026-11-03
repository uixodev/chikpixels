import { useMemo, useState } from 'react'
import { collectedPictures, lockedPictures, type Collected } from '../lib/gallery'
import { library } from '../lib/art'
import type { Habit } from '../lib/habits'
import { Holo } from './Holo'
import { PixelCanvas } from './PixelCanvas'

const pretty = (iso?: string) =>
  iso ? new Date(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

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

      {collected.length === 0 && (
        <p className="callout small">
          <span>Finish a picture and it will be added here, shiny and ready to show off.</span>
        </p>
      )}

      <div className="shelf">
        {collected.map((c) => (
          <button key={c.key} className="slot" onClick={() => setOpen(c)} aria-label={`${c.art.name}, from ${c.habitName}`}>
            <Holo>
              <PixelCanvas art={c.art} full />
            </Holo>
            <strong>{c.art.name}</strong>
            <small className="muted">{c.habitName}</small>
          </button>
        ))}
        {locked.map((a) => (
          <div key={a.id} className="slot locked" aria-label="Not collected yet">
            <div className="blank">?</div>
            <strong>???</strong>
            <small className="muted">not collected</small>
          </div>
        ))}
      </div>

      {open && (
        <div className="scrim celebrate" onClick={() => setOpen(null)}>
          <div className="sheet" role="dialog" aria-label={open.art.name} onClick={(e) => e.stopPropagation()}>
            <Holo className="stage small big">
              <PixelCanvas art={open.art} full label={open.art.name} />
            </Holo>
            <h2>{open.art.name}</h2>
            <p className="muted">
              From “{open.habitName}”{open.completedAt ? ` · finished ${pretty(open.completedAt)}` : ''}
            </p>
            <button className="btn primary" onClick={() => setOpen(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
