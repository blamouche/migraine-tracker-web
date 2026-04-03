/**
 * E29 — Module personalization types
 * Defines which tracking modules can be toggled on/off by the user.
 */

export type ModuleId =
  | 'alimentaire'
  | 'traitements'
  | 'cycle'
  | 'consultations'
  | 'transports'
  | 'sport'
  | 'chargeMentale'
  | 'dailyPain'
  | 'environnement'
  | 'voiceInput'

export interface ModuleDefinition {
  id: ModuleId
  label: string
  description: string
  icon: string
  defaultEnabled: boolean
  /** If true, requires pro plan — shown grayed out for free users */
  proOnly?: boolean
}

export type ModuleConfig = Record<ModuleId, boolean>

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: 'alimentaire',
    label: 'Suivi alimentaire',
    description: 'Enregistrer vos repas et identifier les déclencheurs alimentaires.',
    icon: '🍽️',
    defaultEnabled: true,
  },
  {
    id: 'traitements',
    label: 'Historique des traitements',
    description: 'Suivre vos traitements de crise et de fond.',
    icon: '💊',
    defaultEnabled: true,
  },
  {
    id: 'cycle',
    label: 'Cycle menstruel',
    description: 'Tracker votre cycle et détecter les corrélations hormonales.',
    icon: '📅',
    defaultEnabled: false,
  },
  {
    id: 'consultations',
    label: 'Rendez-vous médicaux',
    description: 'Gérer vos consultations et préparer les visites.',
    icon: '🏥',
    defaultEnabled: true,
  },
  {
    id: 'transports',
    label: 'Suivi des transports',
    description: 'Enregistrer vos trajets et identifier les liens avec vos crises.',
    icon: '🚗',
    defaultEnabled: false,
  },
  {
    id: 'sport',
    label: 'Activités sportives',
    description: 'Suivre vos séances et évaluer l\'impact sur vos migraines.',
    icon: '🏃',
    defaultEnabled: false,
  },
  {
    id: 'chargeMentale',
    label: 'Charge mentale & événements',
    description: 'Évaluer votre charge mentale et noter les événements de vie.',
    icon: '🧠',
    defaultEnabled: false,
  },
  {
    id: 'dailyPain',
    label: 'Douleur quotidienne',
    description: 'Enregistrer votre niveau de douleur chaque jour.',
    icon: '❤️',
    defaultEnabled: true,
  },
  {
    id: 'environnement',
    label: 'Données météo',
    description: 'Collecter automatiquement les données météorologiques et lunaires.',
    icon: '⚙️',
    defaultEnabled: true,
  },
  {
    id: 'voiceInput',
    label: 'Saisie vocale',
    description: 'Dicter vos entrées au lieu de les taper.',
    icon: '🎙️',
    defaultEnabled: true,
  },
]

export const DEFAULT_MODULE_CONFIG: ModuleConfig = Object.fromEntries(
  MODULE_DEFINITIONS.map((m) => [m.id, m.defaultEnabled]),
) as ModuleConfig

/**
 * Maps module IDs to the route path prefixes they control.
 * Used for filtering navigation, command palette, and route access.
 */
export const MODULE_ROUTE_MAP: Record<ModuleId, string[]> = {
  alimentaire: ['/alimentaire'],
  traitements: ['/traitements'],
  cycle: ['/cycle'],
  consultations: ['/consultations'],
  transports: ['/transports'],
  sport: ['/sport'],
  chargeMentale: ['/charge-mentale', '/evenement'],
  dailyPain: ['/douleur'],
  environnement: ['/environnement'],
  voiceInput: [],
}

/** Modules that are always active and cannot be disabled */
export const CORE_ROUTES = ['/', '/dashboard', '/calendrier', '/crisis', '/patterns', '/profil-medical', '/rapport', '/export', '/alertes', '/ia', '/mobile-sync', '/modules']
