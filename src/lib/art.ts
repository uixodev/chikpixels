export type Theme = 'cozy' | 'nature' | 'creatures' | 'objects' | 'characters'

/** On-disk art format. `rows` use one character per pixel; '.' is transparent. */
export interface ArtFile {
  id: string
  name: string
  theme: Theme
  /** Which collection the picture belongs to, for example 'simpsons'. */
  collection?: string
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
  collection: string
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
  return { id: file.id, name: file.name, theme: file.theme, collection: file.collection ?? 'originals', width: file.width, height: file.height, pixels }
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

/** Display names for collections, in the order they are listed. Unknown ones get a tidy default. */
export const collectionNames: Record<string, string> = { simpsons: 'The Simpsons', originals: 'Originals' }
export const collectionName = (id: string): string => collectionNames[id] ?? id.charAt(0).toUpperCase() + id.slice(1)
const collectionOrder = Object.keys(collectionNames)
export const collectionRank = (id: string): number => {
  const i = collectionOrder.indexOf(id)
  return i === -1 ? collectionOrder.length : i
}

export interface CollectionInfo {
  id: string
  name: string
  count: number
}

/** Every collection in the library with how many pictures it holds. */
export const collections: CollectionInfo[] = [...new Set(library.map((a) => a.collection))]
  .sort((a, b) => collectionRank(a) - collectionRank(b) || a.localeCompare(b))
  .map((id) => ({ id, name: collectionName(id), count: library.filter((a) => a.collection === id).length }))

export const themeLabels: Record<Theme, string> = {
  cozy: 'Cozy',
  nature: 'Nature',
  creatures: 'Creatures',
  objects: 'Objects',
  characters: 'Characters',
}
