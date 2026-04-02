import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useNavigationStore } from '@/stores/navigationStore'
import { useProfileStore } from '@/stores/profileStore'
import { useCrisisStore } from '@/stores/crisisStore'
import type { UserProfile } from '@/types/profile'

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
      { label: 'Alertes', path: '/alertes', icon: <BellIcon /> },
      { label: 'Profils', path: '/profils', icon: <UsersIcon /> },
      { label: 'Environnement', path: '/environnement', icon: <SettingsIcon /> },
      { label: 'Sync mobile', path: '/mobile-sync', icon: <SmartphoneIcon /> },
    ],
  },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed, toggleCollapsed, setSidebarOpen } = useNavigationStore()
  const profiles = useProfileStore((s) => s.profiles)
  const activeProfileId = useProfileStore((s) => s.activeProfileId)
  const activeProfile = useMemo(() => profiles.find((p) => p.id === activeProfileId) ?? null, [profiles, activeProfileId])
  const crises = useCrisisStore((s) => s.crises)
  const incompleteCount = useMemo(() => crises.filter((c) => c.status === 'incomplet').length, [crises])

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
        {NAV_GROUPS.map((group) => (
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
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNav(item.path)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group relative mb-0.5 flex w-full items-center gap-3 rounded-(--radius-md) px-2 py-2 text-sm transition-colors ${
                    active
                      ? 'border-l-[3px] border-(--color-brand) bg-(--color-bg-interactive) font-medium text-(--color-text-primary)'
                      : 'border-l-[3px] border-transparent text-(--color-text-secondary) hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary)'
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {hasIncomplete && (
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

      {/* Profile selector */}
      {!sidebarCollapsed && activeProfile && (
        <button
          type="button"
          onClick={() => handleNav('/profils')}
          className="flex items-center gap-3 border-t border-(--color-border) px-4 py-3 text-left text-sm transition-colors hover:bg-(--color-bg-subtle)"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: activeProfile.couleur || 'var(--color-brand)' }}
          >
            {activeProfile.nom.charAt(0).toUpperCase()}
          </span>
          <span className="truncate text-(--color-text-primary)">{activeProfile.nom}</span>
        </button>
      )}

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

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
