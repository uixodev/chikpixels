import { useState } from 'react'
import type { CSSProperties } from 'react'
import { collectionName, collectionRank, library } from '../lib/art'
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
  // One section per collection (The Simpsons, Originals, ...), each with its own progress.
  const byCollection = new Map<string, typeof collected>()
  for (const c of collected) byCollection.set(c.art.collection, [...(byCollection.get(c.art.collection) ?? []), c])
  const sections = [...byCollection.entries()]
    .sort(([a], [b]) => collectionRank(a) - collectionRank(b) || a.localeCompare(b))
    .map(([id, items]) => ({
      id,
      name: collectionName(id),
      have: new Set(items.map((c) => c.art.id)).size,
      of: library.filter((a) => a.collection === id).length,
      sets: groupSets(items),
    }))
  const [open, setOpen] = useState<string | null>(null)

  return (
    <section aria-label="Completed pictures">
      <div className="row-between section-head">
        <h2>Collection</h2>
        <span className="muted">
          {new Set(collected.map((c) => c.art.id)).size} of {library.length} pictures
        </span>
      </div>
      {sections.length === 0 ? (
        <p className="muted empty">Finish a picture and it joins your collection as a sticker.</p>
      ) : (
        <div className="collections">
          {sections.map((section) => (
            <section key={section.id} className="collection" aria-label={section.name}>
              <div className="coll-head">
                <h3>{section.name}</h3>
                <span className="muted">
                  {section.have} of {section.of}
                </span>
              </div>
              <div className="sets">
                {section.sets.map((set) => {
                  const n = set.items.length
                  const multi = n > 1
                  const key = `${section.id}:${set.habitId}`
                  const isOpen = open === key
                  const toggle = () => setOpen((cur) => (cur === key ? null : key))
                  return (
                    <section key={key} className={`set ${multi ? 'multi' : ''} ${isOpen ? 'open' : ''}`} aria-label={set.habitName}>
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
            </section>
          ))}
        </div>
      )}
    </section>
  )
}
