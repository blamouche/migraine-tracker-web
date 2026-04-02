import { useEffect } from 'react'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDailyPainStore } from '@/stores/dailyPainStore'
import { useFoodStore } from '@/stores/foodStore'
import { useTreatmentStore } from '@/stores/treatmentStore'
import { useSportStore } from '@/stores/sportStore'
import { useTransportStore } from '@/stores/transportStore'
import { useCycleStore } from '@/stores/cycleStore'
import { useChargeMentaleStore } from '@/stores/chargeMentaleStore'
import { useConsultationStore } from '@/stores/consultationStore'
import { useEnvironnementStore } from '@/stores/environnementStore'
import { ConsolidatedCalendar } from '@/components/calendar/ConsolidatedCalendar'

export function CalendarPage() {
  const { crises, loadCrises } = useCrisisStore()
  const { entries: pains, loadPains } = useDailyPainStore()
  const { entries: foods, loadEntries: loadFoods } = useFoodStore()
  const { treatments, loadTreatments } = useTreatmentStore()
  const { entries: sports, loadSports } = useSportStore()
  const { entries: transports, loadTransports } = useTransportStore()
  const { entries: cycles, loadCycles } = useCycleStore()
  const { entries: charges, loadCharges } = useChargeMentaleStore()
  const { entries: consultations, loadConsultations } = useConsultationStore()
  const { loadEnvironnements } = useEnvironnementStore()

  useEffect(() => {
    const loads: Promise<void>[] = []
    if (crises.length === 0) loads.push(loadCrises())
    if (pains.length === 0) loads.push(loadPains())
    if (foods.length === 0) loads.push(loadFoods())
    if (treatments.length === 0) loads.push(loadTreatments())
    if (sports.length === 0) loads.push(loadSports())
    if (transports.length === 0) loads.push(loadTransports())
    if (cycles.length === 0) loads.push(loadCycles())
    if (charges.length === 0) loads.push(loadCharges())
    if (consultations.length === 0) loads.push(loadConsultations())
    loads.push(loadEnvironnements())
    Promise.all(loads)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <ConsolidatedCalendar />
    </div>
  )
}
