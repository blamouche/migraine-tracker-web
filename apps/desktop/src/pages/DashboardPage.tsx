import { useEffect } from 'react'
import { useNavigate } from 'react-router'
// @ts-expect-error — Nivo 0.99 exports MotionConfigProvider at runtime but has no type declarations
import { MotionConfigProvider } from '@nivo/core'
import { useCrisisStore } from '@/stores/crisisStore'
import { useFoodStore } from '@/stores/foodStore'
import { useTreatmentStore } from '@/stores/treatmentStore'
import { useDailyPainStore } from '@/stores/dailyPainStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useEnvironnementStore } from '@/stores/environnementStore'
import { IncompleteEntries } from '@/components/crisis/IncompleteEntries'
import { AlertBanner } from '@/components/alerts/AlertBanner'
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector'
import { KpiIndicators } from '@/components/dashboard/KpiIndicators'
import { CalendarHeatmap } from '@/components/dashboard/CalendarHeatmap'
import { CrisisFrequencyChart } from '@/components/dashboard/CrisisFrequencyChart'
import { IntensityEvolutionChart } from '@/components/dashboard/IntensityEvolutionChart'
import { TreatmentEfficacyChart } from '@/components/dashboard/TreatmentEfficacyChart'
import { TreatmentTimelineChart } from '@/components/dashboard/TreatmentTimelineChart'
import { TriggerFrequencyChart } from '@/components/dashboard/TriggerFrequencyChart'
import { TriggerCorrelationChart } from '@/components/dashboard/TriggerCorrelationChart'
import { TriggerTimelineChart } from '@/components/dashboard/TriggerTimelineChart'
import { FoodCorrelationChart } from '@/components/dashboard/FoodCorrelationChart'
import { WeatherOverviewChart } from '@/components/dashboard/WeatherOverviewChart'
import { PressureCrisisChart } from '@/components/dashboard/PressureCrisisChart'
import { LunarPhaseChart } from '@/components/dashboard/LunarPhaseChart'
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
  const { treatments, loadTreatments } = useTreatmentStore()
  const { entries: pains, loadPains } = useDailyPainStore()
  const { loadEnvironnements, backfillWeather } = useEnvironnementStore()
  const { activeTab, setActiveTab } = useDashboardStore()

  useEffect(() => {
    async function init() {
      await Promise.all([
        crises.length === 0 ? loadCrises() : Promise.resolve(),
        foodEntries.length === 0 ? loadFoodEntries() : Promise.resolve(),
        treatments.length === 0 ? loadTreatments() : Promise.resolve(),
        pains.length === 0 ? loadPains() : Promise.resolve(),
        loadEnvironnements(),
      ])
      backfillWeather()
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const incompleteCrises = crises.filter((c) => c.status === 'incomplet')

  return (
    <MotionConfigProvider animate={false}>
    <div>

        {/* Alerts (E06) */}
        <div className="mt-6">
          <AlertBanner />
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

        {/* Global date range selector */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-(--color-text-primary)">Période</h2>
            <DateRangeSelector />
          </div>
        </section>

        {/* KPI section */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-(--color-text-primary)">Indicateurs clés</h2>
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
    </MotionConfigProvider>
  )
}

function CrisesTab() {
  return (
    <>
      <ChartSection title="Calendrier douleur & crises">
        <CalendarHeatmap />
      </ChartSection>

      <ChartSection title="Fréquence des crises">
        <CrisisFrequencyChart />
      </ChartSection>

      <ChartSection title="Évolution de l'intensité">
        <IntensityEvolutionChart />
      </ChartSection>
    </>
  )
}

function DeclencheursTab() {
  return (
    <>
      <ChartSection title="Fréquence des déclencheurs">
        <TriggerFrequencyChart />
      </ChartSection>

      <ChartSection title="Intensité moyenne par déclencheur">
        <TriggerCorrelationChart />
      </ChartSection>

      <ChartSection title="Corrélations alimentaires">
        <FoodCorrelationChart />
      </ChartSection>

      <ChartSection title="Évolution des déclencheurs dans le temps">
        <TriggerTimelineChart />
      </ChartSection>
    </>
  )
}

function MeteoTab() {
  return (
    <>
      <ChartSection title="Évolution météo & crises">
        <WeatherOverviewChart />
      </ChartSection>

      <ChartSection title="Météo moyenne : jours de crise vs jours normaux">
        <PressureCrisisChart />
      </ChartSection>

      <ChartSection title="Crises par phase lunaire">
        <LunarPhaseChart />
      </ChartSection>
    </>
  )
}

function TraitementsTab() {
  return (
    <>
      <ChartSection title="Timeline des traitements">
        <TreatmentTimelineChart />
      </ChartSection>

      <ChartSection title="Utilisation des traitements de crise">
        <TreatmentEfficacyChart />
      </ChartSection>
    </>
  )
}

function ChartSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-(--color-text-primary)">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}
