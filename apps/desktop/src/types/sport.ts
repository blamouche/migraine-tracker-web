export interface SportEntry {
  id: string
  date: string // YYYY-MM-DD
  heure: string // HH:mm
  type: SportType
  dureeMinutes: number
  intensite: number // 1-5
  conditions: string[]
  fcMax: number | null // optionnel
  hydratation: HydratationLevel
  notes: string | null
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type SportFormData = Omit<SportEntry, 'id' | 'createdAt' | 'updatedAt'>

export type SportType =
  | 'course'
  | 'velo'
  | 'natation'
  | 'yoga'
  | 'musculation'
  | 'randonnee'
  | 'autre'

export type HydratationLevel = 'insuffisante' | 'normale' | 'bonne'

export const SPORT_TYPE_LABELS: Record<SportType, string> = {
  course: 'Course à pied',
  velo: 'Vélo',
  natation: 'Natation',
  yoga: 'Yoga',
  musculation: 'Musculation',
  randonnee: 'Randonnée',
  autre: 'Autre',
}

export const SPORT_INTENSITE_LABELS: Record<number, string> = {
  1: 'Très légère — récupération active',
  2: 'Légère — effort modéré, conversation facile',
  3: 'Modérée — effort soutenu, conversation possible',
  4: 'Intense — effort important, conversation difficile',
  5: 'Très intense — effort maximal',
}

export const HYDRATATION_LABELS: Record<HydratationLevel, string> = {
  insuffisante: 'Insuffisante',
  normale: 'Normale',
  bonne: 'Bonne',
}

export const DEFAULT_SPORT_CONDITIONS = [
  'Chaleur',
  'Froid',
  'Altitude',
  'Humidité',
  'Pollution',
  'Intérieur',
  'Extérieur',
]
