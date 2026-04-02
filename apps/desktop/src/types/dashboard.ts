export type DateRangePreset = '7d' | '1m' | '3m' | '6m' | '1y' | 'ytd' | 'all'

export interface DateRange {
  from: string // YYYY-MM-DD
  to: string // YYYY-MM-DD
}

export type DashboardTab = 'crises' | 'declencheurs' | 'meteo' | 'traitements'

export interface KpiData {
  frequency: number // crises per month on period
  avgIntensity: number
  avgDurationMinutes: number
  totalCrises: number
  topTreatments: { name: string; count: number; efficacy: number }[]
  topTriggers: { name: string; count: number }[]
  avgHit6: number | null
  highFrequency: boolean // >= 4 days/month
}

export interface CalendarDay {
  day: string // YYYY-MM-DD
  value: number // pain level 0-10
  hasCrisis: boolean
  crisisIntensity?: number
}

export interface FrequencyDataPoint {
  month: string // 'Jan', 'Fév', etc.
  count: number
}

export interface IntensityDataPoint {
  x: string // YYYY-MM-DD
  y: number // intensity
}

export interface TreatmentEfficacy {
  treatment: string
  totalUses: number
  effective: number // times crisis resolved quickly
  partial: number
  ineffective: number
}
