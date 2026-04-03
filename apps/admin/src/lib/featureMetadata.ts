/**
 * E34 — Human-readable metadata for plan_config feature keys.
 * Maps technical keys from the plan_config table to labels + descriptions
 * displayed in the admin Plans tab.
 */

export type FeatureCategory = 'parameter' | 'module'

export interface FeatureMeta {
  key: string
  label: string
  description: string
  category: FeatureCategory
}

/**
 * Known feature flags — ordered by display priority.
 * Any key present in plan_config but absent here will still appear
 * (under "Autres") so new flags are never hidden.
 */
export const FEATURE_METADATA: FeatureMeta[] = [
  // ── Parameters (numeric) ──────────────────────────────────
  {
    key: 'analytics_range_months',
    label: 'Plage d\'analyse',
    description: 'Nombre de mois d\'historique accessibles dans le dashboard (0 = illimité).',
    category: 'parameter',
  },
  {
    key: 'max_profiles',
    label: 'Nombre max de profils',
    description: 'Nombre de profils utilisateur autorisés par compte.',
    category: 'parameter',
  },

  // ── Modules (boolean) ─────────────────────────────────────
  {
    key: 'ia_enabled',
    label: 'Module IA',
    description: 'Analyse intelligente des crises et recommandations personnalisées.',
    category: 'module',
  },
  {
    key: 'module_cycle_enabled',
    label: 'Cycle menstruel',
    description: 'Suivi du cycle et corrélations hormonales.',
    category: 'module',
  },
  {
    key: 'module_sport_enabled',
    label: 'Activités sportives',
    description: 'Suivi des séances de sport et impact sur les migraines.',
    category: 'module',
  },
  {
    key: 'module_transport_enabled',
    label: 'Transports',
    description: 'Enregistrement des trajets et liens avec les crises.',
    category: 'module',
  },
  {
    key: 'module_charge_mentale_enabled',
    label: 'Charge mentale',
    description: 'Évaluation de la charge mentale et événements de vie.',
    category: 'module',
  },
  {
    key: 'module_daily_pain_enabled',
    label: 'Douleur quotidienne',
    description: 'Enregistrement du niveau de douleur chaque jour.',
    category: 'module',
  },
  {
    key: 'pdf_report_enabled',
    label: 'Rapport PDF',
    description: 'Génération de rapports médicaux au format PDF.',
    category: 'module',
  },
  {
    key: 'vocal_input_enabled',
    label: 'Saisie vocale',
    description: 'Dicter les entrées au lieu de les taper.',
    category: 'module',
  },
  {
    key: 'export_csv_enabled',
    label: 'Export CSV',
    description: 'Export des données au format CSV.',
    category: 'module',
  },
  {
    key: 'export_zip_enabled',
    label: 'Export ZIP',
    description: 'Export complet des données au format ZIP.',
    category: 'module',
  },
]

const metaByKey = new Map(FEATURE_METADATA.map((m) => [m.key, m]))

/** Returns metadata for a given feature key, or a sensible fallback. */
export function getFeatureMeta(key: string): FeatureMeta {
  return metaByKey.get(key) ?? {
    key,
    label: key,
    description: '',
    category: key.includes('enabled') ? 'module' : 'parameter',
  }
}
