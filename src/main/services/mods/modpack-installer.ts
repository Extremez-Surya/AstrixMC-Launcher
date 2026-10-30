import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import AdmZip from 'adm-zip'
import { downloadFile, runLimited } from '../http'
import { getInstance, updateInstance } from '../instances/instance-manager'

interface ModrinthIndexFile {
  path: string
  hashes?: Record<string, string>
  env?: { client?: string; server?: string }
  downloads: string[]
  fileSize?: number
}

interface ModrinthIndex {
  formatVersion: number
  game: string
  versionId: string
  name: string
  summary?: string
  files: ModrinthIndexFile[]
  dependencies?: Record<string, string>
}

/**
 * Installs a Modrinth .mrpack or archive modpack directly into an instance
 */
export async function installModpack(
  instanceId: string,
  downloadUrl: string,
  onProgress?: (msg: string) => void
): Promise<{ success: boolean; error?: string }> {
  const inst = getInstance(instanceId)
  if (!inst) return { success: false, error: 'Instance not found' }

  const tempDir = join(inst.gameDirectory, '.temp_modpack')
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true })

  const packZipPath = join(tempDir, `pack-${Date.now()}.mrpack`)

  try {
    onProgress?.('Downloading modpack archive...')
    await downloadFile(downloadUrl, packZipPath)

    onProgress?.('Analyzing modpack manifest...')
    const zip = new AdmZip(packZipPath)
    const indexEntry = zip.getEntry('modrinth.index.json')

    if (!indexEntry) {
      // Fallback: Check if it's a standard overrides/mods archive
      const zipEntries = zip.getEntries()
      for (const entry of zipEntries) {
        if (!entry.isDirectory && (entry.entryName.startsWith('overrides/') || entry.entryName.startsWith('mods/'))) {
          const cleanRel = entry.entryName.replace(/^overrides\//, '')
          const dest = join(inst.gameDirectory, cleanRel)
          if (!existsSync(dirname(dest))) mkdirSync(dirname(dest), { recursive: true })
          writeFileSync(dest, entry.getData())
        }
      }
      return { success: true }
    }

    const indexJson: ModrinthIndex = JSON.parse(indexEntry.getData().toString('utf8'))
    const filesToDownload = (indexJson.files || []).filter(
      (f) => f.env?.client !== 'unsupported' && f.downloads && f.downloads.length > 0
    )

    // Update instance version & loader if provided in modpack dependencies
    if (indexJson.dependencies) {
      const mcVer = indexJson.dependencies.minecraft
      const hasFabric = Boolean(indexJson.dependencies['fabric-loader'])
      const hasForge = Boolean(indexJson.dependencies['forge'] || indexJson.dependencies['neoforge'])
      const hasQuilt = Boolean(indexJson.dependencies['quilt-loader'])

      const loaderType: 'fabric' | 'forge' | 'quilt' | undefined = hasFabric
        ? 'fabric'
        : hasForge
        ? 'forge'
        : hasQuilt
        ? 'quilt'
        : undefined

      updateInstance(instanceId, {
        ...(mcVer ? { mcVersion: mcVer } : {}),
        ...(loaderType ? { modLoader: { type: loaderType, version: 'latest' } } : {})
      })
    }

    onProgress?.(`Extracting modpack configurations & assets...`)
    // Extract overrides directory into instance
    const zipEntries = zip.getEntries()
    for (const entry of zipEntries) {
      if (!entry.isDirectory && entry.entryName.startsWith('overrides/')) {
        const relPath = entry.entryName.replace(/^overrides\//, '')
        const dest = join(inst.gameDirectory, relPath)
        if (!existsSync(dirname(dest))) mkdirSync(dirname(dest), { recursive: true })
        writeFileSync(dest, entry.getData())
      }
    }

    // Download mods concurrently
    let completed = 0
    const total = filesToDownload.length
    onProgress?.(`Downloading mods: 0 / ${total}...`)

    await runLimited(filesToDownload, 8, async (f) => {
      const dest = join(inst.gameDirectory, f.path)
      if (!existsSync(dirname(dest))) mkdirSync(dirname(dest), { recursive: true })
      try {
        await downloadFile(f.downloads[0], dest)
      } catch (err) {
        console.warn(`[Modpack] Failed to download ${f.path}:`, err)
      }
      completed++
      onProgress?.(`Downloading mods: ${completed} / ${total}...`)
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  } finally {
    try {
      rmSync(tempDir, { recursive: true, force: true })
    } catch {}
  }
}
