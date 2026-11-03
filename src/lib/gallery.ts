import { findArt, library, type Art } from './art'
import { chapterRanges, chapterRevealed, type Habit } from './habits'

export interface Collected {
  key: string
  habitId: string
  habitName: string
  art: Art
  completedAt?: string
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
      out.push({ key: `${habit.id}:${r.index}`, habitId: habit.id, habitName: habit.name, art, completedAt })
    }
  }
  return out.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
}

/** Library pictures nobody has finished yet, for the locked slots in the gallery. */
export function lockedPictures(collected: Collected[]): Art[] {
  const have = new Set(collected.map((c) => c.art.id))
  return library.filter((a) => !have.has(a.id))
}
