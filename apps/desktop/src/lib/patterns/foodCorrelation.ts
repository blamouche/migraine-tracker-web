import type { FoodEntry, FoodRiskScore, FoodCorrelation } from '@/types/alimentaire'
import type { CrisisEntry } from '@/types/crisis'
import { MIN_OCCURRENCES, MIN_CONFIDENCE } from '@/types/patterns'

const LOOKBACK_HOURS = 48

/**
 * US-03-03: Compute a personal risk score for each food based on
 * how often it precedes a crisis within 48h.
 */
export function computeFoodRiskScores(
  foodEntries: FoodEntry[],
  crises: CrisisEntry[],
): Map<string, FoodRiskScore> {
  const scores = new Map<string, FoodRiskScore>()
  if (foodEntries.length === 0 || crises.length === 0) return scores

  // Build crisis timestamps for quick lookup
  const crisisTimestamps = crises.map((c) => {
    const [h, m] = (c.startTime ?? '12:00').split(':').map(Number)
    const d = new Date(c.date + 'T00:00:00')
    d.setHours(h ?? 12, m ?? 0)
    return d.getTime()
  }).sort((a, b) => a - b)

  // Count per food: total occurrences & how many precede a crisis within 48h
  const foodStats = new Map<string, { occurrences: number; crisisPreceded: number }>()

  for (const entry of foodEntries) {
    const [h, m] = entry.time.split(':').map(Number)
    const mealDate = new Date(entry.date + 'T00:00:00')
    mealDate.setHours(h ?? 12, m ?? 0)
    const mealTs = mealDate.getTime()
    const windowEnd = mealTs + LOOKBACK_HOURS * 60 * 60 * 1000

    // Check if any crisis falls in [mealTime, mealTime + 48h]
    const hasCrisis = crisisTimestamps.some((ct) => ct >= mealTs && ct <= windowEnd)

    for (const food of entry.foods) {
      const stat = foodStats.get(food) ?? { occurrences: 0, crisisPreceded: 0 }
      stat.occurrences++
      if (hasCrisis) stat.crisisPreceded++
      foodStats.set(food, stat)
    }
  }

  for (const [foodName, stat] of foodStats) {
    if (stat.occurrences < MIN_OCCURRENCES) continue
    const score = Math.round((stat.crisisPreceded / stat.occurrences) * 100)
    scores.set(foodName, {
      foodName,
      score,
      occurrences: stat.occurrences,
      crisisPreceded: stat.crisisPreceded,
    })
  }

  return scores
}

/**
 * US-03-05: Detect food/crisis correlations for the dashboard.
 * Returns only correlations with confidence >= 60% and >= 5 occurrences.
 */
export function detectFoodCorrelations(
  foodEntries: FoodEntry[],
  crises: CrisisEntry[],
): FoodCorrelation[] {
  const scores = computeFoodRiskScores(foodEntries, crises)
  const correlations: FoodCorrelation[] = []

  for (const [, risk] of scores) {
    if (risk.score < MIN_CONFIDENCE) continue

    correlations.push({
      foodName: risk.foodName,
      crisisCount: risk.crisisPreceded,
      occurrenceCount: risk.occurrences,
      confidence: risk.score,
      description: `${risk.foodName} précède une crise dans ${risk.score}% des cas dans les 48h`,
    })
  }

  return correlations.sort((a, b) => b.confidence - a.confidence)
}
