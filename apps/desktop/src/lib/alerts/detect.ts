import type { CrisisEntry } from '@/types/crisis'
import type { FoodEntry } from '@/types/alimentaire'
import type { Alert, AlertPreferences } from '@/types/alerts'

function generateId(): string {
  return crypto.randomUUID()
}

function currentMonth(): { year: number; month: number; from: string; to: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const from = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { year, month, from, to }
}

function crisesThisMonth(crises: CrisisEntry[]): CrisisEntry[] {
  const { from, to } = currentMonth()
  return crises.filter((c) => c.date >= from && c.date <= to)
}

export function detectAlerts(
  crises: CrisisEntry[],
  foodEntries: FoodEntry[],
  preferences: AlertPreferences,
  isDismissedThisMonth: (key: string) => boolean,
): Alert[] {
  const alerts: Alert[] = []
  const now = new Date().toISOString()
  const monthCrises = crisesThisMonth(crises)

  // US-06-01: High frequency alert
  if (preferences.enableFrequencyAlert && !isDismissedThisMonth('high-frequency')) {
    const uniqueDays = new Set(monthCrises.map((c) => c.date)).size
    if (uniqueDays >= preferences.frequencyThreshold) {
      alerts.push({
        id: generateId(),
        type: 'high-frequency',
        title: 'Fréquence élevée détectée',
        message: `Vous avez atteint ${uniqueDays} jours de migraine ce mois-ci. Cette information peut être utile lors de votre prochaine consultation.`,
        severity: 'warning',
        dismissedAt: null,
        createdAt: now,
      })
    }
  }

  // US-06-02: Triptan overuse alert
  if (preferences.enableTriptanAlert && !isDismissedThisMonth('triptan-overuse')) {
    const triptanCount = monthCrises.reduce((count, c) => {
      return count + c.treatments.filter((t) => t.toLowerCase().includes('triptan')).length
    }, 0)

    if (triptanCount >= preferences.triptanThreshold) {
      alerts.push({
        id: generateId(),
        type: 'triptan-overuse',
        title: 'Prise fréquente de triptans',
        message: `Vous avez pris ${triptanCount} triptans ce mois-ci. Un usage fréquent peut entraîner des céphalées de rebond — à évoquer avec votre médecin.`,
        severity: 'danger',
        dismissedAt: null,
        createdAt: now,
      })
    }
  }

  // US-06-06: Food trigger correlation (simplified — checks foods appearing before crises)
  if (preferences.enableFoodTriggerAlert && foodEntries.length > 0 && crises.length >= 5) {
    const crisisDates = new Set(crises.map((c) => c.date))
    const foodBeforeCrisis = new Map<string, { before: number; total: number }>()

    for (const entry of foodEntries) {
      // Check if a crisis happened same day or next day
      const entryDate = new Date(entry.date + 'T00:00:00')
      const nextDay = new Date(entryDate)
      nextDay.setDate(nextDay.getDate() + 1)
      const nextDayStr = nextDay.toISOString().slice(0, 10)

      const precededCrisis = crisisDates.has(entry.date) || crisisDates.has(nextDayStr)

      for (const food of entry.foods) {
        const existing = foodBeforeCrisis.get(food) ?? { before: 0, total: 0 }
        existing.total++
        if (precededCrisis) existing.before++
        foodBeforeCrisis.set(food, existing)
      }
    }

    for (const [food, stats] of foodBeforeCrisis) {
      if (stats.total < 3) continue // need enough data
      const correlation = Math.round((stats.before / stats.total) * 100)

      if (
        correlation >= preferences.foodCorrelationThreshold &&
        !isDismissedThisMonth(`food-trigger:${food}`)
      ) {
        alerts.push({
          id: generateId(),
          type: 'food-trigger',
          title: 'Déclencheur alimentaire détecté',
          message: `Corrélation forte détectée : ${food} précède une crise dans ${correlation}% de vos cas (${stats.before}/${stats.total}).`,
          severity: 'info',
          dismissedAt: null,
          createdAt: now,
        })
      }
    }
  }

  return alerts
}
