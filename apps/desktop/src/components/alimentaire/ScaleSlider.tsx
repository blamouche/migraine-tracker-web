interface ScaleSliderProps {
  id: string
  label: string
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  labels: Record<number, string>
  getColor: (value: number) => string
}

export function ScaleSlider({
  id,
  label,
  value,
  min = 1,
  max = 5,
  onChange,
  labels,
  getColor,
}: ScaleSliderProps) {
  const currentLabel = labels[value] ?? ''

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-(--color-text-primary)">
          {label}
        </label>
        <span
          className="rounded-(--radius-full) px-3 py-1 text-sm font-semibold text-white"
          style={{ backgroundColor: getColor(value) }}
        >
          {value}/{max}
        </span>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full cursor-pointer accent-(--color-brand)"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} sur ${max} — ${currentLabel}`}
      />

      <div className="flex justify-between text-xs text-(--color-text-muted)">
        <span>{min}</span>
        <span>{Math.ceil((min + max) / 2)}</span>
        <span>{max}</span>
      </div>

      <p className="text-center text-sm font-medium text-(--color-text-secondary)">
        {currentLabel}
      </p>
    </div>
  )
}
