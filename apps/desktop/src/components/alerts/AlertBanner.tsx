import { useEffect } from 'react'
import { useCrisisStore } from '@/stores/crisisStore'
import { useFoodStore } from '@/stores/foodStore'
import { useAlertStore } from '@/stores/alertStore'
import { detectAlerts } from '@/lib/alerts/detect'
import type { Alert } from '@/types/alerts'

const SEVERITY_STYLES: Record<Alert['severity'], string> = {
  info: 'border-(--color-brand) bg-(--color-brand-light)',
  warning: 'border-(--color-warning) bg-(--color-warning-light)',
  danger: 'border-(--color-danger) bg-(--color-danger-light)',
}

export function AlertBanner() {
  const crises = useCrisisStore((s) => s.crises)
  const foodEntries = useFoodStore((s) => s.entries)
  const { alerts, preferences, setAlerts, dismissAlert, isDismissedThisMonth } = useAlertStore()

  useEffect(() => {
    const detected = detectAlerts(crises, foodEntries, preferences, isDismissedThisMonth)
    setAlerts(detected)
  }, [crises, foodEntries, preferences]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeAlerts = alerts.filter((a) => !a.dismissedAt)

  if (activeAlerts.length === 0) return null

  return (
    <div className="space-y-3">
      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start justify-between rounded-(--radius-lg) border-l-3 p-4 ${SEVERITY_STYLES[alert.severity]}`}
        >
          <div>
            <p className="text-sm font-semibold text-(--color-text-primary)">{alert.title}</p>
            <p className="mt-1 text-xs text-(--color-text-secondary)">{alert.message}</p>
          </div>
          <button
            type="button"
            onClick={() => dismissAlert(alert.id)}
            className="shrink-0 ml-3 text-xs text-(--color-text-muted) hover:text-(--color-text-primary)"
            aria-label="Ignorer cette alerte"
          >
            Ignorer
          </button>
        </div>
      ))}
    </div>
  )
}
