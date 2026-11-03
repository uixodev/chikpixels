import { describe, expect, it } from 'vitest'
import { buildMosaic, detailOptions, library, MAX_DAYS, MIN_DAYS } from './art'

describe('library', () => {
  it('loads at least the public starter art with unique ids', () => {
    expect(library.length).toBeGreaterThanOrEqual(3)
    expect(new Set(library.map((a) => a.id)).size).toBe(library.length)
  })
})

describe('mosaic', () => {
  it('has one colour per day square and matches the option sizes', () => {
    for (const art of library) {
      const options = detailOptions(art)
      expect(options.length).toBeGreaterThan(0)
      for (const o of options) {
        expect(o.days).toBeGreaterThanOrEqual(MIN_DAYS)
        expect(o.days).toBeLessThanOrEqual(MAX_DAYS)
        const m = buildMosaic(art, o.k)
        expect(m.colors).toHaveLength(o.days)
        expect(m.cols * m.rows).toBe(o.days)
      }
    }
  })

  it('offers each length once, smallest first', () => {
    for (const art of library) {
      const days = detailOptions(art).map((o) => o.days)
      expect(days).toEqual([...new Set(days)].sort((a, b) => a - b))
    }
  })

  it('uses only palette colours or the backdrop', () => {
    for (const art of library) {
      const allowed = new Set([art.background, ...art.pixels.map((p) => p.color)])
      for (const o of detailOptions(art)) for (const c of buildMosaic(art, o.k).colors) expect(allowed.has(c)).toBe(true)
    }
  })

  it('at block size 1 reproduces the picture exactly', () => {
    const art = library.find((a) => a.pixels.length < 150 && a.width * a.height <= MAX_DAYS)
    if (!art) return // none small enough in this library
    const m = buildMosaic(art, 1)
    art.pixels.forEach((p) => expect(m.colors[p.y * art.width + p.x]).toBe(p.color))
  })
})
