import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useNavigationStore } from '@/stores/navigationStore'
import { useCrisisStore } from '@/stores/crisisStore'
import { useAuthStore } from '@/stores/authStore'
import { useModuleStore } from '@/stores/moduleStore'
import { usePlanStore } from '@/stores/planStore'
import { isPathDisabled } from './ModuleGate'
import { usePlanConfigStore } from '@/stores/planConfigStore'


interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Accès rapide',
    items: [
      { label: 'Accueil', path: '/', icon: <HomeIcon /> },
      { label: 'Dashboard', path: '/dashboard', icon: <ChartIcon /> },
      { label: 'Calendrier', path: '/calendrier', icon: <CalendarViewIcon /> },
    ],
  },
  {
    title: 'Suivi',
    items: [
      { label: 'Crises', path: '/crisis/history', icon: <BoltIcon /> },
      { label: 'Douleur quotidienne', path: '/douleur/historique', icon: <HeartIcon /> },
      { label: 'Alimentation', path: '/alimentaire/historique', icon: <UtensilsIcon /> },
      { label: 'Sport', path: '/sport/historique', icon: <ActivityIcon /> },
      { label: 'Transports', path: '/transports/historique', icon: <CarIcon /> },
      { label: 'Charge mentale', path: '/charge-mentale/historique', icon: <BrainIcon /> },
    ],
  },
  {
    title: 'Santé',
    items: [
      { label: 'Traitements', path: '/traitements/historique', icon: <PillIcon /> },
      { label: 'Cycle menstruel', path: '/cycle/historique', icon: <CalendarIcon /> },
      { label: 'Consultations', path: '/consultations/historique', icon: <StethoscopeIcon /> },
      { label: 'Profil médical', path: '/profil-medical', icon: <ClipboardIcon /> },
    ],
  },
  {
    title: 'Analyse',
    items: [
      { label: 'Patterns', path: '/patterns', icon: <TrendingIcon /> },
      { label: 'Module IA', path: '/ia', icon: <SparklesIcon /> },
      { label: 'Rapport', path: '/rapport', icon: <FileIcon /> },
      { label: 'Export', path: '/export', icon: <DownloadIcon /> },
    ],
  },
  {
    title: 'Système',
    items: [
      { label: 'Modules', path: '/modules', icon: <SlidersIcon /> },
      { label: 'Alertes', path: '/alertes', icon: <BellIcon /> },
      { label: 'Environnement', path: '/environnement', icon: <CloudSunIcon /> },
      { label: 'Sync mobile', path: '/mobile-sync', icon: <SmartphoneIcon /> },
    ],
  },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed, toggleCollapsed, setSidebarOpen } = useNavigationStore()
  const crises = useCrisisStore((s) => s.crises)
  const incompleteCount = useMemo(() => crises.filter((c) => c.status === 'incomplet').length, [crises])
  const { user, signOut } = useAuthStore()
  const moduleConfig = useModuleStore((s) => s.config)
  const isRouteEnabled = useModuleStore((s) => s.isRouteEnabled)
  const currentPlan = usePlanStore((s) => s.plan)
  const planFlags = usePlanConfigStore((s) => s.getFlags(currentPlan))
  const planLoaded = usePlanConfigStore((s) => s.loaded)

  const filteredGroups = useMemo(() => {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items
        .filter((item) => isRouteEnabled(item.path))
        .map((item) => ({
          ...item,
          planDisabled: planLoaded && isPathDisabled(item.path, planFlags),
        })),
    })).filter((group) => group.items.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleConfig, planFlags, planLoaded])

  const handleNav = (path: string) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path.replace('/historique', '').replace('/history', ''))
  }

  // incompleteCount already computed above

  return (
    <aside
      className="flex h-full flex-col border-r border-(--color-border) bg-(--color-bg-elevated)"
      style={{ width: sidebarCollapsed ? 64 : 240, transition: 'width 200ms ease' }}
    >
      {/* CTA Nouvelle crise */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => handleNav('/crisis/quick')}
          className="flex w-full items-center justify-center gap-2 rounded-(--radius-md) bg-(--color-danger) px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
          title="Nouvelle crise"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          {!sidebarCollapsed && <span>Nouvelle crise</span>}
        </button>
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-1" aria-label="Navigation principale">
        {filteredGroups.map((group) => (
          <div key={group.title} className="mb-3">
            {!sidebarCollapsed && (
              <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-(--color-text-muted)">
                {group.title}
              </p>
            )}
            {sidebarCollapsed && <div className="mx-auto my-2 h-px w-6 bg-(--color-border)" />}
            {group.items.map((item) => {
              const active = isActive(item.path)
              const hasIncomplete = item.path === '/crisis/history' && incompleteCount > 0
              const locked = item.planDisabled
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNav(item.path)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group relative mb-0.5 flex w-full items-center gap-3 rounded-(--radius-md) px-2 py-2 text-sm transition-colors ${
                    locked
                      ? 'border-l-[3px] border-transparent opacity-50 cursor-default'
                      : active
                        ? 'border-l-[3px] border-(--color-brand) bg-(--color-bg-interactive) font-medium text-(--color-text-primary)'
                        : 'border-l-[3px] border-transparent text-(--color-text-secondary) hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary)'
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {locked && !sidebarCollapsed && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto shrink-0 text-(--color-text-muted)">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                  {hasIncomplete && !locked && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--color-danger) px-1 text-[10px] font-bold text-white">
                      {incompleteCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User / logout */}
      <div className="border-t border-(--color-border)">
        {user && !sidebarCollapsed && (
          <div className="px-4 py-3 text-sm text-(--color-text-secondary) truncate">
            {user.user_metadata?.given_name ?? user.email}
          </div>
        )}
        {user && (
          <button
            type="button"
            onClick={() => signOut()}
            title={sidebarCollapsed ? 'Déconnexion' : undefined}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-(--color-text-muted) transition-colors hover:bg-(--color-bg-subtle) hover:text-(--color-danger)"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <LogOutIcon />
            </span>
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        )}
      </div>

      {/* Toggle collapse */}
      <button
        type="button"
        onClick={toggleCollapsed}
        className="flex items-center justify-center border-t border-(--color-border) py-3 text-(--color-text-muted) transition-colors hover:text-(--color-text-primary)"
        aria-label={sidebarCollapsed ? 'Étendre la sidebar' : 'Réduire la sidebar'}
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : undefined, transition: 'transform 200ms ease' }}
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </aside>
  )
}

// ─── Lucide-style SVG icons (inline to avoid dependency) ───

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function UtensilsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function CarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10H8s-2.7.6-4.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
      <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
    </svg>
  )
}

function BrainIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1 2 3.46 4 4 0 0 1 0 5.08A4 4 0 0 1 16 18a4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1-2-3.46 4 4 0 0 1 0-5.08A4 4 0 0 1 8 6a4 4 0 0 1 4-4z" />
      <path d="M12 2v20" />
    </svg>
  )
}

function PillIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function StethoscopeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  )
}

function TrendingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function CloudSunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="M20 12h2" /><path d="m19.07 4.93-1.41 1.41" /><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" /><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z" />
    </svg>
  )
}

function SmartphoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><line x1="12" x2="12.01" y1="18" y2="18" />
    </svg>
  )
}

function SlidersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" /><line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" /><line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" /><line x1="2" x2="6" y1="14" y2="14" /><line x1="10" x2="14" y1="8" y2="8" /><line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  )
}

function CalendarViewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
      <rect x="6" y="13" width="4" height="3" rx="0.5" /><rect x="14" y="13" width="4" height="3" rx="0.5" />
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}
