import { useNavigate, useLocation } from 'react-router'
import { useNavigationStore } from '@/stores/navigationStore'

const BOTTOM_ITEMS = [
  {
    label: 'Accueil',
    path: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Crise',
    path: '/crisis/quick',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Menu',
    path: '__menu__',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
      </svg>
    ),
  },
] as const

export function BottomBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSidebarOpen } = useNavigationStore()

  const handleClick = (path: string) => {
    if (path === '__menu__') {
      setSidebarOpen(true)
    } else {
      navigate(path)
    }
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-(--color-border) bg-(--color-bg-elevated) md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navigation mobile"
    >
      {BOTTOM_ITEMS.map((item) => {
        const active = item.path !== '__menu__' && (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path))
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => handleClick(item.path)}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] transition-colors ${
              active
                ? 'text-(--color-brand) font-medium'
                : 'text-(--color-text-muted)'
            }`}
            aria-label={item.label}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
