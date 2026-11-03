import { useMemo, useState } from 'react'
import { buildMosaic, detailOptions, library, themeLabels, type Art, type Detail, type Theme } from '../lib/art'
import { newId, type Habit, type Mode } from '../lib/habits'
import { MosaicBoard } from './MosaicBoard'
import { PixelCanvas } from './PixelCanvas'

interface Props {
  habits: Habit[]
  onCreate: (habit: Habit) => void
  onCancel: () => void
}

const TARGET = 30
const closest = <T,>(items: T[], value: (t: T) => number): T | undefined =>
  [...items].sort((a, b) => Math.abs(value(a) - TARGET) - Math.abs(value(b) - TARGET))[0]

/** Every habit length the library can make, with the pictures that offer it. */
function secretChoices(): Map<number, { art: Art; detail: Detail }[]> {
  const map = new Map<number, { art: Art; detail: Detail }[]>()
  for (const art of library) {
    for (const detail of detailOptions(art)) map.set(detail.days, [...(map.get(detail.days) ?? []), { art, detail }])
  }
  return map
}

export function NewHabit({ habits, onCreate, onCancel }: Props) {
  const [name, setName] = useState('')
  const [mode, setMode] = useState<Mode>('chosen')
  const [artId, setArtId] = useState<string | null>(null)
  const [theme, setTheme] = useState<Theme | 'all'>('all')
  const [k, setK] = useState<number | null>(null)

  const choices = useMemo(secretChoices, [])
  const secretLengths = useMemo(() => [...choices.keys()].sort((a, b) => a - b), [choices])
  const [secretDays, setSecretDays] = useState<number>(() => closest(secretLengths, (n) => n) ?? 36)

  const art = library.find((a) => a.id === artId)
  const options = useMemo(() => (art ? detailOptions(art) : []), [art])
  const detail = options.find((o) => o.k === k)
  const themes = useMemo(() => Array.from(new Set(library.map((a) => a.theme))), [])
  const shown = theme === 'all' ? library : library.filter((a) => a.theme === theme)

  const previewMosaic = useMemo(() => (art && detail ? buildMosaic(art, detail.k) : undefined), [art, detail])
  const previewEfforts = useMemo(() => {
    const e: Record<number, number> = {}
    if (previewMosaic) previewMosaic.colors.forEach((_, i) => (e[i] = 100))
    return e
  }, [previewMosaic])

  const ready = name.trim().length > 0 && (mode === 'secret' || detail !== undefined)

  function pickArt(a: Art) {
    setArtId(a.id)
    setK(closest(detailOptions(a), (o) => o.days)?.k ?? null)
  }

  function start() {
    let chosen: { art: Art; detail: Detail } | undefined
    if (mode === 'chosen' && art && detail) {
      chosen = { art, detail }
    } else if (mode === 'secret') {
      const pool = choices.get(secretDays) ?? []
      const unseen = pool.filter((c) => !habits.some((h) => h.artId === c.art.id))
      const from = unseen.length > 0 ? unseen : pool
      chosen = from[Math.floor(Math.random() * from.length)]
    }
    if (!chosen) return
    onCreate({
      id: newId(),
      name: name.trim(),
      artId: chosen.art.id,
      days: chosen.detail.days,
      cell: chosen.detail.k,
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
            <span>A secret picture is chosen for you. You will not see it, or even its name, until the last square is filled.</span>
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
              <button key={a.id} className={`tile ${artId === a.id ? 'on' : ''}`} onClick={() => pickArt(a)} aria-pressed={artId === a.id}>
                <PixelCanvas art={a} full className="thumb" label={a.name} />
                <span>{a.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <fieldset className="field">
        <legend>How many days?</legend>
        {mode === 'chosen' && !art && <p className="muted">Pick a picture first. Its length is how many squares it is made of.</p>}
        {mode === 'chosen' && art && (
          <>
            <div className="chips">
              {options.map((o) => (
                <button key={o.k} className={`chip ${k === o.k ? 'on' : ''}`} onClick={() => setK(o.k)}>
                  {o.days} days <small>{o.cols}×{o.rows}</small>
                </button>
              ))}
            </div>
            <p className="muted">Each day is one square of the picture. More days, more detail.</p>
            {previewMosaic && (
              <div className="preview">
                <MosaicBoard mosaic={previewMosaic} efforts={previewEfforts} threshold={20} compact label={`Preview of ${art.name}`} />
              </div>
            )}
          </>
        )}
        {mode === 'secret' && (
          <>
            <div className="chips">
              {secretLengths.map((n) => (
                <button key={n} className={`chip ${secretDays === n ? 'on' : ''}`} onClick={() => setSecretDays(n)}>
                  {n} days
                </button>
              ))}
            </div>
            <p className="muted">Longer habits make a more detailed secret picture.</p>
          </>
        )}
      </fieldset>

      <button className="btn primary wide" disabled={!ready} onClick={start}>
        Start
      </button>
    </main>
  )
}
