import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'

interface ShortcutDef {
  key: string
  ctrl?: boolean
  description: string
  action: () => void
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate()

  const shortcuts: ShortcutDef[] = [
    { key: 'n', ctrl: true, description: 'Nouvelle crise', action: () => navigate('/crisis/quick') },
    { key: 'd', ctrl: true, description: 'Dashboard', action: () => navigate('/dashboard') },
    { key: 'p', ctrl: true, description: 'Sélecteur de profil', action: () => navigate('/profils') },
    { key: ',', ctrl: true, description: 'Préférences', action: () => navigate('/environnement') },
  ]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      for (const shortcut of shortcuts) {
        const ctrlOrMeta = e.ctrlKey || e.metaKey
        if (shortcut.ctrl && ctrlOrMeta && e.key === shortcut.key) {
          e.preventDefault()
          shortcut.action()
          return
        }
      }

      // ? key shows shortcut panel (no ctrl needed)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('toggle-shortcuts-panel'))
      }
    },
    [shortcuts],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return shortcuts
}

export const SHORTCUT_LIST = [
  { keys: ['Ctrl', 'N'], description: 'Nouvelle crise' },
  { keys: ['Ctrl', 'D'], description: 'Dashboard' },
  { keys: ['Ctrl', 'K'], description: 'Command Palette' },
  { keys: ['Ctrl', 'P'], description: 'Sélecteur de profil' },
  { keys: ['Ctrl', ','], description: 'Préférences' },
  { keys: ['Escape'], description: 'Fermer le panneau actif' },
  { keys: ['?'], description: 'Afficher les raccourcis' },
]
