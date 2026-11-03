import { buildMosaic, findArt } from '../lib/art'
import { revealedCount, type AppState } from '../lib/habits'
import { useMemo } from 'react'
import { MosaicBoard } from './MosaicBoard'
import type { Habit } from '../lib/habits'

interface Props {
  state: AppState
  onOpen: (id: string) => void
  onNew: () => void
  onThreshold: (n: number) => void
}

function Card({ habit, threshold, onOpen }: { habit: Habit; threshold: number; onOpen: () => void }) {
  const art = findArt(habit.artId)
  const mosaic = useMemo(() => (art ? buildMosaic(art, habit.cell) : undefined), [art, habit.cell])
  const done = revealedCount(habit, threshold)
  const complete = done >= habit.days

  return (
    <button className="card" onClick={onOpen}>
      <div className="mini">
        {mosaic ? (
          <MosaicBoard mosaic={mosaic} efforts={habit.efforts} threshold={threshold} compact label={`${habit.name} progress`} />
        ) : (
          <div className="missing">?</div>
        )}
      </div>
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
