import type { CycleEntry, CyclePhase, ContraceptionType } from '@/types/cycle'
import { restoreVaultHandle, ensureVaultStructure } from './handle'
import { useAuthStore } from '@/stores/authStore'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const profileId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(profileId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

function cycleFileName(dateDebut: string, id: string): string {
  return `${dateDebut}_cycle_${id}.md`
}

function cycleToMarkdown(c: CycleEntry): string {
  const lines = [
    '---',
    `id: ${c.id}`,
    `date_debut: ${c.dateDebut}`,
    `duree_jours: ${c.dureeJours}`,
    `intensite_symptomes: ${c.intensiteSymptomes}`,
    `phase: ${c.phase}`,
    `contraception: ${c.contraception}`,
    `symptomes: [${c.symptomes.join(', ')}]`,
    `cree_le: ${c.createdAt}`,
    `modifie_le: ${c.updatedAt}`,
    '---',
    '',
  ]

  if (c.notes) {
    lines.push('## Notes', '', c.notes, '')
  }

  return lines.join('\n')
}

function markdownToCycle(content: string): CycleEntry | null {
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

  const notesMatch = content.match(/## Notes\n\n([\s\S]*)$/)

  return {
    id: get('id'),
    dateDebut: get('date_debut'),
    dureeJours: parseInt(get('duree_jours')) || 5,
    intensiteSymptomes: parseInt(get('intensite_symptomes')) || 3,
    phase: (get('phase') || 'menstruelle') as CyclePhase,
    contraception: (get('contraception') || 'aucune') as ContraceptionType,
    symptomes: getArray('symptomes'),
    notes: notesMatch?.[1]?.trim() ?? null,
    createdAt: get('cree_le'),
    updatedAt: get('modifie_le'),
  }
}

export async function writeCycle(entry: CycleEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  const dir = await root.getDirectoryHandle('cycle', { create: true })
  const file = await dir.getFileHandle(cycleFileName(entry.dateDebut, entry.id), { create: true })
  const writable = await file.createWritable()
  await writable.write(cycleToMarkdown(entry))
  await writable.close()
  return true
}

export async function readAllCycles(): Promise<CycleEntry[]> {
  const root = await getVaultRoot()
  if (!root) return []

  try {
    const dir = await root.getDirectoryHandle('cycle')
    const entries: CycleEntry[] = []

    for await (const [name, handle] of dir.entries()) {
      if (name.endsWith('.md') && handle.kind === 'file') {
        const content = await (await (handle as FileSystemFileHandle).getFile()).text()
        const entry = markdownToCycle(content)
        if (entry) entries.push(entry)
      }
    }

    return entries.sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))
  } catch {
    return []
  }
}

export async function deleteCycle(entry: CycleEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  try {
    const dir = await root.getDirectoryHandle('cycle')
    const corbeilleDir = await root.getDirectoryHandle('corbeille', { create: true })

    const fileName = cycleFileName(entry.dateDebut, entry.id)
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
