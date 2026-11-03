export type Mode = 'secret' | 'chosen'

export interface Habit {
  id: string
  name: string
  artId: string
  days: number
  mode: Mode
  /** Effort (0-100) per day slot. A slot with no entry has not been logged. */
  efforts: Record<number, number>
  createdAt: string
  completedAt?: string
}

export interface AppState {
  version: 1
  /** Minimum effort for a day to count and reveal its part of the picture. */
  threshold: number
  habits: Habit[]
}

export const DEFAULT_THRESHOLD = 20
export const STORAGE_KEY = 'chikpixels:v1'
export const LENGTH_PRESETS = [7, 14, 21, 30, 66, 100]

export function emptyState(): AppState {
  return { version: 1, threshold: DEFAULT_THRESHOLD, habits: [] }
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

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}
