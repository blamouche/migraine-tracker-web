/**
 * E29 — Vault persistence for module preferences (config/modules.md)
 */
import type { ModuleConfig } from '@/types/modules'
import { DEFAULT_MODULE_CONFIG, MODULE_DEFINITIONS } from '@/types/modules'
import { restoreVaultHandle, ensureVaultStructure } from './handle'
import { useAuthStore } from '@/stores/authStore'

const CONFIG_FILE = 'modules.md'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const userId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(userId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

function configToMarkdown(config: ModuleConfig): string {
  const lines = [
    '---',
    `modifie_le: ${new Date().toISOString()}`,
  ]
  for (const def of MODULE_DEFINITIONS) {
    lines.push(`${def.id}: ${config[def.id]}`)
  }
  lines.push('---', '', '# Modules de suivi', '', 'Configuration des modules actifs dans l\'application.', '')
  return lines.join('\n')
}

function markdownToConfig(content: string): ModuleConfig {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) return { ...DEFAULT_MODULE_CONFIG }

  const fm = fmMatch[1]!
  const config = { ...DEFAULT_MODULE_CONFIG }

  for (const def of MODULE_DEFINITIONS) {
    const match = fm.match(new RegExp(`^${def.id}: *(true|false)$`, 'm'))
    if (match) {
      config[def.id] = match[1] === 'true'
    }
  }

  return config
}

export async function writeModuleConfig(config: ModuleConfig): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  const configDir = await root.getDirectoryHandle('config', { create: true })
  const file = await configDir.getFileHandle(CONFIG_FILE, { create: true })
  const writable = await file.createWritable()
  await writable.write(configToMarkdown(config))
  await writable.close()
  return true
}

export async function readModuleConfig(): Promise<ModuleConfig | null> {
  const root = await getVaultRoot()
  if (!root) return null

  try {
    const configDir = await root.getDirectoryHandle('config')
    const file = await configDir.getFileHandle(CONFIG_FILE)
    const content = await (await file.getFile()).text()
    return markdownToConfig(content)
  } catch {
    return null
  }
}
