export type Theme = 'cozy' | 'nature' | 'creatures' | 'objects' | 'characters'

/** On-disk art format. `rows` use one character per pixel; '.' is transparent. */
export interface ArtFile {
  id: string
  name: string
  theme: Theme
  width: number
  height: number
  palette: Record<string, string>
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
  return { id: file.id, name: file.name, theme: file.theme, width: file.width, height: file.height, pixels }
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
