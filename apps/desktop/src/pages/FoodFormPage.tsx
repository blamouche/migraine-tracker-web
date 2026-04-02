import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ChipSelector, initDefaultSet } from '@/components/crisis/ChipSelector'
import { DailyFactorsForm } from '@/components/alimentaire/DailyFactorsForm'
import {
  DEFAULT_FOODS,
  MEAL_TYPE_LABELS,
} from '@/types/alimentaire'
import type { FoodEntry, MealType, MealTemplate, DailyFactors } from '@/types/alimentaire'
import { useFoodStore } from '@/stores/foodStore'
import { useCrisisStore } from '@/stores/crisisStore'
import { computeFoodRiskScores } from '@/lib/patterns/foodCorrelation'

const DEFAULT_FOOD_NAMES = DEFAULT_FOODS.map((f) => f.name)
initDefaultSet(DEFAULT_FOOD_NAMES)

const FOOD_TAGS_MAP = new Map(DEFAULT_FOODS.map((f) => [f.name, f.tags]))

const FIELD_HELP = {
  foods: {
    label: 'Aliments',
    content: 'Sélectionnez les aliments consommés. Les étiquettes de risque (tyramine, histamine…) sont affichées pour les aliments connus.',
    example: 'Fromage affiné, chocolat, café',
  },
}

function now(): string {
  return new Date().toTimeString().slice(0, 5)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function FoodFormPage() {
  const navigate = useNavigate()
  const { foodId } = useParams<{ foodId: string }>()
  const isEdit = Boolean(foodId)

  const {
    entries,
    loadEntries,
    createEntry,
    updateEntry,
    dailyFactors,
    loadDailyFactors,
    saveDailyFactors,
    getFactorsForDate,
    mealTemplates,
    loadMealTemplates,
    saveMealAsTemplate,
    useTemplate: incrementTemplateUsage,
  } = useFoodStore()

  const crises = useCrisisStore((s) => s.crises)

  const [entry, setEntry] = useState<FoodEntry | null>(
    isEdit
      ? null
      : {
          id: '',
          date: today(),
          time: now(),
          mealType: guessMealType(),
          foods: [],
          notes: null,
          status: 'incomplet',
          completionForcee: false,
          createdAt: '',
          updatedAt: '',
        },
  )
  const [factors, setFactors] = useState<DailyFactors | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [customFoods, setCustomFoods] = useState<string[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)

  const foodOptions = [...DEFAULT_FOOD_NAMES, ...customFoods]
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // US-03-03: Personal food risk scores
  const foodRiskScores = useMemo(
    () => computeFoodRiskScores(entries, crises),
    [entries, crises],
  )

  // Load data
  useEffect(() => {
    if (entries.length === 0) loadEntries()
    if (dailyFactors.length === 0) loadDailyFactors()
    loadMealTemplates()
  }, [entries.length, dailyFactors.length, loadEntries, loadDailyFactors, loadMealTemplates])

  // For edit mode: load entry from store
  useEffect(() => {
    if (isEdit && !entry) {
      const found = entries.find((e) => e.id === foodId)
      if (found) setEntry({ ...found })
    }
  }, [entries, foodId, isEdit]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load daily factors for the current date
  useEffect(() => {
    if (entry) {
      const existing = getFactorsForDate(entry.date)
      if (existing && !factors) {
        setFactors({ ...existing })
      } else if (!factors) {
        setFactors({
          date: entry.date,
          stress: 3,
          sleepQuality: 3,
          hydration: 'bonne',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }
  }, [entry?.date]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save every 30 seconds (edit mode only)
  const doAutoSave = useCallback(async () => {
    if (isEdit && entry) {
      await updateEntry(entry)
      if (factors) await saveDailyFactors(factors)
    }
  }, [entry, factors, isEdit, updateEntry, saveDailyFactors])

  useEffect(() => {
    if (isEdit) {
      autoSaveTimer.current = setInterval(doAutoSave, 30_000)
      return () => {
        if (autoSaveTimer.current) clearInterval(autoSaveTimer.current)
      }
    }
  }, [doAutoSave, isEdit])

  if (!entry) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base)">
        <p className="text-(--color-text-secondary)">Chargement…</p>
      </main>
    )
  }

  const update = (partial: Partial<FoodEntry>) => {
    setEntry((prev) => (prev ? { ...prev, ...partial } : prev))
  }

  const handleSelectTemplate = (template: MealTemplate) => {
    setEntry((prev) =>
      prev
        ? { ...prev, foods: [...template.foods], notes: template.notes, mealType: template.mealType }
        : prev,
    )
    incrementTemplateUsage(template.templateId)
    setShowTemplates(false)
  }

  const handleSaveAsTemplate = async () => {
    if (!entry || !templateName.trim()) return
    await saveMealAsTemplate(entry, templateName.trim())
    setTemplateName('')
    setShowSaveTemplate(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isEdit) {
        await updateEntry(entry)
      } else {
        await createEntry(entry)
      }
      if (factors) {
        await saveDailyFactors({ ...factors, date: entry.date })
      }
      navigate('/alimentaire/historique')
    } finally {
      setIsSaving(false)
    }
  }

  // Show risk tags for selected foods
  const selectedTags = new Set(
    entry.foods.flatMap((f) => FOOD_TAGS_MAP.get(f) ?? []),
  )

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {isEdit ? 'Modifier le repas' : 'Nouveau repas'}
          </h1>
          <div className="flex items-center gap-3">
            {!isEdit && mealTemplates.length > 0 && (
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="rounded-(--radius-md) border border-(--color-brand) px-3 py-1.5 text-sm text-(--color-brand) hover:bg-(--color-brand) hover:text-(--color-text-inverse) transition-colors"
              >
                Utiliser un modèle
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)"
            >
              Retour
            </button>
          </div>
        </div>

        {/* US-03-04: Template selector */}
        {showTemplates && (
          <div className="mt-3 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-4 space-y-2">
            <p className="text-sm font-medium text-(--color-text-secondary)">Modèles enregistrés</p>
            {mealTemplates.map((t) => (
              <button
                key={t.templateId}
                type="button"
                onClick={() => handleSelectTemplate(t)}
                className="flex w-full items-center justify-between rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-left text-sm hover:border-(--color-brand) transition-colors"
              >
                <div>
                  <span className="font-medium">{t.templateName}</span>
                  <span className="ml-2 text-(--color-text-muted)">
                    {MEAL_TYPE_LABELS[t.mealType]} · {t.foods.length} aliment{t.foods.length > 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-xs text-(--color-text-muted)">
                  {t.usageCount > 0 ? `${t.usageCount}×` : 'Jamais utilisé'}
                </span>
              </button>
            ))}
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="food-date" className="text-sm font-medium">Date</label>
              <input
                id="food-date"
                type="date"
                value={entry.date}
                onChange={(e) => update({ date: e.target.value })}
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="food-time" className="text-sm font-medium">Heure</label>
              <input
                id="food-time"
                type="time"
                value={entry.time}
                onChange={(e) => update({ time: e.target.value })}
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Meal type */}
          <div>
            <p className="text-sm font-medium">Type de repas</p>
            <div className="mt-2 flex gap-2 flex-wrap">
              {(Object.entries(MEAL_TYPE_LABELS) as [MealType, string][]).map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => update({ mealType: type })}
                  className={`rounded-(--radius-md) px-4 py-2 text-sm transition-colors ${
                    entry.mealType === type
                      ? 'bg-(--color-brand) text-(--color-text-inverse)'
                      : 'border border-(--color-border) bg-(--color-bg-elevated) text-(--color-text-primary) hover:border-(--color-brand)'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Foods */}
          <div>
            <ChipSelector
              label="Aliments"
              options={foodOptions}
              selected={entry.foods}
              onChange={(v) => update({ foods: v })}
              onAddCustom={(v) => setCustomFoods((prev) => [...prev, v])}
              helpText={FIELD_HELP.foods.content}
            />
          </div>

          {/* Risk tags indicator */}
          {selectedTags.size > 0 && (
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedTags).map((tag) => (
                <span
                  key={tag}
                  className="rounded-(--radius-full) bg-(--color-warning-light) px-2 py-0.5 text-xs text-(--color-warning)"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* US-03-03: Personal food risk scores */}
          {entry.foods.some((f) => foodRiskScores.has(f)) && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-(--color-text-muted)">Scores de risque personnels</p>
              <div className="flex flex-wrap gap-1">
                {entry.foods
                  .filter((f) => foodRiskScores.has(f))
                  .map((f) => {
                    const risk = foodRiskScores.get(f)!
                    return (
                      <span
                        key={f}
                        className="rounded-(--radius-full) border border-(--color-danger) bg-(--color-bg-elevated) px-2 py-0.5 text-xs text-(--color-danger)"
                        title={`${risk.crisisPreceded} crise(s) sur ${risk.occurrences} consommation(s) dans les 48h`}
                      >
                        {f} : {risk.score}%
                      </span>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="food-notes" className="text-sm font-medium">Notes</label>
            <textarea
              id="food-notes"
              value={entry.notes ?? ''}
              onChange={(e) => update({ notes: e.target.value || null })}
              rows={3}
              placeholder="Détails supplémentaires…"
              className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Daily factors (US-03-02) */}
          {factors && (
            <DailyFactorsForm
              factors={factors}
              onChange={setFactors}
            />
          )}

          {/* US-03-01: Save as template */}
          {entry.foods.length > 0 && (
            <div>
              {showSaveTemplate ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Nom du modèle…"
                    className="flex-1 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleSaveAsTemplate() }
                      if (e.key === 'Escape') setShowSaveTemplate(false)
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveAsTemplate}
                    disabled={!templateName.trim()}
                    className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm text-(--color-text-inverse) hover:bg-(--color-brand-hover) disabled:opacity-50"
                  >
                    Sauver
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSaveTemplate(false)}
                    className="rounded-(--radius-md) border border-(--color-border) px-3 py-2 text-sm text-(--color-text-muted)"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSaveTemplate(true)}
                  className="text-sm text-(--color-brand) hover:underline"
                >
                  Sauvegarder comme modèle
                </button>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-(--radius-md) bg-(--color-brand) py-3 text-sm font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover) disabled:opacity-50"
            >
              {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-(--radius-md) border border-(--color-border) px-6 py-3 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-subtle)"
            >
              Annuler
            </button>
          </div>

          {isEdit && (
            <p className="text-center text-xs text-(--color-text-muted)">
              Sauvegarde automatique toutes les 30 secondes
            </p>
          )}
        </form>
      </div>
    </main>
  )
}

function guessMealType(): MealType {
  const hour = new Date().getHours()
  if (hour < 10) return 'petit-dejeuner'
  if (hour < 14) return 'dejeuner'
  if (hour < 19) return 'collation'
  return 'diner'
}
