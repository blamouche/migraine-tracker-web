import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/authStore'
import { useCrisisStore } from '@/stores/crisisStore'
import { useFoodStore } from '@/stores/foodStore'
import { useTreatmentStore } from '@/stores/treatmentStore'
import { useCycleStore } from '@/stores/cycleStore'
import { useConsultationStore } from '@/stores/consultationStore'
import { useTransportStore } from '@/stores/transportStore'
import { useSportStore } from '@/stores/sportStore'
import { useChargeMentaleStore } from '@/stores/chargeMentaleStore'
import { useDailyPainStore } from '@/stores/dailyPainStore'
import { IncompleteEntries } from '@/components/crisis/IncompleteEntries'
import { AlertBanner } from '@/components/alerts/AlertBanner'
import { RiskIndicator } from '@/components/patterns/RiskIndicator'
import { MEAL_TYPE_LABELS } from '@/types/alimentaire'
import { CYCLE_PHASE_LABELS } from '@/types/cycle'
import { CONSULTATION_TYPE_LABELS } from '@/types/consultation'
import { TRANSPORT_MOYEN_LABELS } from '@/types/transport'
import { SPORT_TYPE_LABELS } from '@/types/sport'
import { CHARGE_DOMAINE_LABELS, HUMEUR_LABELS } from '@/types/chargeMentale'
import { PAIN_NIVEAU_LABELS } from '@/types/dailyPain'

export function HomePage() {
  const navigate = useNavigate()
  const { user, isAnonymous, signOut } = useAuthStore()
  const { crises, loadCrises, purgeOldTrash } = useCrisisStore()
  const { entries: foodEntries, loadEntries: loadFoodEntries } = useFoodStore()
  const { treatments, loadTreatments } = useTreatmentStore()
  const { entries: cycles, loadCycles } = useCycleStore()
  const { entries: consultations, loadConsultations } = useConsultationStore()
  const { entries: transports, loadTransports } = useTransportStore()
  const { entries: sports, loadSports } = useSportStore()
  const { entries: charges, loadCharges } = useChargeMentaleStore()
  const { entries: pains, loadPains } = useDailyPainStore()

  useEffect(() => {
    if (crises.length === 0) loadCrises()
    if (foodEntries.length === 0) loadFoodEntries()
    if (treatments.length === 0) loadTreatments()
    if (cycles.length === 0) loadCycles()
    if (consultations.length === 0) loadConsultations()
    if (transports.length === 0) loadTransports()
    if (sports.length === 0) loadSports()
    if (charges.length === 0) loadCharges()
    if (pains.length === 0) loadPains()
    purgeOldTrash()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const recentCrises = crises.slice(0, 5)
  const hasCrises = crises.length > 0
  const recentFood = foodEntries.slice(0, 5)
  const hasFood = foodEntries.length > 0
  const hasTreatments = treatments.length > 0
  const activeTreatments = treatments.filter((t) => !t.dateFin)
  const hasCycles = cycles.length > 0
  const hasConsultations = consultations.length > 0
  const hasTransports = transports.length > 0
  const hasSports = sports.length > 0
  const hasCharges = charges.length > 0
  const hasPains = pains.length > 0

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-[1200px] px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Migraine AI</h1>
          <div className="flex items-center gap-4">
            {hasCrises && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-sm text-(--color-brand) font-medium hover:underline"
              >
                Tableau de bord
              </button>
            )}
            {hasCrises && (
              <button
                type="button"
                onClick={() => navigate('/rapport')}
                className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
              >
                Rapport
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/alertes')}
              className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
            >
              Alertes
            </button>
            <button
              type="button"
              onClick={() => navigate('/export')}
              className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
            >
              Exporter
            </button>
            <button
              type="button"
              onClick={() => navigate('/traitements/historique')}
              className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
            >
              Traitements
            </button>
            {hasCrises && (
              <button
                type="button"
                onClick={() => navigate('/patterns')}
                className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
              >
                Patterns
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/profil-medical')}
              className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
            >
              Profil médical
            </button>
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
            {hasCycles && (
              <button
                type="button"
                onClick={() => navigate('/cycle/historique')}
                className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
              >
                Cycles
              </button>
            )}
            {hasConsultations && (
              <button
                type="button"
                onClick={() => navigate('/consultations/historique')}
                className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
              >
                Consultations
              </button>
            )}
            {hasTransports && (
              <button
                type="button"
                onClick={() => navigate('/transports/historique')}
                className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
              >
                Transports
              </button>
            )}
            {hasSports && (
              <button
                type="button"
                onClick={() => navigate('/sport/historique')}
                className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
              >
                Sport
              </button>
            )}
            {hasCharges && (
              <button type="button" onClick={() => navigate('/charge-mentale/historique')} className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)">
                Charge mentale
              </button>
            )}
            {hasPains && (
              <button type="button" onClick={() => navigate('/douleur/historique')} className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)">
                Douleur
              </button>
            )}
            <button type="button" onClick={() => navigate('/profils')} className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)">
              Profils
            </button>
            <button type="button" onClick={() => navigate('/environnement')} className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)">
              Environnement
            </button>
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

          {/* Risk indicator (E08) — visible en premier */}
          <RiskIndicator />

          {/* Alerts (E06) */}
          <AlertBanner />

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

          {/* Treatments section (E07) */}
          <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-(--color-text-primary)">
                Traitements
              </h2>
              {hasTreatments && (
                <button
                  type="button"
                  onClick={() => navigate('/traitements/historique')}
                  className="text-xs text-(--color-brand) hover:underline"
                >
                  Voir tout
                </button>
              )}
            </div>

            {!hasTreatments ? (
              <div className="mt-4 text-center">
                <p className="text-sm text-(--color-text-secondary)">
                  Enregistrez vos traitements pour suivre leur efficacité dans le temps.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/traitements/nouveau')}
                  className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)"
                >
                  Ajouter un traitement
                </button>
              </div>
            ) : (
              <>
                {activeTreatments.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-(--color-text-muted) mb-2">Traitements actifs</p>
                    <div className="flex flex-wrap gap-2">
                      {activeTreatments.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => navigate(`/traitements/${t.id}/edit`)}
                          className="rounded-(--radius-full) border border-(--color-brand) bg-(--color-brand-light) px-3 py-1.5 text-sm text-(--color-brand) hover:bg-(--color-brand) hover:text-(--color-text-inverse) transition-colors"
                          title={`${t.posologie} — ${t.molecule}`}
                        >
                          {t.nom}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/traitements/nouveau')}
                  className="mt-3 w-full rounded-(--radius-md) border border-dashed border-(--color-border) py-2 text-sm text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand)"
                >
                  + Ajouter un traitement
                </button>
              </>
            )}
          </div>
          {/* Daily pain section (E16) */}
          <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-(--color-text-primary)">Douleur quotidienne</h2>
              {hasPains && (
                <button type="button" onClick={() => navigate('/douleur/historique')} className="text-xs text-(--color-brand) hover:underline">Voir tout</button>
              )}
            </div>
            {!hasPains ? (
              <div className="mt-4 text-center">
                <p className="text-sm text-(--color-text-secondary)">Enregistrez votre niveau de douleur chaque jour pour un suivi continu.</p>
                <button type="button" onClick={() => navigate('/douleur/nouveau')} className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)">Enregistrer la douleur du jour</button>
              </div>
            ) : (
              <>
                <ul className="mt-3 divide-y divide-(--color-border)">
                  {pains.slice(0, 5).map((p) => (
                    <li key={p.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: painColorHome(p.niveau) }}>{p.niveau}</span>
                        <div>
                          <p className="text-sm font-medium">{formatDateShort(p.date)}</p>
                          <p className="text-xs text-(--color-text-muted)">{PAIN_NIVEAU_LABELS[p.niveau]}{p.lieeACrise ? ' · Crise' : ''}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => navigate(`/douleur/${p.id}/edit`)} className="text-xs text-(--color-brand) hover:underline">Détails</button>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => navigate('/douleur/nouveau')} className="mt-3 w-full rounded-(--radius-md) border border-dashed border-(--color-border) py-2 text-sm text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand)">+ Douleur du jour</button>
              </>
            )}
          </div>

          {/* Charge mentale section (E15) */}
          <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-(--color-text-primary)">Charge mentale</h2>
              {hasCharges && (
                <button type="button" onClick={() => navigate('/charge-mentale/historique')} className="text-xs text-(--color-brand) hover:underline">Voir tout</button>
              )}
            </div>
            {!hasCharges ? (
              <div className="mt-4 text-center">
                <p className="text-sm text-(--color-text-secondary)">Suivez votre charge mentale pour identifier les migraines de décompression.</p>
                <button type="button" onClick={() => navigate('/charge-mentale/nouveau')} className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)">Enregistrer ma charge du jour</button>
              </div>
            ) : (
              <>
                <ul className="mt-3 divide-y divide-(--color-border)">
                  {charges.slice(0, 5).map((c) => (
                    <li key={c.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: chargeColorHome(c.niveau) }}>{c.niveau}</span>
                        <div>
                          <p className="text-sm font-medium">{formatDateShort(c.date)}</p>
                          <p className="text-xs text-(--color-text-muted)">{CHARGE_DOMAINE_LABELS[c.domaine]} · {HUMEUR_LABELS[c.humeur]}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => navigate(`/charge-mentale/${c.id}/edit`)} className="text-xs text-(--color-brand) hover:underline">Détails</button>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => navigate('/charge-mentale/nouveau')} className="flex-1 rounded-(--radius-md) border border-dashed border-(--color-border) py-2 text-sm text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand)">+ Charge du jour</button>
                  <button type="button" onClick={() => navigate('/evenement/nouveau')} className="flex-1 rounded-(--radius-md) border border-dashed border-(--color-border) py-2 text-sm text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand)">+ Événement de vie</button>
                </div>
              </>
            )}
          </div>

          {/* Cycle menstruel section (E10) */}
          <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-(--color-text-primary)">
                Cycle menstruel
              </h2>
              {hasCycles && (
                <button type="button" onClick={() => navigate('/cycle/historique')} className="text-xs text-(--color-brand) hover:underline">
                  Voir tout
                </button>
              )}
            </div>
            {!hasCycles ? (
              <div className="mt-4 text-center">
                <p className="text-sm text-(--color-text-secondary)">
                  Suivez votre cycle pour identifier la migraine cataméniale.
                </p>
                <button type="button" onClick={() => navigate('/cycle/nouveau')} className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)">
                  Enregistrer mon premier cycle
                </button>
              </div>
            ) : (
              <>
                <ul className="mt-3 divide-y divide-(--color-border)">
                  {cycles.slice(0, 3).map((c) => (
                    <li key={c.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-brand-light) text-xs font-bold text-(--color-brand)">
                          {c.dureeJours}j
                        </span>
                        <div>
                          <p className="text-sm font-medium">{formatDateShort(c.dateDebut)}</p>
                          <p className="text-xs text-(--color-text-muted)">
                            {CYCLE_PHASE_LABELS[c.phase]} · Intensité {c.intensiteSymptomes}/5
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => navigate(`/cycle/${c.id}/edit`)} className="text-xs text-(--color-brand) hover:underline">
                        Détails
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => navigate('/cycle/nouveau')} className="mt-3 w-full rounded-(--radius-md) border border-dashed border-(--color-border) py-2 text-sm text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand)">
                  + Nouveau cycle
                </button>
              </>
            )}
          </div>

          {/* Consultations section (E11) */}
          <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-(--color-text-primary)">
                Consultations médicales
              </h2>
              {hasConsultations && (
                <button type="button" onClick={() => navigate('/consultations/historique')} className="text-xs text-(--color-brand) hover:underline">
                  Voir tout
                </button>
              )}
            </div>
            {!hasConsultations ? (
              <div className="mt-4 text-center">
                <p className="text-sm text-(--color-text-secondary)">
                  Consignez vos consultations pour un historique complet de votre parcours de soins.
                </p>
                <button type="button" onClick={() => navigate('/consultations/nouveau')} className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)">
                  Enregistrer ma première consultation
                </button>
              </div>
            ) : (
              <>
                <ul className="mt-3 divide-y divide-(--color-border)">
                  {consultations.slice(0, 3).map((c) => (
                    <li key={c.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-bg-subtle) text-sm">
                          {consultationIcon(c.type)}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{c.medecin}</p>
                          <p className="text-xs text-(--color-text-muted)">
                            {formatDateShort(c.date)} · {CONSULTATION_TYPE_LABELS[c.type]}
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => navigate(`/consultations/${c.id}/edit`)} className="text-xs text-(--color-brand) hover:underline">
                        Détails
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => navigate('/consultations/nouveau')} className="mt-3 w-full rounded-(--radius-md) border border-dashed border-(--color-border) py-2 text-sm text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand)">
                  + Nouvelle consultation
                </button>
              </>
            )}
          </div>

          {/* Transports section (E12) */}
          <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-(--color-text-primary)">
                Transports
              </h2>
              {hasTransports && (
                <button type="button" onClick={() => navigate('/transports/historique')} className="text-xs text-(--color-brand) hover:underline">
                  Voir tout
                </button>
              )}
            </div>
            {!hasTransports ? (
              <div className="mt-4 text-center">
                <p className="text-sm text-(--color-text-secondary)">
                  Trackez vos déplacements pour identifier si certains transports déclenchent vos migraines.
                </p>
                <button type="button" onClick={() => navigate('/transports/nouveau')} className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)">
                  Enregistrer mon premier trajet
                </button>
              </div>
            ) : (
              <>
                <ul className="mt-3 divide-y divide-(--color-border)">
                  {transports.slice(0, 3).map((t) => (
                    <li key={t.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-bg-subtle) text-sm">
                          {transportIconHome(t.moyen)}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{TRANSPORT_MOYEN_LABELS[t.moyen]}</p>
                          <p className="text-xs text-(--color-text-muted)">
                            {formatDateShort(t.date)} · {formatDuration(t.dureeMinutes)}
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => navigate(`/transports/${t.id}/edit`)} className="text-xs text-(--color-brand) hover:underline">
                        Détails
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => navigate('/transports/nouveau')} className="mt-3 w-full rounded-(--radius-md) border border-dashed border-(--color-border) py-2 text-sm text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand)">
                  + Nouveau trajet
                </button>
              </>
            )}
          </div>

          {/* Sport section (E13) */}
          <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-(--color-text-primary)">
                Activités sportives
              </h2>
              {hasSports && (
                <button type="button" onClick={() => navigate('/sport/historique')} className="text-xs text-(--color-brand) hover:underline">
                  Voir tout
                </button>
              )}
            </div>
            {!hasSports ? (
              <div className="mt-4 text-center">
                <p className="text-sm text-(--color-text-secondary)">
                  Suivez votre activité physique pour comprendre son impact sur vos migraines.
                </p>
                <button type="button" onClick={() => navigate('/sport/nouveau')} className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)">
                  Enregistrer ma première activité
                </button>
              </div>
            ) : (
              <>
                <ul className="mt-3 divide-y divide-(--color-border)">
                  {sports.slice(0, 3).map((s) => (
                    <li key={s.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-bg-subtle) text-sm">
                          {sportIconHome(s.type)}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{SPORT_TYPE_LABELS[s.type]}</p>
                          <p className="text-xs text-(--color-text-muted)">
                            {formatDateShort(s.date)} · {formatDuration(s.dureeMinutes)} · Intensité {s.intensite}/5
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => navigate(`/sport/${s.id}/edit`)} className="text-xs text-(--color-brand) hover:underline">
                        Détails
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => navigate('/sport/nouveau')} className="mt-3 w-full rounded-(--radius-md) border border-dashed border-(--color-border) py-2 text-sm text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand)">
                  + Nouvelle activité
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

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function consultationIcon(type: string): string {
  const icons: Record<string, string> = {
    cabinet: '\ud83c\udfe5',
    teleconsultation: '\ud83d\udcf1',
    urgences: '\ud83d\ude91',
    hospitalisation: '\ud83c\udfe8',
  }
  return icons[type] ?? '\ud83c\udfe5'
}

function transportIconHome(moyen: string): string {
  const icons: Record<string, string> = {
    voiture: '\ud83d\ude97',
    train: '\ud83d\ude84',
    metro: '\ud83d\ude87',
    bus: '\ud83d\ude8c',
    avion: '\u2708\ufe0f',
    velo: '\ud83d\udeb2',
    marche: '\ud83d\udeb6',
    moto: '\ud83c\udfcd\ufe0f',
    autre: '\ud83d\ude8d',
  }
  return icons[moyen] ?? '\ud83d\ude8d'
}

function painColorHome(niveau: number): string {
  if (niveau <= 2) return 'var(--color-success)'
  if (niveau <= 5) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

function chargeColorHome(niveau: number): string {
  if (niveau <= 3) return 'var(--color-success)'
  if (niveau <= 6) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

function sportIconHome(type: string): string {
  const icons: Record<string, string> = {
    course: '\ud83c\udfc3',
    velo: '\ud83d\udeb4',
    natation: '\ud83c\udfca',
    yoga: '\ud83e\uddd8',
    musculation: '\ud83c\udfcb\ufe0f',
    randonnee: '\u26f0\ufe0f',
    autre: '\ud83c\udfc5',
  }
  return icons[type] ?? '\ud83c\udfc5'
}
