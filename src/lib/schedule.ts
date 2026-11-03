import type { Habit, Schedule } from './habits'

/** Quick length choices, in units of the schedule (days, weeks or check-ins). */
export const LENGTH_PRESETS: Record<Schedule['kind'], number[]> = {
  daily: [7, 14, 21, 30, 66, 100],
  weekly: [2, 4, 8, 12],
  every: [7, 10, 14, 20, 30],
}

export type SlotStatus = 'free' | 'past' | 'current' | 'future'

export interface Slot {
  /** Short name, for example "Day 3" or "Week 2 · 1/3". */
  label: string
  /** The date or date range for calendar habits. */
  dates?: string
  status: SlotStatus
}

/** Add whole days to a YYYY-MM-DD date, in local time. */
export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d + n).toLocaleDateString('en-CA')
}

function pretty(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function range(start: string, end: string): string {
  return start === end ? pretty(start) : `${pretty(start)} – ${pretty(end)}`
}

/** How many squares one unit of length makes (a week of 3 sessions is 3 squares). */
export function slotsPerUnit(schedule: Schedule): number {
  return schedule.kind === 'weekly' ? schedule.times : 1
}

export function unitName(schedule: Schedule, plural = true): string {
  const name = schedule.kind === 'daily' ? 'day' : schedule.kind === 'weekly' ? 'week' : 'check-in'
  return plural ? `${name}s` : name
}

export function describeSchedule(schedule: Schedule): string {
  if (schedule.kind === 'daily') return 'every day'
  if (schedule.kind === 'weekly') return `${schedule.times}× a week`
  return `every ${schedule.n} days`
}

export function slotInfo(habit: Habit, slot: number, today: string): Slot {
  const { schedule, startDate } = habit
  let label: string
  let from: string | undefined
  let to: string | undefined

  if (schedule.kind === 'weekly') {
    const week = Math.floor(slot / schedule.times)
    label = `Week ${week + 1} · ${(slot % schedule.times) + 1}/${schedule.times}`
    if (startDate) {
      from = addDays(startDate, week * 7)
      to = addDays(from, 6)
    }
  } else if (schedule.kind === 'every') {
    label = `Check-in ${slot + 1}`
    if (startDate) {
      from = addDays(startDate, slot * schedule.n)
      to = addDays(from, schedule.n - 1)
    }
  } else {
    label = `Day ${slot + 1}`
    if (startDate) {
      from = addDays(startDate, slot)
      to = from
    }
  }

  if (!from || !to) return { label, status: 'free' }
  const status: SlotStatus = today < from ? 'future' : today > to ? 'past' : 'current'
  return { label, dates: range(from, to), status }
}
