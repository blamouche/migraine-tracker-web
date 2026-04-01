import { INTENSITY_LABELS } from '@/types/crisis'

interface IntensitySliderProps {
  value: number
  onChange: (value: number) => void
  personalAnchors?: Partial<Record<number, string>>
}

function getIntensityColor(value: number): string {
  if (value <= 2) return 'var(--color-pain-1)'
  if (value <= 4) return 'var(--color-pain-3)'
  if (value <= 6) return 'var(--color-pain-5)'
  if (value <= 8) return 'var(--color-pain-7)'
  return 'var(--color-pain-9)'
}

export function IntensitySlider({ value, onChange, personalAnchors }: IntensitySliderProps) {
  const label = INTENSITY_LABELS[value] ?? ''
  const anchor = personalAnchors?.[value]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="intensity-slider" className="text-sm font-medium text-(--color-text-primary)">
          Intensité
        </label>
        <span
          className="rounded-(--radius-full) px-3 py-1 text-sm font-semibold text-white"
          style={{ backgroundColor: getIntensityColor(value) }}
        >
          {value}/10
        </span>
      </div>

      <input
        id="intensity-slider"
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full cursor-pointer accent-(--color-brand)"
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={value}
        aria-valuetext={`${value} sur 10 — ${label}`}
      />

      <div className="flex justify-between text-xs text-(--color-text-muted)">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>

      <p className="text-center text-sm font-medium text-(--color-text-secondary)">
        {label}
      </p>

      {anchor && (
        <p className="text-center text-xs text-(--color-text-muted) italic">
          {anchor}
        </p>
      )}
    </div>
  )
}
