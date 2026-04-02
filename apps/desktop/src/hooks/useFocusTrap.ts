import { useEffect, useRef, type RefObject } from 'react'

export function useFocusTrap(active: boolean): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active || !ref.current) return

    // Store the previously focused element
    previousFocus.current = document.activeElement as HTMLElement

    // Focus the first focusable element inside the trap
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusables = ref.current.querySelectorAll<HTMLElement>(focusableSelector)
    if (focusables.length > 0) {
      focusables[0]!.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !ref.current) return

      const focusableList = ref.current.querySelectorAll<HTMLElement>(focusableSelector)
      if (focusableList.length === 0) return

      const first = focusableList[0]!
      const last = focusableList[focusableList.length - 1]!

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus to the element that had it before the trap
      previousFocus.current?.focus()
    }
  }, [active])

  return ref
}
