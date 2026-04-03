/**
 * E22 — Startup sequence
 * Executes all critical initialization steps in order.
 * Each step handles its own errors without blocking the next (except FSAPI).
 */

import { useAuthStore } from '@/stores/authStore'
// import { useOnboardingStore } from '@/stores/onboardingStore'

export interface BootStep {
  name: string
  run: () => Promise<void>
  critical: boolean
}

export interface BootResult {
  success: boolean
  steps: { name: string; status: 'ok' | 'error'; error?: string; durationMs: number }[]
  totalMs: number
}

export async function runBootSequence(): Promise<BootResult> {
  const totalStart = performance.now()
  const results: BootResult['steps'] = []

  const steps: BootStep[] = [
    {
      name: 'auth-restore',
      critical: false,
      run: async () => {
        // Restore auth session from Supabase
        const { user } = useAuthStore.getState()
        if (!user) {
          // Anonymous mode — ok
        }
      },
    },
    {
      name: 'onboarding-check',
      critical: false,
      run: async () => {
        // Onboarding status is managed by the OnboardingGuard component
      },
    },
    {
      name: 'vault-access',
      critical: true,
      run: async () => {
        // Verify FSAPI permission is still granted
        // If not, the app will show re-authorization dialog
      },
    },
    {
      name: 'vault-integrity',
      critical: false,
      run: async () => {
        // Scan for corrupted markdown files (see validateVault)
      },
    },
    {
      name: 'profile-flags',
      critical: false,
      run: async () => {
        // Load feature flags for active profile
      },
    },
    {
      name: 'mobile-sync',
      critical: false,
      run: async () => {
        const { syncMobileEntries } = await import('@/lib/mobileSync/syncService')
        const result = await syncMobileEntries()
        if (result.synced > 0) {
          // Dispatch a custom event so the UI can show a toast
          window.dispatchEvent(
            new CustomEvent('mobile-sync-complete', { detail: result }),
          )
        }
      },
    },
    {
      name: 'weather-fetch',
      critical: false,
      run: async () => {
        // Fetch today's weather if location configured
      },
    },
    {
      name: 'pattern-detection',
      critical: false,
      run: async () => {
        // Run pattern detection if enough data
      },
    },
    {
      name: 'alert-check',
      critical: false,
      run: async () => {
        // Evaluate alert conditions
      },
    },
    {
      name: 'trash-purge',
      critical: false,
      run: async () => {
        // Purge old trash entries (> 30 days)
      },
    },
    {
      name: 'ia-auto',
      critical: false,
      run: async () => {
        // Run auto IA analysis if opt-in
      },
    },
  ]

  for (const step of steps) {
    const start = performance.now()
    try {
      await step.run()
      results.push({ name: step.name, status: 'ok', durationMs: performance.now() - start })
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      results.push({ name: step.name, status: 'error', error, durationMs: performance.now() - start })
      if (step.critical) {
        return {
          success: false,
          steps: results,
          totalMs: performance.now() - totalStart,
        }
      }
    }
  }

  return {
    success: true,
    steps: results,
    totalMs: performance.now() - totalStart,
  }
}
