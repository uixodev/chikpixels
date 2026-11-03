import { useMemo, useState } from 'react'
import { library, themeLabels, type Art, type Theme } from '../lib/art'
import { LENGTH_PRESETS, newId, type Habit, type Mode } from '../lib/habits'
import { PixelCanvas } from './PixelCanvas'

interface Props {
  habits: Habit[]
  onCreate: (habit: Habit) => void
  onCancel: () => void
}

function pickSurprise(days: number, habits: Habit[]): Art | undefined {
  const fits = library.filter((a) => a.pixels.length >= days)
  const unseen = fits.filter((a) => !habits.some((h) => h.artId === a.id))
  const pool = unseen.length > 0 ? unseen : fits
  return pool[Math.floor(Math.random() * pool.length)]
}

export function NewHabit({ habits, onCreate, onCancel }: Props) {
  const [name, setName] = useState('')
  const [mode, setMode] = useState<Mode>('chosen')
  const [artId, setArtId] = useState<string | null>(null)
  const [theme, setTheme] = useState<Theme | 'all'>('all')
  const [days, setDays] = useState(30)

  const art = library.find((a) => a.id === artId)
  const maxDays = mode === 'chosen' && art ? art.pixels.length : Math.max(...library.map((a) => a.pixels.length))
  const themes = useMemo(() => Array.from(new Set(library.map((a) => a.theme))), [])
  const shown = theme === 'all' ? library : library.filter((a) => a.theme === theme)

  const effectiveDays = Math.min(days, maxDays)
  const ready = name.trim().length > 0 && effectiveDays >= 1 && (mode === 'secret' || art !== undefined)

  function start() {
    const chosen = mode === 'chosen' ? art : pickSurprise(effectiveDays, habits)
    if (!chosen) return
    onCreate({
      id: newId(),
      name: name.trim(),
      artId: chosen.id,
      days: effectiveDays,
      mode,
      efforts: {},
      createdAt: new Date().toLocaleDateString('en-CA'),
    })
  }

  return (
    <main>
      <button className="btn ghost back" onClick={onCancel}>
        ← Back
      </button>
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

      {mode === 'chosen' && (
        <section className="field">
          <div className="chips">
            <button className={`chip ${theme === 'all' ? 'on' : ''}`} onClick={() => setTheme('all')}>
              All
            </button>
            {themes.map((t) => (
              <button key={t} className={`chip ${theme === t ? 'on' : ''}`} onClick={() => setTheme(t)}>
                {themeLabels[t]}
              </button>
            ))}
          </div>
          <div className="gallery">
            {shown.map((a) => (
              <button key={a.id} className={`tile ${artId === a.id ? 'on' : ''}`} onClick={() => setArtId(a.id)} aria-pressed={artId === a.id}>
                <PixelCanvas art={a} full className="thumb" label={a.name} />
                <span>{a.name}</span>
                <small className="muted">{a.pixels.length} px</small>
              </button>
            ))}
          </div>
        </section>
      )}

      <fieldset className="field">
        <legend>How many days?</legend>
        <div className="chips">
          {LENGTH_PRESETS.map((n) => (
            <button key={n} className={`chip ${days === n ? 'on' : ''}`} disabled={n > maxDays} onClick={() => setDays(n)}>
              {n}
            </button>
          ))}
          <input
            className="num"
            type="number"
            min={1}
            max={maxDays}
            value={days}
            onChange={(e) => setDays(Math.max(1, Math.min(maxDays, Math.round(+e.target.value) || 1)))}
            aria-label="Custom number of days"
          />
        </div>
        {mode === 'chosen' && art && effectiveDays < days && <p className="muted">This picture has {art.pixels.length} pixels, so {effectiveDays} days is the most.</p>}
      </fieldset>

      <button className="btn primary wide" disabled={!ready} onClick={start}>
        Start
      </button>
    </main>
  )
}
