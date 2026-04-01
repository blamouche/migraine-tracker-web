import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DetectedPattern, DailyRisk, PeriodicityEstimate } from '@/types/patterns'
import { MIN_CRISES_FOR_PATTERNS } from '@/types/patterns'
import { runFullDetection, calculateDailyRisk, estimatePeriodicity } from '@/lib/patterns/detect'
import { writePatterns, readPatterns } from '@/lib/vault/patterns'
import type { CrisisEntry } from '@/types/crisis'
import type { DailyFactors } from '@/types/alimentaire'

interface PatternState {
  patterns: DetectedPattern[]
  dailyRisk: DailyRisk | null
  periodicity: PeriodicityEstimate | null
  isLoading: boolean
  error: string | null
  lastDetectionAt: string | null

  loadPatterns: () => Promise<void>
  runDetection: (crises: CrisisEntry[], dailyFactors: DailyFactors[]) => void
  validatePattern: (patternId: string) => Promise<void>
  rejectPattern: (patternId: string) => Promise<void>
  updateDailyRisk: (todayFactors: DailyFactors | undefined, crises: CrisisEntry[]) => void
  clearError: () => void
}

export const usePatternStore = create<PatternState>()(
  persist(
    (set, get) => ({
      patterns: [],
      dailyRisk: null,
      periodicity: null,
      isLoading: false,
      error: null,
      lastDetectionAt: null,

      loadPatterns: async () => {
        set({ isLoading: true, error: null })
        try {
          const vaultPatterns = await readPatterns()
          if (vaultPatterns.length > 0) {
            // Merge: vault validated/rejected patterns with local detected ones
            const vaultIds = new Set(vaultPatterns.map((p) => p.id))
            const localOnly = get().patterns.filter(
              (p) => !vaultIds.has(p.id) && p.status === 'detected',
            )
            set({ patterns: [...vaultPatterns, ...localOnly], isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ error: 'Impossible de charger les patterns', isLoading: false })
        }
      },

      runDetection: (crises, dailyFactors) => {
        if (crises.length < MIN_CRISES_FOR_PATTERNS) {
          set({ lastDetectionAt: new Date().toISOString() })
          return
        }

        const detected = runFullDetection(crises, dailyFactors)
        const existing = get().patterns
        const existingIds = new Map(existing.map((p) => [p.id, p]))

        // Merge: keep user decisions, update confidence on re-detected
        const merged: DetectedPattern[] = []
        for (const pattern of detected) {
          const prev = existingIds.get(pattern.id)
          if (prev) {
            if (prev.status === 'rejected') {
              // Re-show only if confidence increased significantly (+15%)
              if (pattern.confidence >= prev.confidence + 15) {
                merged.push({ ...pattern, status: 'detected' })
              } else {
                merged.push(prev) // keep rejected
              }
            } else {
              // Update confidence/occurrences but keep status
              merged.push({
                ...pattern,
                status: prev.status,
                validatedAt: prev.validatedAt,
              })
            }
            existingIds.delete(pattern.id)
          } else {
            merged.push(pattern)
          }
        }

        // Keep validated/rejected patterns that are no longer detected
        for (const [, prev] of existingIds) {
          if (prev.status !== 'detected') {
            merged.push(prev)
          }
        }

        // Periodicity
        const periodicity = estimatePeriodicity(crises)

        set({
          patterns: merged,
          periodicity,
          lastDetectionAt: new Date().toISOString(),
        })
      },

      validatePattern: async (patternId) => {
        const now = new Date().toISOString()
        set((state) => ({
          patterns: state.patterns.map((p) =>
            p.id === patternId ? { ...p, status: 'validated' as const, validatedAt: now } : p,
          ),
        }))

        // Persist to vault
        const toSave = get().patterns.filter((p) => p.status !== 'detected')
        writePatterns(toSave).catch(() => {})
      },

      rejectPattern: async (patternId) => {
        set((state) => ({
          patterns: state.patterns.map((p) =>
            p.id === patternId ? { ...p, status: 'rejected' as const } : p,
          ),
        }))

        const toSave = get().patterns.filter((p) => p.status !== 'detected')
        writePatterns(toSave).catch(() => {})
      },

      updateDailyRisk: (todayFactors, crises) => {
        const validatedPatterns = get().patterns.filter((p) => p.status === 'validated')
        const risk = calculateDailyRisk(validatedPatterns, todayFactors, crises)
        set({ dailyRisk: risk })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-patterns',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        patterns: state.patterns,
        periodicity: state.periodicity,
        lastDetectionAt: state.lastDetectionAt,
      }),
    },
  ),
)
