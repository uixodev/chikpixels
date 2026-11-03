import { describe, expect, it } from 'vitest'
import { brightness, emptyState, fogMix, isRevealed, parseState, revealedCount, type Habit } from './habits'

const habit = (efforts: Record<number, number>): Habit => ({
  id: 'h', name: 'n', artId: 'heart', days: 5, cell: 4, mode: 'chosen', efforts, createdAt: '2026-01-01',
})

describe('effort and brightness', () => {
  it('only counts effort at or above the threshold', () => {
    expect(isRevealed(19, 20)).toBe(false)
    expect(isRevealed(20, 20)).toBe(true)
    expect(isRevealed(undefined, 20)).toBe(false)
  })
  it('gets more vivid as effort rises', () => {
    expect(brightness(20, 20)).toBeCloseTo(0.35)
    expect(brightness(100, 20)).toBeCloseTo(1)
    expect(brightness(60, 20)).toBeGreaterThan(brightness(40, 20))
  })
  it('counts revealed days, including backfilled ones', () => {
    expect(revealedCount(habit({ 0: 50, 3: 100, 4: 10 }), 20)).toBe(2)
  })
  it('mixes to the true colour at full brightness', () => {
    expect(fogMix('#ff0000', 1)).toBe('rgb(255, 0, 0)')
  })
})

describe('parseState', () => {
  it('falls back to an empty state for missing or corrupt data', () => {
    expect(parseState(null)).toEqual(emptyState())
    expect(parseState('not json')).toEqual(emptyState())
    expect(parseState('{"version":2}')).toEqual(emptyState())
  })
  it('round-trips a valid state', () => {
    const s = { ...emptyState(), habits: [habit({ 1: 80 })] }
    expect(parseState(JSON.stringify(s))).toEqual(s)
  })
})
