export interface ChargeMentaleEntry {
  id: string
  date: string // YYYY-MM-DD
  niveau: number // 1-10
  domaine: ChargeDomaine
  humeur: HumeurLevel
  contexte: string[]
  notes: string | null
  source?: 'web' | 'mobile' | undefined
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type ChargeMentaleFormData = Omit<ChargeMentaleEntry, 'id' | 'createdAt' | 'updatedAt'>

export type ChargeDomaine =
  | 'professionnel'
  | 'personnel'
  | 'familial'
  | 'sante'
  | 'financier'
  | 'autre'

export type HumeurLevel = 'tres-bonne' | 'bonne' | 'neutre' | 'mauvaise' | 'tres-mauvaise'

export const CHARGE_DOMAINE_LABELS: Record<ChargeDomaine, string> = {
  professionnel: 'Professionnel',
  personnel: 'Personnel',
  familial: 'Familial',
  sante: 'Santé',
  financier: 'Financier',
  autre: 'Autre',
}

export const HUMEUR_LABELS: Record<HumeurLevel, string> = {
  'tres-bonne': 'Très bonne',
  bonne: 'Bonne',
  neutre: 'Neutre',
  mauvaise: 'Mauvaise',
  'tres-mauvaise': 'Très mauvaise',
}

export const CHARGE_NIVEAU_LABELS: Record<number, string> = {
  1: 'Serein — aucune pression',
  2: 'Très léger — quelques pensées',
  3: 'Léger — gérable sans effort',
  4: 'Modéré — petites tensions',
  5: 'Moyen — charge perceptible',
  6: 'Significatif — besoin de pauses',
  7: 'Élevé — difficulté à décrocher',
  8: 'Intense — épuisement proche',
  9: 'Très intense — surcharge',
  10: 'Insoutenable — burnout imminent',
}

export const DEFAULT_CONTEXTES = [
  'Deadline',
  'Conflit',
  'Surcharge travail',
  'Manque sommeil',
  'Isolement',
  'Multi-tâches',
  'Pression sociale',
  'Incertitude',
]

// --- Life events ---

export interface EvenementVie {
  id: string
  dateDebut: string // YYYY-MM-DD
  dateFin: string | null // YYYY-MM-DD
  categorie: EvenementCategorie
  nature: EvenementNature
  intensite: number // 1-5
  description: string
  notes: string | null
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type EvenementVieFormData = Omit<EvenementVie, 'id' | 'createdAt' | 'updatedAt'>

export type EvenementCategorie =
  | 'professionnel'
  | 'relationnel'
  | 'deuil'
  | 'demenagement'
  | 'sante'
  | 'financier'
  | 'autre'

export type EvenementNature = 'positif' | 'negatif' | 'neutre'

export const EVENEMENT_CATEGORIE_LABELS: Record<EvenementCategorie, string> = {
  professionnel: 'Professionnel',
  relationnel: 'Relationnel',
  deuil: 'Deuil',
  demenagement: 'Déménagement',
  sante: 'Santé',
  financier: 'Financier',
  autre: 'Autre',
}

export const EVENEMENT_NATURE_LABELS: Record<EvenementNature, string> = {
  positif: 'Positif',
  negatif: 'Négatif',
  neutre: 'Neutre',
}
