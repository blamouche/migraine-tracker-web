import { MODULE_META, type CalendarModule } from './calendarHelpers'

interface CalendarLegendProps {
  enabledModules: Set<CalendarModule>
}

export function CalendarLegend({ enabledModules }: CalendarLegendProps) {
  const visibleModules = MODULE_META.filter((m) => enabledModules.has(m.id))

  return (
    <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
        Légende des indicateurs
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {visibleModules.map((mod) => (
          <div key={mod.id} className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
              style={{ backgroundColor: `${mod.color}20`, color: mod.color }}
            >
              {mod.icon}
            </span>
            <div>
              <p className="text-xs font-medium text-(--color-text-primary)">{mod.label}</p>
              <p className="text-[10px] text-(--color-text-muted)">{getLegendDescription(mod.id)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getLegendDescription(id: CalendarModule): string {
  switch (id) {
    case 'crisis': return 'Pastille rouge + intensité'
    case 'pain': return 'Barre vert → rouge'
    case 'food': return 'Fourchette (rouge si risque)'
    case 'treatment': return 'Pilule verte = actif'
    case 'sport': return 'Icône sport + type'
    case 'transport': return 'Icône transport + type'
    case 'cycle': return 'Point coloré par phase'
    case 'chargeMentale': return 'Jauge basse/moy./haute'
    case 'consultation': return 'Badge « RDV »'
    case 'weather': return 'Météo + pression'
  }
}
