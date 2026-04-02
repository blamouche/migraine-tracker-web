import type { CrisisEntry } from '@/types/crisis'
import type { DailyFactors } from '@/types/alimentaire'
import type { DetectedPattern, PeriodicityEstimate } from '@/types/patterns'
import {
  MIN_CRISES_FOR_PATTERNS,
  MIN_CONFIDENCE,
  MIN_OCCURRENCES,
  DECOMPRESSION_STRESS_HIGH,
  DECOMPRESSION_STRESS_LOW,
  DECOMPRESSION_HIGH_DAYS,
  MULTI_FACTOR_MIN_OCCURRENCES,
} from '@/types/patterns'

function generatePatternId(source: string, label: string): string {
  return `pattern-${source}-${label.toLowerCase().replace(/\s+/g, '-')}`
}

function singlePattern(
  base: Omit<DetectedPattern, 'factors' | 'validatedAt'>,
): DetectedPattern {
  return { ...base, factors: undefined, validatedAt: undefined }
}

function multiPattern(
  base: Omit<DetectedPattern, 'validatedAt'>,
): DetectedPattern {
  return { ...base, validatedAt: undefined }
}

// ─── US-08-01: Single-factor pattern detection ───

export function detectSingleFactorPatterns(
  crises: CrisisEntry[],
  dailyFactors: DailyFactors[],
): DetectedPattern[] {
  if (crises.length < MIN_CRISES_FOR_PATTERNS) return []

  const patterns: DetectedPattern[] = []
  const factorsByDate = new Map(dailyFactors.map((f) => [f.date, f]))
  const totalCrises = crises.length
  const now = new Date().toISOString()

  // ── Trigger-based patterns (from crisis data) ──
  const triggerCounts = new Map<string, number>()
  for (const crisis of crises) {
    for (const trigger of crisis.triggers) {
      triggerCounts.set(trigger, (triggerCounts.get(trigger) || 0) + 1)
    }
  }

  for (const [trigger, count] of triggerCounts) {
    const confidence = Math.round((count / totalCrises) * 100)
    if (confidence >= MIN_CONFIDENCE && count >= MIN_OCCURRENCES) {
      patterns.push(singlePattern({
        id: generatePatternId('declencheur', trigger),
        source: mapTriggerToSource(trigger),
        label: trigger,
        description: `${confidence}% de vos crises sont associées au déclencheur « ${trigger} »`,
        confidence,
        occurrences: count,
        totalCrises,
        status: 'detected',
        type: 'single',
        detectedAt: now,
      }))
    }
  }

  // ── Stress pattern ──
  const highStressCrises = crises.filter((c) => {
    const factors = factorsByDate.get(c.date)
    return factors && factors.stress >= 4
  })
  if (highStressCrises.length >= MIN_OCCURRENCES) {
    const confidence = Math.round((highStressCrises.length / totalCrises) * 100)
    if (confidence >= MIN_CONFIDENCE) {
      patterns.push(singlePattern({
        id: generatePatternId('stress', 'stress-eleve'),
        source: 'stress',
        label: 'Stress élevé',
        description: `${confidence}% de vos crises surviennent les jours de stress élevé (≥ 4/5)`,
        confidence,
        occurrences: highStressCrises.length,
        totalCrises,
        status: 'detected',
        type: 'single',
        detectedAt: now,
      }))
    }
  }

  // ── Sleep pattern ──
  const poorSleepCrises = crises.filter((c) => {
    const factors = factorsByDate.get(c.date)
    return factors && factors.sleepQuality <= 2
  })
  if (poorSleepCrises.length >= MIN_OCCURRENCES) {
    const confidence = Math.round((poorSleepCrises.length / totalCrises) * 100)
    if (confidence >= MIN_CONFIDENCE) {
      patterns.push(singlePattern({
        id: generatePatternId('sommeil', 'mauvais-sommeil'),
        source: 'sommeil',
        label: 'Mauvais sommeil',
        description: `${confidence}% de vos crises surviennent après une mauvaise nuit de sommeil (≤ 2/5)`,
        confidence,
        occurrences: poorSleepCrises.length,
        totalCrises,
        status: 'detected',
        type: 'single',
        detectedAt: now,
      }))
    }
  }

  // ── Hydration pattern ──
  const dehydratedCrises = crises.filter((c) => {
    const factors = factorsByDate.get(c.date)
    return factors && factors.hydration === 'insuffisante'
  })
  if (dehydratedCrises.length >= MIN_OCCURRENCES) {
    const confidence = Math.round((dehydratedCrises.length / totalCrises) * 100)
    if (confidence >= MIN_CONFIDENCE) {
      patterns.push(singlePattern({
        id: generatePatternId('alimentation', 'deshydratation'),
        source: 'alimentation',
        label: 'Déshydratation',
        description: `${confidence}% de vos crises surviennent les jours d'hydratation insuffisante`,
        confidence,
        occurrences: dehydratedCrises.length,
        totalCrises,
        status: 'detected',
        type: 'single',
        detectedAt: now,
      }))
    }
  }

  // ── Food-based patterns (using crisis triggers + food entries within 48h window) ──
  const foodTriggerCrises = crises.filter((c) =>
    c.triggers.some((t) => t.toLowerCase().includes('aliment')),
  )
  if (foodTriggerCrises.length >= MIN_OCCURRENCES) {
    const confidence = Math.round((foodTriggerCrises.length / totalCrises) * 100)
    if (confidence >= MIN_CONFIDENCE) {
      patterns.push(singlePattern({
        id: generatePatternId('alimentation', 'aliment-specifique'),
        source: 'alimentation',
        label: 'Aliment spécifique',
        description: `${confidence}% de vos crises sont liées à un aliment spécifique`,
        confidence,
        occurrences: foodTriggerCrises.length,
        totalCrises,
        status: 'detected',
        type: 'single',
        detectedAt: now,
      }))
    }
  }

  return patterns
}

// ─── US-08-04: Decompression migraine detection ───

export function detectDecompressionPattern(
  crises: CrisisEntry[],
  dailyFactors: DailyFactors[],
): DetectedPattern | null {
  if (crises.length < MIN_CRISES_FOR_PATTERNS) return null

  const sortedFactors = [...dailyFactors].sort((a, b) => a.date.localeCompare(b.date))
  if (sortedFactors.length < DECOMPRESSION_HIGH_DAYS + 1) return null

  const crisisDates = new Set(crises.map((c) => c.date))
  let decompressionCrises = 0

  for (let i = DECOMPRESSION_HIGH_DAYS; i < sortedFactors.length; i++) {
    const current = sortedFactors[i]!
    // Check if current day has a stress drop
    if (current.stress > DECOMPRESSION_STRESS_LOW) continue

    // Check if preceding days had high stress
    let highStressDays = 0
    for (let j = i - 1; j >= Math.max(0, i - DECOMPRESSION_HIGH_DAYS); j--) {
      if (sortedFactors[j]!.stress >= DECOMPRESSION_STRESS_HIGH) {
        highStressDays++
      }
    }

    if (highStressDays < DECOMPRESSION_HIGH_DAYS) continue

    // Check if crisis occurs on drop day or next day
    const dropDate = new Date(current.date + 'T00:00:00')
    const nextDay = new Date(dropDate)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().slice(0, 10)

    if (crisisDates.has(current.date) || crisisDates.has(nextDayStr)) {
      decompressionCrises++
    }
  }

  if (decompressionCrises < MIN_OCCURRENCES) return null

  const confidence = Math.round((decompressionCrises / crises.length) * 100)
  if (confidence < MIN_CONFIDENCE) return null

  return singlePattern({
    id: generatePatternId('charge_mentale', 'decompression'),
    source: 'charge_mentale',
    label: 'Migraine de décompression',
    description: `${confidence}% de vos crises surviennent dans les 24h suivant une chute de stress > ${DECOMPRESSION_STRESS_HIGH - DECOMPRESSION_STRESS_LOW} points`,
    confidence,
    occurrences: decompressionCrises,
    totalCrises: crises.length,
    status: 'detected',
    type: 'decompression',
    detectedAt: new Date().toISOString(),
  })
}

// ─── US-08-05: Multi-factor pattern detection ───

export function detectMultiFactorPatterns(
  crises: CrisisEntry[],
  dailyFactors: DailyFactors[],
): DetectedPattern[] {
  if (crises.length < MIN_CRISES_FOR_PATTERNS) return []

  const patterns: DetectedPattern[] = []
  const factorsByDate = new Map(dailyFactors.map((f) => [f.date, f]))
  const totalCrises = crises.length
  const now = new Date().toISOString()

  // ── Stress + Poor sleep ──
  const stressAndSleepCrises = crises.filter((c) => {
    const factors = factorsByDate.get(c.date)
    return factors && factors.stress >= 4 && factors.sleepQuality <= 2
  })
  if (stressAndSleepCrises.length >= MULTI_FACTOR_MIN_OCCURRENCES) {
    const confidence = Math.round((stressAndSleepCrises.length / totalCrises) * 100)
    if (confidence >= MIN_CONFIDENCE) {
      patterns.push(multiPattern({
        id: generatePatternId('multi', 'stress-sommeil'),
        source: 'stress',
        label: 'Stress élevé + Mauvais sommeil',
        description: `Stress élevé + moins de 6h de sommeil → crise dans les 48h dans ${confidence}% des cas`,
        confidence,
        occurrences: stressAndSleepCrises.length,
        totalCrises,
        status: 'detected',
        type: 'multi',
        factors: ['stress', 'sommeil'],
        detectedAt: now,
      }))
    }
  }

  // ── Stress + Dehydration ──
  const stressAndDehydrationCrises = crises.filter((c) => {
    const factors = factorsByDate.get(c.date)
    return factors && factors.stress >= 4 && factors.hydration === 'insuffisante'
  })
  if (stressAndDehydrationCrises.length >= MULTI_FACTOR_MIN_OCCURRENCES) {
    const confidence = Math.round((stressAndDehydrationCrises.length / totalCrises) * 100)
    if (confidence >= MIN_CONFIDENCE) {
      patterns.push(multiPattern({
        id: generatePatternId('multi', 'stress-hydratation'),
        source: 'stress',
        label: 'Stress élevé + Déshydratation',
        description: `Stress élevé + hydratation insuffisante → crise dans ${confidence}% des cas`,
        confidence,
        occurrences: stressAndDehydrationCrises.length,
        totalCrises,
        status: 'detected',
        type: 'multi',
        factors: ['stress', 'alimentation'],
        detectedAt: now,
      }))
    }
  }

  // ── Poor sleep + Dehydration ──
  const sleepAndDehydrationCrises = crises.filter((c) => {
    const factors = factorsByDate.get(c.date)
    return factors && factors.sleepQuality <= 2 && factors.hydration === 'insuffisante'
  })
  if (sleepAndDehydrationCrises.length >= MULTI_FACTOR_MIN_OCCURRENCES) {
    const confidence = Math.round((sleepAndDehydrationCrises.length / totalCrises) * 100)
    if (confidence >= MIN_CONFIDENCE) {
      patterns.push(multiPattern({
        id: generatePatternId('multi', 'sommeil-hydratation'),
        source: 'sommeil',
        label: 'Mauvais sommeil + Déshydratation',
        description: `Mauvais sommeil + hydratation insuffisante → crise dans ${confidence}% des cas`,
        confidence,
        occurrences: sleepAndDehydrationCrises.length,
        totalCrises,
        status: 'detected',
        type: 'multi',
        factors: ['sommeil', 'alimentation'],
        detectedAt: now,
      }))
    }
  }

  return patterns
}

// ─── US-08-06: Periodicity estimation ───

export function estimatePeriodicity(crises: CrisisEntry[]): PeriodicityEstimate | null {
  if (crises.length < 3) return null

  const sortedDates = [...crises]
    .map((c) => new Date(c.date + 'T00:00:00').getTime())
    .sort((a, b) => a - b)

  const intervals: number[] = []
  for (let i = 1; i < sortedDates.length; i++) {
    const diffDays = Math.round((sortedDates[i]! - sortedDates[i - 1]!) / (1000 * 60 * 60 * 24))
    if (diffDays > 0) intervals.push(diffDays)
  }

  if (intervals.length === 0) return null

  const sum = intervals.reduce((a, b) => a + b, 0)
  const avg = sum / intervals.length
  const min = Math.min(...intervals)
  const max = Math.max(...intervals)

  // Confidence based on variance — lower variance = higher confidence
  const variance = intervals.reduce((acc, v) => acc + (v - avg) ** 2, 0) / intervals.length
  const stdDev = Math.sqrt(variance)
  const cv = stdDev / avg // coefficient of variation
  const confidence = Math.max(10, Math.min(95, Math.round(100 * (1 - cv))))

  return {
    averageDays: Math.round(avg),
    minDays: min,
    maxDays: max,
    confidence,
    sampleSize: intervals.length,
  }
}

// ─── US-08-03: Daily risk calculation ───

import type { DailyRisk, RiskFactor } from '@/types/patterns'

export function calculateDailyRisk(
  validatedPatterns: DetectedPattern[],
  todayFactors: DailyFactors | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  crises: CrisisEntry[],
): DailyRisk {
  const now = new Date().toISOString()
  const factors: RiskFactor[] = []

  if (!todayFactors || validatedPatterns.length === 0) {
    return { level: 'faible', score: 0, factors: [], calculatedAt: now }
  }

  // Check each validated pattern against today's factors
  for (const pattern of validatedPatterns) {
    if (pattern.status !== 'validated') continue

    let isActive = false

    if (pattern.type === 'single') {
      switch (pattern.source) {
        case 'stress':
          isActive = todayFactors.stress >= 4
          break
        case 'sommeil':
          isActive = todayFactors.sleepQuality <= 2
          break
        case 'alimentation':
          if (pattern.id.includes('deshydratation')) {
            isActive = todayFactors.hydration === 'insuffisante'
          }
          break
      }
    }

    if (pattern.type === 'multi' && pattern.factors) {
      const factorChecks = pattern.factors.map((f) => {
        switch (f) {
          case 'stress': return todayFactors.stress >= 4
          case 'sommeil': return todayFactors.sleepQuality <= 2
          case 'alimentation': return todayFactors.hydration === 'insuffisante'
          default: return false
        }
      })
      isActive = factorChecks.every(Boolean)
    }

    if (pattern.type === 'decompression') {
      // Decompression needs recent stress history — simplified check
      isActive = todayFactors.stress <= DECOMPRESSION_STRESS_LOW
    }

    if (isActive) {
      factors.push({
        source: pattern.source,
        label: pattern.label,
        description: pattern.description,
        confidence: pattern.confidence,
      })
    }
  }

  // Calculate score: weighted average of active pattern confidences
  const score = factors.length === 0
    ? 0
    : Math.min(100, Math.round(
        factors.reduce((sum, f) => sum + f.confidence, 0) / factors.length +
        (factors.length - 1) * 10, // bonus for multiple active factors
      ))

  const level = score >= 70 ? 'eleve' : score >= 40 ? 'modere' : 'faible'

  return { level, score, factors, calculatedAt: now }
}

// ─── Run all detection ───

export function runFullDetection(
  crises: CrisisEntry[],
  dailyFactors: DailyFactors[],
): DetectedPattern[] {
  const patterns: DetectedPattern[] = []

  patterns.push(...detectSingleFactorPatterns(crises, dailyFactors))
  patterns.push(...detectMultiFactorPatterns(crises, dailyFactors))

  const decompression = detectDecompressionPattern(crises, dailyFactors)
  if (decompression) patterns.push(decompression)

  return patterns
}

// ─── Helpers ───

function mapTriggerToSource(trigger: string): DetectedPattern['source'] {
  const lower = trigger.toLowerCase()
  if (lower.includes('stress')) return 'stress'
  if (lower.includes('sommeil')) return 'sommeil'
  if (lower.includes('météo') || lower.includes('meteo')) return 'meteo'
  if (lower.includes('règles') || lower.includes('cycle')) return 'cycle'
  if (lower.includes('transport')) return 'transport'
  if (lower.includes('sport') || lower.includes('exercice')) return 'sport'
  if (lower.includes('aliment') || lower.includes('alcool') || lower.includes('café') || lower.includes('déshydrat')) return 'alimentation'
  if (lower.includes('charge') || lower.includes('mental')) return 'charge_mentale'
  return 'stress' // fallback
}
