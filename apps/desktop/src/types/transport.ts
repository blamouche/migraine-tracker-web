export interface TransportEntry {
  id: string
  date: string // YYYY-MM-DD
  heure: string // HH:mm
  moyen: TransportMoyen
  dureeMinutes: number
  conditions: string[]
  distance: string | null // km, optionnel
  notes: string | null
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type TransportFormData = Omit<TransportEntry, 'id' | 'createdAt' | 'updatedAt'>

export type TransportMoyen =
  | 'voiture'
  | 'train'
  | 'metro'
  | 'bus'
  | 'avion'
  | 'velo'
  | 'marche'
  | 'moto'
  | 'autre'

export const TRANSPORT_MOYEN_LABELS: Record<TransportMoyen, string> = {
  voiture: 'Voiture',
  train: 'Train',
  metro: 'Métro',
  bus: 'Bus',
  avion: 'Avion',
  velo: 'Vélo',
  marche: 'Marche',
  moto: 'Moto',
  autre: 'Autre',
}

export const DEFAULT_TRANSPORT_CONDITIONS = [
  'Conduite',
  'Passager',
  'Debout',
  'Foule',
  'Bruit fort',
  'Trajet long',
]
