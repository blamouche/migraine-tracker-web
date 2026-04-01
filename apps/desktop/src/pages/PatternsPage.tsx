import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { usePatternStore } from '@/stores/patternStore'
import { useCrisisStore } from '@/stores/crisisStore'
import { useFoodStore } from '@/stores/foodStore'
import {
  MIN_CRISES_FOR_PATTERNS,
  PATTERN_SOURCE_LABELS,
  RISK_LEVEL_CONFIG,
} from '@/types/patterns'
import type { DetectedPattern } from '@/types/patterns'

export function PatternsPage() {
  const navigate = useNavigate()
  const { crises, loadCrises } = useCrisisStore()
  const { dailyFactors, loadDailyFactors } = useFoodStore()
  const {
    patterns,
    periodicity,
    dailyRisk,
    loadPatterns,
    runDetection,
    validatePattern,
    rejectPattern,
    updateDailyRisk,
  } = usePatternStore()

  useEffect(() => {
    if (crises.length === 0) loadCrises()
    if (dailyFactors.length === 0) loadDailyFactors()
    loadPatterns()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (crises.length > 0) {
      runDetection(crises, dailyFactors)
    }
  }, [crises, dailyFactors, runDetection])

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const todayFactors = dailyFactors.find((f) => f.date === todayStr)
    updateDailyRisk(todayFactors, crises)
  }, [patterns, dailyFactors, crises, updateDailyRisk])

  const notEnoughData = crises.length < MIN_CRISES_FOR_PATTERNS
  const detectedPatterns = patterns.filter((p) => p.status === 'detected')
  const validatedPatterns = patterns.filter((p) => p.status === 'validated')
  const rejectedPatterns = patterns.filter((p) => p.status === 'rejected')

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-[800px] px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Patterns & Risque</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
          >
            Retour
          </button>
        </div>

        {/* Daily risk indicator (US-08-03) */}
        {dailyRisk && !notEnoughData && (
          <div className="mt-6">
            <RiskCard risk={dailyRisk} />
          </div>
        )}

        {/* Not enough data message */}
        {notEnoughData && (
          <div className="mt-8 rounded-(--radius-xl) bg-(--color-bg-elevated) p-8 text-center">
            <p className="text-lg font-medium">Données insuffisantes</p>
            <p className="mt-2 text-sm text-(--color-text-secondary)">
              Un minimum de {MIN_CRISES_FOR_PATTERNS} crises est requis pour détecter des
              patterns fiables. Vous avez actuellement {crises.length} crise
              {crises.length > 1 ? 's' : ''}.
            </p>
          </div>
        )}

        {/* Detected patterns — awaiting validation (US-08-02) */}
        {detectedPatterns.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-(--color-text-primary)">
              Patterns détectés
            </h2>
            <p className="mt-1 text-xs text-(--color-text-muted)">
              Validez ou rejetez les patterns pour alimenter votre indicateur de risque.
            </p>
            <div className="mt-4 space-y-3">
              {detectedPatterns.map((p) => (
                <PatternCard
                  key={p.id}
                  pattern={p}
                  onValidate={() => validatePattern(p.id)}
                  onReject={() => rejectPattern(p.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Validated patterns */}
        {validatedPatterns.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-(--color-text-primary)">
              Patterns validés
            </h2>
            <div className="mt-4 space-y-3">
              {validatedPatterns.map((p) => (
                <PatternCard key={p.id} pattern={p} />
              ))}
            </div>
          </section>
        )}

        {/* Periodicity (US-08-06) */}
        {periodicity && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-(--color-text-primary)">
              Périodicité estimée
            </h2>
            <div className="mt-4 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <p className="text-sm">
                Une crise survient en moyenne tous les{' '}
                <span className="font-bold text-(--color-brand)">{periodicity.averageDays} jours</span>
              </p>
              <div className="mt-3 flex gap-6 text-xs text-(--color-text-muted)">
                <span>Min : {periodicity.minDays}j</span>
                <span>Moy : {periodicity.averageDays}j</span>
                <span>Max : {periodicity.maxDays}j</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-(--color-bg-subtle)">
                  <div
                    className="h-1.5 rounded-full bg-(--color-brand)"
                    style={{ width: `${periodicity.confidence}%` }}
                  />
                </div>
                <span className="text-xs text-(--color-text-muted)">
                  {periodicity.confidence}% confiance
                </span>
              </div>
              <p className="mt-2 text-xs text-(--color-text-muted)">
                Basé sur {periodicity.sampleSize} intervalle{periodicity.sampleSize > 1 ? 's' : ''}
              </p>
            </div>
          </section>
        )}

        {/* Rejected patterns */}
        {rejectedPatterns.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-(--color-text-muted)">
              Patterns rejetés
            </h2>
            <div className="mt-4 space-y-3 opacity-60">
              {rejectedPatterns.map((p) => (
                <PatternCard key={p.id} pattern={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

// ─── Sub-components ───

function RiskCard({ risk }: { risk: NonNullable<ReturnType<typeof usePatternStore.getState>['dailyRisk']> }) {
  const config = RISK_LEVEL_CONFIG[risk.level]

  return (
    <div
      className="rounded-(--radius-xl) p-6"
      style={{ backgroundColor: config.bgColor }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-(--color-text-muted)">Risque du jour</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: config.color }}>
            {config.label}
          </p>
        </div>
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
          style={{ backgroundColor: config.color }}
        >
          {risk.score}
        </div>
      </div>

      {risk.factors.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-(--color-text-muted)">Facteurs actifs :</p>
          {risk.factors.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="font-medium">{f.label}</span>
              <span className="text-xs text-(--color-text-muted)">({f.confidence}%)</span>
            </div>
          ))}
        </div>
      )}

      {risk.factors.length === 0 && (
        <p className="mt-3 text-sm text-(--color-text-secondary)">
          Aucun facteur de risque actif aujourd'hui.
        </p>
      )}
    </div>
  )
}

function PatternCard({
  pattern,
  onValidate,
  onReject,
}: {
  pattern: DetectedPattern
  onValidate?: () => void
  onReject?: () => void
}) {
  const typeLabels: Record<string, string> = {
    single: 'Simple',
    multi: 'Multi-facteurs',
    decompression: 'Décompression',
    periodicity: 'Périodicité',
  }

  return (
    <div className="rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{pattern.label}</span>
            <span className="rounded-(--radius-full) bg-(--color-bg-subtle) px-2 py-0.5 text-[10px] text-(--color-text-muted)">
              {PATTERN_SOURCE_LABELS[pattern.source]}
            </span>
            <span className="rounded-(--radius-full) bg-(--color-bg-subtle) px-2 py-0.5 text-[10px] text-(--color-text-muted)">
              {typeLabels[pattern.type]}
            </span>
          </div>
          <p className="mt-1 text-xs text-(--color-text-secondary)">{pattern.description}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-(--color-text-muted)">
            <span>{pattern.occurrences}/{pattern.totalCrises} crises</span>
            <div className="flex items-center gap-1">
              <div className="h-1 w-16 rounded-full bg-(--color-bg-subtle)">
                <div
                  className="h-1 rounded-full bg-(--color-brand)"
                  style={{ width: `${pattern.confidence}%` }}
                />
              </div>
              <span>{pattern.confidence}%</span>
            </div>
          </div>
        </div>

        {pattern.status === 'detected' && onValidate && onReject && (
          <div className="ml-4 flex gap-2">
            <button
              type="button"
              onClick={onValidate}
              className="rounded-(--radius-md) bg-(--color-success) px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
            >
              Valider
            </button>
            <button
              type="button"
              onClick={onReject}
              className="rounded-(--radius-md) bg-(--color-bg-subtle) px-3 py-1.5 text-xs font-medium text-(--color-text-muted) hover:bg-(--color-bg-hover)"
            >
              Rejeter
            </button>
          </div>
        )}

        {pattern.status === 'validated' && (
          <span className="ml-4 text-xs font-medium text-(--color-success)">Validé</span>
        )}
        {pattern.status === 'rejected' && (
          <span className="ml-4 text-xs font-medium text-(--color-text-muted)">Rejeté</span>
        )}
      </div>
    </div>
  )
}
