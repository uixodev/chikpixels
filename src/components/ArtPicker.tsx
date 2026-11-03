import { useMemo, useState } from 'react'
import { library, themeLabels, type Theme } from '../lib/art'
import { PixelCanvas } from './PixelCanvas'

interface Props {
  artId: string | null
  onPick: (id: string) => void
  /** Pictures that cannot be picked again (already used in this habit). */
  used?: string[]
}

export function ArtPicker({ artId, onPick, used = [] }: Props) {
  const [theme, setTheme] = useState<Theme | 'all'>('all')
  const themes = useMemo(() => Array.from(new Set(library.map((a) => a.theme))), [])
  const shown = theme === 'all' ? library : library.filter((a) => a.theme === theme)

  return (
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
        {shown.map((a) => {
          const taken = used.includes(a.id)
          return (
            <button key={a.id} className={`tile ${artId === a.id ? 'on' : ''}`} disabled={taken} onClick={() => onPick(a.id)} aria-pressed={artId === a.id}>
              <PixelCanvas art={a} full className="thumb" label={a.name} />
              <span>{a.name}</span>
              <small className="muted">{taken ? 'already used' : `${a.pixels.length} px`}</small>
            </button>
          )
        })}
      </div>
    </section>
  )
}
