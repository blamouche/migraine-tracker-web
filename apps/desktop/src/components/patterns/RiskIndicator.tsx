import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { usePatternStore } from '@/stores/patternStore'
import { useCrisisStore } from '@/stores/crisisStore'
import { useFoodStore } from '@/stores/foodStore'
import { RISK_LEVEL_CONFIG, MIN_CRISES_FOR_PATTERNS } from '@/types/patterns'

export function RiskIndicator() {
  const navigate = useNavigate()
  const { crises } = useCrisisStore()
  const { dailyFactors } = useFoodStore()
  const { patterns, dailyRisk, runDetection, updateDailyRisk, loadPatterns } = usePatternStore()

  useEffect(() => {
    loadPatterns()
  }, [loadPatterns])

  useEffect(() => {
    if (crises.length >= MIN_CRISES_FOR_PATTERNS) {
      runDetection(crises, dailyFactors)
    }
  }, [crises, dailyFactors, runDetection])

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const todayFactors = dailyFactors.find((f) => f.date === todayStr)
    updateDailyRisk(todayFactors, crises)
  }, [patterns, dailyFactors, crises, updateDailyRisk])

  // Don't show if not enough data or no validated patterns
  const hasValidated = patterns.some((p) => p.status === 'validated')
  if (crises.length < MIN_CRISES_FOR_PATTERNS || !dailyRisk || !hasValidated) {
    // Show a teaser if enough crises but no validated patterns
    const hasDetected = patterns.some((p) => p.status === 'detected')
    if (crises.length >= MIN_CRISES_FOR_PATTERNS && hasDetected) {
      return (
        <button
          type="button"
          onClick={() => navigate('/patterns')}
          className="w-full rounded-(--radius-xl) bg-(--color-bg-elevated) p-4 text-left hover:bg-(--color-bg-hover) transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-(--color-brand)">
                Patterns détectés
              </p>
              <p className="mt-0.5 text-xs text-(--color-text-secondary)">
                {patterns.filter((p) => p.status === 'detected').length} pattern(s) en attente de validation
              </p>
            </div>
            <span className="text-(--color-brand)">→</span>
          </div>
        </button>
      )
    }
    return null
  }

  const config = RISK_LEVEL_CONFIG[dailyRisk.level]

  return (
    <button
      type="button"
      onClick={() => navigate('/patterns')}
      className="w-full rounded-(--radius-xl) p-4 text-left transition-colors hover:opacity-90"
      style={{ backgroundColor: config.bgColor }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-(--color-text-muted)">Risque du jour</p>
          <p className="mt-0.5 text-lg font-bold" style={{ color: config.color }}>
            {config.label}
          </p>
          {dailyRisk.factors.length > 0 && (
            <p className="mt-1 text-xs text-(--color-text-secondary)">
              {dailyRisk.factors.map((f) => f.label).join(' · ')}
            </p>
          )}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: config.color }}
        >
          {dailyRisk.score}
        </div>
      </div>
    </button>
  )
}
