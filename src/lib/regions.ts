import type { Pixel } from './art'

/** Distance along a Hilbert curve of side 2^order. Nearby cells get nearby indices. */
export function hilbertIndex(x: number, y: number, order: number): number {
  let d = 0
  for (let s = 2 ** (order - 1); s > 0; s = Math.floor(s / 2)) {
    const rx = (x & s) > 0 ? 1 : 0
    const ry = (y & s) > 0 ? 1 : 0
    d += s * s * ((3 * rx) ^ ry)
    if (ry === 0) {
      if (rx === 1) {
        x = s - 1 - x
        y = s - 1 - y
      }
      ;[x, y] = [y, x]
    }
  }
  return d
}

/**
 * Splits pixels into `days` compact, near-equal regions (sizes differ by at most 1).
 * Returns, for each day, the indices into `pixels` that the day reveals.
 */
export function splitIntoRegions(pixels: Pixel[], width: number, height: number, days: number): number[][] {
  if (!Number.isInteger(days) || days < 1 || days > pixels.length) {
    throw new Error(`days must be an integer between 1 and ${pixels.length}`)
  }
  const order = Math.max(1, Math.ceil(Math.log2(Math.max(width, height))))
  const sorted = pixels
    .map((p, i) => ({ i, h: hilbertIndex(p.x, p.y, order) }))
    .sort((a, b) => a.h - b.h)
    .map((p) => p.i)
  const base = Math.floor(sorted.length / days)
  const extra = sorted.length % days
  const regions: number[][] = []
  let at = 0
  for (let d = 0; d < days; d++) {
    const size = base + (d < extra ? 1 : 0)
    regions.push(sorted.slice(at, at + size))
    at += size
  }
  return regions
}
