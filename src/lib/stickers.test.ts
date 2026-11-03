import { describe, expect, it } from 'vitest'
import { tiltFor } from './stickers'

describe('tiltFor', () => {
  it('is steady for a key and stays within 7 degrees', () => {
    expect(tiltFor('x:1')).toBe(tiltFor('x:1'))
    for (const k of ['a:0', 'b:1', 'a long key', '']) expect(Math.abs(tiltFor(k))).toBeLessThanOrEqual(7)
  })
})
