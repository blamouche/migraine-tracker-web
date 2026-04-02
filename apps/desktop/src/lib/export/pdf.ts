import { jsPDF } from 'jspdf'
import type { CrisisEntry } from '@/types/crisis'
import { INTENSITY_LABELS, interpretHit6Score } from '@/types/crisis'
import type { MedicalProfile } from '@/types/medicalProfile'
import {
  MIGRAINE_TYPE_LABELS,
  CONTRACEPTION_LABELS,
  DOCTOR_SPECIALITY_LABELS,
} from '@/types/medicalProfile'
import type { ConsultationEntry } from '@/types/consultation'
import { CONSULTATION_TYPE_LABELS } from '@/types/consultation'

export interface ReportSections {
  profile: boolean
  summary: boolean
  triggers: boolean
  treatments: boolean
  consultations: boolean
  crisisDetails: boolean
}

export const DEFAULT_REPORT_SECTIONS: ReportSections = {
  profile: true,
  summary: true,
  triggers: true,
  treatments: true,
  consultations: true,
  crisisDetails: true,
}

export interface ReportOptions {
  from: string // YYYY-MM-DD
  to: string // YYYY-MM-DD
  crises: CrisisEntry[]
  medicalProfile: MedicalProfile | undefined
  consultations?: ConsultationEntry[]
  sections?: ReportSections
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function generateMedicalReport({ from, to, crises, medicalProfile, consultations, sections: sectionsOpt }: ReportOptions): void {
  const sections = { ...DEFAULT_REPORT_SECTIONS, ...sectionsOpt }
  const filtered = crises
    .filter((c) => c.date >= from && c.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date))

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let y = margin

  function checkNewPage(neededHeight: number) {
    if (y + neededHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage()
      y = margin
    }
  }

  // --- Header ---
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Rapport Médical — Migraine AI', margin, y)
  y += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text(`Période : ${formatDate(from)} — ${formatDate(to)}`, margin, y)
  y += 5
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, y)
  y += 3
  doc.text('Document généré côté client — aucune donnée transmise à un serveur.', margin, y)
  doc.setTextColor(0)
  y += 10

  // --- Patient profile (US-09-03) ---
  if (sections.profile && medicalProfile) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Profil patient', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    const profileLines: string[] = []
    profileLines.push(`Type de migraine : ${MIGRAINE_TYPE_LABELS[medicalProfile.migraineType]}${medicalProfile.migraineTypeAutre ? ` (${medicalProfile.migraineTypeAutre})` : ''}`)

    if (medicalProfile.traitementsCrise.length > 0) {
      profileLines.push(`Traitements de crise : ${medicalProfile.traitementsCrise.join(', ')}`)
    }
    if (medicalProfile.traitementsFond.length > 0) {
      profileLines.push(`Traitements de fond : ${medicalProfile.traitementsFond.join(', ')}`)
    }
    if (medicalProfile.antecedentsCardiovasculaires.length > 0) {
      profileLines.push(`Antécédents CV : ${medicalProfile.antecedentsCardiovasculaires.join(', ')}`)
    }
    if (medicalProfile.allergies.length > 0) {
      profileLines.push(`Allergies : ${medicalProfile.allergies.join(', ')}`)
    }
    if (medicalProfile.contreIndications.length > 0) {
      profileLines.push(`Contre-indications : ${medicalProfile.contreIndications.join(', ')}`)
    }
    if (medicalProfile.contraception !== 'aucune') {
      profileLines.push(`Contraception : ${CONTRACEPTION_LABELS[medicalProfile.contraception]}`)
    }
    for (const doc_ of medicalProfile.medecins) {
      if (doc_.nom) {
        profileLines.push(`${DOCTOR_SPECIALITY_LABELS[doc_.specialite]} : ${doc_.nom}${doc_.coordonnees ? ` — ${doc_.coordonnees}` : ''}`)
      }
    }

    for (const line of profileLines) {
      doc.text(`• ${line}`, margin + 2, y)
      y += 5
    }
    y += 5
  }

  // --- Separator ---
  doc.setDrawColor(200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // --- Summary ---
  if (sections.summary) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Résumé de la période', margin, y)
    y += 8

    const totalCrises = filtered.length
    const months = Math.max(1, (new Date(to + 'T00:00:00').getTime() - new Date(from + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24 * 30))
    const frequency = Math.round((totalCrises / months) * 10) / 10

    const intensities = filtered.map((c) => c.intensity)
    const avgIntensity = intensities.length > 0 ? Math.round((intensities.reduce((a, b) => a + b, 0) / intensities.length) * 10) / 10 : 0

    const durations = filtered.map((c) => c.estimatedDuration).filter((d): d is number => d != null)
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0

    const hit6Scores = filtered.filter((c) => !c.completionForcee && c.hit6Score != null).map((c) => c.hit6Score!)
    const avgHit6 = hit6Scores.length > 0 ? Math.round(hit6Scores.reduce((a, b) => a + b, 0) / hit6Scores.length) : null

    const highFrequency = frequency >= 4

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    const summaryLines = [
      `Nombre total de crises : ${totalCrises}`,
      `Fréquence mensuelle : ${frequency} crises/mois${highFrequency ? ' (fréquence élevée ≥ 4/mois)' : ''}`,
      `Intensité moyenne : ${avgIntensity}/10`,
      `Durée moyenne : ${formatDuration(avgDuration)} (min : ${formatDuration(minDuration)}, max : ${formatDuration(maxDuration)})`,
      ...(avgHit6 != null ? [`Score HIT-6 moyen : ${avgHit6} — ${interpretHit6Score(avgHit6)}`] : []),
    ]

    for (const line of summaryLines) {
      doc.text(`• ${line}`, margin + 2, y)
      y += 5
    }
    y += 5
  }

  // --- Top triggers ---
  if (sections.triggers) {
    const triggerCounts = new Map<string, number>()
    for (const c of filtered) {
      for (const t of c.triggers) {
        triggerCounts.set(t, (triggerCounts.get(t) ?? 0) + 1)
      }
    }
    const topTriggers = [...triggerCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

    if (topTriggers.length > 0) {
      checkNewPage(30)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Top 5 déclencheurs suspectés', margin, y)
      y += 7

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      for (const [name, count] of topTriggers) {
        doc.text(`• ${name} (${count} occurrence${count > 1 ? 's' : ''})`, margin + 2, y)
        y += 5
      }
      y += 5
    }
  }

  // --- Treatments ---
  if (sections.treatments) {
    const treatmentCounts = new Map<string, number>()
    for (const c of filtered) {
      for (const t of c.treatments) {
        treatmentCounts.set(t, (treatmentCounts.get(t) ?? 0) + 1)
      }
    }
    const topTreatments = [...treatmentCounts.entries()].sort((a, b) => b[1] - a[1])

    if (topTreatments.length > 0) {
      checkNewPage(30)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Traitements utilisés', margin, y)
      y += 7

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      for (const [name, count] of topTreatments) {
        doc.text(`• ${name} — ${count} prise${count > 1 ? 's' : ''}`, margin + 2, y)
        y += 5
      }
      y += 5
    }
  }

  // --- Consultations (US-11-02) ---
  const filteredConsultations = (consultations ?? [])
    .filter((c) => c.date >= from && c.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (sections.consultations && filteredConsultations.length > 0) {
    checkNewPage(25)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Consultations médicales', margin, y)
    y += 7

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    for (const c of filteredConsultations) {
      checkNewPage(15)
      const dateStr = new Date(c.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      doc.text(`• ${dateStr} — ${c.medecin} (${CONSULTATION_TYPE_LABELS[c.type]})`, margin + 2, y)
      y += 5
      if (c.decisions.length > 0) {
        doc.text(`  Décisions : ${c.decisions.join(', ')}`, margin + 4, y)
        y += 5
      }
    }
    y += 5
  }

  // --- Crisis list table ---
  if (sections.crisisDetails && filtered.length > 0) {
    checkNewPage(25)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Détail des crises', margin, y)
    y += 7

    // Table header
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(240, 240, 240)
    doc.rect(margin, y - 3, contentWidth, 6, 'F')
    const c0 = margin
    const c1 = margin + 22
    const c2 = margin + 36
    const c3 = margin + 50
    const c4 = margin + 80
    const c5 = margin + 120
    doc.text('Date', c0, y)
    doc.text('Heure', c1, y)
    doc.text('Intensité', c2, y)
    doc.text('Traitements', c3, y)
    doc.text('Symptômes', c4, y)
    doc.text('Déclencheurs', c5, y)
    y += 5

    doc.setFont('helvetica', 'normal')
    for (const c of filtered) {
      checkNewPage(8)

      const dateStr = new Date(c.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      doc.text(dateStr, c0, y)
      doc.text(c.startTime, c1, y)
      doc.text(`${c.intensity} — ${INTENSITY_LABELS[c.intensity] ?? ''}`, c2, y)

      const treatText = c.treatments.slice(0, 2).join(', ')
      doc.text(treatText.slice(0, 25), c3, y)

      const sympText = c.symptoms.slice(0, 2).join(', ')
      doc.text(sympText.slice(0, 25), c4, y)

      const trigText = c.triggers.slice(0, 2).join(', ')
      doc.text(trigText.slice(0, 25), c5, y)

      y += 5
    }
  }

  // --- Footer ---
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Migraine AI — Rapport médical — Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' },
    )
    doc.setTextColor(0)
  }

  doc.save(`rapport-medical-${from}-${to}.pdf`)
}
