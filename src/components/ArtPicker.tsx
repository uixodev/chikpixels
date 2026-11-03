import { useState } from 'react'
import { collections, library } from '../lib/art'
import { PixelCanvas } from './PixelCanvas'

interface Props {
  artId: string | null
  onPick: (id: string) => void
  /** Pictures that cannot be picked again (already used in this habit). */
  used?: string[]
}

export function ArtPicker({ artId, onPick, used = [] }: Props) {
  const [collection, setCollection] = useState<string>('all')
  const shown = collection === 'all' ? library : library.filter((a) => a.collection === collection)

  return (
    <section className="field">
      <div className="chips">
        <button className={`chip ${collection === 'all' ? 'on' : ''}`} onClick={() => setCollection('all')}>
          All · {library.length}
        </button>
        {collections.map((c) => (
          <button key={c.id} className={`chip ${collection === c.id ? 'on' : ''}`} onClick={() => setCollection(c.id)}>
            {c.name} · {c.count}
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
