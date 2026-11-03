import { useState } from 'react'
import { library, type Art } from '../lib/art'
import { newId, todayISO, type Habit, type Mode, type Schedule, type Track } from '../lib/habits'
import { LENGTH_PRESETS, slotsPerUnit, unitName } from '../lib/schedule'
import { ArtPicker } from './ArtPicker'

interface Props {
  habits: Habit[]
  onCreate: (habit: Habit) => void
}

type TrackKind = Track['type']
type ScheduleKind = Schedule['kind']

const toInt = (v: string, min: number, max: number) => Math.min(max, Math.max(min, Math.round(+v) || min))

export function NewHabit({ habits, onCreate }: Props) {
  const [name, setName] = useState('')
  const [mode, setMode] = useState<Mode>('chosen')
  const [artId, setArtId] = useState<string | null>(null)

  const [trackKind, setTrackKind] = useState<TrackKind>('effort')
  const [target, setTarget] = useState(8)
  const [unit, setUnit] = useState('glasses')

  const [schedKind, setSchedKind] = useState<ScheduleKind>('daily')
  const [times, setTimes] = useState(3)
  const [every, setEvery] = useState(2)

  const [dated, setDated] = useState(false)
  const [startDate, setStartDate] = useState(todayISO())
  const [units, setUnits] = useState(30)

  const schedule: Schedule = schedKind === 'weekly' ? { kind: 'weekly', times } : schedKind === 'every' ? { kind: 'every', n: every } : { kind: 'daily' }
  const mult = slotsPerUnit(schedule)

  const art = library.find((a) => a.id === artId)
  const maxSlots = mode === 'chosen' && art ? art.pixels.length : Math.max(...library.map((a) => a.pixels.length))
  const maxUnits = Math.max(1, Math.floor(maxSlots / mult))
  const effectiveUnits = Math.min(units, maxUnits)
  const slots = effectiveUnits * mult

  const ready = name.trim().length > 0 && slots >= 1 && (mode === 'secret' || art !== undefined) && (trackKind !== 'count' || (target >= 1 && unit.trim().length > 0))

  function start() {
    let chosen: Art | undefined = mode === 'chosen' ? art : undefined
    if (mode === 'secret') {
      const fits = library.filter((a) => a.pixels.length >= slots)
      const unseen = fits.filter((a) => !habits.some((h) => h.artId === a.id))
      const pool = unseen.length > 0 ? unseen : fits
      chosen = pool[Math.floor(Math.random() * pool.length)]
    }
    if (!chosen) return
    const track: Track = trackKind === 'count' ? { type: 'count', target, unit: unit.trim() } : { type: trackKind }
    onCreate({
      id: newId(),
      name: name.trim(),
      artId: chosen.id,
      days: slots,
      mode,
      track,
      schedule,
      startDate: dated ? startDate : undefined,
      efforts: {},
      createdAt: todayISO(),
    })
  }

  return (
    <main>
      <h1>New habit</h1>

      <label className="field">
        <span>What are you building?</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Read 20 pages, drink water, run…" maxLength={40} />
      </label>

      <fieldset className="field">
        <legend>Your picture</legend>
        <div className="seg">
          <button className={`btn ${mode === 'chosen' ? 'on' : ''}`} onClick={() => setMode('chosen')}>
            I'll choose
          </button>
          <button className={`btn ${mode === 'secret' ? 'on' : ''}`} onClick={() => setMode('secret')}>
            Surprise me
          </button>
        </div>
        {mode === 'secret' && (
          <p className="callout small">
            <span>A secret picture is chosen for you. You will not see it, or even its name, until the last piece appears.</span>
          </p>
        )}
      </fieldset>

      {mode === 'chosen' && <ArtPicker artId={artId} onPick={setArtId} />}

      <fieldset className="field">
        <legend>How do you track it?</legend>
        <select value={trackKind} onChange={(e) => setTrackKind(e.target.value as TrackKind)} aria-label="How do you track it?">
          <option value="effort">Effort: rate each day 0 to 100</option>
          <option value="check">Check-in: done or not</option>
          <option value="count">Count: reach a target (like 8 glasses)</option>
        </select>
        {trackKind === 'count' && (
          <div className="row">
            <input className="num" type="number" min={1} max={999} value={target} onChange={(e) => setTarget(toInt(e.target.value, 1, 999))} aria-label="Target" />
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="glasses, pages, minutes…" maxLength={16} aria-label="Unit" />
          </div>
        )}
        <p className="muted">
          {trackKind === 'effort' && 'More effort, more vivid colour.'}
          {trackKind === 'check' && 'One tap reveals a piece at full colour.'}
          {trackKind === 'count' && `Each piece gets more vivid as you get closer to ${target} ${unit || 'the target'}.`}
        </p>
      </fieldset>

      <fieldset className="field">
        <legend>How often?</legend>
        <select value={schedKind} onChange={(e) => { const k = e.target.value as ScheduleKind; setSchedKind(k); setUnits(LENGTH_PRESETS[k].includes(30) ? 30 : LENGTH_PRESETS[k][1]) }} aria-label="How often?">
          <option value="daily">Every day</option>
          <option value="weekly">A few times a week</option>
          <option value="every">Every few days</option>
        </select>
        {schedKind === 'weekly' && (
          <div className="row">
            <input className="num" type="number" min={1} max={7} value={times} onChange={(e) => setTimes(toInt(e.target.value, 1, 7))} aria-label="Times per week" />
            <span>times a week</span>
          </div>
        )}
        {schedKind === 'every' && (
          <div className="row">
            <span>every</span>
            <input className="num" type="number" min={2} max={30} value={every} onChange={(e) => setEvery(toInt(e.target.value, 2, 30))} aria-label="Days between check-ins" />
            <span>days</span>
          </div>
        )}
      </fieldset>

      <fieldset className="field">
        <legend>Follow the calendar?</legend>
        <select value={dated ? 'dated' : 'free'} onChange={(e) => setDated(e.target.value === 'dated')} aria-label="Follow the calendar?">
          <option value="free">No, log squares in any order</option>
          <option value="dated">Yes, squares follow real dates</option>
        </select>
        {dated && (
          <label className="row">
            <span>Starts</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value || todayISO())} aria-label="Start date" />
          </label>
        )}
      </fieldset>

      <fieldset className="field">
        <legend>For how many {unitName(schedule)}?</legend>
        <div className="chips">
          {LENGTH_PRESETS[schedKind].map((n) => (
            <button key={n} className={`chip ${effectiveUnits === n ? 'on' : ''}`} disabled={n > maxUnits} onClick={() => setUnits(n)}>
              {n}
            </button>
          ))}
          <input className="num" type="number" min={1} max={maxUnits} value={effectiveUnits} onChange={(e) => setUnits(toInt(e.target.value, 1, maxUnits))} aria-label={`Number of ${unitName(schedule)}`} />
        </div>
        <p className="muted">
          {slots} {slots === 1 ? 'piece' : 'pieces'} of the picture
          {mult > 1 ? ` (${effectiveUnits} weeks × ${mult})` : ''}.
          {mode === 'chosen' && art && effectiveUnits < units ? ` ${art.name} has ${art.pixels.length} pixels, so that is the most.` : ''}
        </p>
      </fieldset>

      <button className="btn primary wide" disabled={!ready} onClick={start}>
        Start
      </button>
    </main>
  )
}
