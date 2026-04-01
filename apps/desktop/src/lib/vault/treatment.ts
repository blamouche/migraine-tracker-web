import type { TreatmentEntry, TherapeuticClass, TreatmentType, AdministrationRoute, EfficacyVerdict, FrequencyReduction, ToleranceLevel } from '@/types/treatment'
import { restoreVaultHandle, ensureVaultStructure } from './handle'
import { useAuthStore } from '@/stores/authStore'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const profileId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(profileId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

function treatmentFileName(id: string): string {
  return `${id}_traitement.md`
}

function treatmentToMarkdown(t: TreatmentEntry): string {
  const lines = [
    '---',
    `id: ${t.id}`,
    `nom: ${t.nom}`,
    `molecule: ${t.molecule}`,
    `classe: ${t.classe}`,
    `type: ${t.type}`,
    `posologie: ${t.posologie}`,
    `voie: ${t.voie}`,
    `date_debut: ${t.dateDebut}`,
    `date_fin: ${t.dateFin ?? ''}`,
    `motif_arret: ${t.motifArret ?? ''}`,
    `prescripteur: ${t.prescripteur ?? ''}`,
    `verdict: ${t.efficacite.verdict}`,
    `reduction_frequence: ${t.efficacite.reductionFrequence}`,
    `tolerance: ${t.efficacite.tolerance}`,
    `commentaire_efficacite: ${t.efficacite.commentaire ?? ''}`,
    `cree_le: ${t.createdAt}`,
    `modifie_le: ${t.updatedAt}`,
    '---',
    '',
  ]

  if (t.notes) {
    lines.push('## Notes', '', t.notes, '')
  }

  return lines.join('\n')
}

function markdownToTreatment(content: string): TreatmentEntry | null {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) return null

  const fm = fmMatch[1]!
  const get = (key: string): string => {
    const match = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
    return match?.[1]?.trim() ?? ''
  }

  const notesMatch = content.match(/## Notes\n\n([\s\S]*)$/)

  return {
    id: get('id'),
    nom: get('nom'),
    molecule: get('molecule'),
    classe: (get('classe') || 'autre') as TherapeuticClass,
    type: (get('type') || 'crise') as TreatmentType,
    posologie: get('posologie'),
    voie: (get('voie') || 'oral') as AdministrationRoute,
    dateDebut: get('date_debut'),
    dateFin: get('date_fin') || null,
    motifArret: get('motif_arret') || null,
    prescripteur: get('prescripteur') || null,
    notes: notesMatch?.[1]?.trim() ?? null,
    efficacite: {
      verdict: (get('verdict') || 'non-evalue') as EfficacyVerdict,
      reductionFrequence: (get('reduction_frequence') || 'aucune') as FrequencyReduction,
      tolerance: (get('tolerance') || 'bonne') as ToleranceLevel,
      commentaire: get('commentaire_efficacite') || null,
    },
    createdAt: get('cree_le'),
    updatedAt: get('modifie_le'),
  }
}

export async function writeTreatment(treatment: TreatmentEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  const dir = await root.getDirectoryHandle('traitements', { create: true })
  const file = await dir.getFileHandle(treatmentFileName(treatment.id), { create: true })
  const writable = await file.createWritable()
  await writable.write(treatmentToMarkdown(treatment))
  await writable.close()
  return true
}

export async function readAllTreatments(): Promise<TreatmentEntry[]> {
  const root = await getVaultRoot()
  if (!root) return []

  try {
    const dir = await root.getDirectoryHandle('traitements')
    const entries: TreatmentEntry[] = []

    for await (const [name, handle] of dir.entries()) {
      if (name.endsWith('_traitement.md') && handle.kind === 'file') {
        const content = await (await (handle as FileSystemFileHandle).getFile()).text()
        const treatment = markdownToTreatment(content)
        if (treatment) entries.push(treatment)
      }
    }

    return entries.sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))
  } catch {
    return []
  }
}

export async function deleteTreatment(treatment: TreatmentEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  try {
    const dir = await root.getDirectoryHandle('traitements')
    const corbeilleDir = await root.getDirectoryHandle('corbeille', { create: true })

    const file = await dir.getFileHandle(treatmentFileName(treatment.id))
    const content = await (await file.getFile()).text()

    const trashContent = content.replace('---\n', `---\nsupprime_le: ${new Date().toISOString()}\n`)
    const trashFile = await corbeilleDir.getFileHandle(treatmentFileName(treatment.id), { create: true })
    const writable = await trashFile.createWritable()
    await writable.write(trashContent)
    await writable.close()

    await dir.removeEntry(treatmentFileName(treatment.id))
    return true
  } catch {
    return false
  }
}
