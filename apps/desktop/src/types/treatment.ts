export interface TreatmentEntry {
  id: string
  nom: string
  molecule: string
  classe: TherapeuticClass
  type: TreatmentType
  posologie: string
  voie: AdministrationRoute
  dateDebut: string // YYYY-MM-DD
  dateFin: string | null // null = en cours
  motifArret: string | null
  prescripteur: string | null
  notes: string | null
  efficacite: TreatmentEfficacy
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type TreatmentFormData = Omit<TreatmentEntry, 'id' | 'createdAt' | 'updatedAt'>

export type TherapeuticClass =
  | 'triptan'
  | 'anti-cgrp'
  | 'gepant'
  | 'betabloquant'
  | 'antiepileptique'
  | 'ains'
  | 'autre'

export type TreatmentType = 'fond' | 'crise'

export type AdministrationRoute = 'oral' | 'injectable' | 'nasal' | 'patch'

export type EfficacyVerdict = 'efficace' | 'partiel' | 'inefficace' | 'non-evalue'

export type FrequencyReduction = 'aucune' | 'legere' | 'moderee' | 'importante'

export type ToleranceLevel = 'bonne' | 'acceptable' | 'mauvaise'

export interface TreatmentEfficacy {
  verdict: EfficacyVerdict
  reductionFrequence: FrequencyReduction
  tolerance: ToleranceLevel
  commentaire: string | null
}

export const THERAPEUTIC_CLASS_LABELS: Record<TherapeuticClass, string> = {
  triptan: 'Triptan',
  'anti-cgrp': 'Anti-CGRP',
  gepant: 'Gépant',
  betabloquant: 'Bêtabloquant',
  antiepileptique: 'Antiépileptique',
  ains: 'AINS',
  autre: 'Autre',
}

export const TREATMENT_TYPE_LABELS: Record<TreatmentType, string> = {
  fond: 'Traitement de fond',
  crise: 'Traitement de crise',
}

export const ADMINISTRATION_ROUTE_LABELS: Record<AdministrationRoute, string> = {
  oral: 'Oral',
  injectable: 'Injectable',
  nasal: 'Nasal',
  patch: 'Patch',
}

export const VERDICT_LABELS: Record<EfficacyVerdict, string> = {
  efficace: 'Efficace',
  partiel: 'Partiellement efficace',
  inefficace: 'Inefficace',
  'non-evalue': 'Non évalué',
}

export const VERDICT_COLORS: Record<EfficacyVerdict, string> = {
  efficace: 'var(--color-success)',
  partiel: 'var(--color-warning)',
  inefficace: 'var(--color-danger)',
  'non-evalue': 'var(--color-text-muted)',
}

export const FREQUENCY_REDUCTION_LABELS: Record<FrequencyReduction, string> = {
  aucune: 'Aucune',
  legere: 'Légère (< 30 %)',
  moderee: 'Modérée (30–50 %)',
  importante: 'Importante (> 50 %)',
}

export const TOLERANCE_LABELS: Record<ToleranceLevel, string> = {
  bonne: 'Bonne',
  acceptable: 'Acceptable',
  mauvaise: 'Mauvaise',
}

export const DEFAULT_EFFICACY: TreatmentEfficacy = {
  verdict: 'non-evalue',
  reductionFrequence: 'aucune',
  tolerance: 'bonne',
  commentaire: null,
}
