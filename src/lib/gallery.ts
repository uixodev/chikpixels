import { findArt, library, type Art } from './art'
import { chapterRanges, chapterRevealed, type Habit } from './habits'
import { unitName } from './schedule'

export interface Collected {
  key: string
  habitId: string
  habitName: string
  art: Art
  /** How long the picture took, in the habit's own terms (7 days, 2 weeks, 5 check-ins). */
  length: number
  unit: string
  completedAt?: string
}

function lengthOf(habit: Habit, squares: number): { length: number; unit: string } {
  const s = habit.schedule
  if (s.kind === 'weekly') {
    if (squares % s.times === 0) {
      const weeks = squares / s.times
      return { length: weeks, unit: unitName(s, weeks !== 1) }
    }
    return { length: squares, unit: squares === 1 ? 'session' : 'sessions' }
  }
  return { length: squares, unit: unitName(s, squares !== 1) }
}

/** Every finished picture across all habits, newest first. */
export function collectedPictures(habits: Habit[], threshold: number): Collected[] {
  const out: Collected[] = []
  for (const habit of habits) {
    const ranges = chapterRanges(habit)
    for (const r of ranges) {
      if (chapterRevealed(habit, r, threshold) < r.days) continue
      const art = findArt(r.artId)
      if (!art) continue
      const completedAt = r.completedAt ?? (ranges.length === 1 ? habit.completedAt : undefined)
      out.push({ key: `${habit.id}:${r.index}`, habitId: habit.id, habitName: habit.name, art, ...lengthOf(habit, r.days), completedAt })
    }
  }
  return out.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
}

/** Library pictures nobody has finished yet, for the locked slots in the gallery. */
export function lockedPictures(collected: Collected[]): Art[] {
  const have = new Set(collected.map((c) => c.art.id))
  return library.filter((a) => !have.has(a.id))
}

/** The text on a sticker: the habit's name and how long it ran, for example "drink water · 7 days". */
export function stickerLabel(c: Collected): string {
  return `${c.habitName} · ${c.length} ${c.unit}`
}
