import type { CrisisEntry } from '@/types/crisis'
import { restoreVaultHandle, ensureVaultStructure } from './handle'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const profileId = localStorage.getItem('migraine-ai-active-profile') ?? 'default'
  const parentHandle = await restoreVaultHandle(profileId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

function crisisFileName(date: string): string {
  return `${date}_crise.md`
}

function crisisToMarkdown(crisis: CrisisEntry): string {
  const lines = [
    '---',
    `id: ${crisis.id}`,
    `date: ${crisis.date}`,
    `heure_debut: ${crisis.startTime}`,
    `heure_fin: ${crisis.endTime ?? ''}`,
    `intensite: ${crisis.intensity}`,
    `traitements: [${crisis.treatments.join(', ')}]`,
    `symptomes: [${crisis.symptoms.join(', ')}]`,
    `declencheurs: [${crisis.triggers.join(', ')}]`,
    `lieu: ${crisis.location ?? ''}`,
    `score_hit6: ${crisis.hit6Score ?? ''}`,
    `statut: ${crisis.status}`,
    `completion_forcee: ${crisis.completionForcee}`,
    `duree_estimee: ${crisis.estimatedDuration ?? ''}`,
    `cree_le: ${crisis.createdAt}`,
    `modifie_le: ${crisis.updatedAt}`,
    '---',
    '',
  ]

  if (crisis.notes) {
    lines.push('## Notes', '', crisis.notes, '')
  }

  return lines.join('\n')
}

function markdownToCrisis(content: string): CrisisEntry | null {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) return null

  const fm = fmMatch[1]!
  const get = (key: string): string => {
    const match = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
    return match?.[1]?.trim() ?? ''
  }
  const getArray = (key: string): string[] => {
    const raw = get(key)
    const inner = raw.replace(/^\[/, '').replace(/\]$/, '').trim()
    if (!inner) return []
    return inner.split(',').map((s) => s.trim()).filter(Boolean)
  }

  const notesMatch = content.match(/## Notes\n\n([\s\S]*)$/)

  return {
    id: get('id'),
    date: get('date'),
    startTime: get('heure_debut'),
    endTime: get('heure_fin') || null,
    intensity: parseInt(get('intensite'), 10) || 1,
    treatments: getArray('traitements'),
    symptoms: getArray('symptomes'),
    triggers: getArray('declencheurs'),
    location: get('lieu') || null,
    hit6Score: get('score_hit6') ? parseInt(get('score_hit6'), 10) : null,
    status: get('statut') === 'complet' ? 'complet' : 'incomplet',
    completionForcee: get('completion_forcee') === 'true',
    estimatedDuration: get('duree_estimee') ? parseInt(get('duree_estimee'), 10) : null,
    notes: notesMatch?.[1]?.trim() ?? null,
    createdAt: get('cree_le'),
    updatedAt: get('modifie_le'),
  }
}

export async function writeCrisis(crisis: CrisisEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  const crisesDir = await root.getDirectoryHandle('crises', { create: true })
  const file = await crisesDir.getFileHandle(crisisFileName(crisis.date), { create: true })
  const writable = await file.createWritable()
  await writable.write(crisisToMarkdown(crisis))
  await writable.close()
  return true
}

export async function readCrisis(date: string): Promise<CrisisEntry | null> {
  const root = await getVaultRoot()
  if (!root) return null

  try {
    const crisesDir = await root.getDirectoryHandle('crises')
    const file = await crisesDir.getFileHandle(crisisFileName(date))
    const content = await (await file.getFile()).text()
    return markdownToCrisis(content)
  } catch {
    return null
  }
}

export async function readAllCrises(): Promise<CrisisEntry[]> {
  const root = await getVaultRoot()
  if (!root) return []

  try {
    const crisesDir = await root.getDirectoryHandle('crises')
    const entries: CrisisEntry[] = []

    for await (const [name, handle] of crisesDir.entries()) {
      if (name.endsWith('_crise.md') && handle.kind === 'file') {
        const content = await (await (handle as FileSystemFileHandle).getFile()).text()
        const crisis = markdownToCrisis(content)
        if (crisis) entries.push(crisis)
      }
    }

    return entries.sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}

export async function deleteCrisis(crisis: CrisisEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  try {
    const crisesDir = await root.getDirectoryHandle('crises')
    const corbeilleDir = await root.getDirectoryHandle('corbeille', { create: true })

    // Read the file content
    const file = await crisesDir.getFileHandle(crisisFileName(crisis.date))
    const content = await (await file.getFile()).text()

    // Write to corbeille with deletion timestamp
    const trashContent = content.replace('---\n', `---\nsupprime_le: ${new Date().toISOString()}\n`)
    const trashFile = await corbeilleDir.getFileHandle(crisisFileName(crisis.date), { create: true })
    const writable = await trashFile.createWritable()
    await writable.write(trashContent)
    await writable.close()

    // Remove from crises
    await crisesDir.removeEntry(crisisFileName(crisis.date))
    return true
  } catch {
    return false
  }
}

export async function purgeTrash(): Promise<number> {
  const root = await getVaultRoot()
  if (!root) return 0

  try {
    const corbeilleDir = await root.getDirectoryHandle('corbeille')
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    let purged = 0

    const toDelete: string[] = []
    for await (const [name, handle] of corbeilleDir.entries()) {
      if (handle.kind !== 'file') continue
      const content = await (await (handle as FileSystemFileHandle).getFile()).text()
      const match = content.match(/supprime_le:\s*(.+)/)
      if (match?.[1]) {
        const deletedAt = new Date(match[1].trim())
        if (deletedAt < thirtyDaysAgo) {
          toDelete.push(name)
        }
      }
    }

    for (const name of toDelete) {
      await corbeilleDir.removeEntry(name)
      purged++
    }

    return purged
  } catch {
    return 0
  }
}
