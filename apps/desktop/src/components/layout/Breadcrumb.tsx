import { useLocation, useNavigate } from 'react-router'

interface BreadcrumbEntry {
  label: string
  path: string
}

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Accueil',
  '/dashboard': 'Dashboard',
  '/crisis/quick': 'Nouvelle crise',
  '/crisis/history': 'Crises',
  '/alimentaire/nouveau': 'Nouveau repas',
  '/alimentaire/historique': 'Alimentation',
  '/traitements/nouveau': 'Nouveau traitement',
  '/traitements/historique': 'Traitements',
  '/patterns': 'Patterns',
  '/profil-medical': 'Profil médical',
  '/cycle/nouveau': 'Nouveau cycle',
  '/cycle/historique': 'Cycles',
  '/consultations/nouveau': 'Nouvelle consultation',
  '/consultations/historique': 'Consultations',
  '/transports/nouveau': 'Nouveau trajet',
  '/transports/historique': 'Transports',
  '/sport/nouveau': 'Nouvelle séance',
  '/sport/historique': 'Sport',
  '/charge-mentale/nouveau': 'Nouvelle entrée',
  '/charge-mentale/historique': 'Charge mentale',
  '/douleur/nouveau': 'Nouvelle douleur',
  '/douleur/historique': 'Douleur quotidienne',
  '/evenement/nouveau': 'Nouvel événement',
  '/environnement': 'Environnement',
  '/ia': 'Module IA',
  '/mobile-sync': 'Sync mobile',
  '/rapport': 'Rapport',
  '/export': 'Export',
  '/alertes': 'Alertes',
}

const PARENT_MAP: Record<string, string> = {
  '/crisis/quick': '/',
  '/alimentaire/nouveau': '/alimentaire/historique',
  '/traitements/nouveau': '/traitements/historique',
  '/cycle/nouveau': '/cycle/historique',
  '/consultations/nouveau': '/consultations/historique',
  '/transports/nouveau': '/transports/historique',
  '/sport/nouveau': '/sport/historique',
  '/charge-mentale/nouveau': '/charge-mentale/historique',
  '/douleur/nouveau': '/douleur/historique',
  '/evenement/nouveau': '/charge-mentale/historique',
}

function resolveBreadcrumbs(pathname: string): BreadcrumbEntry[] {
  const crumbs: BreadcrumbEntry[] = [{ label: 'Accueil', path: '/' }]
  if (pathname === '/') return crumbs

  // Check for dynamic routes (edit pages)
  const editMatch = pathname.match(/^\/([^/]+)\/[^/]+\/edit$/)
  if (editMatch && editMatch[1]) {
    const section: string = editMatch[1]
    const historyPath = `/${section}/historique`
    const altHistoryPath = `/${section}/history`
    const parentLabel = ROUTE_LABELS[historyPath] || ROUTE_LABELS[altHistoryPath] || section
    const parentPath = ROUTE_LABELS[historyPath] ? historyPath : altHistoryPath
    crumbs.push({ label: parentLabel, path: parentPath })
    crumbs.push({ label: 'Modifier', path: pathname })
    return crumbs
  }

  // Check parent map first
  const parent = PARENT_MAP[pathname]
  if (parent && parent !== '/') {
    crumbs.push({ label: ROUTE_LABELS[parent] || parent, path: parent })
  }

  const label = ROUTE_LABELS[pathname] || pathname.split('/').pop() || pathname
  crumbs.push({ label, path: pathname })
  return crumbs
}

export function Breadcrumb() {
  const location = useLocation()
  const navigate = useNavigate()
  const crumbs = resolveBreadcrumbs(location.pathname)

  if (crumbs.length <= 1) return null

  // Mobile: show only parent link
  const parent = crumbs[crumbs.length - 2]!


  return (
    <>
      {/* Mobile breadcrumb */}
      <nav className="mb-2 md:hidden" aria-label="Fil d'Ariane">
        <button
          type="button"
          onClick={() => navigate(parent.path)}
          className="flex items-center gap-1 text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {parent.label}
        </button>
      </nav>

      {/* Desktop breadcrumb */}
      <nav className="mb-2 hidden md:block" aria-label="Fil d'Ariane">
        <ol className="flex items-center gap-1 text-sm">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1
            return (
              <li key={crumb.path} className="flex items-center gap-1">
                {i > 0 && <span className="text-(--color-text-muted)">&gt;</span>}
                {isLast ? (
                  <span className="text-(--color-text-muted)">{crumb.label}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(crumb.path)}
                    className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
                  >
                    {crumb.label}
                  </button>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
