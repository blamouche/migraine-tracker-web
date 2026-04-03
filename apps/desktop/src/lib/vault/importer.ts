/**
 * E41 — Vault orphan file importer
 * Scans vault directories for markdown files missing the `id` field
 * in their frontmatter, and can patch them with a generated UUID.
 */

import { restoreVaultHandle, ensureVaultStructure } from './handle'
import { useAuthStore } from '@/stores/authStore'

export interface OrphanFile {
  /** Relative path inside the vault root, e.g. "crises/2026-03-15_crise.md" */
  path: string
  /** Parent directory name, e.g. "crises" */
  directory: string
  /** File name */
  fileName: string
  /** First lines of the markdown body (after frontmatter) for preview */
  preview: string
  /** File last-modified date */
  lastModified: string
  /** Whether the frontmatter is parseable */
  validFrontmatter: boolean
  /** Whether the directory is a known data directory */
  knownDirectory: boolean
  /** Internal handle reference for patching */
  _handle: FileSystemFileHandle
  /** Raw content for patching */
  _content: string
}

export interface ImportResult {
  imported: number
  errors: Array<{ path: string; reason: string }>
}

/** Data directories where files are expected to have an `id` field */
const DATA_DIRS = [
  'crises',
  'daily-pain',
  'charge-mentale',
  'journal-alimentaire',
  'cycle',
  'consultations',
  'transports',
  'sport',
  'environnement',
]

/** Directories to skip entirely (config, system, non-data) */
const SKIP_DIRS = ['config', 'corbeille', 'ia', 'templates']

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const userId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(userId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

/**
 * Scan all vault data directories for .md files missing the `id` field.
 */
export async function scanOrphanFiles(): Promise<OrphanFile[]> {
  const root = await getVaultRoot()
  if (!root) return []

  const orphans: OrphanFile[] = []

  for await (const [dirName, dirHandle] of root.entries()) {
    if (dirHandle.kind !== 'directory') continue
    if (SKIP_DIRS.includes(dirName)) continue

    const isKnown = DATA_DIRS.includes(dirName)
    await scanDirectory(dirHandle as FileSystemDirectoryHandle, dirName, isKnown, orphans)
  }

  return orphans.sort((a, b) => a.path.localeCompare(b.path))
}

async function scanDirectory(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string,
  isKnown: boolean,
  orphans: OrphanFile[],
): Promise<void> {
  try {
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'directory') {
        // Recurse into subdirectories (e.g. charge-mentale/evenements)
        await scanDirectory(
          handle as FileSystemDirectoryHandle,
          `${basePath}/${name}`,
          isKnown,
          orphans,
        )
        continue
      }

      if (!name.endsWith('.md')) continue

      const fileHandle = handle as FileSystemFileHandle
      const file = await fileHandle.getFile()

      if (file.size === 0) continue

      const content = await file.text()

      // Must have frontmatter
      if (!content.startsWith('---')) continue

      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
      const validFrontmatter = fmMatch !== null

      if (!validFrontmatter) {
        // Unclosed frontmatter — still an orphan, but not importable
        orphans.push({
          path: `${basePath}/${name}`,
          directory: basePath.split('/')[0]!,
          fileName: name,
          preview: content.slice(0, 200),
          lastModified: new Date(file.lastModified).toISOString().slice(0, 10),
          validFrontmatter: false,
          knownDirectory: isKnown,
          _handle: fileHandle,
          _content: content,
        })
        continue
      }

      const fm = fmMatch![1]!
      if (fm.includes('id:')) continue // Has an id — not an orphan

      // Extract body preview (after frontmatter)
      const bodyStart = content.indexOf('\n---', 4)
      const body = bodyStart !== -1 ? content.slice(bodyStart + 4).trim() : ''
      const preview = body
        .replace(/^##\s+.*$/m, '') // Remove heading
        .trim()
        .slice(0, 150)

      orphans.push({
        path: `${basePath}/${name}`,
        directory: basePath.split('/')[0]!,
        fileName: name,
        preview: preview || '(aucun contenu)',
        lastModified: new Date(file.lastModified).toISOString().slice(0, 10),
        validFrontmatter: true,
        knownDirectory: isKnown,
        _handle: fileHandle,
        _content: content,
      })
    }
  } catch {
    // Directory inaccessible — skip silently
  }
}

/**
 * Patch selected orphan files by injecting a UUID `id` field into their frontmatter.
 * Returns a summary of imported files and errors.
 */
export async function importOrphanFiles(files: OrphanFile[]): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, errors: [] }

  for (const file of files) {
    if (!file.validFrontmatter) {
      result.errors.push({ path: file.path, reason: 'Frontmatter YAML non fermé ou invalide' })
      continue
    }

    if (!file.knownDirectory) {
      result.errors.push({ path: file.path, reason: 'Dossier non reconnu par l\u2019application' })
      continue
    }

    try {
      const newId = crypto.randomUUID()
      // Inject `id: <uuid>` right after the opening `---`
      const patched = file._content.replace(/^---\n/, `---\nid: ${newId}\n`)

      const writable = await file._handle.createWritable()
      await writable.write(patched)
      await writable.close()

      result.imported++
    } catch {
      result.errors.push({ path: file.path, reason: 'Impossible d\u2019écrire dans le fichier' })
    }
  }

  return result
}
