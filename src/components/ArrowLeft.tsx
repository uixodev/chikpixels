/** Pixel-art left chevron on a 6x7 grid, two pixels thick like the logo's strokes. */
const ROWS = ['...##.', '..##..', '.##...', '##....', '.##...', '..##..', '...##.']

export function ArrowLeft({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 7) / 6} viewBox="0 0 6 7" aria-hidden="true" shapeRendering="crispEdges">
      {ROWS.flatMap((row, y) =>
        [...row].map((ch, x) => (ch === '#' ? <rect key={`${x},${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null)),
      )}
    </svg>
  )
}
