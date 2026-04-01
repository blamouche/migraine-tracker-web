import type { CrisisEntry } from '@/types/crisis'
import { useCrisisStore } from '@/stores/crisisStore'

interface IncompleteEntriesProps {
  crises: CrisisEntry[]
  onComplete: (crisis: CrisisEntry) => void
}

export function IncompleteEntries({ crises, onComplete }: IncompleteEntriesProps) {
  const { updateCrisis } = useCrisisStore()
  const incomplete = crises.filter(
    (c) => c.status === 'incomplet' && !c.completionForcee,
  )

  if (incomplete.length === 0) return null

  const handleForce = async (crisis: CrisisEntry) => {
    await updateCrisis({ ...crisis, completionForcee: true })
  }

  return (
    <section
      className="rounded-(--radius-xl) border border-(--color-warning) bg-(--color-warning-light) p-4"
      aria-label="Entrées incomplètes"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-(--color-warning) text-xs font-bold text-white">
          {incomplete.length}
        </span>
        <h2 className="text-sm font-semibold text-(--color-text-primary)">
          {incomplete.length === 1 ? 'Crise à compléter' : 'Crises à compléter'}
        </h2>
      </div>

      <ul className="mt-3 space-y-2">
        {incomplete.map((crisis) => (
          <li
            key={crisis.id}
            className="flex items-center justify-between rounded-(--radius-md) bg-(--color-bg-elevated) px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-(--color-text-primary)">
                {formatDateFr(crisis.date)} — {crisis.startTime}
              </p>
              <p className="text-xs text-(--color-text-muted)">
                Intensité {crisis.intensity}/10
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onComplete(crisis)}
                className="rounded-(--radius-md) bg-(--color-brand) px-3 py-1.5 text-xs font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)"
              >
                Compléter
              </button>
              <button
                type="button"
                onClick={() => handleForce(crisis)}
                className="rounded-(--radius-md) border border-(--color-border) px-3 py-1.5 text-xs text-(--color-text-muted) hover:bg-(--color-bg-subtle)"
                title="Marquer comme suffisant — exclure des analytics sensibles"
              >
                Forcer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function formatDateFr(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}
