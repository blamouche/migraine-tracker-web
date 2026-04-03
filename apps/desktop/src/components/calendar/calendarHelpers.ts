import type { CrisisEntry } from '@/types/crisis'
import type { DailyPainEntry } from '@/types/dailyPain'
import type { FoodEntry } from '@/types/alimentaire'
import type { TreatmentEntry } from '@/types/treatment'
import type { SportEntry } from '@/types/sport'
import type { TransportEntry } from '@/types/transport'
import type { CycleEntry } from '@/types/cycle'
import type { ChargeMentaleEntry } from '@/types/chargeMentale'
import type { ConsultationEntry } from '@/types/consultation'
import type { EnvironnementEntry } from '@/types/environnement'

// ─── Types ───

export type CalendarModule =
  | 'crisis'
  | 'pain'
  | 'food'
  | 'treatment'
  | 'sport'
  | 'transport'
  | 'cycle'
  | 'chargeMentale'
  | 'consultation'
  | 'weather'

export interface CalendarModuleMeta {
  id: CalendarModule
  label: string
  icon: string // emoji for simplicity in indicators
  color: string // CSS color
}

export const MODULE_META: CalendarModuleMeta[] = [
  { id: 'crisis', label: 'Crises', icon: '⚡', color: '#ef4444' },
  { id: 'pain', label: 'Douleur', icon: '💢', color: '#f97316' },
  { id: 'food', label: 'Alimentation', icon: '🍴', color: '#22c55e' },
  { id: 'treatment', label: 'Traitements', icon: '💊', color: '#3b82f6' },
  { id: 'sport', label: 'Sport', icon: '🏃', color: '#8b5cf6' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#6366f1' },
  { id: 'cycle', label: 'Cycle', icon: '●', color: '#ec4899' },
  { id: 'chargeMentale', label: 'Charge mentale', icon: '🧠', color: '#f59e0b' },
  { id: 'consultation', label: 'RDV', icon: '🩺', color: '#14b8a6' },
  { id: 'weather', label: 'Météo', icon: '☁️', color: '#64748b' },
]

export function getModuleMeta(id: CalendarModule): CalendarModuleMeta {
  return MODULE_META.find((m) => m.id === id)!
}

// ─── Indicator data per module per day ───

export interface CrisisIndicator {
  module: 'crisis'
  intensity: number // max intensity that day
  count: number
}

export interface PainIndicator {
  module: 'pain'
  niveau: number // 0-10
}

export interface FoodIndicator {
  module: 'food'
  mealCount: number
  hasRiskFood: boolean
}

export interface TreatmentIndicator {
  module: 'treatment'
  taken: boolean
  names: string[]
}

export interface SportIndicator {
  module: 'sport'
  type: string
  intensite: number
}

export interface TransportIndicator {
  module: 'transport'
  moyen: string
}

export interface CycleIndicator {
  module: 'cycle'
  phase: string
}

export interface ChargeMentaleIndicator {
  module: 'chargeMentale'
  niveau: number // 1-10
}

export interface ConsultationIndicator {
  module: 'consultation'
  medecin: string
}

export interface WeatherIndicator {
  module: 'weather'
  pression: number | null
  phase: string | null
}

export type DayIndicator =
  | CrisisIndicator
  | PainIndicator
  | FoodIndicator
  | TreatmentIndicator
  | SportIndicator
  | TransportIndicator
  | CycleIndicator
  | ChargeMentaleIndicator
  | ConsultationIndicator
  | WeatherIndicator

export interface ConsolidatedDayData {
  date: string // YYYY-MM-DD
  indicators: DayIndicator[]
}

// ─── Aggregation ───

export interface AllStoreData {
  crises: CrisisEntry[]
  pains: DailyPainEntry[]
  foods: FoodEntry[]
  treatments: TreatmentEntry[]
  sports: SportEntry[]
  transports: TransportEntry[]
  cycles: CycleEntry[]
  charges: ChargeMentaleEntry[]
  consultations: ConsultationEntry[]
  weather: EnvironnementEntry[]
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function getDaysInMonth(year: number, month: number): string[] {
  const daysCount = new Date(year, month + 1, 0).getDate()
  const days: string[] = []
  for (let d = 1; d <= daysCount; d++) {
    days.push(`${year}-${pad(month + 1)}-${pad(d)}`)
  }
  return days
}

/** Check if a treatment is active on a given date */
function isTreatmentActiveOnDate(t: TreatmentEntry, date: string): boolean {
  if (t.dateDebut > date) return false
  if (t.dateFin && t.dateFin < date) return false
  return true
}

/** Check if a cycle entry covers a given date */
function isCycleDateInRange(c: CycleEntry, date: string): boolean {
  const start = new Date(c.dateDebut)
  const end = new Date(start)
  end.setDate(end.getDate() + c.dureeJours - 1)
  const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`
  return date >= c.dateDebut && date <= endStr
}

export function buildConsolidatedData(
  data: AllStoreData,
  year: number,
  month: number,
  enabledModules: Set<CalendarModule>,
): Map<string, ConsolidatedDayData> {
  const days = getDaysInMonth(year, month)
  const result = new Map<string, ConsolidatedDayData>()

  // Pre-index entries by date for O(1) lookups
  const crisesByDate = groupByDate(data.crises, (c) => c.date)
  const painsByDate = groupByDate(data.pains, (p) => p.date)
  const foodsByDate = groupByDate(data.foods, (f) => f.date)
  const sportsByDate = groupByDate(data.sports, (s) => s.date)
  const transportsByDate = groupByDate(data.transports, (t) => t.date)
  const chargesByDate = groupByDate(data.charges, (c) => c.date)
  const consultationsByDate = groupByDate(data.consultations, (c) => c.date)
  const weatherByDate = groupByDate(data.weather, (w) => w.date)

  for (const day of days) {
    const indicators: DayIndicator[] = []

    // Crisis
    if (enabledModules.has('crisis')) {
      const dayCrises = crisesByDate.get(day)
      if (dayCrises && dayCrises.length > 0) {
        indicators.push({
          module: 'crisis',
          intensity: Math.max(...dayCrises.map((c) => c.intensity)),
          count: dayCrises.length,
        })
      }
    }

    // Pain
    if (enabledModules.has('pain')) {
      const dayPains = painsByDate.get(day)
      if (dayPains && dayPains.length > 0) {
        indicators.push({
          module: 'pain',
          niveau: Math.max(...dayPains.map((p) => p.niveau)),
        })
      }
    }

    // Food
    if (enabledModules.has('food')) {
      const dayFoods = foodsByDate.get(day)
      if (dayFoods && dayFoods.length > 0) {
        indicators.push({
          module: 'food',
          mealCount: dayFoods.length,
          hasRiskFood: false, // TODO: check against risk foods from pattern store
        })
      }
    }

    // Treatment
    if (enabledModules.has('treatment')) {
      const activeTreatments = data.treatments.filter((t) => isTreatmentActiveOnDate(t, day))
      if (activeTreatments.length > 0) {
        indicators.push({
          module: 'treatment',
          taken: true,
          names: activeTreatments.map((t) => t.nom),
        })
      }
    }

    // Sport
    if (enabledModules.has('sport')) {
      const daySports = sportsByDate.get(day)
      if (daySports && daySports.length > 0) {
        const first = daySports[0]!
        indicators.push({
          module: 'sport',
          type: first.type,
          intensite: Math.max(...daySports.map((s) => s.intensite)),
        })
      }
    }

    // Transport
    if (enabledModules.has('transport')) {
      const dayTransports = transportsByDate.get(day)
      if (dayTransports && dayTransports.length > 0) {
        indicators.push({
          module: 'transport',
          moyen: dayTransports[0]!.moyen,
        })
      }
    }

    // Cycle
    if (enabledModules.has('cycle')) {
      const matchingCycle = data.cycles.find((c) => isCycleDateInRange(c, day))
      if (matchingCycle) {
        indicators.push({
          module: 'cycle',
          phase: matchingCycle.phase,
        })
      }
    }

    // Charge mentale
    if (enabledModules.has('chargeMentale')) {
      const dayCharges = chargesByDate.get(day)
      if (dayCharges && dayCharges.length > 0) {
        indicators.push({
          module: 'chargeMentale',
          niveau: Math.max(...dayCharges.map((c) => c.niveau)),
        })
      }
    }

    // Consultation
    if (enabledModules.has('consultation')) {
      const dayConsultations = consultationsByDate.get(day)
      if (dayConsultations && dayConsultations.length > 0) {
        indicators.push({
          module: 'consultation',
          medecin: dayConsultations[0]!.medecin,
        })
      }
    }

    // Weather
    if (enabledModules.has('weather')) {
      const dayWeather = weatherByDate.get(day)
      if (dayWeather && dayWeather.length > 0) {
        const w = dayWeather[0]!
        indicators.push({
          module: 'weather',
          pression: w.pressionMoyenne,
          phase: w.phaseLunaire,
        })
      }
    }

    result.set(day, { date: day, indicators })
  }

  return result
}

function groupByDate<T>(items: T[], getDate: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const date = getDate(item)
    const existing = map.get(date)
    if (existing) existing.push(item)
    else map.set(date, [item])
  }
  return map
}

// ─── Completion rate ───

export function computeCompletionRate(
  consolidatedData: Map<string, ConsolidatedDayData>,
  year: number,
  month: number,
): { filledDays: number; totalDays: number; rate: number } {
  const today = new Date()
  const days = getDaysInMonth(year, month)
  // Only count days up to today for current month
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
  const totalDays = isCurrentMonth ? today.getDate() : days.length

  let filledDays = 0
  for (let i = 0; i < totalDays; i++) {
    const dayData = consolidatedData.get(days[i]!)
    if (dayData && dayData.indicators.length > 0) {
      filledDays++
    }
  }

  return {
    filledDays,
    totalDays,
    rate: totalDays > 0 ? Math.round((filledDays / totalDays) * 100) : 0,
  }
}

// ─── Day detail helpers ───

export function getIndicatorLabel(indicator: DayIndicator): string {
  switch (indicator.module) {
    case 'crisis':
      return `Crise (intensité ${indicator.intensity}/10)${indicator.count > 1 ? ` × ${indicator.count}` : ''}`
    case 'pain':
      return `Douleur : ${indicator.niveau}/10`
    case 'food':
      return `${indicator.mealCount} repas enregistré${indicator.mealCount > 1 ? 's' : ''}${indicator.hasRiskFood ? ' ⚠️ aliment à risque' : ''}`
    case 'treatment':
      return `Traitement${indicator.names.length > 1 ? 's' : ''} : ${indicator.names.join(', ')}`
    case 'sport':
      return `Sport : ${indicator.type} (intensité ${indicator.intensite}/5)`
    case 'transport':
      return `Transport : ${indicator.moyen}`
    case 'cycle':
      return `Cycle : phase ${indicator.phase}`
    case 'chargeMentale':
      return `Charge mentale : ${indicator.niveau}/10`
    case 'consultation':
      return `RDV médical : ${indicator.medecin}`
    case 'weather':
      return `Météo${indicator.pression ? ` : ${indicator.pression} hPa` : ''}${indicator.phase ? ` · ${indicator.phase}` : ''}`
  }
}

// ─── Quick add routes ───

export interface QuickAddOption {
  module: CalendarModule
  label: string
  path: string
}

export function getQuickAddOptions(enabledModules: Set<CalendarModule>): QuickAddOption[] {
  const options: QuickAddOption[] = [
    { module: 'crisis', label: 'Nouvelle crise', path: '/crisis/quick' },
    { module: 'pain', label: 'Douleur du jour', path: '/douleur/nouveau' },
    { module: 'food', label: 'Repas', path: '/alimentaire/nouveau' },
    { module: 'sport', label: 'Activité sportive', path: '/sport/nouveau' },
    { module: 'transport', label: 'Transport', path: '/transports/nouveau' },
    { module: 'chargeMentale', label: 'Charge mentale', path: '/charge-mentale/nouveau' },
    { module: 'consultation', label: 'Consultation', path: '/consultations/nouveau' },
    { module: 'cycle', label: 'Cycle menstruel', path: '/cycle/nouveau' },
  ]
  return options.filter((o) => enabledModules.has(o.module))
}

// ─── Edit routes for day detail ───

export function getEditRouteForModule(module: CalendarModule): string | null {
  switch (module) {
    case 'crisis': return '/crisis/history'
    case 'pain': return '/douleur/historique'
    case 'food': return '/alimentaire/historique'
    case 'treatment': return '/traitements/historique'
    case 'sport': return '/sport/historique'
    case 'transport': return '/transports/historique'
    case 'chargeMentale': return '/charge-mentale/historique'
    case 'consultation': return '/consultations/historique'
    case 'cycle': return '/cycle/historique'
    case 'weather': return '/environnement'
    default: return null
  }
}
