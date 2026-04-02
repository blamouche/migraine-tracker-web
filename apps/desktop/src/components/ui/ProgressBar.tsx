interface ProgressBarProps {
  value: number // 0–100
  label?: string
  onCancel?: () => void
  showCancel?: boolean
}

export function ProgressBar({ value, label, onCancel, showCancel }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        {label && (
          <p className="mb-1 text-xs text-(--color-text-secondary)">{label}</p>
        )}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--color-bg-subtle)">
          <div
            className="h-full rounded-full bg-(--color-brand) transition-[width] duration-300 ease-out"
            style={{ width: `${clamped}%` }}
            role="progressbar"
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
          />
        </div>
      </div>
      {showCancel && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-(--color-text-muted) hover:text-(--color-danger)"
        >
          Annuler
        </button>
      )}
    </div>
  )
}

export function HeaderProgress({ value, label }: { value: number; label?: string }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--color-bg-subtle)"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Progression'}
    >
      <div
        className="h-full bg-(--color-brand) transition-[width] duration-300 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}
