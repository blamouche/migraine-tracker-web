interface KpiCardProps {
  label: string
  value: string | number
  trend?: { value: number; isPositive: boolean } // +/- percentage
  sparklineData?: number[]
  tooltip?: string
}

export function KpiCard({ label, value, trend, sparklineData, tooltip }: KpiCardProps) {
  return (
    <div className="card-hover rounded-(--radius-lg) bg-(--color-bg-elevated) p-4" title={tooltip}>
      <p className="text-xs font-medium text-(--color-text-muted)">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[30px] font-bold leading-tight">{value}</span>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              trend.isPositive ? 'text-(--color-success)' : 'text-(--color-danger)'
            }`}
          >
            {trend.isPositive ? '\u2191' : '\u2193'}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-2">
          <Sparkline data={sparklineData} />
        </div>
      )}
    </div>
  )
}

function Sparkline({ data }: { data: number[] }) {
  const width = 120
  const height = 28
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)

  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`)
    .join(' ')

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
