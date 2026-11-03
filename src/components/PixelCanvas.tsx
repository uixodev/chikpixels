import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { Art } from '../lib/art'
import { fogMix } from '../lib/habits'

const SCALE = 16

interface Props {
  art: Art
  /** Per pixel index: brightness 0-1 when revealed, undefined while hidden. */
  brightness?: (number | undefined)[]
  /** Show every pixel (full colour). Used for the library and for completed pictures. */
  full?: boolean
  /** Faint outline of the finished picture, for the "peek" view. */
  ghost?: boolean
  className?: string
  label?: string
}

export function PixelCanvas({ art, brightness, full, ghost, className, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    art.pixels.forEach((p, i) => {
      const b = full ? 1 : brightness?.[i]
      if (b === undefined) {
        if (ghost) {
          ctx.fillStyle = 'rgba(0,0,0,0.12)'
          ctx.fillRect(p.x * SCALE, p.y * SCALE, SCALE, SCALE)
        }
        return
      }
      ctx.fillStyle = fogMix(p.color, b)
      ctx.fillRect(p.x * SCALE, p.y * SCALE, SCALE, SCALE)
    })
  }, [art, brightness, full, ghost])

  const style = {
    '--cols': art.width,
    '--rows': art.height,
    aspectRatio: `${art.width} / ${art.height}`,
  } as CSSProperties

  return (
    <div className={`paper ${className ?? ''}`} style={style}>
      <canvas
        ref={ref}
        width={art.width * SCALE}
        height={art.height * SCALE}
        role="img"
        aria-label={label ?? 'Pixel picture'}
      />
    </div>
  )
}
