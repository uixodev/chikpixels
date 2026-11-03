import type { CSSProperties } from 'react'
import type { Mosaic } from '../lib/art'
import { brightness, fogMix, isRevealed } from '../lib/habits'

interface Props {
  mosaic: Mosaic
  efforts: Record<number, number>
  threshold: number
  /** Faint preview of the finished colours in squares not yet logged. */
  ghost?: boolean
  /** Without a handler the board is display-only (used on the home cards). */
  onPick?: (day: number) => void
  compact?: boolean
  label: string
}

export function MosaicBoard({ mosaic, efforts, threshold, ghost, onPick, compact, label }: Props) {
  const style = {
    gridTemplateColumns: `repeat(${mosaic.cols}, 1fr)`,
    aspectRatio: `${mosaic.cols} / ${mosaic.rows}`,
  } as CSSProperties

  return (
    <div className={`mosaic ${compact ? 'compact' : ''}`} style={style} role="group" aria-label={label}>
      {mosaic.colors.map((color, d) => {
        const e = efforts[d]
        const revealed = isRevealed(e, threshold)
        const state = e === undefined ? 'empty' : revealed ? 'done' : 'low'
        const bg = revealed ? fogMix(color, brightness(e, threshold)) : state === 'empty' && ghost ? fogMix(color, 0.22) : undefined
        const text = state === 'done' ? '' : String(d + 1)
        const aria = `Day ${d + 1}${e !== undefined ? `, effort ${e}` : ', not logged'}`
        const cls = `cell ${state}`
        return onPick ? (
          <button key={d} className={cls} style={bg ? { background: bg } : undefined} onClick={() => onPick(d)} aria-label={aria}>
            {text}
          </button>
        ) : (
          <div key={d} className={cls} style={bg ? { background: bg } : undefined} />
        )
      })}
    </div>
  )
}
