import { useState, useCallback, type KeyboardEvent } from 'react'

interface UseKeyboardListNavOptions {
  itemCount: number
  onSelect?: (index: number) => void
  onEdit?: (index: number) => void
  onDelete?: (index: number) => void
}

export function useKeyboardListNav({ itemCount, onSelect, onEdit, onDelete }: UseKeyboardListNavOptions) {
  const [activeIndex, setActiveIndex] = useState(-1)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((prev) => Math.min(prev + 1, itemCount - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          if (activeIndex >= 0) {
            e.preventDefault()
            onSelect?.(activeIndex)
          }
          break
        case 'e':
          if (activeIndex >= 0 && !e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            onEdit?.(activeIndex)
          }
          break
        case 'Delete':
        case 'Backspace':
          if (activeIndex >= 0) {
            e.preventDefault()
            onDelete?.(activeIndex)
          }
          break
        case 'Home':
          e.preventDefault()
          setActiveIndex(0)
          break
        case 'End':
          e.preventDefault()
          setActiveIndex(Math.max(0, itemCount - 1))
          break
      }
    },
    [activeIndex, itemCount, onSelect, onEdit, onDelete],
  )

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    getItemProps: (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      'aria-selected': index === activeIndex,
      className: index === activeIndex ? 'bg-(--color-bg-interactive)' : '',
      onFocus: () => setActiveIndex(index),
    }),
  }
}
