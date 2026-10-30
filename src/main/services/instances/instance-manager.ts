import { cpSync, existsSync, mkdirSync, rmSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { randomUUID } from 'crypto'
import { shell } from 'electron'
import { getInstancesRoot, getLauncherRoot, JSONStore } from '../store'
import type { GameInstance } from '../../../shared/types/instance'

const instancesStore = new JSONStore<GameInstance>('instances')

export function getInstances(): GameInstance[] {
  return instancesStore.read()
}

export function getInstance(id: string): GameInstance | null {
  const list = instancesStore.read()
  return list.find((inst) => inst.id === id || inst.name.toLowerCase() === id.toLowerCase()) || null
}

export function createInstance(data: {
  name: string
  mcVersion: string
  icon?: string
  modLoader?: { type: 'fabric' | 'forge' | 'quilt'; version: string }
  memoryMin?: string
  memoryMax?: string
  javaPath?: string
  jvmArgs?: string
}): GameInstance {
  const id = randomUUID()
  const instancesDir = getInstancesRoot()
  const safeName = (data.name || `Minecraft-${data.mcVersion}`).replace(/[^a-zA-Z0-9_\-\. ]/g, '_').trim()
  const folderName = `${safeName}-${id.slice(0, 8)}`
  const instanceDir = join(instancesDir, folderName)

  // Create isolated directories for mods, resourcepacks, shaders, saves
  const subdirs = ['mods', 'resourcepacks', 'shaderpacks', 'saves', 'screenshots']
  for (const sub of subdirs) {
    const dir = join(instanceDir, sub)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }

  const newInstance: GameInstance = {
    id,
    name: data.name || `Minecraft ${data.mcVersion}`,
    icon: data.icon || 'grass',
    mcVersion: data.mcVersion,
    modLoader: data.modLoader,
    memoryMin: data.memoryMin || '2',
    memoryMax: data.memoryMax || '6',
    javaPath: data.javaPath,
    jvmArgs: data.jvmArgs,
    gameDirectory: instanceDir,
    created: new Date().toISOString(),
    totalPlaytime: 0
  }

  const list = instancesStore.read()
  list.push(newInstance)
  instancesStore.write(list)

  return newInstance
}

export function updateInstance(id: string, patch: Partial<GameInstance>): GameInstance | null {
  const list = instancesStore.read()
  const index = list.findIndex((inst) => inst.id === id || inst.name.toLowerCase() === id.toLowerCase())
  if (index === -1) return null

  list[index] = { ...list[index], ...patch }
  instancesStore.write(list)
  return list[index]
}

export function deleteInstance(id: string): boolean {
  const list = instancesStore.read()
  const target = list.find(
    (inst) =>
      inst.id === id ||
      inst.name.toLowerCase() === id.toLowerCase() ||
      inst.mcVersion.toLowerCase() === id.toLowerCase()
  )
  if (!target) return false

  const filtered = list.filter((inst) => inst.id !== target.id)
  instancesStore.write(filtered)

  // Remove files
  try {
    if (existsSync(target.gameDirectory)) {
      rmSync(target.gameDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
    }
  } catch (err) {
    console.error(`[InstanceManager] Failed to remove dir ${target.gameDirectory}:`, err)
  }

  return true
}

export function deleteVersionFiles(versionId: string): { success: boolean; deletedCount: number } {
  let deletedCount = 0
  const launcherRoot = getLauncherRoot()
  const instancesDir = getInstancesRoot()

  // 1. Delete in launcher/versions/<versionId>
  const sharedVerDir = join(launcherRoot, 'versions', versionId)
  if (existsSync(sharedVerDir)) {
    try {
      rmSync(sharedVerDir, { recursive: true, force: true, maxRetries: 5 })
      deletedCount++
    } catch {}
  }

  // 2. Delete asset index in launcher/assets/indexes/<versionId>.json
  const assetIndex = join(launcherRoot, 'assets', 'indexes', `${versionId}.json`)
  if (existsSync(assetIndex)) {
    try {
      rmSync(assetIndex, { force: true })
      deletedCount++
    } catch {}
  }

  // 3. Delete inside each instance folder
  const instances = instancesStore.read()
  for (const inst of instances) {
    const instDir = inst.gameDirectory || join(instancesDir, inst.id)
    const verFolder = join(instDir, 'versions', versionId)
    if (existsSync(verFolder)) {
      try {
        rmSync(verFolder, { recursive: true, force: true, maxRetries: 5 })
        deletedCount++
      } catch {}
    }
    const cacheJson = join(instDir, 'cache', 'json', `${versionId}.json`)
    if (existsSync(cacheJson)) {
      try {
        rmSync(cacheJson, { force: true })
        deletedCount++
      } catch {}
    }
  }

  return { success: true, deletedCount }
}

export function duplicateInstance(id: string): GameInstance | null {
  const source = getInstance(id)
  if (!source) return null

  const newId = randomUUID()
  const instancesDir = getInstancesRoot()
  const targetDir = join(instancesDir, newId)

  try {
    if (existsSync(source.gameDirectory)) {
      cpSync(source.gameDirectory, targetDir, { recursive: true })
    } else {
      mkdirSync(targetDir, { recursive: true })
    }
  } catch {
    // Ignore copy error
  }

  const duplicated: GameInstance = {
    ...source,
    id: newId,
    name: `${source.name} (Copy)`,
    gameDirectory: targetDir,
    created: new Date().toISOString(),
    lastPlayed: undefined,
    totalPlaytime: 0
  }

  const list = instancesStore.read()
  list.push(duplicated)
  instancesStore.write(list)
  return duplicated
}

export function openInstanceFolder(id: string, subfolder?: string): boolean {
  if (id === 'root') {
    const root = getLauncherRoot()
    if (!existsSync(root)) mkdirSync(root, { recursive: true })
    shell.openPath(root)
    return true
  }

  const list = instancesStore.read()
  const target = getInstance(id) || list[0]
  if (target && target.gameDirectory) {
    let targetPath = subfolder ? join(target.gameDirectory, subfolder) : target.gameDirectory

    // Check if subfolder points to a specific file (e.g. has extension or is file on disk)
    const hasExtension = subfolder ? /\.[a-zA-Z0-9_\-]+$/.test(subfolder) : false
    const isExistingFile = existsSync(targetPath) ? !statSync(targetPath).isDirectory() : false

    if (hasExtension || isExistingFile) {
      if (existsSync(targetPath)) {
        try {
          shell.showItemInFolder(targetPath)
          return true
        } catch {}
      }
      // If file doesn't exist, fallback to opening its containing directory
      targetPath = dirname(targetPath)
    }

    if (!existsSync(targetPath)) {
      try {
        mkdirSync(targetPath, { recursive: true })
      } catch (err) {
        console.error('Failed to create instance subfolder:', targetPath, err)
      }
    }
    shell.openPath(targetPath).catch(() => {
      try { shell.showItemInFolder(targetPath) } catch {}
    })
    return true
  }

  const fallbackDir = subfolder ? join(getLauncherRoot(), subfolder) : getLauncherRoot()
  const fallbackHasExt = subfolder ? /\.[a-zA-Z0-9_\-]+$/.test(subfolder) : false
  const resolvedFallback = fallbackHasExt ? dirname(fallbackDir) : fallbackDir
  if (!existsSync(resolvedFallback)) {
    try {
      mkdirSync(resolvedFallback, { recursive: true })
    } catch {}
  }
  shell.openPath(resolvedFallback).catch(() => {
    try { shell.showItemInFolder(resolvedFallback) } catch {}
  })
  return true
}
