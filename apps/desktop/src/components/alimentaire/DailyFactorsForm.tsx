import { ScaleSlider } from './ScaleSlider'
import { STRESS_LABELS, SLEEP_LABELS } from '@/types/alimentaire'
import type { DailyFactors } from '@/types/alimentaire'

interface DailyFactorsFormProps {
  factors: DailyFactors
  onChange: (factors: DailyFactors) => void
}

function getStressColor(value: number): string {
  if (value <= 2) return 'var(--color-success)'
  if (value === 3) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

function getSleepColor(value: number): string {
  if (value <= 2) return 'var(--color-danger)'
  if (value === 3) return 'var(--color-warning)'
  return 'var(--color-success)'
}

export function DailyFactorsForm({ factors, onChange }: DailyFactorsFormProps) {
  const update = (partial: Partial<DailyFactors>) => {
    onChange({ ...factors, ...partial })
  }

  return (
    <div className="space-y-6 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-4">
      <h3 className="text-sm font-semibold text-(--color-text-primary)">
        Facteurs du jour
      </h3>

      <ScaleSlider
        id="stress-slider"
        label="Niveau de stress"
        value={factors.stress}
        onChange={(v) => update({ stress: v })}
        labels={STRESS_LABELS}
        getColor={getStressColor}
      />

      <ScaleSlider
        id="sleep-slider"
        label="Qualit\u00e9 du sommeil"
        value={factors.sleepQuality}
        onChange={(v) => update({ sleepQuality: v })}
        labels={SLEEP_LABELS}
        getColor={getSleepColor}
      />

      <div>
        <p className="text-sm font-medium text-(--color-text-primary)">Hydratation</p>
        <div className="mt-2 flex gap-2">
          {(['bonne', 'insuffisante'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => update({ hydration: option })}
              className={`rounded-(--radius-md) px-4 py-2 text-sm transition-colors ${
                factors.hydration === option
                  ? 'bg-(--color-brand) text-(--color-text-inverse)'
                  : 'border border-(--color-border) bg-(--color-bg-elevated) text-(--color-text-primary) hover:border-(--color-brand)'
              }`}
            >
              {option === 'bonne' ? 'Bonne' : 'Insuffisante'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
