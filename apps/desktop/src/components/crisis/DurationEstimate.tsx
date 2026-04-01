import { DEFAULT_DURATION_MAP } from '@/types/crisis'

interface DurationEstimateProps {
  intensity: number
  historicalAvg?: number | null
  confirmedEndTime: string | null
  onConfirmEndTime: (time: string) => void
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`
}

export function DurationEstimate({
  intensity,
  historicalAvg,
  confirmedEndTime,
  onConfirmEndTime,
}: DurationEstimateProps) {
  const estimated = historicalAvg ?? DEFAULT_DURATION_MAP[intensity] ?? 240

  return (
    <div className="space-y-2">
      <label htmlFor="end-time" className="text-sm font-medium text-(--color-text-primary)">
        Durée estimée
      </label>

      <div className="flex items-center gap-3 rounded-(--radius-md) bg-(--color-bg-subtle) px-4 py-3">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" className="text-(--color-text-muted)" />
          <path d="M10 5v5l3.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-(--color-brand)" />
        </svg>
        <span className="text-sm font-medium text-(--color-text-primary)">
          ~{formatDuration(estimated)}
        </span>
        {historicalAvg && (
          <span className="text-xs text-(--color-text-muted)">
            (basé sur votre historique)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="end-time" className="text-xs text-(--color-text-secondary)">
          Ou saisir l'heure de fin :
        </label>
        <input
          id="end-time"
          type="time"
          value={confirmedEndTime ?? ''}
          onChange={(e) => onConfirmEndTime(e.target.value)}
          className="rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-elevated) px-2 py-1 text-sm text-(--color-text-primary)"
        />
      </div>
    </div>
  )
}
