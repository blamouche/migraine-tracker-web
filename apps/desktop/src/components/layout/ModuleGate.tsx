/**
 * E34 — ModuleGate
 * Wraps a module's content. If the module is disabled by the admin
 * (via plan_config), shows a locked message instead of the content.
 * Existing data remains visible in read-only mode.
 */
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { usePlanStore } from '@/stores/planStore'
import { usePlanConfigStore } from '@/stores/planConfigStore'
import type { PlanFlags } from '@/stores/planConfigStore'

/** Maps route path prefixes to the PlanFlags boolean key that controls them */
const ROUTE_TO_PLAN_FLAG: Record<string, keyof PlanFlags> = {
  '/cycle': 'moduleCycleEnabled',
  '/sport': 'moduleSportEnabled',
  '/transports': 'moduleTransportEnabled',
  '/charge-mentale': 'moduleChargeMentaleEnabled',
  '/evenement': 'moduleChargeMentaleEnabled',
  '/douleur': 'moduleDailyPainEnabled',
  '/ia': 'iaEnabled',
  '/rapport': 'pdfReportEnabled',
  '/export': 'exportCsvEnabled',
}

export function useIsModuleDisabledByPlan(pathname: string): boolean {
  const plan = usePlanStore((s) => s.plan)
  const flags = usePlanConfigStore((s) => s.getFlags(plan))
  const loaded = usePlanConfigStore((s) => s.loaded)

  if (!loaded) return false // Don't block before config loads

  return isPathDisabled(pathname, flags)
}

/** Non-hook version for use in useMemo / loops */
export function isPathDisabled(pathname: string, flags: PlanFlags): boolean {
  for (const [prefix, flagKey] of Object.entries(ROUTE_TO_PLAN_FLAG)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return flags[flagKey] === false
    }
  }
  return false
}

interface ModuleGateProps {
  pathname: string
  children: ReactNode
}

/** Wrap page content — shows lock screen when module is disabled by admin */
export function ModuleGate({ pathname, children }: ModuleGateProps) {
  const navigate = useNavigate()
  const disabled = useIsModuleDisabledByPlan(pathname)

  if (!disabled) return <>{children}</>

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Lock icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--color-bg-subtle)">
        <svg
          width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="text-(--color-text-muted)"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h2 className="mt-6 text-lg font-semibold text-(--color-text-primary)">
        Module non disponible
      </h2>
      <p className="mt-2 max-w-md text-sm text-(--color-text-secondary)">
        Cette fonctionnalité n&apos;est pas disponible avec votre plan actuel.
        Vos données existantes sont conservées et seront à nouveau accessibles
        si le module est réactivé.
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 rounded-(--radius-md) bg-(--color-brand) px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
      >
        Retour à l&apos;accueil
      </button>
    </div>
  )
}
