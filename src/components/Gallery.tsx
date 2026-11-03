import { useMemo, useState } from 'react'
import { collectedPictures, lockedPictures, type Collected } from '../lib/gallery'
import { library } from '../lib/art'
import type { Habit } from '../lib/habits'
import { HoloCard } from './HoloCard'

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
            <HoloCard art={c.art} habitName={c.habitName} date={c.completedAt} className="compact" />
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
            <HoloCard art={open.art} habitName={open.habitName} date={open.completedAt} />
            <p className="muted">Move your finger or mouse over the card.</p>
            <button className="btn primary" onClick={() => setOpen(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
