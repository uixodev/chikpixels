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
  /** Which picture of the habit this is, and how many it has (an extended habit has several). */
  part: number
  parts: number
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
      out.push({ key: `${habit.id}:${r.index}`, habitId: habit.id, habitName: habit.name, art, ...lengthOf(habit, r.days), part: r.index + 1, parts: ranges.length, completedAt })
    }
  }
  // Keep a habit's pictures together: habits finished most recently first, each habit's pictures in order.
  const latest = new Map<string, string>()
  for (const c of out) latest.set(c.habitId, [latest.get(c.habitId) ?? '', c.completedAt ?? ''].sort().pop() as string)
  return out.sort(
    (a, b) =>
      (latest.get(b.habitId) as string).localeCompare(latest.get(a.habitId) as string) ||
      a.habitId.localeCompare(b.habitId) ||
      a.part - b.part,
  )
}

/** Library pictures nobody has finished yet, for the locked slots in the gallery. */
export function lockedPictures(collected: Collected[]): Art[] {
  const have = new Set(collected.map((c) => c.art.id))
  return library.filter((a) => !have.has(a.id))
}

/** The two lines on a sticker: the habit's name, then how long it ran (and which part, if extended). */
export function stickerLabelParts(c: Collected): { title: string; detail: string } {
  const length = `${c.length} ${c.unit}`
  return { title: c.habitName, detail: c.parts > 1 ? `part ${c.part} of ${c.parts} · ${length}` : length }
}

export function stickerLabel(c: Collected): string {
  const { title, detail } = stickerLabelParts(c)
  return `${title} · ${detail}`
}

export interface CollectionSet {
  habitId: string
  habitName: string
  items: Collected[]
  /** How long the whole set took, for example "21 days". */
  total: string
}

/** One set per habit, in the order the pictures were already sorted (most recently finished first). */
export function groupSets(collected: Collected[]): CollectionSet[] {
  const sets: CollectionSet[] = []
  for (const c of collected) {
    const last = sets[sets.length - 1]
    if (last && last.habitId === c.habitId) last.items.push(c)
    else sets.push({ habitId: c.habitId, habitName: c.habitName, items: [c], total: '' })
  }
  for (const set of sets) {
    const n = set.items.reduce((sum, c) => sum + c.length, 0)
    const base = set.items[0].unit.replace(/s$/, '')
    set.total = `${n} ${base}${n === 1 ? '' : 's'}`
  }
  return sets
}
