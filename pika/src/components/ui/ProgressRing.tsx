import { cn, clamp } from '../../lib/utils'

export function ProgressRing({
  value,
  size = 44,
  stroke = 4,
  className,
}: {
  /** 0..1 */
  value: number
  size?: number
  stroke?: number
  className?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = clamp(value, 0, 1)
  const offset = c * (1 - pct)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('block', className)}
      aria-label={`progress ${(pct * 100).toFixed(0)}%`}
      role="img"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="transparent"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}

