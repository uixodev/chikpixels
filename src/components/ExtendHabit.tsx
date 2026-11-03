import { useState } from 'react'
import { library, type Art } from '../lib/art'
import { chaptersOf, extendHabit, type Habit, type Mode } from '../lib/habits'
import { describeSchedule, LENGTH_PRESETS, slotsPerUnit, unitName } from '../lib/schedule'
import { ArtPicker } from './ArtPicker'

interface Props {
  habit: Habit
  habits: Habit[]
  onExtend: (habit: Habit) => void
}

const toInt = (v: string, min: number, max: number) => Math.min(max, Math.max(min, Math.round(+v) || min))

export function ExtendHabit({ habit, habits, onExtend }: Props) {
  const [mode, setMode] = useState<Mode>('chosen')
  const [artId, setArtId] = useState<string | null>(null)
  const [units, setUnits] = useState(LENGTH_PRESETS[habit.schedule.kind][1])

  const used = chaptersOf(habit).map((c) => c.artId)
  const available = library.filter((a) => !used.includes(a.id))
  const mult = slotsPerUnit(habit.schedule)
  const art = library.find((a) => a.id === artId)
  const maxSlots = mode === 'chosen' && art ? art.pixels.length : Math.max(0, ...available.map((a) => a.pixels.length))
  const maxUnits = Math.max(1, Math.floor(maxSlots / mult))
  const effectiveUnits = Math.min(units, maxUnits)
  const slots = effectiveUnits * mult
  const ready = available.length > 0 && slots >= 1 && (mode === 'secret' || art !== undefined)

  function start() {
    let chosen: Art | undefined = mode === 'chosen' ? art : undefined
    if (mode === 'secret') {
      const fits = available.filter((a) => a.pixels.length >= slots)
      const unseen = fits.filter((a) => !habits.some((h) => chaptersOf(h).some((c) => c.artId === a.id)))
      const pool = unseen.length > 0 ? unseen : fits
      chosen = pool[Math.floor(Math.random() * pool.length)]
    }
    if (!chosen) return
    onExtend(extendHabit(habit, { artId: chosen.id, days: slots, mode }))
  }

  return (
    <main>
      <h1>Extend “{habit.name}”</h1>
      <p className="callout small">
        <span>
          Your next picture starts after square {habit.days}. Everything you have revealed so far stays as it is. The pace stays the same ({describeSchedule(habit.schedule)}).
        </span>
      </p>

      {available.length === 0 ? (
        <p className="muted">Every picture in the library is already part of this habit. Add more art to extend it.</p>
      ) : (
        <>
          <fieldset className="field">
            <legend>Next picture</legend>
            <div className="seg">
              <button className={`btn ${mode === 'chosen' ? 'on' : ''}`} onClick={() => setMode('chosen')}>
                I'll choose
              </button>
              <button className={`btn ${mode === 'secret' ? 'on' : ''}`} onClick={() => setMode('secret')}>
                Surprise me
              </button>
            </div>
          </fieldset>

          {mode === 'chosen' && <ArtPicker artId={artId} onPick={setArtId} used={used} />}

          <fieldset className="field">
            <legend>For how many {unitName(habit.schedule)} more?</legend>
            <div className="chips">
              {LENGTH_PRESETS[habit.schedule.kind].map((n) => (
                <button key={n} className={`chip ${effectiveUnits === n ? 'on' : ''}`} disabled={n > maxUnits} onClick={() => setUnits(n)}>
                  {n}
                </button>
              ))}
              <input className="num" type="number" min={1} max={maxUnits} value={effectiveUnits} onChange={(e) => setUnits(toInt(e.target.value, 1, maxUnits))} aria-label={`Number of ${unitName(habit.schedule)}`} />
            </div>
            <p className="muted">
              {slots} more {slots === 1 ? 'piece' : 'pieces'}, so {habit.days + slots} in total.
              {mode === 'chosen' && art && effectiveUnits < units ? ` ${art.name} has ${art.pixels.length} pixels, so that is the most.` : ''}
            </p>
          </fieldset>

          <button className="btn primary wide" disabled={!ready} onClick={start}>
            Extend
          </button>
        </>
      )}
    </main>
  )
}
