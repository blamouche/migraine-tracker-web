export interface CrisisEntry {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string | null
  intensity: number // 1-10
  treatments: string[]
  symptoms: string[]
  triggers: string[]
  location: string | null
  notes: string | null
  hit6Score: number | null
  status: 'incomplet' | 'complet'
  completionForcee: boolean
  estimatedDuration: number | null // minutes
  createdAt: string // ISO
  updatedAt: string // ISO
}

export interface QuickCrisisData {
  startTime: string
  intensity: number
  treatments: string[]
}

export type CrisisFormData = Omit<CrisisEntry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'completionForcee'>

export const INTENSITY_LABELS: Record<number, string> = {
  1: 'Imperceptible',
  2: 'Très légère',
  3: 'Légère',
  4: 'Modérée',
  5: 'Inconfortable',
  6: 'Pénible',
  7: 'Difficile',
  8: 'Intense',
  9: 'Très intense',
  10: 'Insupportable',
}

export const DEFAULT_TREATMENTS = [
  'Paracétamol',
  'Ibuprofène',
  'Triptan',
  'Aspirine',
  'Anti-nausée',
  'Caféine',
  'Repos',
  'Glaçage',
]

export const DEFAULT_SYMPTOMS = [
  'Nausée',
  'Photophobie',
  'Phonophobie',
  'Aura visuelle',
  'Vertige',
  'Fatigue',
  'Raideur nuque',
  'Troubles concentration',
]

export const DEFAULT_TRIGGERS = [
  'Stress',
  'Mauvais sommeil',
  'Alcool',
  'Variation météo',
  'Écran prolongé',
  'Repas sauté',
  'Déshydratation',
  'Règles',
  'Aliment spécifique',
]

export const DEFAULT_DURATION_MAP: Record<number, number> = {
  1: 30,
  2: 60,
  3: 120,
  4: 180,
  5: 240,
  6: 360,
  7: 480,
  8: 720,
  9: 1080,
  10: 1440,
}

export const HIT6_QUESTIONS = [
  'Quand vous avez des maux de tête, la douleur est-elle sévère ?',
  'Vos maux de tête limitent-ils votre capacité à faire vos activités quotidiennes habituelles ?',
  'Quand vous avez un mal de tête, souhaiteriez-vous pouvoir vous allonger ?',
  'Au cours des 4 dernières semaines, vous êtes-vous senti(e) trop fatigué(e) pour travailler ou faire vos activités quotidiennes à cause de vos maux de tête ?',
  'Au cours des 4 dernières semaines, en avez-vous eu assez ou vous êtes-vous senti(e) irrité(e) à cause de vos maux de tête ?',
  'Au cours des 4 dernières semaines, vos maux de tête ont-ils limité votre capacité à vous concentrer sur votre travail ou vos activités quotidiennes ?',
]

export const HIT6_OPTIONS = [
  { label: 'Jamais', value: 6 },
  { label: 'Rarement', value: 8 },
  { label: 'Parfois', value: 10 },
  { label: 'Très souvent', value: 11 },
  { label: 'Toujours', value: 13 },
]

export function interpretHit6Score(score: number): string {
  if (score <= 49) return 'Impact faible ou nul'
  if (score <= 55) return 'Impact modéré'
  if (score <= 59) return 'Impact important'
  return 'Impact très sévère'
}
