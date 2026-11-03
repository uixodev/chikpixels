import { useState } from 'react'

interface Props {
  day: number
  current: number | undefined
  threshold: number
  onSave: (effort: number) => void
  onClear: () => void
  onClose: () => void
}

const QUICK = [25, 50, 75, 100]

export function EffortSheet({ day, current, threshold, onSave, onClear, onClose }: Props) {
  const [effort, setEffort] = useState(current ?? 70)
  const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n) || 0))
  const counts = effort >= threshold

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={`Log day ${day + 1}`} onClick={(e) => e.stopPropagation()}>
        <h2>Day {day + 1}</h2>
        <p className="muted">How much effort did you put in?</p>

        <div className="effort-row">
          <input
            type="range"
            min={0}
            max={100}
            value={effort}
            onChange={(e) => setEffort(clamp(+e.target.value))}
            aria-label="Effort"
          />
          <input
            className="num"
            type="number"
            min={0}
            max={100}
            value={effort}
            onChange={(e) => setEffort(clamp(+e.target.value))}
            aria-label="Effort number"
          />
        </div>

        <div className="quick">
          {QUICK.map((q) => (
            <button key={q} className={`btn small ${effort === q ? 'on' : ''}`} onClick={() => setEffort(q)}>
              {q}
            </button>
          ))}
        </div>

        <p className={`note ${counts ? '' : 'warn'}`}>
          {counts
            ? 'This reveals a piece of your picture. More effort, more vivid.'
            : `Below ${threshold} it will not reveal anything yet. You can raise it later.`}
        </p>

        <div className="actions">
          <button className="btn primary" onClick={() => onSave(effort)}>
            Save
          </button>
          {current !== undefined && (
            <button className="btn" onClick={onClear}>
              Clear
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
