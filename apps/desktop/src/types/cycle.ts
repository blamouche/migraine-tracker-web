export interface CycleEntry {
  id: string
  dateDebut: string // YYYY-MM-DD
  dureeJours: number
  intensiteSymptomes: number // 1-5
  phase: CyclePhase
  contraception: ContraceptionType
  symptomes: string[]
  notes: string | null
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type CycleFormData = Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'>

export type CyclePhase = 'menstruelle' | 'folliculaire' | 'ovulatoire' | 'luteale'

export type ContraceptionType =
  | 'aucune'
  | 'pilule-combinee'
  | 'progestative'
  | 'diu-hormonal'
  | 'diu-cuivre'
  | 'autre'

export const CYCLE_PHASE_LABELS: Record<CyclePhase, string> = {
  menstruelle: 'Menstruelle',
  folliculaire: 'Folliculaire',
  ovulatoire: 'Ovulatoire',
  luteale: 'Lutéale',
}

export const CONTRACEPTION_TYPE_LABELS: Record<ContraceptionType, string> = {
  aucune: 'Aucune',
  'pilule-combinee': 'Pilule combinée',
  progestative: 'Progestative',
  'diu-hormonal': 'DIU hormonal',
  'diu-cuivre': 'DIU cuivre',
  autre: 'Autre',
}

export const INTENSITE_SYMPTOMES_LABELS: Record<number, string> = {
  1: 'Très faible',
  2: 'Faible',
  3: 'Modérée',
  4: 'Forte',
  5: 'Très forte',
}

export const DEFAULT_CYCLE_SYMPTOMES = [
  'Crampes',
  'Ballonnements',
  'Maux de tête',
  'Fatigue',
  'Irritabilité',
  'Douleurs lombaires',
  'Sensibilité mammaire',
  'Troubles du sommeil',
]

export function calculatePhase(dateDebut: string, dureeJours: number, dateReference?: string): CyclePhase {
  const start = new Date(dateDebut + 'T00:00:00')
  const ref = dateReference ? new Date(dateReference + 'T00:00:00') : new Date()
  const daysSinceStart = Math.floor((ref.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceStart < dureeJours) return 'menstruelle'
  if (daysSinceStart < 13) return 'folliculaire'
  if (daysSinceStart < 16) return 'ovulatoire'
  return 'luteale'
}

export function isInCatamenialWindow(dateDebut: string, dateReference?: string): boolean {
  const start = new Date(dateDebut + 'T00:00:00')
  const ref = dateReference ? new Date(dateReference + 'T00:00:00') : new Date()
  const daysSinceStart = Math.floor((ref.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  // Window: 2 days before start to 3 days after start
  return daysSinceStart >= -2 && daysSinceStart <= 3
}
