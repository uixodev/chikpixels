import { describe, expect, it } from 'vitest'
import { applyLog, effortFromCount, type Habit } from './habits'
import { addDays, slotInfo, slotsPerUnit } from './schedule'

const base: Habit = {
  id: 'h', name: 'n', artId: 'heart', days: 12, mode: 'chosen',
  track: { type: 'effort' }, schedule: { kind: 'daily' }, efforts: {}, createdAt: '2026-01-01',
}

describe('addDays', () => {
  it('handles month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
})

describe('slotInfo', () => {
  it('free habits have no dates', () => {
    expect(slotInfo(base, 3, '2026-01-10')).toEqual({ label: 'Day 4', status: 'free' })
  })
  it('daily calendar habits mark past, current and future', () => {
    const h = { ...base, startDate: '2026-01-10' }
    expect(slotInfo(h, 0, '2026-01-11').status).toBe('past')
    expect(slotInfo(h, 1, '2026-01-11').status).toBe('current')
    expect(slotInfo(h, 2, '2026-01-11').status).toBe('future')
  })
  it('weekly habits share one week window', () => {
    const h: Habit = { ...base, schedule: { kind: 'weekly', times: 3 }, startDate: '2026-01-05' }
    expect(slotsPerUnit(h.schedule)).toBe(3)
    expect(slotInfo(h, 4, '2026-01-13').label).toBe('Week 2 · 2/3')
    expect(slotInfo(h, 3, '2026-01-13').status).toBe('current')
    expect(slotInfo(h, 6, '2026-01-13').status).toBe('future')
    expect(slotInfo(h, 2, '2026-01-13').status).toBe('past')
  })
  it('every-N-days habits step by N', () => {
    const h: Habit = { ...base, schedule: { kind: 'every', n: 3 }, startDate: '2026-01-01' }
    expect(slotInfo(h, 1, '2026-01-04').status).toBe('current')
    expect(slotInfo(h, 1, '2026-01-07').status).toBe('past')
    expect(slotInfo(h, 2, '2026-01-04').status).toBe('future')
  })
})

describe('applyLog', () => {
  it('count habits turn progress into vividness', () => {
    expect(effortFromCount(3, 8)).toBe(38)
    expect(effortFromCount(8, 8)).toBe(100)
    expect(effortFromCount(12, 8)).toBe(100)
    const h: Habit = { ...base, track: { type: 'count', target: 8, unit: 'glasses' } }
    const logged = applyLog(h, 0, 4, 20)
    expect(logged.counts?.[0]).toBe(4)
    expect(logged.efforts[0]).toBe(50)
    expect(applyLog(logged, 0, 0, 20).efforts[0]).toBeUndefined()
  })
  it('check-in habits always log as full colour', () => {
    const h: Habit = { ...base, track: { type: 'check' } }
    expect(applyLog(h, 2, 1, 20).efforts[2]).toBe(100)
  })
  it('sets and clears the completion date', () => {
    let h: Habit = { ...base, days: 2, track: { type: 'check' } }
    h = applyLog(h, 0, 1, 20)
    expect(h.completedAt).toBeUndefined()
    h = applyLog(h, 1, 1, 20)
    expect(h.completedAt).toBeDefined()
    h = applyLog(h, 1, null, 20)
    expect(h.completedAt).toBeUndefined()
  })
})
