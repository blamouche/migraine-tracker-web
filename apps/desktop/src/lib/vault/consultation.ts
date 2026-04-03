import type { ConsultationEntry, ConsultationType } from '@/types/consultation'
import { restoreVaultHandle, ensureVaultStructure } from './handle'
import { useAuthStore } from '@/stores/authStore'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const userId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(userId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

function consultationFileName(date: string, id: string): string {
  return `${date}_consultation_${id}.md`
}

function consultationToMarkdown(c: ConsultationEntry): string {
  const lines = [
    '---',
    `id: ${c.id}`,
    `date: ${c.date}`,
    `heure: ${c.heure}`,
    `medecin: ${c.medecin}`,
    `specialite: ${c.specialite}`,
    `type: ${c.type}`,
    `motif: ${c.motif}`,
    `decisions: [${c.decisions.join(', ')}]`,
    `ordonnances: [${c.ordonnances.join(', ')}]`,
    `prochain_rdv: ${c.prochainRdv ?? ''}`,
    `cree_le: ${c.createdAt}`,
    `modifie_le: ${c.updatedAt}`,
    '---',
    '',
  ]

  if (c.resume) {
    lines.push('## Résumé', '', c.resume, '')
  }

  if (c.notes) {
    lines.push('## Notes', '', c.notes, '')
  }

  return lines.join('\n')
}

function markdownToConsultation(content: string): ConsultationEntry | null {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) return null

  const fm = fmMatch[1]!
  const get = (key: string): string => {
    const match = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
    return match?.[1]?.trim() ?? ''
  }

  const getArray = (key: string): string[] => {
    const raw = get(key)
    const inner = raw.match(/^\[(.*)\]$/)?.[1]
    if (!inner) return raw ? [raw] : []
    return inner.split(',').map((s) => s.trim()).filter(Boolean)
  }

  const resumeMatch = content.match(/## Résumé\n\n([\s\S]*?)(?=\n## |$)/)
  const notesMatch = content.match(/## Notes\n\n([\s\S]*)$/)

  return {
    id: get('id'),
    date: get('date'),
    heure: get('heure'),
    medecin: get('medecin'),
    specialite: get('specialite'),
    type: (get('type') || 'cabinet') as ConsultationType,
    motif: get('motif'),
    resume: resumeMatch?.[1]?.trim() ?? '',
    decisions: getArray('decisions'),
    ordonnances: getArray('ordonnances'),
    prochainRdv: get('prochain_rdv') || null,
    notes: notesMatch?.[1]?.trim() ?? null,
    createdAt: get('cree_le'),
    updatedAt: get('modifie_le'),
  }
}

export async function writeConsultation(entry: ConsultationEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  const dir = await root.getDirectoryHandle('consultations', { create: true })
  const file = await dir.getFileHandle(consultationFileName(entry.date, entry.id), { create: true })
  const writable = await file.createWritable()
  await writable.write(consultationToMarkdown(entry))
  await writable.close()
  return true
}

export async function readAllConsultations(): Promise<ConsultationEntry[]> {
  const root = await getVaultRoot()
  if (!root) return []

  try {
    const dir = await root.getDirectoryHandle('consultations')
    const entries: ConsultationEntry[] = []

    for await (const [name, handle] of dir.entries()) {
      if (name.endsWith('.md') && handle.kind === 'file') {
        const content = await (await (handle as FileSystemFileHandle).getFile()).text()
        const entry = markdownToConsultation(content)
        if (entry) entries.push(entry)
      }
    }

    return entries.sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}

export async function deleteConsultation(entry: ConsultationEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  try {
    const dir = await root.getDirectoryHandle('consultations')
    const corbeilleDir = await root.getDirectoryHandle('corbeille', { create: true })

    const fileName = consultationFileName(entry.date, entry.id)
    const file = await dir.getFileHandle(fileName)
    const content = await (await file.getFile()).text()

    const trashContent = content.replace('---\n', `---\nsupprime_le: ${new Date().toISOString()}\n`)
    const trashFile = await corbeilleDir.getFileHandle(fileName, { create: true })
    const writable = await trashFile.createWritable()
    await writable.write(trashContent)
    await writable.close()

    await dir.removeEntry(fileName)
    return true
  } catch {
    return false
  }
}
