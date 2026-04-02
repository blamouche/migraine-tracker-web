import { useEffect, useState } from 'react'
import { SHORTCUT_LIST } from '@/hooks/useKeyboardShortcuts'

export function ShortcutsPanel() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen((prev) => !prev)
    document.addEventListener('toggle-shortcuts-panel', handler)
    return () => document.removeEventListener('toggle-shortcuts-panel', handler)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-black/50"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-1/2 z-[91] w-[400px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6 shadow-xl"
        role="dialog"
        aria-label="Raccourcis clavier"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Raccourcis clavier</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-(--color-text-muted) hover:text-(--color-text-primary)"
            aria-label="Fermer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          </button>
        </div>
        <ul className="space-y-2">
          {SHORTCUT_LIST.map((shortcut) => (
            <li key={shortcut.description} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-(--color-text-secondary)">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="inline-flex h-6 min-w-6 items-center justify-center rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-subtle) px-1.5 text-[11px] font-medium text-(--color-text-primary)"
                  >
                    {key === 'Ctrl' ? (navigator.platform.includes('Mac') ? '\u2318' : 'Ctrl') : key}
                  </kbd>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
