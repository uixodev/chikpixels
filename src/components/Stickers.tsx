import { useState } from 'react'
import type { CSSProperties } from 'react'
import { library } from '../lib/art'
import { collectedPictures, groupSets } from '../lib/gallery'
import type { Habit } from '../lib/habits'
import { tiltFor } from '../lib/stickers'
import { Sticker } from './Sticker'

interface Props {
  habits: Habit[]
  threshold: number
  onOpenHabit: (habitId: string) => void
  onExtend: (habitId: string) => void
}

/**
 * Finished pictures as a collection. Each habit is a stack: its first picture in front and the
 * others tucked behind. Tap a stack to fan it out a little and get its options.
 */
export function Stickers({ habits, threshold, onOpenHabit, onExtend }: Props) {
  const collected = collectedPictures(habits, threshold)
  const sets = groupSets(collected)
  const [open, setOpen] = useState<string | null>(null)

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
          {sets.map((set) => {
            const n = set.items.length
            const multi = n > 1
            const isOpen = open === set.habitId
            const toggle = () => setOpen((cur) => (cur === set.habitId ? null : set.habitId))
            return (
              <section key={set.habitId} className={`set ${multi ? 'multi' : ''} ${isOpen ? 'open' : ''}`} aria-label={set.habitName}>
                <div
                  className="stack"
                  style={{ '--n': n, '--rows': Math.ceil(n / 2) } as CSSProperties}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  aria-label={`${set.habitName}, ${multi ? `${n} pictures` : '1 picture'}, ${set.total}. Press Enter for options.`}
                  onClick={toggle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggle()
                    }
                  }}
                >
                  {set.items.map((c, i) => (
                    <div
                      key={c.key}
                      className="stack-item"
                      style={{ '--i': i, '--col': i % 2, '--row': Math.floor(i / 2), '--tilt': `${tiltFor(c.key)}deg` } as CSSProperties}
                    >
                      <Sticker art={c.art} compact label={`Part ${c.part}`} sublabel={`${c.length} ${c.unit}`} />
                    </div>
                  ))}
                </div>
                <div className="set-cap">
                  <b>{set.habitName}</b>
                  <small>{multi ? `${n} pictures · ${set.total}` : set.total}</small>
                </div>
                {isOpen && (
                  <div className="sk-actions">
                    <button className="btn small" onClick={() => { setOpen(null); onExtend(set.habitId) }}>
                      Extend
                    </button>
                    <button className="btn small" onClick={() => { setOpen(null); onOpenHabit(set.habitId) }}>
                      Open habit
                    </button>
                    <button className="btn small" onClick={() => setOpen(null)}>
                      Close
                    </button>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </section>
  )
}
