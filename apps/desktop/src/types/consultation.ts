export interface ConsultationEntry {
  id: string
  date: string // YYYY-MM-DD
  heure: string // HH:mm
  medecin: string
  specialite: string
  type: ConsultationType
  motif: string
  resume: string
  decisions: string[]
  ordonnances: string[]
  prochainRdv: string | null // YYYY-MM-DD
  notes: string | null
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type ConsultationFormData = Omit<ConsultationEntry, 'id' | 'createdAt' | 'updatedAt'>

export type ConsultationType = 'cabinet' | 'teleconsultation' | 'urgences' | 'hospitalisation'

export const CONSULTATION_TYPE_LABELS: Record<ConsultationType, string> = {
  cabinet: 'En cabinet',
  teleconsultation: 'Téléconsultation',
  urgences: 'Urgences',
  hospitalisation: 'Hospitalisation',
}

export const DEFAULT_SPECIALITES = [
  'Médecine générale',
  'Neurologie',
  'ORL',
  'Ophtalmologie',
  'Gynécologie',
  'Psychiatrie',
  'Rhumatologie',
  'Algologie',
]
