import { ArrowLeft } from './ArrowLeft'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Art } from '../lib/art'
import { brightness, isRevealed, revealedCount, type Habit } from '../lib/habits'
import { splitIntoRegions } from '../lib/regions'
import { Confetti } from './Confetti'
import { EffortSheet } from './EffortSheet'
import { PixelCanvas } from './PixelCanvas'

interface Props {
  habit: Habit
  art: Art
  threshold: number
  onEffort: (day: number, effort: number | null) => void
  onDelete: () => void
  onBack: () => void
}

export function Tracker({ habit, art, threshold, onEffort, onDelete, onBack }: Props) {
  const [editing, setEditing] = useState<number | null>(null)
  const [peek, setPeek] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  const regions = useMemo(() => splitIntoRegions(art.pixels, art.width, art.height, habit.days), [art, habit.days])
  const pixelBrightness = useMemo(() => {
    const out: (number | undefined)[] = new Array(art.pixels.length).fill(undefined)
    regions.forEach((region, d) => {
      const e = habit.efforts[d]
      if (isRevealed(e, threshold)) region.forEach((i) => (out[i] = brightness(e, threshold)))
    })
    return out
  }, [art, regions, habit.efforts, threshold])

  const done = revealedCount(habit, threshold)
  const complete = done >= habit.days
  const wasComplete = useRef(complete)
  useEffect(() => {
    if (complete && !wasComplete.current) setCelebrate(true)
    wasComplete.current = complete
  }, [complete])

  const mystery = habit.mode === 'secret' && !complete
  const palette = useMemo(() => Array.from(new Set(art.pixels.map((p) => p.color))).slice(0, 8), [art])

  return (
    <main>
      <button className="btn ghost back" onClick={onBack}>
        <ArrowLeft /> My habits
      </button>
      <div className="row-between">
        <h1>{habit.name}</h1>
        <span className="count">
          {done}/{habit.days}
        </span>
      </div>
      <p className="muted">{mystery ? 'A secret picture' : art.name}</p>

      <PixelCanvas art={art} brightness={pixelBrightness} ghost={peek && habit.mode === 'chosen' && !complete} className="stage" label={mystery ? 'Your picture so far' : art.name} />

      {habit.mode === 'chosen' && !complete && (
        <button className="btn small" onClick={() => setPeek((p) => !p)} aria-pressed={peek}>
          {peek ? 'Hide outline' : 'Peek at outline'}
        </button>
      )}

      <h2>Tap a day to log it</h2>
      <p className="muted">Pick any slot, in any order. Missed one? Fill it in later.</p>
      <div className="board">
        {Array.from({ length: habit.days }, (_, d) => {
          const e = habit.efforts[d]
          const state = e === undefined ? 'empty' : isRevealed(e, threshold) ? 'done' : 'low'
          return (
            <button
              key={d}
              className={`day ${state}`}
              style={state === 'done' ? { opacity: 0.45 + 0.55 * (e / 100) } : undefined}
              onClick={() => setEditing(d)}
              aria-label={`Day ${d + 1}${e !== undefined ? `, effort ${e}` : ', not logged'}`}
            >
              {d + 1}
            </button>
          )
        })}
      </div>

      <button
        className="btn ghost danger"
        onClick={() => {
          if (confirm(`Delete “${habit.name}” and its progress?`)) onDelete()
        }}
      >
        Delete habit
      </button>

      {editing !== null && (
        <EffortSheet
          day={editing}
          current={habit.efforts[editing]}
          threshold={threshold}
          onSave={(e) => {
            onEffort(editing, e)
            setEditing(null)
          }}
          onClear={() => {
            onEffort(editing, null)
            setEditing(null)
          }}
          onClose={() => setEditing(null)}
        />
      )}

      {celebrate && (
        <div className="scrim celebrate" onClick={() => setCelebrate(false)}>
          <Confetti colors={palette} />
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h2>You did it!</h2>
            <PixelCanvas art={art} full className="stage small" label={art.name} />
            <p>
              Your picture was <b>{art.name}</b>.
            </p>
            <button className="btn primary" onClick={() => setCelebrate(false)}>
              Nice
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
