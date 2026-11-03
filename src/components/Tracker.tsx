import { useEffect, useMemo, useRef, useState } from 'react'
import { findArt, type Art } from '../lib/art'
import { brightness, chapterRanges, chapterRevealed, isRevealed, revealedCount, todayISO, type ChapterRange, type Habit } from '../lib/habits'
import { splitIntoRegions } from '../lib/regions'
import { describeSchedule, slotInfo } from '../lib/schedule'
import { ArrowLeft } from './ArrowLeft'
import { Confetti } from './Confetti'
import { Holo } from './Holo'
import { LogSheet } from './LogSheet'
import { PixelCanvas } from './PixelCanvas'

interface Props {
  habit: Habit
  threshold: number
  onLog: (day: number, value: number | null) => void
  onDelete: () => void
  onBack: () => void
  onExtend: () => void
}

function trackSummary(habit: Habit): string {
  const t = habit.track
  const how = t.type === 'check' ? 'Check-in' : t.type === 'count' ? `${t.target} ${t.unit}` : 'Effort'
  return `${how} · ${describeSchedule(habit.schedule)}${habit.startDate ? '' : ' · any order'}`
}

interface ChapterProps {
  habit: Habit
  range: ChapterRange
  art: Art | undefined
  total: number
  threshold: number
  today: string
  complete: boolean
  collapse: boolean
  onPick: (slot: number) => void
}

function ChapterView({ habit, range, art, total, threshold, today, complete, collapse, onPick }: ChapterProps) {
  const [peek, setPeek] = useState(false)
  const regions = useMemo(() => (art ? splitIntoRegions(art.pixels, art.width, art.height, range.days) : []), [art, range.days])
  const pixelBrightness = useMemo(() => {
    const out: (number | undefined)[] = art ? new Array(art.pixels.length).fill(undefined) : []
    regions.forEach((region, d) => {
      const e = habit.efforts[range.offset + d]
      if (isRevealed(e, threshold)) region.forEach((i) => (out[i] = brightness(e, threshold)))
    })
    return out
  }, [art, regions, habit.efforts, range.offset, threshold])

  if (!art) {
    return <p className="callout small"><span>This chapter's picture is not in the library on this device.</span></p>
  }

  const mystery = range.mode === 'secret' && !complete
  const slots = Array.from({ length: range.days }, (_, i) => range.offset + i)

  function describeLog(d: number): string {
    const e = habit.efforts[d]
    if (e === undefined) return 'not logged'
    if (habit.track.type === 'check') return 'done'
    if (habit.track.type === 'count') return `${habit.counts?.[d] ?? 0} of ${habit.track.target} ${habit.track.unit}`
    return `effort ${e}`
  }

  const board = (
    <div className="board">
      {slots.map((d) => {
        const e = habit.efforts[d]
        const slot = slotInfo(habit, d, today)
        const state = e === undefined ? 'empty' : isRevealed(e, threshold) ? 'done' : 'low'
        return (
          <button
            key={d}
            className={`day ${state} ${slot.status === 'current' ? 'today' : ''}`}
            style={state === 'done' ? { opacity: 0.45 + 0.55 * (e / 100) } : undefined}
            disabled={slot.status === 'future'}
            onClick={() => onPick(d)}
            aria-label={`${slot.label}${slot.dates ? `, ${slot.dates}` : ''}, ${describeLog(d)}`}
            title={slot.dates ? `${slot.label} · ${slot.dates}` : slot.label}
          >
            {d + 1}
          </button>
        )
      })}
    </div>
  )

  return (
    <section className="chapter">
      <p className="muted">
        {total > 1 ? `Picture ${range.index + 1} of ${total} · ` : ''}
        {mystery ? 'A secret picture' : art.name}
      </p>
      {complete ? (
        <Holo className="stage">
          <PixelCanvas art={art} brightness={pixelBrightness} label={art.name} />
        </Holo>
      ) : (
        <PixelCanvas art={art} brightness={pixelBrightness} ghost={peek && range.mode === 'chosen'} className="stage" label={mystery ? 'Your picture so far' : art.name} />
      )}
      {range.mode === 'chosen' && !complete && (
        <button className="btn small" onClick={() => setPeek((p) => !p)} aria-pressed={peek}>
          {peek ? 'Hide outline' : 'Peek at outline'}
        </button>
      )}
      {collapse ? (
        <details>
          <summary>Show squares ({range.days})</summary>
          {board}
        </details>
      ) : (
        board
      )}
    </section>
  )
}

export function Tracker({ habit, threshold, onLog, onDelete, onBack, onExtend }: Props) {
  const [editing, setEditing] = useState<number | null>(null)
  const [celebrate, setCelebrate] = useState<number | null>(null)
  const today = todayISO()

  const ranges = chapterRanges(habit)
  const states = ranges.map((r) => ({ range: r, complete: chapterRevealed(habit, r, threshold) >= r.days }))
  const completeKey = states.map((s) => (s.complete ? 1 : 0)).join('')
  const done = revealedCount(habit, threshold)
  const allComplete = done >= habit.days

  const seen = useRef(completeKey)
  useEffect(() => {
    const before = seen.current
    for (let i = 0; i < completeKey.length; i++) if (completeKey[i] === '1' && before[i] !== '1') setCelebrate(i)
    seen.current = completeKey
  }, [completeKey])

  const celebrating = celebrate !== null ? ranges[celebrate] : undefined
  const celebratingArt = celebrating ? findArt(celebrating.artId) : undefined
  const palette = useMemo(() => (celebratingArt ? Array.from(new Set(celebratingArt.pixels.map((p) => p.color))).slice(0, 8) : []), [celebratingArt])
  const editingSlot = editing !== null ? slotInfo(habit, editing, today) : undefined

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
      <p className="muted">{trackSummary(habit)}</p>

      {allComplete && (
        <div className="callout small keep-going">
          <span>Habit complete! Want to keep going? Add another picture and carry on.</span>
          <button className="btn primary small" onClick={onExtend}>
            Extend habit
          </button>
        </div>
      )}

      {states.map(({ range, complete }) => (
        <ChapterView
          key={range.index}
          habit={habit}
          range={range}
          art={findArt(range.artId)}
          total={ranges.length}
          threshold={threshold}
          today={today}
          complete={complete}
          collapse={complete && range.index < ranges.length - 1}
          onPick={setEditing}
        />
      ))}

      <p className="muted">
        {habit.startDate ? 'Tap today, or fill in an earlier square you missed.' : 'Pick any square, in any order. Missed one? Fill it in later.'}
      </p>

      {!allComplete && (
        <button className="btn small" onClick={onExtend}>
          + Extend this habit
        </button>
      )}

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

      {celebrating && celebratingArt && (
        <div className="scrim celebrate" onClick={() => setCelebrate(null)}>
          <Confetti colors={palette} />
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h2>{allComplete ? 'You did it!' : 'Picture complete!'}</h2>
            <Holo className="stage small">
              <PixelCanvas art={celebratingArt} full label={celebratingArt.name} />
            </Holo>
            <p>
              Your picture was <b>{celebratingArt.name}</b>.
            </p>
            <div className="actions">
              <button className="btn primary" onClick={() => setCelebrate(null)}>
                Nice
              </button>
              {allComplete && (
                <button
                  className="btn"
                  onClick={() => {
                    setCelebrate(null)
                    onExtend()
                  }}
                >
                  Keep going
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
