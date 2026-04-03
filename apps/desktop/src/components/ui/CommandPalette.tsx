import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useCrisisStore } from '@/stores/crisisStore'
import { useTreatmentStore } from '@/stores/treatmentStore'
import { useModuleStore } from '@/stores/moduleStore'

interface CommandItem {
  id: string
  label: string
  category: 'page' | 'crise' | 'traitement' | 'action'
  icon: string
  action: () => void
}

const PAGE_COMMANDS: { label: string; path: string; icon: string }[] = [
  { label: 'Accueil', path: '/', icon: '\ud83c\udfe0' },
  { label: 'Dashboard', path: '/dashboard', icon: '\ud83d\udcca' },
  { label: 'Crises', path: '/crisis/history', icon: '\u26a1' },
  { label: 'Alimentation', path: '/alimentaire/historique', icon: '\ud83c\udf7d\ufe0f' },
  { label: 'Traitements', path: '/traitements/historique', icon: '\ud83d\udc8a' },
  { label: 'Patterns', path: '/patterns', icon: '\ud83d\udcc8' },
  { label: 'Profil médical', path: '/profil-medical', icon: '\ud83d\udccb' },
  { label: 'Cycle menstruel', path: '/cycle/historique', icon: '\ud83d\udcc5' },
  { label: 'Consultations', path: '/consultations/historique', icon: '\ud83c\udfe5' },
  { label: 'Transports', path: '/transports/historique', icon: '\ud83d\ude97' },
  { label: 'Sport', path: '/sport/historique', icon: '\ud83c\udfc3' },
  { label: 'Charge mentale', path: '/charge-mentale/historique', icon: '\ud83e\udde0' },
  { label: 'Douleur quotidienne', path: '/douleur/historique', icon: '\u2764\ufe0f' },
  { label: 'Module IA', path: '/ia', icon: '\u2728' },
  { label: 'Sync mobile', path: '/mobile-sync', icon: '\ud83d\udcf1' },
  { label: 'Export', path: '/export', icon: '\ud83d\udce5' },
  { label: 'Rapport', path: '/rapport', icon: '\ud83d\udcc4' },
  { label: 'Alertes', path: '/alertes', icon: '\ud83d\udd14' },
  { label: 'Environnement', path: '/environnement', icon: '\u2699\ufe0f' },
  { label: 'Modules de suivi', path: '/modules', icon: '\ud83d\udd27' },
]

const ACTION_COMMANDS: { label: string; path: string; icon: string }[] = [
  { label: 'Nouvelle crise', path: '/crisis/quick', icon: '\u26a1' },
  { label: 'Nouveau repas', path: '/alimentaire/nouveau', icon: '\ud83c\udf7d\ufe0f' },
  { label: 'Nouveau traitement', path: '/traitements/nouveau', icon: '\ud83d\udc8a' },
  { label: 'Nouvelle consultation', path: '/consultations/nouveau', icon: '\ud83c\udfe5' },
  { label: 'Exporter PDF', path: '/rapport', icon: '\ud83d\udcc4' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentCommands, setRecentCommands] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('command-palette-recent') || '[]')
    } catch {
      return []
    }
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const crises = useCrisisStore((s) => s.crises)
  const treatments = useTreatmentStore((s) => s.treatments)
  const isRouteEnabled = useModuleStore((s) => s.isRouteEnabled)

  // Open/close with Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const executeCommand = useCallback(
    (item: CommandItem) => {
      item.action()
      setOpen(false)

      // Store in recents
      const updated = [item.id, ...recentCommands.filter((r) => r !== item.id)].slice(0, 5)
      setRecentCommands(updated)
      localStorage.setItem('command-palette-recent', JSON.stringify(updated))
    },
    [recentCommands],
  )

  const allCommands: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = []

    // Actions (filtered by enabled modules)
    for (const cmd of ACTION_COMMANDS) {
      if (!isRouteEnabled(cmd.path)) continue
      items.push({
        id: `action:${cmd.path}`,
        label: cmd.label,
        category: 'action',
        icon: cmd.icon,
        action: () => navigate(cmd.path),
      })
    }

    // Pages (filtered by enabled modules)
    for (const cmd of PAGE_COMMANDS) {
      if (!isRouteEnabled(cmd.path)) continue
      items.push({
        id: `page:${cmd.path}`,
        label: cmd.label,
        category: 'page',
        icon: cmd.icon,
        action: () => navigate(cmd.path),
      })
    }

    // Recent crises
    for (const crisis of crises.slice(0, 5)) {
      items.push({
        id: `crise:${crisis.id}`,
        label: `Crise du ${crisis.date} (intensité ${crisis.intensity})`,
        category: 'crise',
        icon: '\u26a1',
        action: () => navigate(`/crisis/${crisis.id}/edit`),
      })
    }

    // Active treatments
    for (const t of treatments.filter((tr) => !tr.dateFin).slice(0, 5)) {
      items.push({
        id: `traitement:${t.id}`,
        label: `${t.nom} — ${t.molecule}`,
        category: 'traitement',
        icon: '\ud83d\udc8a',
        action: () => navigate(`/traitements/${t.id}/edit`),
      })
    }

    return items
  }, [crises, treatments, navigate, isRouteEnabled])

  const filtered = useMemo(() => {
    if (!query.trim()) {
      // Show recents first, then actions
      const recents = recentCommands
        .map((id) => allCommands.find((c) => c.id === id))
        .filter(Boolean) as CommandItem[]
      if (recents.length > 0) return recents
      return allCommands.filter((c) => c.category === 'action').slice(0, 5)
    }
    const q = query.toLowerCase()
    return allCommands.filter((c) => c.label.toLowerCase().includes(q)).slice(0, 10)
  }, [query, allCommands, recentCommands])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[selectedIndex]
      if (item) executeCommand(item)
    }
  }

  if (!open) return null

  const CATEGORY_LABELS: Record<string, string> = {
    action: 'Actions',
    page: 'Pages',
    crise: 'Crises récentes',
    traitement: 'Traitements actifs',
  }

  // Group by category
  let currentCategory = ''

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/50"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-[20%] z-[81] w-[520px] max-w-[90vw] -translate-x-1/2 overflow-hidden rounded-(--radius-xl) bg-(--color-bg-elevated) shadow-2xl"
        role="combobox"
        aria-expanded="true"
        aria-controls="command-palette-listbox"
        aria-label="Command Palette"
      >
        <div className="flex items-center gap-3 border-b border-(--color-border) px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une page, une crise, une action..."
            className="flex-1 bg-transparent text-sm text-(--color-text-primary) outline-none placeholder:text-(--color-text-muted)"
            aria-label="Recherche"
          />
          <kbd className="text-[11px] text-(--color-text-muted) border border-(--color-border) rounded px-1.5 py-0.5 bg-(--color-bg-subtle)">Esc</kbd>
        </div>

        <ul id="command-palette-listbox" className="max-h-[300px] overflow-y-auto py-2" role="listbox">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-(--color-text-muted)">
              Aucun résultat pour « {query} »
            </li>
          )}
          {filtered.map((item, i) => {
            const showCategory = item.category !== currentCategory
            if (showCategory) currentCategory = item.category

            return (
              <li key={item.id}>
                {showCategory && (
                  <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-(--color-text-muted)">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => executeCommand(item)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                    i === selectedIndex
                      ? 'bg-(--color-bg-interactive) text-(--color-text-primary)'
                      : 'text-(--color-text-secondary) hover:bg-(--color-bg-subtle)'
                  }`}
                  role="option"
                  aria-selected={i === selectedIndex}
                >
                  <span className="flex h-6 w-6 items-center justify-center text-base">{item.icon}</span>
                  <span className="flex-1 truncate">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-4 border-t border-(--color-border) px-4 py-2 text-[11px] text-(--color-text-muted)">
          <span><kbd className="font-mono">\u2191\u2193</kbd> Naviguer</span>
          <span><kbd className="font-mono">\u21b5</kbd> Sélectionner</span>
          <span><kbd className="font-mono">Esc</kbd> Fermer</span>
        </div>
      </div>
    </>
  )
}
