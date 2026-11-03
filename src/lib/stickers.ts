/** A steady angle per sticker (-7 to 7 degrees), so a set looks hand-placed. */
export function tiltFor(key: string): number {
  let h = 0
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return (h % 15) - 7
}
