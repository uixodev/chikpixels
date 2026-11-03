import { describe, expect, it } from 'vitest'
import { library } from './art'
import { hilbertIndex, splitIntoRegions } from './regions'

describe('hilbertIndex', () => {
  it('visits every cell of an 8x8 grid exactly once', () => {
    const seen = new Set<number>()
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) seen.add(hilbertIndex(x, y, 3))
    expect(seen.size).toBe(64)
    expect(Math.max(...seen)).toBe(63)
  })
})

describe('splitIntoRegions', () => {
  it('covers every pixel exactly once with near-equal regions', () => {
    for (const art of library) {
      for (const days of [1, 7, 21, 30, Math.min(66, art.pixels.length)]) {
        const regions = splitIntoRegions(art.pixels, art.width, art.height, days)
        expect(regions).toHaveLength(days)
        const all = regions.flat().sort((a, b) => a - b)
        expect(all).toEqual(art.pixels.map((_, i) => i))
        const sizes = regions.map((r) => r.length)
        expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1)
      }
    }
  })

  it('rejects impossible lengths', () => {
    const art = library[0]
    expect(() => splitIntoRegions(art.pixels, art.width, art.height, 0)).toThrow()
    expect(() => splitIntoRegions(art.pixels, art.width, art.height, art.pixels.length + 1)).toThrow()
  })
})

describe('library', () => {
  it('loads at least the public starter art with unique ids', () => {
    expect(library.length).toBeGreaterThanOrEqual(3)
    expect(new Set(library.map((a) => a.id)).size).toBe(library.length)
  })
})
