import { useState } from 'react'

interface ChipSelectorProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  onAddCustom?: (value: string) => void
  helpText?: string
  tooltips?: Record<string, string>
}

export function ChipSelector({
  label,
  options,
  selected,
  onChange,
  onAddCustom,
  helpText,
  tooltips,
}: ChipSelectorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [customValue, setCustomValue] = useState('')

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const handleAddCustom = () => {
    const trimmed = customValue.trim()
    if (trimmed && !options.includes(trimmed)) {
      onAddCustom?.(trimmed)
      onChange([...selected, trimmed])
      setCustomValue('')
      setIsAdding(false)
    }
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-(--color-text-primary)">
        {label}
        {helpText && (
          <FieldTooltip text={helpText} />
        )}
      </legend>

      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((option) => {
          const isSelected = selected.includes(option)
          const isCustom = !DEFAULT_SET.has(option)
          return (
            <button
              key={option}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggle(option)}
              title={tooltips?.[option]}
              className={`rounded-(--radius-full) border px-3 py-1.5 text-sm transition-colors ${
                isSelected
                  ? 'border-(--color-brand) bg-(--color-brand) text-(--color-text-inverse)'
                  : 'border-(--color-border) bg-(--color-bg-elevated) text-(--color-text-primary) hover:border-(--color-brand)'
              }`}
            >
              {isCustom && '✏️ '}{option}
            </button>
          )
        })}

        {onAddCustom && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="rounded-(--radius-full) border border-dashed border-(--color-border) px-3 py-1.5 text-sm text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand)"
          >
            + Ajouter…
          </button>
        )}

        {isAdding && (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAddCustom() }
                if (e.key === 'Escape') { setIsAdding(false); setCustomValue('') }
              }}
              placeholder="Nouvelle valeur"
              className="rounded-(--radius-sm) border border-(--color-brand) bg-(--color-bg-elevated) px-2 py-1 text-sm text-(--color-text-primary) focus:outline-none"
              // eslint-disable-next-line jsx-a11y/no-autofocus -- inline add field needs immediate focus
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddCustom}
              className="rounded-(--radius-sm) bg-(--color-brand) px-2 py-1 text-xs text-(--color-text-inverse)"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </fieldset>
  )
}

// Track which items are from the default sets — module-level set
const DEFAULT_SET = new Set<string>()

// eslint-disable-next-line react-refresh/only-export-components
export function initDefaultSet(items: string[]) {
  items.forEach((item) => DEFAULT_SET.add(item))
}

function FieldTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative ml-1 inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-xs text-(--color-text-muted) hover:text-(--color-brand)"
        aria-label="Aide"
      >
        ⓘ
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-10 mb-1 w-48 -translate-x-1/2 rounded-(--radius-md) bg-(--color-bg-elevated) p-2 text-xs text-(--color-text-secondary) shadow-lg ring-1 ring-(--color-border)"
        >
          {text}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="ml-1 text-(--color-text-muted) hover:text-(--color-text-primary)"
            aria-label="Fermer"
          >
            ✕
          </button>
        </span>
      )}
    </span>
  )
}
