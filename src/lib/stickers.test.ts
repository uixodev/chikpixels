import { describe, expect, it } from 'vitest'
import { areaHeight, clampPos, defaultPos, ROW, tiltFor } from './stickers'

describe('sticker layout', () => {
  it('puts the first stickers in two columns, row by row', () => {
    const a = defaultPos(0, 'a:0'), b = defaultPos(1, 'b:0'), c = defaultPos(2, 'c:0')
    expect(a.x).toBeLessThan(0.5)
    expect(b.x).toBeGreaterThan(0.5)
    expect(c.y).toBeGreaterThan(a.y + ROW - 40)
  })
  it('is stable for the same key', () => {
    expect(defaultPos(3, 'x:1')).toEqual(defaultPos(3, 'x:1'))
    expect(tiltFor('x:1')).toBe(tiltFor('x:1'))
    expect(Math.abs(tiltFor('anything'))).toBeLessThanOrEqual(7)
  })
  it('grows the area for more stickers and for stickers dragged low', () => {
    expect(areaHeight(0, [])).toBe(340)
    expect(areaHeight(8, [])).toBeGreaterThan(areaHeight(2, []))
    expect(areaHeight(2, [{ x: 0.5, y: 900 }])).toBeGreaterThanOrEqual(900 + ROW)
  })
  it('keeps a dragged sticker inside the area', () => {
    const p = clampPos({ x: 2, y: -50 }, 400)
    expect(p.x).toBeLessThanOrEqual(0.9)
    expect(p.y).toBe(0)
    expect(clampPos({ x: 0.5, y: 9999 }, 400).y).toBe(400 - ROW)
  })
})
