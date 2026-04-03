import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

      const ctrlOrMeta = e.ctrlKey || e.metaKey

      if (ctrlOrMeta) {
        switch (e.key) {
          case 'n':
            e.preventDefault()
            navigateRef.current('/crisis/quick')
            return
          case 'd':
            e.preventDefault()
            navigateRef.current('/dashboard')
            return
          case ',':
            e.preventDefault()
            navigateRef.current('/environnement')
            return
        }
      }

      // ? key shows shortcut panel (no ctrl needed)
      if (e.key === '?' && !ctrlOrMeta) {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('toggle-shortcuts-panel'))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}

export const SHORTCUT_LIST = [
  { keys: ['Ctrl', 'N'], description: 'Nouvelle crise' },
  { keys: ['Ctrl', 'D'], description: 'Dashboard' },
  { keys: ['Ctrl', 'K'], description: 'Command Palette' },
  { keys: ['Ctrl', ','], description: 'Préférences' },
  { keys: ['Escape'], description: 'Fermer le panneau actif' },
  { keys: ['?'], description: 'Afficher les raccourcis' },
]
