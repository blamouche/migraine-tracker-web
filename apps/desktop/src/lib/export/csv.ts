import type { CrisisEntry } from '@/types/crisis'
import type { FoodEntry, DailyFactors } from '@/types/alimentaire'
import { MEAL_TYPE_LABELS } from '@/types/alimentaire'
import { INTENSITY_LABELS } from '@/types/crisis'

const BOM = '\uFEFF'

function escapeCsv(value: string | number | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCsv).join(',')
  const dataLines = rows.map((row) => row.map(escapeCsv).join(','))
  return BOM + [headerLine, ...dataLines].join('\r\n')
}

function downloadBlob(content: string, filename: string, mimeType = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadBlobRaw(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportCrisesCsv(crises: CrisisEntry[], filename = 'crises-migraine-ai.csv') {
  const headers = [
    'Date',
    'Heure début',
    'Heure fin',
    'Intensité',
    'Intensité (label)',
    'Durée estimée (min)',
    'Traitements',
    'Symptômes',
    'Déclencheurs',
    'Localisation',
    'Score HIT-6',
    'Notes',
    'Statut',
    'Complétion forcée',
  ]

  const rows = crises.map((c) => [
    c.date,
    c.startTime,
    c.endTime,
    c.intensity,
    INTENSITY_LABELS[c.intensity] ?? '',
    c.estimatedDuration,
    c.treatments.join('; '),
    c.symptoms.join('; '),
    c.triggers.join('; '),
    c.location,
    c.hit6Score,
    c.notes,
    c.status,
    c.completionForcee ? 'Oui' : 'Non',
  ])

  downloadBlob(buildCsv(headers, rows), filename)
}

export function exportFoodCsv(entries: FoodEntry[], filename = 'journal-alimentaire-migraine-ai.csv') {
  const headers = [
    'Date',
    'Heure',
    'Type de repas',
    'Aliments',
    'Notes',
    'Statut',
  ]

  const rows = entries.map((e) => [
    e.date,
    e.time,
    MEAL_TYPE_LABELS[e.mealType],
    e.foods.join('; '),
    e.notes,
    e.status,
  ])

  downloadBlob(buildCsv(headers, rows), filename)
}

export function exportDailyFactorsCsv(
  factors: DailyFactors[],
  filename = 'facteurs-quotidiens-migraine-ai.csv',
) {
  const headers = ['Date', 'Stress (1-5)', 'Qualité sommeil (1-5)', 'Hydratation']

  const rows = factors.map((f) => [f.date, f.stress, f.sleepQuality, f.hydration])

  downloadBlob(buildCsv(headers, rows), filename)
}
