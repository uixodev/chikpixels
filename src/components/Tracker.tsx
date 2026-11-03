import { useEffect, useMemo, useRef, useState } from 'react'
import type { Art } from '../lib/art'
import { brightness, isRevealed, revealedCount, todayISO, type Habit } from '../lib/habits'
import { describeSchedule, slotInfo } from '../lib/schedule'
import { splitIntoRegions } from '../lib/regions'
import { ArrowLeft } from './ArrowLeft'
import { Confetti } from './Confetti'
import { LogSheet } from './LogSheet'
import { PixelCanvas } from './PixelCanvas'

interface Props {
  habit: Habit
  art: Art
  threshold: number
  onLog: (day: number, value: number | null) => void
  onDelete: () => void
  onBack: () => void
}

function trackSummary(habit: Habit): string {
  const t = habit.track
  const how = t.type === 'check' ? 'Check-in' : t.type === 'count' ? `${t.target} ${t.unit}` : 'Effort'
  return `${how} · ${describeSchedule(habit.schedule)}${habit.startDate ? '' : ' · any order'}`
}

export function Tracker({ habit, art, threshold, onLog, onDelete, onBack }: Props) {
  const [editing, setEditing] = useState<number | null>(null)
  const [peek, setPeek] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const today = todayISO()

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
  const editingSlot = editing !== null ? slotInfo(habit, editing, today) : undefined

  function describeLog(d: number): string {
    const e = habit.efforts[d]
    if (e === undefined) return 'not logged'
    if (habit.track.type === 'check') return 'done'
    if (habit.track.type === 'count') return `${habit.counts?.[d] ?? 0} of ${habit.track.target} ${habit.track.unit}`
    return `effort ${e}`
  }

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
      <p className="muted">{trackSummary(habit)}</p>

      <PixelCanvas art={art} brightness={pixelBrightness} ghost={peek && habit.mode === 'chosen' && !complete} className="stage" label={mystery ? 'Your picture so far' : art.name} />

      {habit.mode === 'chosen' && !complete && (
        <button className="btn small" onClick={() => setPeek((p) => !p)} aria-pressed={peek}>
          {peek ? 'Hide outline' : 'Peek at outline'}
        </button>
      )}

      <h2>{habit.startDate ? 'Your calendar' : 'Tap a square to log it'}</h2>
      <p className="muted">
        {habit.startDate ? 'Tap today, or fill in an earlier one you missed.' : 'Pick any slot, in any order. Missed one? Fill it in later.'}
      </p>
      <div className="board">
        {Array.from({ length: habit.days }, (_, d) => {
          const e = habit.efforts[d]
          const slot = slotInfo(habit, d, today)
          const state = e === undefined ? 'empty' : isRevealed(e, threshold) ? 'done' : 'low'
          const future = slot.status === 'future'
          return (
            <button
              key={d}
              className={`day ${state} ${slot.status === 'current' ? 'today' : ''}`}
              style={state === 'done' ? { opacity: 0.45 + 0.55 * (e / 100) } : undefined}
              disabled={future}
              onClick={() => setEditing(d)}
              aria-label={`${slot.label}${slot.dates ? `, ${slot.dates}` : ''}, ${describeLog(d)}`}
              title={slot.dates ? `${slot.label} · ${slot.dates}` : slot.label}
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

      {editing !== null && editingSlot && (
        <LogSheet
          title={editingSlot.label}
          sub={editingSlot.dates}
          track={habit.track}
          currentEffort={habit.efforts[editing]}
          currentCount={habit.counts?.[editing]}
          threshold={threshold}
          onSave={(v) => {
            onLog(editing, v)
            setEditing(null)
          }}
          onClear={() => {
            onLog(editing, null)
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
