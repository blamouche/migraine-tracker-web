import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useModuleStore } from '@/stores/moduleStore'
import { usePlanStore } from '@/stores/planStore'
import { usePlanConfigStore } from '@/stores/planConfigStore'
import { MODULE_DEFINITIONS } from '@/types/modules'
import type { ModuleId } from '@/types/modules'

// Same Lucide-style SVG icons as the Sidebar, keyed by ModuleId
const MODULE_ICONS: Record<ModuleId, React.ReactNode> = {
  alimentaire: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  ),
  traitements: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  ),
  cycle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  consultations: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" />
    </svg>
  ),
  transports: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10H8s-2.7.6-4.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
      <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
    </svg>
  ),
  sport: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  chargeMentale: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1 2 3.46 4 4 0 0 1 0 5.08A4 4 0 0 1 16 18a4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1-2-3.46 4 4 0 0 1 0-5.08A4 4 0 0 1 8 6a4 4 0 0 1 4-4z" />
      <path d="M12 2v20" />
    </svg>
  ),
  dailyPain: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  environnement: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="M20 12h2" /><path d="m19.07 4.93-1.41 1.41" /><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" /><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z" />
    </svg>
  ),
  voiceInput: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  ),
}

export function ModulePreferencesPage() {
  const navigate = useNavigate()
  const { config, setModuleEnabled } = useModuleStore()
  const plan = usePlanStore((s) => s.plan)
  const isModuleEnabledForPlan = usePlanConfigStore((s) => s.isModuleEnabledForPlan)
  const [confirmingDisable, setConfirmingDisable] = useState<ModuleId | null>(null)

  const handleToggle = async (moduleId: ModuleId, currentEnabled: boolean) => {
    if (currentEnabled) {
      // Show confirmation before disabling
      setConfirmingDisable(moduleId)
    } else {
      await setModuleEnabled(moduleId, true)
    }
  }

  const confirmDisable = async () => {
    if (confirmingDisable) {
      await setModuleEnabled(confirmingDisable, false)
      setConfirmingDisable(null)
    }
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-[800px] px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Modules de suivi</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
          >
            Accueil
          </button>
        </div>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Choisissez les modules actifs pour simplifier votre interface. Les modules du socle
          (crises, dashboard, rapport, profil médical) sont toujours actifs.
        </p>

        <section className="mt-8 space-y-3">
          {MODULE_DEFINITIONS.map((mod) => {
            const enabled = config[mod.id]
            const adminDisabled = !isModuleEnabledForPlan(plan, mod.id)

            return (
              <div
                key={mod.id}
                className={`flex items-center justify-between rounded-(--radius-lg) bg-(--color-bg-elevated) p-4 ${
                  adminDisabled ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-(--radius-md) bg-(--color-bg-subtle) text-(--color-text-secondary)">
                    {MODULE_ICONS[mod.id]}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{mod.label}</p>
                      {adminDisabled && (
                        <span className="flex items-center gap-1 rounded-full bg-(--color-warning)/20 px-2 py-0.5 text-[10px] font-semibold text-(--color-warning)">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          Non disponible
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-(--color-text-muted)">
                      {adminDisabled
                        ? 'Ce module n\'est pas disponible avec votre plan actuel.'
                        : mod.description}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !adminDisabled && handleToggle(mod.id, enabled)}
                  disabled={adminDisabled}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    adminDisabled
                      ? 'bg-(--color-border-strong) cursor-not-allowed'
                      : enabled
                        ? 'bg-(--color-brand) cursor-pointer'
                        : 'bg-(--color-border-strong) cursor-pointer'
                  }`}
                  role="switch"
                  aria-checked={!adminDisabled && enabled}
                  aria-label={`${enabled ? 'Désactiver' : 'Activer'} ${mod.label}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      !adminDisabled && enabled ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </section>

        <p className="mt-6 text-xs text-(--color-text-muted)">
          Les modules Journal des crises, Dashboard, Rapport médical et Profil médical sont
          toujours actifs et ne peuvent pas être désactivés.
        </p>
      </div>

      {/* Confirmation modal */}
      {confirmingDisable && (
        <>
          <div
            className="fixed inset-0 z-[90] bg-black/50"
            onClick={() => setConfirmingDisable(null)}
            aria-hidden="true"
          />
          <div className="fixed left-1/2 top-1/2 z-[91] w-[420px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">Désactiver ce module ?</h2>
            <p className="mt-2 text-sm text-(--color-text-secondary)">
              Vos données existantes sont conservées. Vous pouvez réactiver ce module à tout moment.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmingDisable(null)}
                className="rounded-(--radius-md) px-4 py-2 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-subtle)"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDisable}
                className="rounded-(--radius-md) bg-(--color-danger) px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Désactiver
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
