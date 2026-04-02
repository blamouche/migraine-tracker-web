import { useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { nivoTheme } from '@/lib/nivoTheme'
import { calculateMoonPhase, LUNAR_PHASE_LABELS } from '@/types/environnement'
import type { LunarPhase } from '@/types/environnement'

const PHASE_ORDER: LunarPhase[] = [
  'nouvelle-lune',
  'premier-croissant',
  'premier-quartier',
  'gibbeuse-croissante',
  'pleine-lune',
  'gibbeuse-decroissante',
  'dernier-quartier',
  'dernier-croissant',
]

const MOON_EMOJIS: Record<LunarPhase, string> = {
  'nouvelle-lune': '🌑',
  'premier-croissant': '🌒',
  'premier-quartier': '🌓',
  'gibbeuse-croissante': '🌔',
  'pleine-lune': '🌕',
  'gibbeuse-decroissante': '🌖',
  'dernier-quartier': '🌗',
  'dernier-croissant': '🌘',
}

interface PhaseData {
  phase: string
  crises: number
  [key: string]: string | number
}

function buildLunarData(
  crises: { date: string }[],
  from: Date,
  to: Date,
): PhaseData[] {
  const counts = new Map<LunarPhase, number>()
  for (const p of PHASE_ORDER) counts.set(p, 0)

  for (const c of crises) {
    const d = new Date(c.date + 'T00:00:00')
    if (d < from || d > to) continue

    const { phase } = calculateMoonPhase(d)
    counts.set(phase, (counts.get(phase) ?? 0) + 1)
  }

  return PHASE_ORDER.map((p) => ({
    phase: `${MOON_EMOJIS[p]} ${LUNAR_PHASE_LABELS[p]}`,
    crises: counts.get(p) ?? 0,
  }))
}

export function LunarPhaseChart() {
  const crises = useCrisisStore((s) => s.crises)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange()

  const data = useMemo(() => buildLunarData(crises, from, to), [crises, from, to])
  const hasData = data.some((d) => d.crises > 0)

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
        <p className="text-sm text-(--color-text-muted)">Aucune crise sur cette période</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="h-64 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
        <ResponsiveBar
          data={data}
          keys={['crises']}
          indexBy="phase"
          margin={{ top: 10, right: 20, bottom: 60, left: 40 }}
          padding={0.3}
          colors={['#a78bfa']}
          borderRadius={4}
          theme={nivoTheme}
          enableLabel
          labelTextColor="var(--color-text-inverse)"
          axisBottom={{
            tickRotation: -35,
          }}
          axisLeft={{
            tickValues: 5,
          }}
          tooltip={({ indexValue, value }) => (
            <div
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
              }}
            >
              <strong>{indexValue}</strong> : {value} crise{value > 1 ? 's' : ''}
            </div>
          )}
        />
      </div>
      <p className="text-xs text-(--color-text-muted) italic">
        Corrélation exploratoire — non validée scientifiquement
      </p>
    </div>
  )
}
