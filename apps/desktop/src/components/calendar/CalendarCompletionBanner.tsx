interface CalendarCompletionBannerProps {
  filledDays: number
  totalDays: number
  rate: number
}

export function CalendarCompletionBanner({ filledDays, totalDays, rate }: CalendarCompletionBannerProps) {
  if (rate >= 60) return null

  return (
    <div className="rounded-(--radius-lg) border border-(--color-warning)/30 bg-(--color-warning)/5 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg">📊</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-(--color-text-primary)">
            Vous avez renseigné <strong>{filledDays} jour{filledDays > 1 ? 's' : ''}</strong> sur{' '}
            <strong>{totalDays}</strong> ce mois-ci. Plus vos données sont complètes, plus les analyses
            seront pertinentes !
          </p>
          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-(--color-bg-subtle)">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${rate}%`,
                  backgroundColor: rate < 30 ? '#ef4444' : rate < 50 ? '#f59e0b' : '#22c55e',
                }}
              />
            </div>
            <span className="shrink-0 text-xs font-semibold text-(--color-text-secondary)">{rate} %</span>
          </div>
        </div>
      </div>
    </div>
  )
}
