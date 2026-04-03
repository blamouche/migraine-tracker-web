/**
 * E34 — Plan configuration store
 * Fetches plan_config from Supabase and refreshes every 5 minutes
 * or on page navigation. Replaces hardcoded FREE_FLAGS / PRO_FLAGS.
 */
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

interface PlanConfigRow {
  plan: string
  feature_key: string
  feature_value: string
}

/** Parsed feature flags for a single plan */
export interface PlanFlags {
  analyticsRangeMonths: number
  maxProfiles: number
  iaEnabled: boolean
  moduleCycleEnabled: boolean
  moduleSportEnabled: boolean
  moduleTransportEnabled: boolean
  moduleChargeMentaleEnabled: boolean
  moduleDailyPainEnabled: boolean
  moduleAlimentaireEnabled: boolean
  moduleTraitementsEnabled: boolean
  moduleConsultationsEnabled: boolean
  moduleEnvironnementEnabled: boolean
  moduleProfilMedicalEnabled: boolean
  modulePatternsEnabled: boolean
  moduleAlertesEnabled: boolean
  moduleMobileSyncEnabled: boolean
  pdfReportEnabled: boolean
  vocalInputEnabled: boolean
  exportCsvEnabled: boolean
  exportZipEnabled: boolean
}

const DEFAULT_FREE_FLAGS: PlanFlags = {
  analyticsRangeMonths: 3,
  maxProfiles: 1,
  iaEnabled: false,
  moduleCycleEnabled: true,
  moduleSportEnabled: true,
  moduleTransportEnabled: true,
  moduleChargeMentaleEnabled: true,
  moduleDailyPainEnabled: true,
  moduleAlimentaireEnabled: true,
  moduleTraitementsEnabled: true,
  moduleConsultationsEnabled: true,
  moduleEnvironnementEnabled: true,
  moduleProfilMedicalEnabled: true,
  modulePatternsEnabled: true,
  moduleAlertesEnabled: true,
  moduleMobileSyncEnabled: true,
  pdfReportEnabled: true,
  vocalInputEnabled: true,
  exportCsvEnabled: true,
  exportZipEnabled: true,
}

const DEFAULT_PRO_FLAGS: PlanFlags = {
  analyticsRangeMonths: 0,
  maxProfiles: 3,
  iaEnabled: true,
  moduleCycleEnabled: true,
  moduleSportEnabled: true,
  moduleTransportEnabled: true,
  moduleChargeMentaleEnabled: true,
  moduleDailyPainEnabled: true,
  moduleAlimentaireEnabled: true,
  moduleTraitementsEnabled: true,
  moduleConsultationsEnabled: true,
  moduleEnvironnementEnabled: true,
  moduleProfilMedicalEnabled: true,
  modulePatternsEnabled: true,
  moduleAlertesEnabled: true,
  moduleMobileSyncEnabled: true,
  pdfReportEnabled: true,
  vocalInputEnabled: true,
  exportCsvEnabled: true,
  exportZipEnabled: true,
}

/** Map DB feature_key → PlanFlags field */
function parseRows(rows: PlanConfigRow[]): { free: PlanFlags; pro: PlanFlags } {
  const free = { ...DEFAULT_FREE_FLAGS }
  const pro = { ...DEFAULT_PRO_FLAGS }

  for (const row of rows) {
    const target = row.plan === 'free' ? free : row.plan === 'pro' ? pro : null
    if (!target) continue

    const val = row.feature_value
    switch (row.feature_key) {
      case 'analytics_range_months':
        target.analyticsRangeMonths = Number(val)
        break
      case 'max_profiles':
        target.maxProfiles = Number(val)
        break
      case 'ia_enabled':
        target.iaEnabled = val === 'true'
        break
      case 'module_cycle_enabled':
        target.moduleCycleEnabled = val === 'true'
        break
      case 'module_sport_enabled':
        target.moduleSportEnabled = val === 'true'
        break
      case 'module_transport_enabled':
        target.moduleTransportEnabled = val === 'true'
        break
      case 'module_charge_mentale_enabled':
        target.moduleChargeMentaleEnabled = val === 'true'
        break
      case 'module_daily_pain_enabled':
        target.moduleDailyPainEnabled = val === 'true'
        break
      case 'module_alimentaire_enabled':
        target.moduleAlimentaireEnabled = val === 'true'
        break
      case 'module_traitements_enabled':
        target.moduleTraitementsEnabled = val === 'true'
        break
      case 'module_consultations_enabled':
        target.moduleConsultationsEnabled = val === 'true'
        break
      case 'module_environnement_enabled':
        target.moduleEnvironnementEnabled = val === 'true'
        break
      case 'module_profil_medical_enabled':
        target.moduleProfilMedicalEnabled = val === 'true'
        break
      case 'module_patterns_enabled':
        target.modulePatternsEnabled = val === 'true'
        break
      case 'module_alertes_enabled':
        target.moduleAlertesEnabled = val === 'true'
        break
      case 'module_mobile_sync_enabled':
        target.moduleMobileSyncEnabled = val === 'true'
        break
      case 'pdf_report_enabled':
        target.pdfReportEnabled = val === 'true'
        break
      case 'vocal_input_enabled':
        target.vocalInputEnabled = val === 'true'
        break
      case 'export_csv_enabled':
        target.exportCsvEnabled = val === 'true'
        break
      case 'export_zip_enabled':
        target.exportZipEnabled = val === 'true'
        break
    }
  }

  return { free, pro }
}

interface PlanConfigState {
  free: PlanFlags
  pro: PlanFlags
  loaded: boolean
  lastFetchedAt: number | null

  /** Fetch plan_config from Supabase */
  fetchConfig: () => Promise<void>

  /** Start the 5-minute auto-refresh interval. Returns cleanup fn. */
  startAutoRefresh: () => () => void

  /** Get flags for a given plan */
  getFlags: (plan: 'free' | 'pro') => PlanFlags

  /** Check if a specific module is enabled for a plan */
  isModuleEnabledForPlan: (plan: 'free' | 'pro', moduleKey: string) => boolean
}

export const usePlanConfigStore = create<PlanConfigState>()((set, get) => ({
  free: { ...DEFAULT_FREE_FLAGS },
  pro: { ...DEFAULT_PRO_FLAGS },
  loaded: false,
  lastFetchedAt: null,

  fetchConfig: async () => {
    const { data, error } = await supabase
      .from('plan_config')
      .select('plan, feature_key, feature_value')

    if (error || !data) {
      console.warn('[planConfigStore] Failed to fetch plan_config:', error?.message)
      // Keep cached values — don't break the UI
      return
    }

    const parsed = parseRows(data as PlanConfigRow[])
    set({ free: parsed.free, pro: parsed.pro, loaded: true, lastFetchedAt: Date.now() })
  },

  startAutoRefresh: () => {
    const id = setInterval(() => {
      get().fetchConfig()
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  },

  getFlags: (plan) => {
    return plan === 'pro' ? get().pro : get().free
  },

  isModuleEnabledForPlan: (plan, moduleKey) => {
    const flags = get().getFlags(plan)
    const mapping: Record<string, keyof PlanFlags> = {
      alimentaire: 'moduleAlimentaireEnabled',
      traitements: 'moduleTraitementsEnabled',
      cycle: 'moduleCycleEnabled',
      consultations: 'moduleConsultationsEnabled',
      transports: 'moduleTransportEnabled',
      sport: 'moduleSportEnabled',
      chargeMentale: 'moduleChargeMentaleEnabled',
      dailyPain: 'moduleDailyPainEnabled',
      environnement: 'moduleEnvironnementEnabled',
      voiceInput: 'vocalInputEnabled',
      ia: 'iaEnabled',
    }
    const flagKey = mapping[moduleKey]
    if (flagKey && typeof flags[flagKey] === 'boolean') {
      return flags[flagKey] as boolean
    }
    return true
  },
}))
