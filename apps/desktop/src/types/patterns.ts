// ─── Pattern detection types (E08) ───

export type PatternSource =
  | 'alimentation'
  | 'stress'
  | 'sommeil'
  | 'meteo'
  | 'cycle'
  | 'transport'
  | 'sport'
  | 'charge_mentale'

export type PatternStatus = 'detected' | 'validated' | 'rejected'

export type RiskLevel = 'faible' | 'modere' | 'eleve'

export interface DetectedPattern {
  id: string
  source: PatternSource
  label: string // e.g. "Stress élevé"
  description: string // e.g. "72% de vos crises surviennent après un stress ≥ 4"
  confidence: number // 0-100
  occurrences: number
  totalCrises: number
  status: PatternStatus
  type: 'single' | 'multi' | 'decompression' | 'periodicity'
  factors: string[] | undefined // for multi-factor patterns
  detectedAt: string // ISO
  validatedAt: string | undefined // ISO
}

export interface ValidatedPatternFile {
  patterns: DetectedPattern[]
  updatedAt: string // ISO
}

export interface RiskFactor {
  source: PatternSource
  label: string
  description: string
  confidence: number
}

export interface DailyRisk {
  level: RiskLevel
  score: number // 0-100
  factors: RiskFactor[]
  calculatedAt: string // ISO
}

export interface PeriodicityEstimate {
  averageDays: number
  minDays: number
  maxDays: number
  confidence: number // 0-100
  sampleSize: number
}

export const RISK_LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; bgColor: string }> = {
  faible: { label: 'Faible', color: 'var(--color-success)', bgColor: 'var(--color-success-light)' },
  modere: { label: 'Modéré', color: 'var(--color-warning)', bgColor: 'var(--color-warning-light)' },
  eleve: { label: 'Élevé', color: 'var(--color-danger)', bgColor: 'var(--color-danger-light)' },
}

export const PATTERN_SOURCE_LABELS: Record<PatternSource, string> = {
  alimentation: 'Alimentation',
  stress: 'Stress',
  sommeil: 'Sommeil',
  meteo: 'Météo',
  cycle: 'Cycle menstruel',
  transport: 'Transport',
  sport: 'Sport',
  charge_mentale: 'Charge mentale',
}

export const MIN_CRISES_FOR_PATTERNS = 10
export const MIN_CONFIDENCE = 60
export const MIN_OCCURRENCES = 5
export const DECOMPRESSION_STRESS_HIGH = 7
export const DECOMPRESSION_STRESS_LOW = 4
export const DECOMPRESSION_HIGH_DAYS = 3
export const MULTI_FACTOR_MIN_OCCURRENCES = 5
