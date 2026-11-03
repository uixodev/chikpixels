import { useMemo } from 'react'
import type { CSSProperties } from 'react'

export function Confetti({ colors }: { colors: string[] }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        dur: 2.2 + Math.random() * 1.8,
        size: 8 + Math.floor(Math.random() * 3) * 4,
        color: colors[i % colors.length],
      })),
    [colors],
  )
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          style={
            {
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              background: b.color,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.dur}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
