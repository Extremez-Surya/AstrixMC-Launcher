import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, unlinkSync } from 'fs'
import { join } from 'path'
import AdmZip from 'adm-zip'
import { BrowserWindow } from 'electron'
import { downloadFile } from '../http'
import { getInstance } from '../instances/instance-manager'
import { getModrinthVersions, searchModrinth } from './modrinth-api'
import type { InstalledMod } from '../../../shared/types/mod'

function sendInAppLog(msg: string): void {
  try {
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send('launch:log', msg)
      }
    }
  } catch {}
}

// Recursively delete any 0-byte or corrupted .jar files in directory
export function cleanCorruptJars(dir: string): void {
  if (!existsSync(dir)) return
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        cleanCorruptJars(fullPath)
      } else if (entry.isFile()) {
        let isCorrupt = false
        try {
          const stat = statSync(fullPath)
          if (stat.size === 0) {
            isCorrupt = true
          } else if (entry.name.endsWith('.jar')) {
            const zip = new AdmZip(fullPath)
            const list = zip.getEntries()
            if (!list || list.length === 0) isCorrupt = true
          }
        } catch {
          isCorrupt = true
        }
        if (isCorrupt) {
          try {
            unlinkSync(fullPath)
            console.warn(`[ModManager] Removed corrupted or incomplete jar file: ${entry.name}`)
          } catch {
            // ignore
          }
        }
      }
    }
  } catch {
    // ignore
  }
}

export function getInstalledMods(instanceId: string): InstalledMod[] {
  const inst = getInstance(instanceId)
  if (!inst) return []

  const modsDir = join(inst.gameDirectory, 'mods')
  if (!existsSync(modsDir)) {
    mkdirSync(modsDir, { recursive: true })
    return []
  }

  const files = readdirSync(modsDir)
  const mods: InstalledMod[] = []

  for (const file of files) {
    if (file.endsWith('.jar') || file.endsWith('.jar.disabled')) {
      const isEnabled = file.endsWith('.jar')
      const cleanName = file.replace(/\.jar(?:\.disabled)?$/, '')
      mods.push({
        id: file,
        name: cleanName,
        version: 'installed',
        fileName: file,
        source: 'modrinth',
        sourceId: cleanName,
        enabled: isEnabled,
        instanceId
      })
    }
  }

  return mods
}

export async function installModFile(
  instanceId: string,
  downloadUrl: string,
  fileName: string,
  folderType: 'mods' | 'shaderpacks' | 'resourcepacks' = 'mods',
  dependencies?: any[]
): Promise<{ success: boolean; error?: string }> {
  const inst = getInstance(instanceId)
  if (!inst) return { success: false, error: 'Instance not found' }

  const targetDir = join(inst.gameDirectory, folderType)
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  const destPath = join(targetDir, fileName)
  const tempPath = join(targetDir, `${fileName}.tmp-${Date.now()}`)

  try {
    // 1. Download to temporary file
    await downloadFile(downloadUrl, tempPath)

    // 2. Validate zip archive integrity for .jar mod and .zip pack files
    if (fileName.endsWith('.jar') || fileName.endsWith('.zip') || folderType === 'mods') {
      try {
        const zip = new AdmZip(tempPath)
        const entries = zip.getEntries()
        if (!entries || entries.length === 0) {
          throw new Error('Archive is empty')
        }
      } catch (zipErr) {
        if (existsSync(tempPath)) {
          try {
            unlinkSync(tempPath)
          } catch {}
        }
        return {
          success: false,
          error: `Corrupt file download (integrity check failed): ${zipErr}`
        }
      }
    }

    // 3. Atomically overwrite destination file
    if (existsSync(destPath)) {
      rmSync(destPath, { force: true })
    }
    renameSync(tempPath, destPath)

    // 4. If user installed a Shaderpack, ensure Iris / Oculus is in mods folder so the Shader Packs menu appears in Minecraft!
    if (folderType === 'shaderpacks') {
      const modsDir = join(inst.gameDirectory, 'mods')
      const loader = inst.modLoader?.type || 'fabric'
      const shaderModSlug = loader === 'forge' ? 'oculus' : 'iris'

      const hasShaderEngine =
        existsSync(modsDir) &&
        readdirSync(modsDir).some(
          (f) => (f.toLowerCase().includes('iris') || f.toLowerCase().includes('oculus')) && f.endsWith('.jar')
        )

      if (!hasShaderEngine) {
        // Run in background without blocking shaderpack installation completion
        getModrinthVersions(shaderModSlug, loader, inst.mcVersion)
          .then(async (versions) => {
            if (versions && versions.length > 0 && versions[0].files.length > 0) {
              const file = versions[0].files.find((f) => f.primary) || versions[0].files[0]
              await installModFile(instanceId, file.url, file.filename, 'mods')
              sendInAppLog(`[AstrixMC ModManager] Installed ${shaderModSlug} for in-game shaders`)
            }
          })
          .catch(() => {})
      }
    }

    // 5. Automatically resolve and install dependencies in background (INSTANT response for Discover UI!)
    if (folderType === 'mods') {
      const loader = inst.modLoader?.type || 'fabric'
      resolveMissingModDependencies(targetDir, inst.mcVersion, loader, destPath).catch((err) => {
        console.warn('[AstrixMC ModManager] Dependency resolution notice:', err)
      })
    }

    return { success: true }
  } catch (err) {
    if (existsSync(tempPath)) {
      try {
        unlinkSync(tempPath)
      } catch {}
    }
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export const KNOWN_MOD_ALIASES: Record<string, string> = {
  'yet_another_config_lib_v3': 'yacl',
  'yet_another_config_lib': 'yacl',
  'yacl': 'yacl',
  'cloth_config': 'cloth-config',
  'cloth-config2': 'cloth-config',
  'cloth-config': 'cloth-config',
  'architectury': 'architectury-api',
  'architectury-api': 'architectury-api',
  'cicada': 'cicada',
  'cicada-lib': 'cicada',
  'owo': 'owo-lib',
  'owo-lib': 'owo-lib',
  'fabric-api': 'fabric-api',
  'modmenu': 'modmenu',
  'sodium': 'sodium',
  'iris': 'iris',
  'watermedia_binaries': 'watermedia-binaries',
  'watermedia-binaries': 'watermedia-binaries'
}

const SYSTEM_MOD_IDS = new Set([
  'minecraft',
  'fabricloader',
  'fabric',
  'quilt_loader',
  'forge',
  'neoforge',
  'java',
  'mixinextras',
  'mixinsquared',
  'optifine',
  'fabric-language-kotlin',
  'fabric-language-scala'
])

/**
 * Scans newly installed jar (or all jars) in mods directory, extracts dependencies,
 * and automatically downloads any missing required library from Modrinth!
 */
export async function resolveMissingModDependencies(
  modsDir: string,
  mcVersion: string,
  loader: string = 'fabric',
  targetModPath?: string
): Promise<string[]> {
  if (!existsSync(modsDir)) return []
  const files = readdirSync(modsDir).filter((f) => f.endsWith('.jar'))
  if (files.length === 0) return []

  const providedIds = new Set<string>()
  const requiredDeps = new Map<string, string>()

  // Files to inspect for missing dependencies
  const filesToInspect = targetModPath && existsSync(targetModPath)
    ? [targetModPath]
    : files.map((f) => join(modsDir, f))

  // Fast registration of provided IDs across all existing jars
  for (const file of files) {
    const base = file.toLowerCase()
    if (base.includes('fabric-api')) providedIds.add('fabric-api')
    if (base.includes('architectury')) providedIds.add('architectury')
    if (base.includes('cloth-config')) providedIds.add('cloth-config')
    if (base.includes('yacl') || base.includes('yet-another-config-lib')) providedIds.add('yacl')
    if (base.includes('sodium')) providedIds.add('sodium')
    if (base.includes('iris')) providedIds.add('iris')
  }

  for (const fullPath of filesToInspect) {
    try {
      const zip = new AdmZip(fullPath)
      const entry = zip.getEntry('fabric.mod.json')
      if (entry) {
        const data = JSON.parse(entry.getData().toString('utf8'))
        if (data.id) providedIds.add(data.id)
        if (Array.isArray(data.provides)) {
          data.provides.forEach((p: string) => providedIds.add(p))
        }
        if (data.depends && typeof data.depends === 'object') {
          for (const depId of Object.keys(data.depends)) {
            if (!SYSTEM_MOD_IDS.has(depId)) {
              requiredDeps.set(depId, data.name || data.id || fullPath)
            }
          }
        }
      }

      // Check Jar-in-Jar (JiJ) entries so bundled libraries are not searched/downloaded
      const zipEntries = zip.getEntries()
      for (const e of zipEntries) {
        if (e.entryName.startsWith('META-INF/jars/') && e.entryName.endsWith('.jar')) {
          try {
            const subZip = new AdmZip(e.getData())
            const subEntry = subZip.getEntry('fabric.mod.json')
            if (subEntry) {
              const subData = JSON.parse(subEntry.getData().toString('utf8'))
              if (subData.id) providedIds.add(subData.id)
              if (Array.isArray(subData.provides)) {
                subData.provides.forEach((p: string) => providedIds.add(p))
              }
            }
          } catch {}
        }
      }
    } catch {
      // ignore
    }
  }

  let hasFabricApi =
    providedIds.has('fabric-api') ||
    files.some((f) => f.toLowerCase().includes('fabric-api'))

  const installed: string[] = []
  for (const [depId, requiringMod] of requiredDeps.entries()) {
    if (providedIds.has(depId)) continue

    // If fabric-api is present, all internal submodules (fabric-resource-loader, fabric-screen-api, etc.) are satisfied
    if (hasFabricApi && (depId.startsWith('fabric-') || depId.startsWith('fabric_') || depId.startsWith('fabric-api-'))) {
      continue
    }

    // If it's a fabric submodule but fabric-api itself is missing, install fabric-api once
    const targetSlug =
      (depId.startsWith('fabric-') || depId.startsWith('fabric_')) && depId !== 'fabric-api'
        ? 'fabric-api'
        : KNOWN_MOD_ALIASES[depId] || depId

    if (targetSlug === 'fabric-api') {
      if (hasFabricApi) continue
      hasFabricApi = true
    }

    sendInAppLog(`[AstrixMC Dependencies] Missing dependency detected: '${depId}' (required by '${requiringMod}')`)
    try {
      let versions = await getModrinthVersions(targetSlug, loader, mcVersion)
      if (!versions || versions.length === 0) {
        const hits = await searchModrinth({ query: targetSlug, loader, version: mcVersion, limit: 1 })
        if (hits && hits.length > 0) {
          versions = await getModrinthVersions(hits[0].slug, loader, mcVersion)
        }
      }

      if (versions && versions.length > 0 && versions[0].files && versions[0].files.length > 0) {
        const file = versions[0].files.find((f: any) => f.primary) || versions[0].files[0]
        const dest = join(modsDir, file.filename)
        if (!existsSync(dest)) {
          sendInAppLog(`[AstrixMC Dependencies] Downloading '${file.filename}' for Minecraft ${mcVersion}...`)
          await downloadFile(file.url, dest)
          providedIds.add(depId)
          installed.push(file.filename)
        } else {
          providedIds.add(depId)
        }
      }
    } catch (err) {
      sendInAppLog(`[AstrixMC Dependencies] Notice: Could not resolve dependency '${depId}'`)
    }
  }

  return installed
}

export function toggleMod(instanceId: string, fileName: string): boolean {
  const inst = getInstance(instanceId)
  if (!inst) return false

  const modsDir = join(inst.gameDirectory, 'mods')
  const currentPath = join(modsDir, fileName)
  if (!existsSync(currentPath)) return false

  let newPath = ''
  if (fileName.endsWith('.jar')) {
    newPath = join(modsDir, `${fileName}.disabled`)
  } else if (fileName.endsWith('.jar.disabled')) {
    newPath = join(modsDir, fileName.replace(/\.disabled$/, ''))
  } else {
    return false
  }

  try {
    renameSync(currentPath, newPath)
    return true
  } catch {
    return false
  }
}

export function removeMod(instanceId: string, fileName: string): boolean {
  const inst = getInstance(instanceId)
  if (!inst) return false

  const modsDir = join(inst.gameDirectory, 'mods')
  const targetPath = join(modsDir, fileName)
  if (!existsSync(targetPath)) return false

  try {
    rmSync(targetPath, { force: true })
    return true
  } catch {
    return false
  }
}

export interface FpsModCandidate {
  slug: string
  name: string
  description: string
}

export interface FpsModCompatibilityResult {
  slug: string
  name: string
  description: string
  compatible: boolean
  versionNumber?: string
  filename?: string
  downloadUrl?: string
}

export function getFpsCandidateList(loader: string = 'fabric'): FpsModCandidate[] {
  if (loader === 'fabric' || loader === 'quilt') {
    return [
      { slug: 'fabric-api', name: 'Fabric API', description: 'Essential core runtime library for Fabric' },
      { slug: 'sodium', name: 'Sodium', description: 'Next-gen rendering engine (Massive FPS boost)' },
      { slug: 'iris', name: 'Iris Shaders', description: 'Enables in-game Shaders menu & ultra-fast shader rendering' },
      { slug: 'sodium-extra', name: 'Sodium Extra', description: 'Adds detailed video settings (particles, clouds, animations)' },
      { slug: 'modmenu', name: 'Mod Menu', description: 'Adds the in-game "Mods" button to title screen and pause menu' },
      { slug: 'lithium', name: 'Lithium', description: 'Game physics & internal tick optimizer' },
      { slug: 'ferrite-core', name: 'FerriteCore', description: 'Reduces Minecraft RAM usage by up to 40%' },
      { slug: 'entityculling', name: 'Entity Culling', description: 'Skips rendering entities occluded by blocks' },
      { slug: 'badoptimizations', name: 'BadOptimizations', description: 'Safe entity & lighting dispatch micro-optimizations' },
      { slug: 'dynamic-fps', name: 'Dynamic FPS', description: 'Saves GPU/CPU power when Minecraft is in background' },
      { slug: 'clumps', name: 'Clumps', description: 'Merges XP orbs together to eliminate XP cluster lag' },
      { slug: 'krypton', name: 'Krypton', description: 'Optimizes networking stack & multiplayer latency' },
      { slug: 'ebe', name: 'Enhanced Block Entities', description: 'Optimized models for chests, signs, and bells' }
    ]
  }

  return [
    { slug: 'embeddium', name: 'Embeddium', description: 'Sodium port for Forge/NeoForge (High FPS)' },
    { slug: 'oculus', name: 'Oculus', description: 'Iris Shaders port for Forge (Shader Support)' },
    { slug: 'ferrite-core', name: 'FerriteCore', description: 'Reduces Minecraft RAM usage by up to 40%' },
    { slug: 'entityculling', name: 'Entity Culling', description: 'Skips rendering hidden entities' },
    { slug: 'modernfix', name: 'ModernFix', description: 'Reduces game load time & RAM consumption' },
    { slug: 'clumps', name: 'Clumps', description: 'Merges XP orbs to eliminate XP lag' }
  ]
}

/**
 * Check which FPS mods are available and 100% compatible for the chosen Minecraft version & mod loader
 */
export async function checkFpsBoostCompatibility(
  mcVersion: string,
  loader: string = 'fabric'
): Promise<FpsModCompatibilityResult[]> {
  const candidates = getFpsCandidateList(loader)

  const results = await Promise.all(
    candidates.map(async (mod) => {
      try {
        const versions = await getModrinthVersions(mod.slug, loader, mcVersion)
        if (versions && versions.length > 0 && versions[0].files && versions[0].files.length > 0) {
          const file = versions[0].files.find((f) => f.primary) || versions[0].files[0]
          return {
            slug: mod.slug,
            name: mod.name,
            description: mod.description,
            compatible: true,
            versionNumber: versions[0].version_number,
            filename: file.filename,
            downloadUrl: file.url
          }
        }
        return {
          slug: mod.slug,
          name: mod.name,
          description: mod.description,
          compatible: false
        }
      } catch {
        return {
          slug: mod.slug,
          name: mod.name,
          description: mod.description,
          compatible: false
        }
      }
    })
  )

  return results
}

/**
 * 1-Click FPS Beast optimization modpack installer (Sodium, Lithium, FerriteCore, ImmediatelyFast, EntityCulling, Krypton)
 * Dynamically filters ONLY mods that are 100% verified compatible with the instance's Minecraft version!
 */
export async function installFpsBoostPack(
  instanceId: string,
  onProgress?: (msg: string) => void
): Promise<{ success: boolean; installed: string[]; errors: string[] }> {
  const inst = getInstance(instanceId)
  if (!inst) return { success: false, installed: [], errors: ['Instance not found'] }

  const loader = inst.modLoader?.type || 'fabric'
  const version = inst.mcVersion || '1.20.4'

  // Pre-clean any corrupt or incomplete jar files first
  cleanCorruptJars(join(inst.gameDirectory, 'mods'))

  onProgress?.(`Checking FPS mod compatibility for Minecraft ${version} (${loader})...`)
  const compatibilityList = await checkFpsBoostCompatibility(version, loader)
  const compatibleMods = compatibilityList.filter((m) => m.compatible && m.downloadUrl && m.filename)

  const installed: string[] = []
  const errors: string[] = []

  if (compatibleMods.length === 0) {
    return {
      success: false,
      installed: [],
      errors: [`No FPS optimization mods currently available for Minecraft ${version} on ${loader}`]
    }
  }

  for (const mod of compatibleMods) {
    try {
      onProgress?.(`Installing ${mod.name} (${mod.filename})...`)
      const res = await installModFile(instanceId, mod.downloadUrl!, mod.filename!)
      if (res.success) {
        installed.push(mod.name)
      } else {
        errors.push(`Failed to download ${mod.name}: ${res.error}`)
      }
    } catch (err) {
      errors.push(`Error installing ${mod.name}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // Final verification sweep in mods directory to guarantee 0 broken files
  cleanCorruptJars(join(inst.gameDirectory, 'mods'))

  return { success: installed.length > 0, installed, errors }
}
