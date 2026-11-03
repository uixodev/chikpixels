import { useState } from 'react'
import { effortFromCount, type Track } from '../lib/habits'

interface Props {
  title: string
  sub?: string
  track: Track
  currentEffort: number | undefined
  currentCount: number | undefined
  threshold: number
  /** Effort for effort habits, the count for count habits, ignored for check-ins. */
  onSave: (value: number) => void
  onClear: () => void
  onClose: () => void
}

const QUICK = [25, 50, 75, 100]
const clamp = (n: number, max: number) => Math.min(max, Math.max(0, Math.round(n) || 0))

export function LogSheet({ title, sub, track, currentEffort, currentCount, threshold, onSave, onClear, onClose }: Props) {
  const logged = currentEffort !== undefined
  const [effort, setEffort] = useState(currentEffort ?? 70)
  const [count, setCount] = useState(currentCount ?? 0)

  const target = track.type === 'count' ? track.target : 0
  const percent = track.type === 'count' ? effortFromCount(count, target) : effort
  const counts = track.type === 'check' || percent >= threshold

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={`Log ${title}`} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {sub && <p className="muted">{sub}</p>}

        {track.type === 'check' && <p>Did you do it?</p>}

        {track.type === 'effort' && (
          <>
            <p className="muted">How much effort did you put in?</p>
            <div className="effort-row">
              <input type="range" min={0} max={100} value={effort} onChange={(e) => setEffort(clamp(+e.target.value, 100))} aria-label="Effort" />
              <input className="num" type="number" min={0} max={100} value={effort} onChange={(e) => setEffort(clamp(+e.target.value, 100))} aria-label="Effort number" />
            </div>
            <div className="quick">
              {QUICK.map((q) => (
                <button key={q} className={`btn small ${effort === q ? 'on' : ''}`} onClick={() => setEffort(q)}>
                  {q}
                </button>
              ))}
            </div>
          </>
        )}

        {track.type === 'count' && (
          <>
            <p className="muted">
              {count} of {track.target} {track.unit}
            </p>
            <div className="stepper">
              <button className="btn" onClick={() => setCount((c) => clamp(c - 1, 9999))} aria-label="One less">
                −
              </button>
              <input className="num" type="number" min={0} value={count} onChange={(e) => setCount(clamp(+e.target.value, 9999))} aria-label="Count" />
              <button className="btn" onClick={() => setCount((c) => clamp(c + 1, 9999))} aria-label="One more">
                +
              </button>
            </div>
            <div className="quick">
              <button className="btn small" onClick={() => setCount((c) => clamp(c + 1, 9999))}>
                +1
              </button>
              <button className="btn small" onClick={() => setCount(track.target)}>
                Goal reached
              </button>
            </div>
          </>
        )}

        {track.type !== 'check' && (
          <p className={`note ${counts ? '' : 'warn'}`}>
            {track.type === 'count' ? `${percent}% of your goal. ` : ''}
            {counts ? 'This reveals a piece of your picture. More progress, more vivid.' : `Below ${threshold}% it will not reveal anything yet.`}
          </p>
        )}

        <div className="actions">
          {track.type === 'check' ? (
            <button className="btn primary" onClick={() => onSave(1)}>
              Done
            </button>
          ) : (
            <button className="btn primary" disabled={track.type === 'count' && count === 0} onClick={() => onSave(track.type === 'count' ? count : effort)}>
              Save
            </button>
          )}
          {logged && (
            <button className="btn" onClick={onClear}>
              {track.type === 'check' ? 'Not done' : 'Clear'}
            </button>
          )}
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
