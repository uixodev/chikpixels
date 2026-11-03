/** Where a sticker sits in the sticker area: x is a fraction of the width, y is pixels from the top. */
export interface Pos {
  x: number
  y: number
  /** Stacking order; the sticker moved last is on top. */
  z?: number
}

/** Vertical space one row of stickers takes. */
export const ROW = 190

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

function hash(key: string): number {
  let h = 0
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

/** A steady angle per sticker, so the pile looks hand-placed. */
export function tiltFor(key: string): number {
  return (hash(key) % 15) - 7
}

/** Two stickers per row with a little scatter, until the user moves them. */
export function defaultPos(index: number, key: string): Pos {
  const h = hash(key)
  const col = index % 2
  return {
    x: (col === 0 ? 0.27 : 0.73) + ((h % 9) - 4) * 0.01,
    y: Math.floor(index / 2) * ROW + 16 + (col === 1 ? 22 : 0) + ((h >> 4) % 15) - 7,
  }
}

export function areaHeight(count: number, positions: Pos[]): number {
  const base = Math.max(340, Math.ceil(count / 2) * ROW + 60)
  const maxY = positions.reduce((m, p) => Math.max(m, p.y), 0)
  return Math.max(base, maxY + ROW + 20)
}

export function clampPos(p: Pos, height: number): Pos {
  return { ...p, x: clamp(p.x, 0.1, 0.9), y: clamp(p.y, 0, Math.max(0, height - ROW)) }
}
