/** Pixel-art left arrow, drawn on a 9x7 grid so it matches the logo's square style. */
const ROWS = ['...#.....', '..##.....', '.########', '#########', '.########', '..##.....', '...#.....']

export function ArrowLeft({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 7) / 9} viewBox="0 0 9 7" aria-hidden="true" shapeRendering="crispEdges">
      {ROWS.flatMap((row, y) =>
        [...row].map((ch, x) => (ch === '#' ? <rect key={`${x},${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null)),
      )}
    </svg>
  )
}
