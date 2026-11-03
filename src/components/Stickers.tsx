import { useState } from 'react'
import type { CSSProperties } from 'react'
import { library } from '../lib/art'
import { collectedPictures, groupSets, stickerLabelParts, stickerLabel, type Collected } from '../lib/gallery'
import type { Habit } from '../lib/habits'
import { tiltFor } from '../lib/stickers'
import { Sticker } from './Sticker'

interface Props {
  habits: Habit[]
  threshold: number
  onOpenHabit: (habitId: string) => void
  onExtend: (habitId: string) => void
}

function Arrow() {
  return (
    <svg className="set-arrow" viewBox="0 0 28 12" aria-hidden="true">
      <path d="M2 6 H18" stroke="currentColor" strokeWidth="3" strokeDasharray="1 5" strokeLinecap="round" fill="none" />
      <path d="M17 1 L27 6 L17 11 Z" fill="currentColor" />
    </svg>
  )
}

/** Finished pictures as a collection: one set per habit, a habit's parts side by side. Tap a sticker for options. */
export function Stickers({ habits, threshold, onOpenHabit, onExtend }: Props) {
  const collected = collectedPictures(habits, threshold)
  const sets = groupSets(collected)
  const [selected, setSelected] = useState<string | null>(null)
  const toggle = (c: Collected) => setSelected((cur) => (cur === c.key ? null : c.key))

  return (
    <section aria-label="Completed pictures">
      <div className="row-between section-head">
        <h2>Collection</h2>
        <span className="muted">
          {new Set(collected.map((c) => c.art.id)).size} of {library.length} pictures
        </span>
      </div>
      {sets.length === 0 ? (
        <p className="muted empty">Finish a picture and it joins your collection as a sticker.</p>
      ) : (
        <div className="sets">
          {sets.map((set) => (
            <section key={set.habitId} className={`set ${set.items.length > 1 ? 'multi' : ''}`} aria-label={set.habitName}>
              <div className="set-head">
                <strong>{set.habitName}</strong>
                <span className="muted">
                  {set.items.length === 1 ? '1 picture' : `${set.items.length} pictures`} · {set.total}
                </span>
              </div>
              <div className="set-row">
                {set.items.map((c, i) => {
                  const isSel = selected === c.key
                  const label = stickerLabelParts(c)
                  return (
                    <div key={c.key} className="set-cell">
                      {i > 0 && <Arrow />}
                      <div className="set-item">
                        <div
                          className={`sk ${isSel ? 'selected' : ''}`}
                          style={{ '--tilt': `${tiltFor(c.key)}deg` } as CSSProperties}
                          role="button"
                          tabIndex={0}
                          aria-label={`${stickerLabel(c)}. Press Enter for options.`}
                          aria-expanded={isSel}
                          onClick={() => toggle(c)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              toggle(c)
                            }
                          }}
                        >
                          <Sticker art={c.art} compact label={set.items.length > 1 ? `Part ${c.part}` : c.art.name} sublabel={set.items.length > 1 ? `${c.length} ${c.unit}` : label.detail} />
                        </div>
                        {isSel && (
                          <div className="sk-actions">
                            <button className="btn small" onClick={() => { setSelected(null); onExtend(c.habitId) }}>
                              Extend
                            </button>
                            <button className="btn small" onClick={() => { setSelected(null); onOpenHabit(c.habitId) }}>
                              Open habit
                            </button>
                            <button className="btn small" onClick={() => setSelected(null)}>
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  )
}
