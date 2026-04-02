import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { IAPreferences, IAPattern, IARecommendation, IASummary, IALogEntry, IARiskRefinement } from '@/types/ia'
import { DEFAULT_IA_PREFERENCES, MIN_CRISES_FOR_IA } from '@/types/ia'
import { writeIAPatterns, writeIARecommendations, writeIASummary, appendIALog } from '@/lib/ia/vault'

interface IAState {
  preferences: IAPreferences
  patterns: IAPattern[]
  recommendations: IARecommendation[]
  summaries: IASummary[]
  log: IALogEntry[]
  lastRiskRefinement: IARiskRefinement | null
  isAnalyzing: boolean
  error: string | null

  giveConsent: () => void
  revokeConsent: () => void
  updatePreferences: (partial: Partial<IAPreferences>) => void

  runPatternAnalysis: (crisisCount: number) => Promise<void>
  validatePattern: (patternId: string) => void
  rejectPattern: (patternId: string) => void

  runRecommendations: (crisisCount: number) => Promise<void>
  dismissRecommendation: (recId: string) => void

  generateSummary: (period: IASummary['period'], detailLevel: IASummary['detailLevel'], language: IASummary['language']) => Promise<void>

  refineRisk: (crisisCount: number) => Promise<void>

  clearError: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

export const useIAStore = create<IAState>()(
  persist(
    (set, get) => ({
      preferences: { ...DEFAULT_IA_PREFERENCES },
      patterns: [],
      recommendations: [],
      summaries: [],
      log: [],
      lastRiskRefinement: null,
      isAnalyzing: false,
      error: null,

      giveConsent: () => {
        set((state) => ({
          preferences: { ...state.preferences, consentGiven: true, consentDate: new Date().toISOString() },
        }))
      },

      revokeConsent: () => {
        set((state) => ({
          preferences: { ...state.preferences, consentGiven: false, autoWeeklyAnalysis: false, autoRiskRefinement: false },
        }))
      },

      updatePreferences: (partial: Partial<IAPreferences>) => {
        set((state) => ({ preferences: { ...state.preferences, ...partial } }))
      },

      runPatternAnalysis: async (crisisCount: number) => {
        if (crisisCount < MIN_CRISES_FOR_IA) {
          set({ error: `Minimum ${MIN_CRISES_FOR_IA} crises requises pour l'analyse IA (actuellement ${crisisCount})` })
          return
        }
        if (!get().preferences.consentGiven) {
          set({ error: 'Consentement requis pour utiliser le module IA' })
          return
        }
        set({ isAnalyzing: true, error: null })
        try {
          // Placeholder: in production, this would call the AI API
          const pattern: IAPattern = {
            id: generateId(),
            source: 'ia',
            label: 'Pattern IA détecté',
            description: 'Analyse en attente de connexion API. Les patterns seront générés par le modèle IA une fois le backend configuré.',
            confidence: 0,
            status: 'detected',
            detectedAt: new Date().toISOString(),
            validatedAt: null,
          }

          const logEntry: IALogEntry = {
            id: generateId(),
            date: new Date().toISOString(),
            type: 'patterns',
            dataSummary: `${crisisCount} crises analysées`,
            trigger: 'manual',
          }

          set((state) => ({
            patterns: [pattern, ...state.patterns],
            log: [logEntry, ...state.log],
            isAnalyzing: false,
          }))

          writeIAPatterns(get().patterns).catch(() => {})
          appendIALog(logEntry).catch(() => {})
        } catch {
          set({ isAnalyzing: false, error: 'Erreur lors de l\'analyse IA' })
        }
      },

      validatePattern: (patternId: string) => {
        set((state) => ({
          patterns: state.patterns.map((p) =>
            p.id === patternId ? { ...p, status: 'validated' as const, validatedAt: new Date().toISOString() } : p,
          ),
        }))
        writeIAPatterns(get().patterns).catch(() => {})
      },

      rejectPattern: (patternId: string) => {
        set((state) => ({
          patterns: state.patterns.map((p) =>
            p.id === patternId ? { ...p, status: 'rejected' as const } : p,
          ),
        }))
        writeIAPatterns(get().patterns).catch(() => {})
      },

      runRecommendations: async (crisisCount: number) => {
        if (crisisCount < MIN_CRISES_FOR_IA) {
          set({ error: `Minimum ${MIN_CRISES_FOR_IA} crises requises` })
          return
        }
        set({ isAnalyzing: true, error: null })
        try {
          const rec: IARecommendation = {
            id: generateId(),
            text: 'Recommandations en attente de connexion API. Les suggestions personnalisées seront générées par le modèle IA.',
            confidence: 0,
            category: 'autre',
            generatedAt: new Date().toISOString(),
            status: 'active',
          }

          const logEntry: IALogEntry = {
            id: generateId(),
            date: new Date().toISOString(),
            type: 'recommendations',
            dataSummary: `${crisisCount} crises`,
            trigger: 'manual',
          }

          set((state) => ({
            recommendations: [rec, ...state.recommendations],
            log: [logEntry, ...state.log],
            isAnalyzing: false,
          }))

          writeIARecommendations(get().recommendations).catch(() => {})
          appendIALog(logEntry).catch(() => {})
        } catch {
          set({ isAnalyzing: false, error: 'Erreur lors de la génération des recommandations' })
        }
      },

      dismissRecommendation: (recId: string) => {
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === recId ? { ...r, status: 'dismissed' as const } : r,
          ),
        }))
        writeIARecommendations(get().recommendations).catch(() => {})
      },

      generateSummary: async (period, detailLevel, language) => {
        set({ isAnalyzing: true, error: null })
        try {
          const summary: IASummary = {
            id: generateId(),
            period,
            detailLevel,
            language,
            content: `Résumé ${detailLevel} sur ${period} — En attente de connexion API. Le résumé narratif sera généré par le modèle IA.`,
            generatedAt: new Date().toISOString(),
          }

          const logEntry: IALogEntry = {
            id: generateId(),
            date: new Date().toISOString(),
            type: 'summary',
            dataSummary: `${period}, ${detailLevel}, ${language}`,
            trigger: 'manual',
          }

          set((state) => ({
            summaries: [summary, ...state.summaries],
            log: [logEntry, ...state.log],
            isAnalyzing: false,
          }))

          writeIASummary(summary).catch(() => {})
          appendIALog(logEntry).catch(() => {})
        } catch {
          set({ isAnalyzing: false, error: 'Erreur lors de la génération du résumé' })
        }
      },

      refineRisk: async (crisisCount: number) => {
        if (crisisCount < MIN_CRISES_FOR_IA) {
          set({ error: `Minimum ${MIN_CRISES_FOR_IA} crises requises` })
          return
        }
        set({ isAnalyzing: true, error: null })
        try {
          const refinement: IARiskRefinement = {
            probability: 0,
            factors: [{ label: 'En attente de connexion API', contribution: 0 }],
            generatedAt: new Date().toISOString(),
          }

          const logEntry: IALogEntry = {
            id: generateId(),
            date: new Date().toISOString(),
            type: 'risk-refinement',
            dataSummary: `${crisisCount} crises`,
            trigger: 'manual',
          }

          set((state) => ({
            lastRiskRefinement: refinement,
            log: [logEntry, ...state.log],
            isAnalyzing: false,
          }))

          appendIALog(logEntry).catch(() => {})
        } catch {
          set({ isAnalyzing: false, error: 'Erreur lors de l\'affinement du risque' })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-ia',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        patterns: state.patterns,
        recommendations: state.recommendations,
        summaries: state.summaries,
        log: state.log,
        lastRiskRefinement: state.lastRiskRefinement,
      }),
    },
  ),
)
