import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, readFileSync } from 'fs'
import { join, basename } from 'path'
import { dialog } from 'electron'
import AdmZip from 'adm-zip'
import { getInstance, createInstance, getInstances } from './instance-manager'
import { fetchJSON } from '../http'
import type { GameInstance } from '../../../shared/types/instance'

export interface InstanceFileItem {
  id: string
  name: string
  fileName: string
  enabled: boolean
  size: number
  dateModified: string
  category: 'mods' | 'resourcepacks' | 'shaderpacks' | 'saves' | 'screenshots'
  extra?: any
}

/**
 * Get files in an instance folder (mods, resourcepacks, shaderpacks, saves, screenshots)
 */
export function getInstanceFiles(
  instanceId: string,
  category: 'mods' | 'resourcepacks' | 'shaderpacks' | 'saves' | 'screenshots'
): InstanceFileItem[] {
  const inst = getInstance(instanceId)
  if (!inst) return []

  const targetDir = join(inst.gameDirectory, category)
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
    return []
  }

  const entries = readdirSync(targetDir, { withFileTypes: true })
  const items: InstanceFileItem[] = []

  for (const entry of entries) {
    const fullPath = join(targetDir, entry.name)
    try {
      const stats = statSync(fullPath)

      if (category === 'saves') {
        if (entry.isDirectory()) {
          items.push({
            id: entry.name,
            name: entry.name,
            fileName: entry.name,
            enabled: true,
            size: stats.size,
            dateModified: stats.mtime.toISOString(),
            category
          })
        }
      } else if (category === 'screenshots') {
        if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
          let dataUrl: string | undefined = undefined
          try {
            const buf = readFileSync(fullPath)
            dataUrl = `data:image/png;base64,${buf.toString('base64')}`
          } catch {
            // ignore read error
          }

          items.push({
            id: entry.name,
            name: entry.name,
            fileName: entry.name,
            enabled: true,
            size: stats.size,
            dateModified: stats.mtime.toISOString(),
            category,
            extra: { fullPath, dataUrl }
          })
        }
      } else {
        // mods, resourcepacks, shaderpacks
        const isFile = entry.isFile() || entry.isDirectory()
        if (isFile) {
          const isEnabled = !entry.name.endsWith('.disabled')
          const cleanName = entry.name.replace(/\.disabled$/, '').replace(/\.(jar|zip)$/, '')

          items.push({
            id: entry.name,
            name: cleanName,
            fileName: entry.name,
            enabled: isEnabled,
            size: stats.size,
            dateModified: stats.mtime.toISOString(),
            category
          })
        }
      }
    } catch {
      // skip unreadable
    }
  }

  return items.sort((a, b) => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime())
}

/**
 * Toggle enable/disable a file (.disabled suffix)
 */
export function toggleInstanceFile(
  instanceId: string,
  category: 'mods' | 'resourcepacks' | 'shaderpacks',
  fileName: string
): { success: boolean; newFileName?: string; error?: string } {
  const inst = getInstance(instanceId)
  if (!inst) return { success: false, error: 'Instance not found' }

  const dir = join(inst.gameDirectory, category)
  const currentPath = join(dir, fileName)
  if (!existsSync(currentPath)) return { success: false, error: 'File not found' }

  let newFileName = ''
  if (fileName.endsWith('.disabled')) {
    newFileName = fileName.replace(/\.disabled$/, '')
  } else {
    newFileName = `${fileName}.disabled`
  }

  try {
    renameSync(currentPath, join(dir, newFileName))
    return { success: true, newFileName }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Delete a file or directory inside an instance category
 */
export function deleteInstanceFile(
  instanceId: string,
  category: 'mods' | 'resourcepacks' | 'shaderpacks' | 'saves' | 'screenshots',
  fileName: string
): boolean {
  const inst = getInstance(instanceId)
  if (!inst) return false

  const targetPath = join(inst.gameDirectory, category, fileName)
  if (!existsSync(targetPath)) return false

  try {
    rmSync(targetPath, { recursive: true, force: true })
    return true
  } catch {
    return false
  }
}

/**
 * 1-Click World Backup (Zips world directory into instance/backups/)
 */
export function backupWorld(
  instanceId: string,
  worldName: string
): { success: boolean; backupPath?: string; error?: string } {
  const inst = getInstance(instanceId)
  if (!inst) return { success: false, error: 'Instance not found' }

  const worldDir = join(inst.gameDirectory, 'saves', worldName)
  if (!existsSync(worldDir)) return { success: false, error: 'World not found' }

  const backupsDir = join(inst.gameDirectory, 'backups')
  if (!existsSync(backupsDir)) {
    mkdirSync(backupsDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFileName = `${worldName}-backup-${timestamp}.zip`
  const backupPath = join(backupsDir, backupFileName)

  try {
    const zip = new AdmZip()
    zip.addLocalFolder(worldDir, worldName)
    zip.writeZip(backupPath)
    return { success: true, backupPath }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Export instance to a shareable .zip file
 */
export async function exportInstanceZip(
  instanceId: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  const inst = getInstance(instanceId)
  if (!inst) return { success: false, error: 'Instance not found' }

  const saveDialogResult = await dialog.showSaveDialog({
    title: `Export ${inst.name}`,
    defaultPath: `${inst.name.replace(/[^a-zA-Z0-9_-]/g, '_')}-export.zip`,
    filters: [{ name: 'AstrixMC / Prism Instance Zip', extensions: ['zip'] }]
  })

  if (saveDialogResult.canceled || !saveDialogResult.filePath) {
    return { success: false, error: 'Export cancelled' }
  }

  try {
    const zip = new AdmZip()

    // 1. Add instance metadata
    zip.addFile('instance.json', Buffer.from(JSON.stringify(inst, null, 2), 'utf-8'))

    // 2. Add folders if they exist
    const foldersToInclude = ['mods', 'resourcepacks', 'shaderpacks', 'config']
    for (const folder of foldersToInclude) {
      const fullDir = join(inst.gameDirectory, folder)
      if (existsSync(fullDir)) {
        zip.addLocalFolder(fullDir, folder)
      }
    }

    zip.writeZip(saveDialogResult.filePath)
    return { success: true, filePath: saveDialogResult.filePath }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Import instance from a .zip file
 */
export async function importInstanceZip(): Promise<{
  success: boolean
  instance?: GameInstance
  error?: string
}> {
  const openDialogResult = await dialog.showOpenDialog({
    title: 'Import Instance (.zip)',
    filters: [{ name: 'Instance Zip Archive', extensions: ['zip'] }],
    properties: ['openFile']
  })

  if (openDialogResult.canceled || openDialogResult.filePaths.length === 0) {
    return { success: false, error: 'Import cancelled' }
  }

  const zipPath = openDialogResult.filePaths[0]

  try {
    const zip = new AdmZip(zipPath)
    const instanceJsonEntry = zip.getEntry('instance.json')

    let meta: any = {}
    if (instanceJsonEntry) {
      meta = JSON.parse(instanceJsonEntry.getData().toString('utf-8'))
    }

    const defaultName = meta.name || basename(zipPath, '.zip')
    const mcVersion = meta.mcVersion || '1.20.4'

    const newInst = createInstance({
      name: `${defaultName} (Imported)`,
      mcVersion,
      modLoader: meta.modLoader,
      memoryMin: meta.memoryMin,
      memoryMax: meta.memoryMax,
      jvmArgs: meta.jvmArgs
    })

    // Extract folders into new instance gameDirectory
    zip.extractAllTo(newInst.gameDirectory, true)

    return { success: true, instance: newInst }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Upload game console logs to mclo.gs (Prism Launcher feature)
 */
export async function uploadToMclogs(
  logContent: string
): Promise<{ success: boolean; url?: string; rawUrl?: string; error?: string }> {
  if (!logContent || !logContent.trim()) {
    return { success: false, error: 'Log is empty' }
  }

  try {
    const response = await fetch('https://api.mclo.gs/1/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        content: logContent.slice(-100000) // max ~100k chars
      })
    })

    const data: any = await response.json()
    if (data.success && data.url) {
      return { success: true, url: data.url, rawUrl: data.raw }
    }
    return { success: false, error: data.error || 'Failed to upload to mclo.gs' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Check for updates for installed mods in an instance (queries Modrinth)
 */
export async function checkInstanceModUpdates(
  instanceId: string
): Promise<Array<{ fileName: string; currentName: string; latestVersion?: string; updateAvailable: boolean; downloadUrl?: string }>> {
  const inst = getInstance(instanceId)
  if (!inst) return []

  const mods = getInstanceFiles(instanceId, 'mods')
  const results: Array<{
    fileName: string
    currentName: string
    latestVersion?: string
    updateAvailable: boolean
    downloadUrl?: string
  }> = []

  const loader = inst.modLoader?.type || 'fabric'
  const mcVersion = inst.mcVersion || '1.20.4'

  for (const mod of mods.slice(0, 20)) {
    // Clean search term
    const cleanSearch = mod.name.replace(/[-_v0-9.].*$/, '').trim()
    if (!cleanSearch || cleanSearch.length < 3) continue

    try {
      const url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(cleanSearch)}&facets=[["project_type:mod"],["versions:${mcVersion}"],["categories:${loader.toLowerCase()}"]]&limit=1`
      const data = await fetchJSON<any>(url)
      if (data?.hits && data.hits.length > 0) {
        const hit = data.hits[0]
        // Get versions
        const vUrl = `https://api.modrinth.com/v2/project/${hit.project_id}/version?game_versions=["${mcVersion}"]&loaders=["${loader.toLowerCase()}"]`
        const versions = await fetchJSON<any[]>(vUrl)
        if (versions && versions.length > 0) {
          const latest = versions[0]
          const primaryFile = latest.files?.find((f: any) => f.primary) || latest.files?.[0]
          results.push({
            fileName: mod.fileName,
            currentName: mod.name,
            latestVersion: latest.version_number,
            updateAvailable: primaryFile && primaryFile.filename !== mod.fileName,
            downloadUrl: primaryFile?.url
          })
        }
      }
    } catch {
      // skip
    }
  }

  return results
}

export interface RawFileEntry {
  name: string
  isDirectory: boolean
  size: number
  itemCount?: number
  dateCreated: string
  dateModified: string
  relativePath: string
}

export function getInstanceRawFiles(instanceId: string, subPath = ''): RawFileEntry[] {
  const inst = getInstance(instanceId)
  if (!inst) return []

  const targetDir = subPath ? join(inst.gameDirectory, subPath) : inst.gameDirectory
  if (!existsSync(targetDir)) return []

  try {
    const entries = readdirSync(targetDir, { withFileTypes: true })
    const results: RawFileEntry[] = []

    for (const entry of entries) {
      const fullPath = join(targetDir, entry.name)
      try {
        const stats = statSync(fullPath)
        let itemCount: number | undefined = undefined
        if (entry.isDirectory()) {
          try {
            itemCount = readdirSync(fullPath).length
          } catch {
            itemCount = 0
          }
        }

        results.push({
          name: entry.name,
          isDirectory: entry.isDirectory(),
          size: stats.size,
          itemCount,
          dateCreated: stats.birthtime.toISOString(),
          dateModified: stats.mtime.toISOString(),
          relativePath: subPath ? `${subPath}/${entry.name}` : entry.name
        })
      } catch {
        // ignore unreadable
      }
    }

    return results.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })
  } catch {
    return []
  }
}

export function readInstanceLog(instanceId: string, logFile = 'latest.log'): string {
  const inst = getInstance(instanceId)
  if (!inst) return ''

  let targetPath = join(inst.gameDirectory, 'logs', logFile)
  if (!existsSync(targetPath)) {
    targetPath = join(inst.gameDirectory, logFile)
    if (!existsSync(targetPath)) return ''
  }

  try {
    return readFileSync(targetPath, 'utf8')
  } catch {
    return ''
  }
}
