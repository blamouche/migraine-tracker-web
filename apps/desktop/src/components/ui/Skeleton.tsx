interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-(--radius-md) bg-(--color-bg-subtle) ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function SkeletonKpiCard() {
  return (
    <div className="flex flex-col gap-2 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <Skeleton height={14} width="60%" />
      <Skeleton height={30} width="40%" />
      <Skeleton height={12} width="80%" />
      <Skeleton height={32} className="mt-1" />
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <Skeleton height={14} width="30%" />
      <Skeleton height={200} className="mt-4" />
    </div>
  )
}

export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton width={32} height={32} className="shrink-0 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton height={14} width="50%" />
        <Skeleton height={12} width="70%" />
      </div>
      <Skeleton height={14} width={48} />
    </div>
  )
}

export function SkeletonForm() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton height={14} width="25%" />
          <Skeleton height={40} />
        </div>
      ))}
    </div>
  )
}
