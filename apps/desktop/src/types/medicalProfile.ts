// ─── Medical profile types (E09) ───

export type MigraineType =
  | 'sans-aura'
  | 'avec-aura'
  | 'chronique'
  | 'menstruelle'
  | 'vestibulaire'
  | 'hemiplegique'
  | 'autre'

export type ContraceptionType =
  | 'aucune'
  | 'pilule-combinee'
  | 'pilule-progestative'
  | 'diu-hormonal'
  | 'diu-cuivre'
  | 'implant'
  | 'autre'

export interface Doctor {
  nom: string
  specialite: 'generaliste' | 'neurologue' | 'autre'
  coordonnees: string // phone, email, or address
}

export interface MedicalProfile {
  migraineType: MigraineType
  migraineTypeAutre: string | null // if migraineType === 'autre'
  traitementsCrise: string[] // current crisis treatments
  traitementsFond: string[] // current preventive treatments
  antecedentsCardiovasculaires: string[]
  allergies: string[]
  contreIndications: string[]
  contraception: ContraceptionType
  medecins: Doctor[]
  notes: string | null
  updatedAt: string // ISO
}

export const MIGRAINE_TYPE_LABELS: Record<MigraineType, string> = {
  'sans-aura': 'Migraine sans aura',
  'avec-aura': 'Migraine avec aura',
  chronique: 'Migraine chronique',
  menstruelle: 'Migraine menstruelle',
  vestibulaire: 'Migraine vestibulaire',
  hemiplegique: 'Migraine hémiplégique',
  autre: 'Autre',
}

export const CONTRACEPTION_LABELS: Record<ContraceptionType, string> = {
  aucune: 'Aucune',
  'pilule-combinee': 'Pilule combinée',
  'pilule-progestative': 'Pilule progestative',
  'diu-hormonal': 'DIU hormonal',
  'diu-cuivre': 'DIU cuivre',
  implant: 'Implant',
  autre: 'Autre',
}

export const DOCTOR_SPECIALITY_LABELS: Record<Doctor['specialite'], string> = {
  generaliste: 'Médecin traitant',
  neurologue: 'Neurologue',
  autre: 'Autre spécialiste',
}

export const DEFAULT_ANTECEDENTS = [
  'Hypertension',
  'AVC',
  'Infarctus',
  'Arythmie',
  'Maladie de Raynaud',
]

export const DEFAULT_ALLERGIES = [
  'AINS',
  'Triptans',
  'Aspirine',
  'Paracétamol',
  'Pénicilline',
  'Latex',
]

export const EMPTY_PROFILE: MedicalProfile = {
  migraineType: 'sans-aura',
  migraineTypeAutre: null,
  traitementsCrise: [],
  traitementsFond: [],
  antecedentsCardiovasculaires: [],
  allergies: [],
  contreIndications: [],
  contraception: 'aucune',
  medecins: [],
  notes: null,
  updatedAt: new Date().toISOString(),
}
