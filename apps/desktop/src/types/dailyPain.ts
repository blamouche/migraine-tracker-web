export interface DailyPainEntry {
  id: string
  date: string // YYYY-MM-DD
  niveau: number // 0-10
  lieeACrise: boolean
  criseId: string | null
  notes: string | null
  source?: 'web' | 'mobile' | undefined
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type DailyPainFormData = Omit<DailyPainEntry, 'id' | 'createdAt' | 'updatedAt'>

export const PAIN_NIVEAU_LABELS: Record<number, string> = {
  0: 'Aucune douleur',
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
