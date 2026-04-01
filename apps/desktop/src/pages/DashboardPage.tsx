import { useEffect } from 'react'
import { useNavigate } from 'react-router'
// @ts-expect-error — Nivo 0.99 exports MotionConfigProvider at runtime but has no type declarations
import { MotionConfigProvider } from '@nivo/core'
import { useCrisisStore } from '@/stores/crisisStore'
import { useFoodStore } from '@/stores/foodStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { IncompleteEntries } from '@/components/crisis/IncompleteEntries'
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector'
import { KpiIndicators } from '@/components/dashboard/KpiIndicators'
import { CalendarHeatmap } from '@/components/dashboard/CalendarHeatmap'
import { CrisisFrequencyChart } from '@/components/dashboard/CrisisFrequencyChart'
import { IntensityEvolutionChart } from '@/components/dashboard/IntensityEvolutionChart'
import { TreatmentEfficacyChart } from '@/components/dashboard/TreatmentEfficacyChart'
import type { DashboardTab } from '@/types/dashboard'

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'crises', label: 'Crises' },
  { id: 'declencheurs', label: 'Déclencheurs' },
  { id: 'meteo', label: 'Météo' },
  { id: 'traitements', label: 'Traitements' },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const { crises, loadCrises } = useCrisisStore()
  const { entries: foodEntries, loadEntries: loadFoodEntries } = useFoodStore()
  const { activeTab, setActiveTab } = useDashboardStore()

  useEffect(() => {
    if (crises.length === 0) loadCrises()
    if (foodEntries.length === 0) loadFoodEntries()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const incompleteCrises = crises.filter((c) => c.status === 'incomplet')

  return (
    <MotionConfigProvider animate={false}>
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-[1200px] px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
          >
            Accueil
          </button>
        </div>

        {/* Zone d'attention (US-02-13) */}
        {incompleteCrises.length > 0 && (
          <div className="mt-6">
            <IncompleteEntries
              crises={crises}
              onComplete={(crisis) => navigate(`/crisis/${crisis.id}/edit`)}
            />
          </div>
        )}

        {/* KPI section with its own date range */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-(--color-text-primary)">Indicateurs clés</h2>
            <DateRangeSelector chartId="kpi" />
          </div>
          <div className="mt-3">
            <KpiIndicators />
          </div>
        </section>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 border-b border-(--color-border)">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-(--color-brand) text-(--color-brand)'
                  : 'text-(--color-text-muted) hover:text-(--color-text-secondary)'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-6 space-y-6">
          {activeTab === 'crises' && <CrisesTab />}
          {activeTab === 'declencheurs' && <DeclencheursTab />}
          {activeTab === 'meteo' && <MeteoTab />}
          {activeTab === 'traitements' && <TraitementsTab />}
        </div>
      </div>

      {/* FAB — Crisis quick access */}
      <button
        type="button"
        onClick={() => navigate('/crisis/quick')}
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-(--color-danger) text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Enregistrer une crise"
        title="Mode Crise"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </button>
    </main>
    </MotionConfigProvider>
  )
}

function CrisesTab() {
  return (
    <>
      <ChartSection title="Calendrier douleur & crises" chartId="calendar">
        <CalendarHeatmap />
      </ChartSection>

      <ChartSection title="Fréquence des crises" chartId="frequency">
        <CrisisFrequencyChart />
      </ChartSection>

      <ChartSection title="Évolution de l'intensité" chartId="intensity">
        <IntensityEvolutionChart />
      </ChartSection>
    </>
  )
}

function DeclencheursTab() {
  return (
    <div className="flex h-40 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
      <p className="text-sm text-(--color-text-muted)">
        Les graphiques de corrélation déclencheurs seront disponibles prochainement (US-04-07)
      </p>
    </div>
  )
}

function MeteoTab() {
  return (
    <div className="flex h-40 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
      <p className="text-sm text-(--color-text-muted)">
        Les graphiques météo seront disponibles prochainement (US-04-05, US-04-08)
      </p>
    </div>
  )
}

function TraitementsTab() {
  return (
    <ChartSection title="Utilisation des traitements" chartId="treatments">
      <TreatmentEfficacyChart />
    </ChartSection>
  )
}

function ChartSection({
  title,
  chartId,
  children,
}: {
  title: string
  chartId: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-(--color-text-primary)">{title}</h3>
        <DateRangeSelector chartId={chartId} />
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}
