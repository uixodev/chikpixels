import { findArt } from '../lib/art'
import { chapterRanges, chapterRevealed, revealedCount, type AppState } from '../lib/habits'
import { PixelCanvas } from './PixelCanvas'
import { Stickers } from './Stickers'
import type { Pos } from '../lib/stickers'
import { useMemo } from 'react'
import { splitIntoRegions } from '../lib/regions'
import type { Habit } from '../lib/habits'

interface Props {
  state: AppState
  onOpen: (id: string) => void
  onNew: () => void
  onMoveSticker: (key: string, pos: Pos) => void
  onExtend: (habitId: string) => void
}

function Card({ habit, threshold, onOpen }: { habit: Habit; threshold: number; onOpen: () => void }) {
  // Show the picture currently in progress (or the last one once everything is done).
  const ranges = chapterRanges(habit)
  const range = ranges.find((r) => chapterRevealed(habit, r, threshold) < r.days) ?? ranges[ranges.length - 1]
  const art = findArt(range.artId)
  const done = revealedCount(habit, threshold)
  const complete = done >= habit.days
  const regions = useMemo(() => (art ? splitIntoRegions(art.pixels, art.width, art.height, range.days) : []), [art, range.days])
  const pixelBrightness = useMemo(() => {
    const out: (number | undefined)[] = []
    regions.forEach((r, d) => {
      if ((habit.efforts[range.offset + d] ?? -1) >= threshold) r.forEach((i) => (out[i] = 1))
    })
    return out
  }, [regions, habit.efforts, range.offset, threshold])

  return (
    <button className="card" onClick={onOpen}>
      {!art ? (
        <div className="mini missing">?</div>
      ) : complete ? (
        <PixelCanvas art={art} full className="mini" />
      ) : (
        <PixelCanvas art={art} brightness={pixelBrightness} className="mini" />
      )}
      <div className="card-body">
        <strong>{habit.name}</strong>
        <span className="muted">
          {complete ? `Complete${habit.completedAt ? ' · ' + habit.completedAt : ''}` : `${done} / ${habit.days} revealed`}
          {ranges.length > 1 ? ` · ${ranges.length} pictures` : ''}
        </span>
        <span className="bar" aria-hidden="true">
          <i style={{ width: `${(done / habit.days) * 100}%` }} />
        </span>
      </div>
    </button>
  )
}

export function Home({ state, onOpen, onNew, onMoveSticker, onExtend }: Props) {
  const isDone = (h: Habit) => revealedCount(h, state.threshold) >= h.days
  const active = state.habits.filter((h) => !isDone(h))
  const anyDone = state.habits.some(isDone)
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

      {active.length === 0 ? (
        <p className="muted empty">
          {anyDone ? 'Nothing in progress right now. Start a new habit to collect another picture.' : 'No habits yet. Start one and pick a picture, or let it be a surprise.'}
        </p>
      ) : (
        <div className="cards">
          {active.map((h) => (
            <Card key={h.id} habit={h} threshold={state.threshold} onOpen={() => onOpen(h.id)} />
          ))}
        </div>
      )}

      <Stickers habits={state.habits} threshold={state.threshold} positions={state.stickers} onMove={onMoveSticker} onOpenHabit={onOpen} onExtend={onExtend} />
    </main>
  )
}
