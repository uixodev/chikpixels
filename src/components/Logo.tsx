export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 410 410" aria-hidden="true">
      <g fill="currentColor">
        <rect x="45" y="45" width="323" height="46" />
        <rect x="45" y="322" width="323" height="46" />
        <rect x="45" y="45" width="46" height="323" />
        <rect x="322" y="45" width="46" height="323" />
        <rect x="22" y="184" width="369" height="46" />
      </g>
    </svg>
  )
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <LogoMark />
      <span>CHIK.PIXELS</span>
    </span>
  )
}
