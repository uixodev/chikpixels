import { useEffect, useMemo, useRef, useState } from 'react'
import { buildMosaic, type Art } from '../lib/art'
import { revealedCount, type Habit } from '../lib/habits'
import { Confetti } from './Confetti'
import { EffortSheet } from './EffortSheet'
import { MosaicBoard } from './MosaicBoard'
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

  const mosaic = useMemo(() => buildMosaic(art, habit.cell), [art, habit.cell])
  const done = revealedCount(habit, threshold)
  const complete = done >= habit.days
  const wasComplete = useRef(complete)
  useEffect(() => {
    if (complete && !wasComplete.current) setCelebrate(true)
    wasComplete.current = complete
  }, [complete])

  const mystery = habit.mode === 'secret' && !complete
  const palette = useMemo(() => Array.from(new Set(mosaic.colors)).slice(0, 8), [mosaic])

  return (
    <main>
      <button className="btn ghost back" onClick={onBack}>
        ← My habits
      </button>
      <div className="row-between">
        <h1>{habit.name}</h1>
        <span className="count">
          {done}/{habit.days}
        </span>
      </div>
      <p className="muted">{mystery ? 'A secret picture' : art.name}</p>

      <div className="stage">
        <MosaicBoard
          mosaic={mosaic}
          efforts={habit.efforts}
          threshold={threshold}
          ghost={peek && habit.mode === 'chosen' && !complete}
          onPick={setEditing}
          label={mystery ? 'Your days. Each square is a piece of a secret picture.' : `Your days. Each square is a piece of ${art.name}.`}
        />
      </div>
      <p className="muted">Every square is one day. Tap any square, in any order, and log your effort. Missed one? Fill it in later.</p>

      {habit.mode === 'chosen' && !complete && (
        <button className="btn small" onClick={() => setPeek((p) => !p)} aria-pressed={peek}>
          {peek ? 'Hide preview' : 'Peek at the picture'}
        </button>
      )}

      {complete && (
        <>
          <h2>The full picture</h2>
          <PixelCanvas art={art} full className="stage" label={art.name} />
        </>
      )}

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
