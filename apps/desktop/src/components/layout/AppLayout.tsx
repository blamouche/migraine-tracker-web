import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useNavigationStore } from '@/stores/navigationStore'
import { usePlanConfigStore } from '@/stores/planConfigStore'
import { ModuleGate } from './ModuleGate'
import { Sidebar } from './Sidebar'
import { BottomBar } from './BottomBar'
import { Breadcrumb } from './Breadcrumb'
import { PageTransition } from './PageTransition'
import { ToastContainer } from '@/components/ui/Toast'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { ShortcutsPanel } from '@/components/ui/ShortcutsPanel'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useModuleGuard } from './ModuleGuard'
import { useProfileMigration } from '@/hooks/useProfileMigration'

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Accueil',
  '/dashboard': 'Tableau de bord',
  '/crisis/quick': 'Mode Crise',
  '/crisis/history': 'Historique des crises',
  '/alimentaire/nouveau': 'Nouveau repas',
  '/alimentaire/historique': 'Historique alimentaire',
  '/traitements/nouveau': 'Nouveau traitement',
  '/traitements/historique': 'Historique des traitements',
  '/patterns': 'Patterns détectés',
  '/profil-medical': 'Profil médical',
  '/cycle/nouveau': 'Nouveau cycle',
  '/cycle/historique': 'Historique des cycles',
  '/consultations/nouveau': 'Nouvelle consultation',
  '/consultations/historique': 'Historique des consultations',
  '/transports/nouveau': 'Nouveau trajet',
  '/transports/historique': 'Historique des transports',
  '/sport/nouveau': 'Nouvelle séance',
  '/sport/historique': 'Historique sportif',
  '/charge-mentale/nouveau': 'Nouvelle entrée',
  '/charge-mentale/historique': 'Charge mentale',
  '/douleur/nouveau': 'Nouvelle douleur',
  '/douleur/historique': 'Douleur quotidienne',
  '/evenement/nouveau': 'Nouvel événement',
  '/environnement': 'Environnement',
  '/ia': 'Module IA',
  '/mobile-sync': 'Synchronisation mobile',
  '/rapport': 'Rapport médical',
  '/export': 'Export des données',
  '/alertes': 'Préférences d\'alertes',
  '/modules': 'Modules de suivi',
}

// Crisis mode bypasses the layout (full screen)
const BYPASS_LAYOUT = ['/crisis/quick']

export function AppLayout() {
  const location = useLocation()
  const { sidebarOpen, setSidebarOpen } = useNavigationStore()
  const fetchConfig = usePlanConfigStore((s) => s.fetchConfig)
  const startAutoRefresh = usePlanConfigStore((s) => s.startAutoRefresh)

  // E34 — Fetch plan_config on mount + auto-refresh every 5 min
  useEffect(() => {
    fetchConfig()
    const cleanup = startAutoRefresh()
    return cleanup
  }, [fetchConfig, startAutoRefresh])

  // E34 — Re-fetch on page navigation
  useEffect(() => {
    fetchConfig()
  }, [location.pathname, fetchConfig])

  // Register global keyboard shortcuts (E26)
  useKeyboardShortcuts()

  // E29 — Redirect if route belongs to disabled module
  useModuleGuard()

  // E36 — Migration notice for users who had multiple profiles
  const { showMigrationNotice, dismissNotice } = useProfileMigration()

  if (BYPASS_LAYOUT.includes(location.pathname)) {
    return <Outlet />
  }

  const pageTitle = ROUTE_TITLES[location.pathname]
    || (location.pathname.match(/\/edit$/) ? 'Modifier' : '')

  return (
    <div className="flex h-screen overflow-hidden bg-(--color-bg-base) text-(--color-text-primary)">
      {/* Desktop sidebar (≥ 1024px) */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Tablet/mobile overlay sidebar (< 1024px) */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-(--color-border) bg-(--color-bg-elevated) px-6 py-3 lg:px-8">
          {/* Hamburger (< 1024px) */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-(--color-text-secondary) hover:text-(--color-text-primary)"
            aria-label="Ouvrir le menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <Breadcrumb />
            {pageTitle && (
              <h1 className="text-xl font-semibold truncate">{pageTitle}</h1>
            )}
          </div>
        </header>

        {/* E36 — Migration notice */}
        {showMigrationNotice && (
          <div className="flex items-center justify-between border-b border-(--color-border) bg-(--color-brand-light) px-6 py-3 text-sm text-(--color-text-primary)">
            <p>
              Le mode multi-profils a été supprimé. Votre profil principal a été conservé comme profil unique de votre compte.
              Pour suivre un proche, créez un compte séparé.
            </p>
            <button
              type="button"
              onClick={dismissNotice}
              className="ml-4 shrink-0 text-xs font-medium text-(--color-brand) hover:underline"
            >
              Compris
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto" id="main-content">
          <div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8 lg:py-8">
            <PageTransition>
              <ModuleGate pathname={location.pathname}>
                <Outlet />
              </ModuleGate>
            </PageTransition>
          </div>
        </main>
      </div>

      {/* Mobile bottom bar (< 768px) */}
      <BottomBar />

      {/* Toast notifications (E24) */}
      <ToastContainer />

      {/* Command Palette (E26) */}
      <CommandPalette />

      {/* Shortcuts panel (E26) */}
      <ShortcutsPanel />

      {/* Skip-to-content link (E26) */}
      <a href="#main-content" className="skip-to-content">
        Aller au contenu principal
      </a>
    </div>
  )
}
