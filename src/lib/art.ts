export type Theme = 'cozy' | 'nature' | 'creatures' | 'objects' | 'characters'

/** On-disk art format. `rows` use one character per pixel; '.' is transparent. */
export interface ArtFile {
  id: string
  name: string
  theme: Theme
  width: number
  height: number
  palette: Record<string, string>
  /** Backdrop colour for transparent areas. Shown in the squares around the subject. */
  background?: string
  rows: string[]
}

export interface Pixel {
  x: number
  y: number
  color: string
}

export interface Art {
  id: string
  name: string
  theme: Theme
  width: number
  height: number
  background: string
  pixels: Pixel[]
}

export function parseArt(file: ArtFile): Art {
  if (file.rows.length !== file.height) {
    throw new Error(`${file.id}: expected ${file.height} rows, got ${file.rows.length}`)
  }
  const pixels: Pixel[] = []
  file.rows.forEach((row, y) => {
    if (row.length !== file.width) {
      throw new Error(`${file.id}: row ${y} has width ${row.length}, expected ${file.width}`)
    }
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.') continue
      const color = file.palette[ch]
      if (!color) throw new Error(`${file.id}: unknown palette key "${ch}" at ${x},${y}`)
      pixels.push({ x, y, color })
    }
  })
  return { id: file.id, name: file.name, theme: file.theme, width: file.width, height: file.height, background: file.background ?? '#eeeeee', pixels }
}

// Public art ships with the repo. Private art (git-ignored) is picked up if present.
const publicFiles = import.meta.glob<ArtFile>('../art/public/*.json', { eager: true, import: 'default' })
const privateFiles = import.meta.glob<ArtFile>('../art/private/*.json', { eager: true, import: 'default' })

export const library: Art[] = [...Object.values(publicFiles), ...Object.values(privateFiles)]
  .map(parseArt)
  .sort((a, b) => a.name.localeCompare(b.name))

export function findArt(id: string): Art | undefined {
  return library.find((a) => a.id === id)
}

export const themeLabels: Record<Theme, string> = {
  cozy: 'Cozy',
  nature: 'Nature',
  creatures: 'Creatures',
  objects: 'Objects',
  characters: 'Characters',
}

/** A low-resolution version of the art: one square per habit day. */
export interface Mosaic {
  k: number
  cols: number
  rows: number
  /** One colour per square, in reading order (left to right, top to bottom). */
  colors: string[]
}

/** Squares per side: block size `k` collapses k x k pixels into one square. */
export function buildMosaic(art: Art, k: number): Mosaic {
  const cols = Math.ceil(art.width / k)
  const rows = Math.ceil(art.height / k)
  const at = new Map<number, string>()
  for (const p of art.pixels) at.set(p.y * art.width + p.x, p.color)

  const colors: string[] = []
  for (let by = 0; by < rows; by++) {
    for (let bx = 0; bx < cols; bx++) {
      const counts = new Map<string, number>()
      let present = 0
      let total = 0
      for (let y = by * k; y < Math.min(art.height, (by + 1) * k); y++) {
        for (let x = bx * k; x < Math.min(art.width, (bx + 1) * k); x++) {
          total++
          const c = at.get(y * art.width + x)
          if (c) {
            present++
            counts.set(c, (counts.get(c) ?? 0) + 1)
          }
        }
      }
      // Mostly empty block: it is backdrop. Otherwise the most common colour keeps the palette crisp.
      let best = art.background
      if (present * 2 >= total) {
        let top = 0
        for (const [c, n] of counts) {
          if (n > top) {
            top = n
            best = c
          }
        }
      }
      colors.push(best)
    }
  }
  return { k, cols, rows, colors }
}

export interface Detail {
  k: number
  cols: number
  rows: number
  days: number
}

export const MIN_DAYS = 9
export const MAX_DAYS = 150

/** The habit lengths a picture offers, coarsest first. Days equal squares. */
export function detailOptions(art: Art): Detail[] {
  const seen = new Set<number>()
  const out: Detail[] = []
  for (const k of [12, 8, 6, 4, 3, 2, 1]) {
    const cols = Math.ceil(art.width / k)
    const rows = Math.ceil(art.height / k)
    const days = cols * rows
    if (days < MIN_DAYS || days > MAX_DAYS || seen.has(days)) continue
    seen.add(days)
    out.push({ k, cols, rows, days })
  }
  return out.sort((a, b) => a.days - b.days)
}
