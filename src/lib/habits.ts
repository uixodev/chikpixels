import type { Pos } from './stickers'

export type Mode = 'secret' | 'chosen'

/** How a day is logged. Count turns progress toward a target into effort. */
export type Track = { type: 'effort' } | { type: 'check' } | { type: 'count'; target: number; unit: string }

/** What one square stands for. */
export type Schedule = { kind: 'daily' } | { kind: 'weekly'; times: number } | { kind: 'every'; n: number }

/** One picture within a habit. Extending a habit adds a chapter. */
export interface Chapter {
  artId: string
  /** Number of squares (slots) this chapter spans. */
  days: number
  mode: Mode
  /** Date this picture was finished (YYYY-MM-DD). */
  completedAt?: string
}

export interface Habit {
  id: string
  name: string
  artId: string
  days: number
  mode: Mode
  /** Absent until the habit is extended; then lists every picture in order. */
  chapters?: Chapter[]
  track: Track
  schedule: Schedule
  /** When set, squares follow the calendar from this date (YYYY-MM-DD). Otherwise they are free slots. */
  startDate?: string
  /** Effort (0-100) per slot. A slot with no entry has not been logged. For count habits this is progress toward the target. */
  efforts: Record<number, number>
  /** Raw counts per slot, for count habits. */
  counts?: Record<number, number>
  createdAt: string
  completedAt?: string
}

export interface AppState {
  version: 1
  /** Minimum effort for a day to count and reveal its part of the picture. */
  threshold: number
  habits: Habit[]
  /** Where each finished picture's sticker sits, keyed `habitId:chapterIndex`. */
  stickers: Record<string, Pos>
}

export const DEFAULT_THRESHOLD = 20
export const STORAGE_KEY = 'chikpixels:v1'

export function emptyState(): AppState {
  return { version: 1, threshold: DEFAULT_THRESHOLD, habits: [], stickers: {} }
}

export function parseState(raw: string | null): AppState {
  if (!raw) return emptyState()
  try {
    const data = JSON.parse(raw)
    if (data && data.version === 1 && Array.isArray(data.habits) && typeof data.threshold === 'number') {
      return data as AppState
    }
  } catch {
    /* fall through to a fresh state */
  }
  return emptyState()
}

export function loadState(): AppState {
  try {
    return parseState(localStorage.getItem(STORAGE_KEY))
  } catch {
    return emptyState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage full or blocked: the app keeps working for this session */
  }
}

export function isRevealed(effort: number | undefined, threshold: number): boolean {
  return effort !== undefined && effort >= threshold
}

export function revealedCount(habit: Habit, threshold: number): number {
  let n = 0
  for (let d = 0; d < habit.days; d++) if (isRevealed(habit.efforts[d], threshold)) n++
  return n
}

/** 0.35 at the threshold up to 1 at effort 100: more effort, more vivid. */
export function brightness(effort: number, threshold: number): number {
  const span = Math.max(1, 100 - threshold)
  const t = Math.min(1, Math.max(0, (effort - threshold) / span))
  return 0.35 + 0.65 * t
}

const FOG = [214, 214, 214]

/** Blend a hex colour with fog. b=1 is the true colour. */
export function fogMix(hex: string, b: number): string {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  const out = ch.map((c, i) => Math.round(FOG[i] * (1 - b) + c * b))
  return `rgb(${out[0]}, ${out[1]}, ${out[2]})`
}

export function effortFromCount(count: number, target: number): number {
  return Math.min(100, Math.round((count / Math.max(1, target)) * 100))
}

export const todayISO = (): string => new Date().toLocaleDateString('en-CA')

/**
 * Log or clear one slot. `value` is the effort (effort habits), ignored (check-in habits,
 * which always log as done) or the count (count habits). `null` clears the slot.
 */
export function applyLog(habit: Habit, day: number, value: number | null, threshold: number): Habit {
  const efforts = { ...habit.efforts }
  const counts = { ...(habit.counts ?? {}) }
  const { track } = habit
  if (value === null || (track.type === 'count' && value <= 0)) {
    delete efforts[day]
    delete counts[day]
  } else if (track.type === 'count') {
    counts[day] = value
    efforts[day] = effortFromCount(value, track.target)
  } else {
    efforts[day] = track.type === 'check' ? 100 : value
  }
  const next: Habit = { ...habit, efforts, counts }
  const complete = revealedCount(next, threshold) >= next.days
  if (complete && !next.completedAt) next.completedAt = todayISO()
  if (!complete) delete next.completedAt
  if (next.chapters) {
    const ranges = chapterRanges(next)
    next.chapters = next.chapters.map((c, i) => {
      const { completedAt: _old, ...rest } = c
      return chapterRevealed(next, ranges[i], threshold) >= c.days ? { ...rest, completedAt: c.completedAt ?? todayISO() } : rest
    })
  }
  return next
}

export function chaptersOf(habit: Habit): Chapter[] {
  return habit.chapters ?? [{ artId: habit.artId, days: habit.days, mode: habit.mode }]
}

export interface ChapterRange extends Chapter {
  index: number
  /** Index of this chapter's first slot within the habit. */
  offset: number
}

export function chapterRanges(habit: Habit): ChapterRange[] {
  let offset = 0
  return chaptersOf(habit).map((c, index) => {
    const range = { ...c, index, offset }
    offset += c.days
    return range
  })
}

export function chapterRevealed(habit: Habit, range: { offset: number; days: number }, threshold: number): number {
  let n = 0
  for (let d = range.offset; d < range.offset + range.days; d++) if (isRevealed(habit.efforts[d], threshold)) n++
  return n
}

/** Add a new picture after the current ones. Nothing already logged changes. */
export function extendHabit(habit: Habit, chapter: Chapter): Habit {
  // A habit without chapters has one picture whose finish date lives on the habit itself.
  const existing = habit.chapters ?? chaptersOf(habit).map((c) => ({ ...c, completedAt: habit.completedAt }))
  const next: Habit = { ...habit, chapters: [...existing, chapter], days: habit.days + chapter.days }
  delete next.completedAt
  return next
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}
