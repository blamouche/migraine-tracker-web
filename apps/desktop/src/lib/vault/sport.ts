import type { SportEntry, SportType, HydratationLevel } from '@/types/sport'
import { restoreVaultHandle, ensureVaultStructure } from './handle'
import { useAuthStore } from '@/stores/authStore'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const userId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(userId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

function sportFileName(date: string, id: string): string {
  return `${date}_sport_${id}.md`
}

function sportToMarkdown(s: SportEntry): string {
  const lines = [
    '---',
    `id: ${s.id}`,
    `date: ${s.date}`,
    `heure: ${s.heure}`,
    `type: ${s.type}`,
    `duree_minutes: ${s.dureeMinutes}`,
    `intensite: ${s.intensite}`,
    `conditions: [${s.conditions.join(', ')}]`,
    `fc_max: ${s.fcMax ?? ''}`,
    `hydratation: ${s.hydratation}`,
    `cree_le: ${s.createdAt}`,
    `modifie_le: ${s.updatedAt}`,
    '---',
    '',
  ]

  if (s.notes) {
    lines.push('## Notes', '', s.notes, '')
  }

  return lines.join('\n')
}

function markdownToSport(content: string): SportEntry | null {
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
    date: get('date'),
    heure: get('heure'),
    type: (get('type') || 'autre') as SportType,
    dureeMinutes: parseInt(get('duree_minutes')) || 0,
    intensite: parseInt(get('intensite')) || 3,
    conditions: getArray('conditions'),
    fcMax: parseInt(get('fc_max')) || null,
    hydratation: (get('hydratation') || 'normale') as HydratationLevel,
    notes: notesMatch?.[1]?.trim() ?? null,
    createdAt: get('cree_le'),
    updatedAt: get('modifie_le'),
  }
}

export async function writeSport(entry: SportEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  const dir = await root.getDirectoryHandle('sport', { create: true })
  const file = await dir.getFileHandle(sportFileName(entry.date, entry.id), { create: true })
  const writable = await file.createWritable()
  await writable.write(sportToMarkdown(entry))
  await writable.close()
  return true
}

export async function readAllSports(): Promise<SportEntry[]> {
  const root = await getVaultRoot()
  if (!root) return []

  try {
    const dir = await root.getDirectoryHandle('sport')
    const entries: SportEntry[] = []

    for await (const [name, handle] of dir.entries()) {
      if (name.endsWith('.md') && handle.kind === 'file') {
        const content = await (await (handle as FileSystemFileHandle).getFile()).text()
        const entry = markdownToSport(content)
        if (entry) entries.push(entry)
      }
    }

    return entries.sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}

export async function deleteSport(entry: SportEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  try {
    const dir = await root.getDirectoryHandle('sport')
    const corbeilleDir = await root.getDirectoryHandle('corbeille', { create: true })

    const fileName = sportFileName(entry.date, entry.id)
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
