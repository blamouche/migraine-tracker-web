export interface IAPreferences {
  consentGiven: boolean
  consentDate: string | null // ISO
  autoWeeklyAnalysis: boolean
  autoRiskRefinement: boolean
  excludeNotes: boolean
}

export const DEFAULT_IA_PREFERENCES: IAPreferences = {
  consentGiven: false,
  consentDate: null,
  autoWeeklyAnalysis: false,
  autoRiskRefinement: false,
  excludeNotes: false,
}

export interface IAPattern {
  id: string
  source: 'ia'
  label: string
  description: string
  confidence: number // 0-100
  status: 'detected' | 'validated' | 'rejected'
  detectedAt: string // ISO
  validatedAt: string | null
}

export interface IARecommendation {
  id: string
  text: string
  confidence: number // 0-100
  category: 'alimentation' | 'sommeil' | 'activite' | 'stress' | 'environnement' | 'autre'
  generatedAt: string // ISO
  status: 'active' | 'dismissed'
}

export interface IASummary {
  id: string
  period: '1m' | '3m' | '6m'
  detailLevel: 'synthetique' | 'detaille'
  language: 'fr' | 'en'
  content: string
  generatedAt: string // ISO
}

export interface IALogEntry {
  id: string
  date: string // ISO
  type: 'patterns' | 'recommendations' | 'summary' | 'risk-refinement'
  dataSummary: string
  trigger: 'manual' | 'auto'
}

export interface IARiskRefinement {
  probability: number // 0-100
  factors: { label: string; contribution: number }[]
  generatedAt: string // ISO
}

export const IA_RECOMMENDATION_CATEGORIES: Record<IARecommendation['category'], string> = {
  alimentation: 'Alimentation',
  sommeil: 'Sommeil',
  activite: 'Activité physique',
  stress: 'Gestion du stress',
  environnement: 'Environnement',
  autre: 'Autre',
}

export const MIN_CRISES_FOR_IA = 10
