import type { DailyPainEntry } from '@/types/dailyPain'
import { restoreVaultHandle, ensureVaultStructure } from './handle'
import { useAuthStore } from '@/stores/authStore'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const profileId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(profileId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

function painFileName(date: string): string {
  return `${date}.md`
}

function painToMarkdown(p: DailyPainEntry): string {
  const lines = [
    '---',
    `id: ${p.id}`,
    `date: ${p.date}`,
    `niveau: ${p.niveau}`,
    `liee_a_crise: ${p.lieeACrise}`,
    `crise_id: ${p.criseId ?? ''}`,
    `cree_le: ${p.createdAt}`,
    `modifie_le: ${p.updatedAt}`,
    '---',
    '',
  ]
  if (p.notes) {
    lines.push('## Notes', '', p.notes, '')
  }
  return lines.join('\n')
}

function markdownToPain(content: string): DailyPainEntry | null {
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
    date: get('date'),
    niveau: parseInt(get('niveau')) || 0,
    lieeACrise: get('liee_a_crise') === 'true',
    criseId: get('crise_id') || null,
    notes: notesMatch?.[1]?.trim() ?? null,
    createdAt: get('cree_le'),
    updatedAt: get('modifie_le'),
  }
}

export async function writeDailyPain(entry: DailyPainEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false
  const dir = await root.getDirectoryHandle('daily-pain', { create: true })
  const file = await dir.getFileHandle(painFileName(entry.date), { create: true })
  const writable = await file.createWritable()
  await writable.write(painToMarkdown(entry))
  await writable.close()
  return true
}

export async function readAllDailyPains(): Promise<DailyPainEntry[]> {
  const root = await getVaultRoot()
  if (!root) return []
  try {
    const dir = await root.getDirectoryHandle('daily-pain')
    const entries: DailyPainEntry[] = []
    for await (const [name, handle] of dir.entries()) {
      if (name.endsWith('.md') && handle.kind === 'file') {
        const content = await (await (handle as FileSystemFileHandle).getFile()).text()
        const entry = markdownToPain(content)
        if (entry) entries.push(entry)
      }
    }
    return entries.sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}

export async function deleteDailyPain(entry: DailyPainEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false
  try {
    const dir = await root.getDirectoryHandle('daily-pain')
    const corbeilleDir = await root.getDirectoryHandle('corbeille', { create: true })
    const fileName = painFileName(entry.date)
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
