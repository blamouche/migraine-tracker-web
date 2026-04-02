import type { EnvironnementEntry } from '@/types/environnement'
import { calculateMoonPhase, findNextMoonEvent } from '@/types/environnement'

interface OpenMeteoResponse {
  daily: {
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    surface_pressure_mean?: number[]
    relative_humidity_2m_mean?: number[]
    wind_speed_10m_max: number[]
    uv_index_max: number[]
    precipitation_sum: number[]
  }
}

export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  date: string,
): Promise<Omit<EnvironnementEntry, 'id' | 'createdAt' | 'updatedAt'> | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,uv_index_max,precipitation_sum&timezone=auto&start_date=${date}&end_date=${date}`

    const response = await fetch(url)
    if (!response.ok) return null

    const data: OpenMeteoResponse = await response.json()
    const daily = data.daily

    const dateObj = new Date(date + 'T12:00:00')
    const moon = calculateMoonPhase(dateObj)

    return {
      date,
      latitude,
      longitude,
      temperatureMax: daily.temperature_2m_max?.[0] ?? null,
      temperatureMin: daily.temperature_2m_min?.[0] ?? null,
      pressionMoyenne: daily.surface_pressure_mean?.[0] ?? null,
      variationPression24h: null, // would need yesterday's data
      humidite: daily.relative_humidity_2m_mean?.[0] ?? null,
      vitesseVent: daily.wind_speed_10m_max?.[0] ?? null,
      uvIndex: daily.uv_index_max?.[0] ?? null,
      precipitations: daily.precipitation_sum?.[0] ?? null,
      phaseLunaire: moon.phase,
      illuminationLunaire: moon.illumination,
      prochainePleineLune: findNextMoonEvent(dateObj, 'full'),
      prochaineNouvelleLune: findNextMoonEvent(dateObj, 'new'),
      source: 'open-meteo',
    }
  } catch {
    return null
  }
}

export async function fetchHistoricalWeather(
  latitude: number,
  longitude: number,
  fromDate: string,
  toDate: string,
): Promise<Array<Omit<EnvironnementEntry, 'id' | 'createdAt' | 'updatedAt'>>> {
  try {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_sum&timezone=auto&start_date=${fromDate}&end_date=${toDate}`

    const response = await fetch(url)
    if (!response.ok) return []

    const data = await response.json()
    const daily = data.daily
    const dates: string[] = data.daily?.time ?? []

    return dates.map((date: string, i: number) => {
      const dateObj = new Date(date + 'T12:00:00')
      const moon = calculateMoonPhase(dateObj)

      return {
        date,
        latitude,
        longitude,
        temperatureMax: daily.temperature_2m_max?.[i] ?? null,
        temperatureMin: daily.temperature_2m_min?.[i] ?? null,
        pressionMoyenne: null,
        variationPression24h: null,
        humidite: null,
        vitesseVent: daily.wind_speed_10m_max?.[i] ?? null,
        uvIndex: null,
        precipitations: daily.precipitation_sum?.[i] ?? null,
        phaseLunaire: moon.phase,
        illuminationLunaire: moon.illumination,
        prochainePleineLune: findNextMoonEvent(dateObj, 'full'),
        prochaineNouvelleLune: findNextMoonEvent(dateObj, 'new'),
        source: 'open-meteo' as const,
      }
    })
  } catch {
    return []
  }
}
