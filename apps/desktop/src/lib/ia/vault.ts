import type { IAPattern, IARecommendation, IASummary, IALogEntry } from '@/types/ia'
import { restoreVaultHandle, ensureVaultStructure } from '../vault/handle'
import { useAuthStore } from '@/stores/authStore'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const profileId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(profileId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

async function getIADir(): Promise<FileSystemDirectoryHandle | null> {
  const root = await getVaultRoot()
  if (!root) return null
  return root.getDirectoryHandle('ia', { create: true })
}

// --- Patterns ---
export async function writeIAPatterns(patterns: IAPattern[]): Promise<boolean> {
  const dir = await getIADir()
  if (!dir) return false
  const lines = ['---', `modifie_le: ${new Date().toISOString()}`, '---', '']
  for (const p of patterns) {
    lines.push(
      `## ${p.label}`,
      '',
      `- id: ${p.id}`,
      `- confidence: ${p.confidence}%`,
      `- status: ${p.status}`,
      `- detected: ${p.detectedAt}`,
      p.validatedAt ? `- validated: ${p.validatedAt}` : '',
      '',
      p.description,
      '',
    )
  }
  const file = await dir.getFileHandle('patterns-ia.md', { create: true })
  const w = await file.createWritable()
  await w.write(lines.filter(Boolean).join('\n'))
  await w.close()
  return true
}

// --- Recommendations ---
export async function writeIARecommendations(recs: IARecommendation[]): Promise<boolean> {
  const dir = await getIADir()
  if (!dir) return false
  const lines = ['---', `modifie_le: ${new Date().toISOString()}`, '---', '']
  for (const r of recs) {
    lines.push(
      `## ${r.category}`,
      '',
      `- id: ${r.id}`,
      `- confidence: ${r.confidence}%`,
      `- status: ${r.status}`,
      `- generated: ${r.generatedAt}`,
      '',
      r.text,
      '',
    )
  }
  const file = await dir.getFileHandle('recommandations.md', { create: true })
  const w = await file.createWritable()
  await w.write(lines.join('\n'))
  await w.close()
  return true
}

// --- Summaries ---
export async function writeIASummary(summary: IASummary): Promise<boolean> {
  const dir = await getIADir()
  if (!dir) return false
  const resumesDir = await dir.getDirectoryHandle('resumes', { create: true })
  const dateStr = summary.generatedAt.slice(0, 10)
  const file = await resumesDir.getFileHandle(`${dateStr}_resume.md`, { create: true })
  const content = [
    '---',
    `id: ${summary.id}`,
    `period: ${summary.period}`,
    `detail_level: ${summary.detailLevel}`,
    `language: ${summary.language}`,
    `generated_at: ${summary.generatedAt}`,
    '---',
    '',
    summary.content,
  ].join('\n')
  const w = await file.createWritable()
  await w.write(content)
  await w.close()
  return true
}

// --- Log ---
export async function appendIALog(entry: IALogEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false
  const configDir = await root.getDirectoryHandle('config', { create: true })
  let existingContent = ''
  try {
    const file = await configDir.getFileHandle('ia-log.md')
    existingContent = await (await file.getFile()).text()
  } catch { /* file doesn't exist yet */ }

  const newLine = `| ${entry.date} | ${entry.type} | ${entry.trigger} | ${entry.dataSummary} |`
  const content = existingContent
    ? existingContent.trimEnd() + '\n' + newLine + '\n'
    : `# Journal des appels IA\n\n| Date | Type | Déclenchement | Résumé |\n|------|------|---------------|--------|\n${newLine}\n`

  const file = await configDir.getFileHandle('ia-log.md', { create: true })
  const w = await file.createWritable()
  await w.write(content)
  await w.close()
  return true
}
