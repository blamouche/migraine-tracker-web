export interface FoodEntry {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  mealType: MealType
  foods: string[]
  notes: string | null
  status: 'incomplet' | 'complet'
  completionForcee: boolean
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type MealType = 'petit-dejeuner' | 'dejeuner' | 'diner' | 'collation'

export type FoodFormData = Omit<FoodEntry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'completionForcee'>

export interface DailyFactors {
  date: string // YYYY-MM-DD
  stress: number // 1-5
  sleepQuality: number // 1-5
  hydration: 'bonne' | 'insuffisante'
  createdAt: string // ISO
  updatedAt: string // ISO
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  'petit-dejeuner': 'Petit-déjeuner',
  'dejeuner': 'Déjeuner',
  'diner': 'Dîner',
  'collation': 'Collation',
}

export const STRESS_LABELS: Record<number, string> = {
  1: 'Très calme',
  2: 'Calme',
  3: 'Modéré',
  4: 'Élevé',
  5: 'Très élevé',
}

export const SLEEP_LABELS: Record<number, string> = {
  1: 'Très mauvaise',
  2: 'Mauvaise',
  3: 'Correcte',
  4: 'Bonne',
  5: 'Excellente',
}

export const DEFAULT_FOODS = [
  { name: 'Fromage affiné', tags: ['tyramine', 'histamine'] },
  { name: 'Chocolat', tags: ['tyramine', 'caféine'] },
  { name: 'Vin rouge', tags: ['histamine', 'sulfites'] },
  { name: 'Bière', tags: ['histamine', 'tyramine'] },
  { name: 'Agrumes', tags: ['histamine'] },
  { name: 'Charcuterie', tags: ['nitrites', 'tyramine'] },
  { name: 'Café', tags: ['caféine'] },
  { name: 'Thé', tags: ['caféine'] },
  { name: 'Banane', tags: ['tyramine'] },
  { name: 'Avocat', tags: ['tyramine'] },
  { name: 'Soja', tags: ['tyramine'] },
  { name: 'Noix', tags: ['tyramine'] },
  { name: 'Glutamate (MSG)', tags: ['glutamate'] },
  { name: 'Aspartame', tags: ['additifs'] },
  { name: 'Alcool fort', tags: ['histamine'] },
]

export const RISK_TAGS = [
  'tyramine',
  'histamine',
  'caféine',
  'additifs',
  'glutamate',
  'nitrites',
  'sulfites',
] as const

export type RiskTag = (typeof RISK_TAGS)[number]
