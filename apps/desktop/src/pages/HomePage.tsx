import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/authStore'
import { useCrisisStore } from '@/stores/crisisStore'
import { useFoodStore } from '@/stores/foodStore'
import { IncompleteEntries } from '@/components/crisis/IncompleteEntries'
import { MEAL_TYPE_LABELS } from '@/types/alimentaire'

export function HomePage() {
  const navigate = useNavigate()
  const { user, isAnonymous, signOut } = useAuthStore()
  const { crises, loadCrises, purgeOldTrash } = useCrisisStore()
  const { entries: foodEntries, loadEntries: loadFoodEntries } = useFoodStore()

  useEffect(() => {
    if (crises.length === 0) loadCrises()
    if (foodEntries.length === 0) loadFoodEntries()
    purgeOldTrash()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const recentCrises = crises.slice(0, 5)
  const hasCrises = crises.length > 0
  const recentFood = foodEntries.slice(0, 5)
  const hasFood = foodEntries.length > 0

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-[1200px] px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Migraine AI</h1>
          <div className="flex items-center gap-4">
            {hasFood && (
              <button
                type="button"
                onClick={() => navigate('/alimentaire/historique')}
                className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
              >
                Journal alimentaire
              </button>
            )}
            {hasCrises && (
              <button
                type="button"
                onClick={() => navigate('/crisis/history')}
                className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
              >
                Historique crises
              </button>
            )}
            {user && (
              <button
                type="button"
                onClick={() => signOut()}
                className="text-sm text-(--color-text-secondary) underline hover:text-(--color-text-primary)"
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {isAnonymous && (
            <div className="rounded-(--radius-md) bg-(--color-warning-light) px-4 py-3 text-sm text-(--color-warning)">
              Vous utilisez Migraine AI sans compte. Créez un compte pour sauvegarder vos
              préférences et accéder aux fonctionnalités Pro.
            </div>
          )}

          {/* Incomplete entries (US-02-13) */}
          <IncompleteEntries
            crises={crises}
            onComplete={(crisis) => navigate(`/crisis/${crisis.id}/edit`)}
          />

          {/* Welcome / recent crises */}
          {!hasCrises ? (
            <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-8 text-center">
              <p className="text-lg font-medium">Bienvenue sur Migraine AI</p>
              <p className="mt-2 text-sm text-(--color-text-secondary)">
                Commencez par enregistrer votre première crise pour construire votre historique.
              </p>
              <button
                type="button"
                onClick={() => navigate('/crisis/quick')}
                className="mt-6 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)"
              >
                Enregistrer ma première crise
              </button>
            </div>
          ) : (
            <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-(--color-text-primary)">
                  Crises récentes
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/crisis/history')}
                  className="text-xs text-(--color-brand) hover:underline"
                >
                  Voir tout
                </button>
              </div>
              <ul className="mt-3 divide-y divide-(--color-border)">
                {recentCrises.map((crisis) => (
                  <li key={crisis.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: intensityColor(crisis.intensity) }}
                      >
                        {crisis.intensity}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{formatDateShort(crisis.date)}</p>
                        <p className="text-xs text-(--color-text-muted)">
                          {crisis.startTime}
                          {crisis.treatments.length > 0 && ` · ${crisis.treatments[0]}`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/crisis/${crisis.id}/edit`)}
                      className="text-xs text-(--color-brand) hover:underline"
                    >
                      {crisis.status === 'incomplet' ? 'Compléter' : 'Détails'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Food journal section (E03) */}
          <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-(--color-text-primary)">
                Journal alimentaire
              </h2>
              {hasFood && (
                <button
                  type="button"
                  onClick={() => navigate('/alimentaire/historique')}
                  className="text-xs text-(--color-brand) hover:underline"
                >
                  Voir tout
                </button>
              )}
            </div>

            {!hasFood ? (
              <div className="mt-4 text-center">
                <p className="text-sm text-(--color-text-secondary)">
                  Suivez votre alimentation pour identifier les déclencheurs de vos crises.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/alimentaire/nouveau')}
                  className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)"
                >
                  Enregistrer mon premier repas
                </button>
              </div>
            ) : (
              <>
                <ul className="mt-3 divide-y divide-(--color-border)">
                  {recentFood.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-bg-subtle) text-sm">
                          {mealIcon(entry.mealType)}
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            {formatDateShort(entry.date)} — {MEAL_TYPE_LABELS[entry.mealType]}
                          </p>
                          <p className="text-xs text-(--color-text-muted)">
                            {entry.time}
                            {entry.foods.length > 0 && ` · ${entry.foods[0]}`}
                            {entry.foods.length > 1 && ` +${entry.foods.length - 1}`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/alimentaire/${entry.id}/edit`)}
                        className="text-xs text-(--color-brand) hover:underline"
                      >
                        {entry.status === 'incomplet' ? 'Compléter' : 'Détails'}
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => navigate('/alimentaire/nouveau')}
                  className="mt-3 w-full rounded-(--radius-md) border border-dashed border-(--color-border) py-2 text-sm text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand)"
                >
                  + Ajouter un repas
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FAB — Crisis quick access (US-02-01: ≤ 2 taps) */}
      <button
        type="button"
        onClick={() => navigate('/crisis/quick')}
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-(--color-danger) text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Enregistrer une crise"
        title="Mode Crise"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </button>
    </main>
  )
}

function intensityColor(intensity: number): string {
  if (intensity <= 3) return 'var(--color-pain-3)'
  if (intensity <= 5) return 'var(--color-pain-5)'
  if (intensity <= 8) return 'var(--color-pain-7)'
  return 'var(--color-pain-9)'
}

function mealIcon(type: string): string {
  const icons: Record<string, string> = {
    'petit-dejeuner': '\u2600\ufe0f',
    'dejeuner': '\ud83c\udf7d\ufe0f',
    'diner': '\ud83c\udf19',
    'collation': '\ud83c\udf4e',
  }
  return icons[type] ?? '\ud83c\udf74'
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
