export interface EnvironnementEntry {
  id: string
  date: string // YYYY-MM-DD
  latitude: number
  longitude: number
  // Weather data
  temperatureMax: number | null // °C
  temperatureMin: number | null // °C
  pressionMoyenne: number | null // hPa
  variationPression24h: number | null // hPa
  humidite: number | null // %
  vitesseVent: number | null // km/h
  uvIndex: number | null
  precipitations: number | null // mm
  // Moon data (calculated locally)
  phaseLunaire: LunarPhase
  illuminationLunaire: number | null // 0-100%
  prochainePleineLune: string | null // YYYY-MM-DD
  prochaineNouvelleLune: string | null // YYYY-MM-DD
  // Meta
  source: 'open-meteo' | 'manual' | 'cached'
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type LunarPhase =
  | 'nouvelle-lune'
  | 'premier-croissant'
  | 'premier-quartier'
  | 'gibbeuse-croissante'
  | 'pleine-lune'
  | 'gibbeuse-decroissante'
  | 'dernier-quartier'
  | 'dernier-croissant'

export const LUNAR_PHASE_LABELS: Record<LunarPhase, string> = {
  'nouvelle-lune': 'Nouvelle Lune',
  'premier-croissant': 'Premier croissant',
  'premier-quartier': 'Premier quartier',
  'gibbeuse-croissante': 'Gibbeuse croissante',
  'pleine-lune': 'Pleine Lune',
  'gibbeuse-decroissante': 'Gibbeuse décroissante',
  'dernier-quartier': 'Dernier quartier',
  'dernier-croissant': 'Dernier croissant',
}

export interface LocationConfig {
  type: 'address' | 'geolocation' | 'favorite'
  label: string
  latitude: number
  longitude: number
}

export interface LocationPreferences {
  defaultLocation: LocationConfig | null
  favorites: LocationConfig[]
}

// Moon phase calculation (local, no API needed)
export function calculateMoonPhase(date: Date): { phase: LunarPhase; illumination: number } {
  // Simplified moon phase calculation based on synodic month
  const SYNODIC_MONTH = 29.53058867
  // Known new moon: Jan 6, 2000 18:14 UTC
  const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime()
  const diff = date.getTime() - KNOWN_NEW_MOON
  const days = diff / (1000 * 60 * 60 * 24)
  const cycle = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH
  const fraction = cycle / SYNODIC_MONTH

  // Illumination (approximate)
  const illumination = Math.round((1 - Math.cos(fraction * 2 * Math.PI)) / 2 * 100)

  // Phase determination
  let phase: LunarPhase
  if (fraction < 0.0625) phase = 'nouvelle-lune'
  else if (fraction < 0.1875) phase = 'premier-croissant'
  else if (fraction < 0.3125) phase = 'premier-quartier'
  else if (fraction < 0.4375) phase = 'gibbeuse-croissante'
  else if (fraction < 0.5625) phase = 'pleine-lune'
  else if (fraction < 0.6875) phase = 'gibbeuse-decroissante'
  else if (fraction < 0.8125) phase = 'dernier-quartier'
  else if (fraction < 0.9375) phase = 'dernier-croissant'
  else phase = 'nouvelle-lune'

  return { phase, illumination }
}

export function findNextMoonEvent(fromDate: Date, targetPhase: 'new' | 'full'): string {
  const SYNODIC_MONTH = 29.53058867
  const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime()
  const diff = fromDate.getTime() - KNOWN_NEW_MOON
  const days = diff / (1000 * 60 * 60 * 24)
  const currentCycle = days / SYNODIC_MONTH
  const offset = targetPhase === 'full' ? 0.5 : 0

  let nextEvent = (Math.ceil(currentCycle - offset) + offset) * SYNODIC_MONTH
  if (nextEvent <= days) nextEvent += SYNODIC_MONTH

  const eventDate = new Date(KNOWN_NEW_MOON + nextEvent * 24 * 60 * 60 * 1000)
  return eventDate.toISOString().slice(0, 10)
}
