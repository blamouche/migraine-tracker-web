import type { DetectedPattern } from '@/types/patterns'
import { restoreVaultHandle, ensureVaultStructure } from './handle'
import { useAuthStore } from '@/stores/authStore'

const PATTERNS_FILE = 'patterns-valides.md'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const userId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(userId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

function patternsToMarkdown(patterns: DetectedPattern[]): string {
  const lines = [
    '---',
    `modifie_le: ${new Date().toISOString()}`,
    `nombre_patterns: ${patterns.length}`,
    '---',
    '',
    '# Patterns validés',
    '',
  ]

  for (const p of patterns) {
    lines.push(`## ${p.label}`)
    lines.push('')
    lines.push('```yaml')
    lines.push(`id: ${p.id}`)
    lines.push(`source: ${p.source}`)
    lines.push(`type: ${p.type}`)
    lines.push(`confiance: ${p.confidence}`)
    lines.push(`occurrences: ${p.occurrences}`)
    lines.push(`total_crises: ${p.totalCrises}`)
    lines.push(`statut: ${p.status}`)
    if (p.factors) lines.push(`facteurs: [${p.factors.join(', ')}]`)
    lines.push(`detecte_le: ${p.detectedAt}`)
    if (p.validatedAt) lines.push(`valide_le: ${p.validatedAt}`)
    lines.push('```')
    lines.push('')
    lines.push(p.description)
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  return lines.join('\n')
}

function markdownToPatterns(content: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = []
  const blocks = content.split('## ').slice(1) // skip header

  for (const block of blocks) {
    const labelMatch = block.match(/^(.+)\n/)
    if (!labelMatch) continue

    const label = labelMatch[1]!.trim()
    const yamlMatch = block.match(/```yaml\n([\s\S]*?)```/)
    if (!yamlMatch) continue

    const yaml = yamlMatch[1]!
    const get = (key: string): string => {
      const match = yaml.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
      return match?.[1]?.trim() ?? ''
    }
    const getArray = (key: string): string[] => {
      const raw = get(key)
      const inner = raw.replace(/^\[/, '').replace(/\]$/, '').trim()
      if (!inner) return []
      return inner.split(',').map((s) => s.trim()).filter(Boolean)
    }

    // Extract description (text after yaml block, before ---)
    const descMatch = block.match(/```\n\n([\s\S]*?)(?:\n---|\n*$)/)
    const description = descMatch?.[1]?.trim() ?? ''

    patterns.push({
      id: get('id'),
      source: get('source') as DetectedPattern['source'],
      label,
      description,
      confidence: parseInt(get('confiance'), 10) || 0,
      occurrences: parseInt(get('occurrences'), 10) || 0,
      totalCrises: parseInt(get('total_crises'), 10) || 0,
      status: get('statut') as DetectedPattern['status'],
      type: get('type') as DetectedPattern['type'],
      factors: getArray('facteurs').length > 0 ? getArray('facteurs') : undefined,
      detectedAt: get('detecte_le'),
      validatedAt: get('valide_le') || undefined,
    })
  }

  return patterns
}

export async function writePatterns(patterns: DetectedPattern[]): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  const configDir = await root.getDirectoryHandle('config', { create: true })
  const file = await configDir.getFileHandle(PATTERNS_FILE, { create: true })
  const writable = await file.createWritable()
  await writable.write(patternsToMarkdown(patterns))
  await writable.close()
  return true
}

export async function readPatterns(): Promise<DetectedPattern[]> {
  const root = await getVaultRoot()
  if (!root) return []

  try {
    const configDir = await root.getDirectoryHandle('config')
    const file = await configDir.getFileHandle(PATTERNS_FILE)
    const content = await (await file.getFile()).text()
    return markdownToPatterns(content)
  } catch {
    return []
  }
}
