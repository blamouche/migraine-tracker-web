import type { CrisisEntry } from '@/types/crisis'
import type { DailyFactors } from '@/types/alimentaire'

export interface AnonymizedCrisis {
  date: string
  startTime: string
  intensity: number
  treatments: string[]
  symptoms: string[]
  triggers: string[]
  estimatedDuration: number | null
  hit6Score: number | null
}

export interface AnonymizedFactors {
  date: string
  stress: number | null
  sommeil: number | null
  hydratation: number | null
}

export interface AnonymizedDataset {
  crises: AnonymizedCrisis[]
  dailyFactors: AnonymizedFactors[]
  metadata: {
    totalCrises: number
    periodDays: number
    generatedAt: string
  }
}

export function anonymizeCrisis(crisis: CrisisEntry): AnonymizedCrisis {
  return {
    date: crisis.date,
    startTime: crisis.startTime,
    intensity: crisis.intensity,
    treatments: crisis.treatments,
    symptoms: crisis.symptoms,
    triggers: crisis.triggers,
    estimatedDuration: crisis.estimatedDuration,
    hit6Score: crisis.hit6Score,
    // Notes are NEVER sent — even if excludeNotes is false, we strip them
    // The excludeNotes flag is for additional fields in other contexts
  }
}

export function anonymizeFactors(factors: DailyFactors): AnonymizedFactors {
  return {
    date: factors.date,
    stress: factors.stress,
    sommeil: factors.sleepQuality,
    hydratation: factors.hydration === 'bonne' ? 1 : 0,
  }
}

export function buildAnonymizedDataset(
  crises: CrisisEntry[],
  dailyFactors: DailyFactors[],
): AnonymizedDataset {
  const sortedCrises = [...crises].sort((a, b) => a.date.localeCompare(b.date))
  const firstDate = sortedCrises[0]?.date ?? ''
  const lastDate = sortedCrises[sortedCrises.length - 1]?.date ?? ''

  const periodDays = firstDate && lastDate
    ? Math.ceil((new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return {
    crises: sortedCrises.map((c) => anonymizeCrisis(c)),
    dailyFactors: dailyFactors.map(anonymizeFactors),
    metadata: {
      totalCrises: crises.length,
      periodDays,
      generatedAt: new Date().toISOString(),
    },
  }
}

export function previewAnonymizedData(
  crises: CrisisEntry[],
  dailyFactors: DailyFactors[],
): string {
  const dataset = buildAnonymizedDataset(crises, dailyFactors)
  return JSON.stringify(dataset, null, 2)
}
