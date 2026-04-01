import { useNavigate } from 'react-router'
import { useAlertStore } from '@/stores/alertStore'
import type { AlertPreferences } from '@/types/alerts'

interface ToggleFieldProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-(--color-text-muted)">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-(--color-brand)' : 'bg-(--color-border-strong)'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  )
}

interface NumberFieldProps {
  label: string
  description: string
  value: number
  unit: string
  min: number
  max: number
  onChange: (value: number) => void
}

function NumberField({ label, description, value, unit, min, max, onChange }: NumberFieldProps) {
  return (
    <div className="rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 text-xs text-(--color-text-muted)">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (!isNaN(v) && v >= min && v <= max) onChange(v)
            }}
            className="w-16 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-2 py-1 text-center text-sm"
          />
          <span className="text-xs text-(--color-text-muted)">{unit}</span>
        </div>
      </div>
    </div>
  )
}

export function AlertPreferencesPage() {
  const navigate = useNavigate()
  const { preferences, updatePreferences } = useAlertStore()

  function update<K extends keyof AlertPreferences>(key: K, value: AlertPreferences[K]) {
    updatePreferences({ [key]: value })
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-[800px] px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Alertes & notifications</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
          >
            Accueil
          </button>
        </div>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Configurez les alertes et rappels pour suivre votre pathologie. Chaque alerte ne
          s'affiche qu'une fois par mois.
        </p>

        {/* Toggles */}
        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold text-(--color-text-primary)">Types d'alertes</h2>

          <ToggleField
            label="Fréquence élevée"
            description="Alerte quand le nombre de jours de migraine dépasse le seuil mensuel."
            checked={preferences.enableFrequencyAlert}
            onChange={(v) => update('enableFrequencyAlert', v)}
          />

          <ToggleField
            label="Prise excessive de triptans"
            description="Alerte en cas de risque de céphalée de rebond."
            checked={preferences.enableTriptanAlert}
            onChange={(v) => update('enableTriptanAlert', v)}
          />

          <ToggleField
            label="Rappel de consultation"
            description="Rappel si aucune consultation n'est enregistrée depuis plusieurs mois."
            checked={preferences.enableConsultationReminder}
            onChange={(v) => update('enableConsultationReminder', v)}
          />

          <ToggleField
            label="Déclencheur alimentaire"
            description="Notification quand une corrélation forte est détectée avec un aliment."
            checked={preferences.enableFoodTriggerAlert}
            onChange={(v) => update('enableFoodTriggerAlert', v)}
          />
        </section>

        {/* Thresholds */}
        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold text-(--color-text-primary)">Seuils</h2>

          <NumberField
            label="Seuil de fréquence élevée"
            description="Nombre de jours de migraine par mois pour déclencher l'alerte."
            value={preferences.frequencyThreshold}
            unit="jours/mois"
            min={1}
            max={30}
            onChange={(v) => update('frequencyThreshold', v)}
          />

          <NumberField
            label="Seuil de triptans"
            description="Nombre de prises de triptans par mois."
            value={preferences.triptanThreshold}
            unit="prises/mois"
            min={1}
            max={30}
            onChange={(v) => update('triptanThreshold', v)}
          />

          <NumberField
            label="Rappel consultation"
            description="Nombre de mois sans consultation avant le rappel."
            value={preferences.consultationReminderMonths}
            unit="mois"
            min={1}
            max={24}
            onChange={(v) => update('consultationReminderMonths', v)}
          />

          <NumberField
            label="Corrélation alimentaire"
            description="Pourcentage minimum de corrélation pour déclencher l'alerte."
            value={preferences.foodCorrelationThreshold}
            unit="%"
            min={50}
            max={100}
            onChange={(v) => update('foodCorrelationThreshold', v)}
          />
        </section>
      </div>
    </main>
  )
}
