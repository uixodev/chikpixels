import { findArt } from '../lib/art'
import { revealedCount, type AppState } from '../lib/habits'
import { PixelCanvas } from './PixelCanvas'
import { useMemo } from 'react'
import { splitIntoRegions } from '../lib/regions'
import type { Habit } from '../lib/habits'

interface Props {
  state: AppState
  onOpen: (id: string) => void
  onNew: () => void
  onThreshold: (n: number) => void
}

function Card({ habit, threshold, onOpen }: { habit: Habit; threshold: number; onOpen: () => void }) {
  const art = findArt(habit.artId)
  const done = revealedCount(habit, threshold)
  const regions = useMemo(
    () => (art ? splitIntoRegions(art.pixels, art.width, art.height, habit.days) : []),
    [art, habit.days],
  )
  const pixelBrightness = useMemo(() => {
    const out: (number | undefined)[] = []
    if (!art) return out
    regions.forEach((r, d) => {
      if ((habit.efforts[d] ?? -1) >= threshold) r.forEach((i) => (out[i] = 1))
    })
    return out
  }, [art, regions, habit.efforts, threshold])
  const complete = done >= habit.days

  return (
    <button className="card" onClick={onOpen}>
      {art ? <PixelCanvas art={art} brightness={pixelBrightness} className="mini" /> : <div className="mini missing">?</div>}
      <div className="card-body">
        <strong>{habit.name}</strong>
        <span className="muted">
          {complete ? `Complete${habit.completedAt ? ' · ' + habit.completedAt : ''}` : `${done} / ${habit.days} revealed`}
        </span>
        <span className="bar" aria-hidden="true">
          <i style={{ width: `${(done / habit.days) * 100}%` }} />
        </span>
      </div>
    </button>
  )
}

export function Home({ state, onOpen, onNew, onThreshold }: Props) {
  return (
    <main>
      <section className="callout">
        <p>
          Consistency is often invisible, until now. Show up, and a picture appears one piece at a time.
        </p>
      </section>

      <div className="row-between">
        <h1>My habits</h1>
        <button className="btn primary" onClick={onNew}>
          + New habit
        </button>
      </div>

      {state.habits.length === 0 ? (
        <p className="muted empty">No habits yet. Start one and pick a picture, or let it be a surprise.</p>
      ) : (
        <div className="cards">
          {state.habits.map((h) => (
            <Card key={h.id} habit={h} threshold={state.threshold} onOpen={() => onOpen(h.id)} />
          ))}
        </div>
      )}

      <section className="settings">
        <label>
          <span>Effort needed to reveal a piece: <b>{state.threshold}</b></span>
          <input type="range" min={0} max={90} value={state.threshold} onChange={(e) => onThreshold(+e.target.value)} />
        </label>
      </section>
    </main>
  )
}
