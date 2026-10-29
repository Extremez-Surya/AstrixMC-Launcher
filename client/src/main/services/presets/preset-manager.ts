import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { BrowserWindow } from 'electron'
import { getInstances, createInstance, getInstance, updateInstance } from '../instances/instance-manager'
import { buildAstrixPackInDirectory } from '../client-ui/astrix-menu'
import { installModFile, getFpsCandidateList } from '../mods/mod-manager'
import { getModrinthVersions } from '../mods/modrinth-api'
import { getCapeTextureBuffer } from '../cosmetics/cosmetics-manager'
import type { GameInstance } from '../../../shared/types/instance'

export interface AstrixPresetDefinition {
  id: string
  name: string
  tagline: string
  mcVersion: string
  loader: 'fabric' | 'forge' | 'quilt'
  loaderVersion: string
  recommendedRam: string
  icon: string
  features: string[]
  coreMods: { slug: string; name: string; required?: boolean }[]
}

export const ASTRIX_PRESETS: AstrixPresetDefinition[] = [
  {
    id: 'astrix-client-1.21.4',
    name: 'Astrix Client 1.21.4',
    tagline: 'Ultra FPS Engine & Modern PvP / Shaders',
    mcVersion: '1.21.4',
    loader: 'fabric',
    loaderVersion: 'latest',
    recommendedRam: '4',
    icon: 'diamond',
    features: [
      '500+ FPS Boost (Sodium + Lithium + FerriteCore)',
      'Built-in Iris Shader Engine',
      'Smooth Cinematic Scroll Zoom (Zoomify)',
      '3D Dynamic Capes & Cosmetics (WaveyCapes)',
      'Astrix Glassmorphism In-Game UI'
    ],
    coreMods: [
      { slug: 'fabric-api', name: 'Fabric API', required: true },
      { slug: 'fabric-language-kotlin', name: 'Fabric Language Kotlin', required: true },
      { slug: 'sodium', name: 'Sodium', required: true },
      { slug: 'lithium', name: 'Lithium', required: true },
      { slug: 'ferrite-core', name: 'FerriteCore', required: true },
      { slug: 'immediatelyfast', name: 'ImmediatelyFast', required: true },
      { slug: 'entityculling', name: 'EntityCulling', required: true },
      { slug: 'indium', name: 'Indium', required: true },
      { slug: 'iris', name: 'Iris Shaders', required: true },
      { slug: 'zoomify', name: 'Zoomify' },
      { slug: 'modmenu', name: 'ModMenu' },
      { slug: 'wavey-capes', name: 'Wavey Capes' },
      { slug: '3dskinlayers', name: '3D Skin Layers' },
      { slug: 'clean-keystrokes', name: 'Keystrokes & CPS' },
      { slug: 'simple-hud-enhanced', name: 'Simple HUD Enhanced' },
      { slug: 'ukus-armor-hud', name: 'Armor Durability HUD' },
      { slug: 'customskinloader', name: 'CustomSkinLoader' }
    ]
  },
  {
    id: 'astrix-client-1.20.1',
    name: 'Astrix Client 1.20.1',
    tagline: 'Universal Survival, Mods & Shaders Beast',
    mcVersion: '1.20.1',
    loader: 'fabric',
    loaderVersion: '0.16.10',
    recommendedRam: '4',
    icon: 'sword',
    features: [
      'Maximum Stability for Modpacks & Survival',
      'Full Shader Pack Support with Iris',
      'Dynamic Entity Culling & Memory Shield',
      'OptiFine Alternative Zoom & Capes'
    ],
    coreMods: [
      { slug: 'fabric-api', name: 'Fabric API', required: true },
      { slug: 'sodium', name: 'Sodium', required: true },
      { slug: 'lithium', name: 'Lithium', required: true },
      { slug: 'ferrite-core', name: 'FerriteCore', required: true },
      { slug: 'immediatelyfast', name: 'ImmediatelyFast', required: true },
      { slug: 'entityculling', name: 'EntityCulling', required: true },
      { slug: 'indium', name: 'Indium', required: true },
      { slug: 'iris', name: 'Iris Shaders', required: true },
      { slug: 'zoomify', name: 'Zoomify' },
      { slug: 'modmenu', name: 'ModMenu' },
      { slug: 'wavey-capes', name: 'Wavey Capes' },
      { slug: '3dskinlayers', name: '3D Skin Layers' },
      { slug: 'clean-keystrokes', name: 'Keystrokes & CPS' },
      { slug: 'simple-hud-enhanced', name: 'Simple HUD Enhanced' },
      { slug: 'ukus-armor-hud', name: 'Armor Durability HUD' },
      { slug: 'customskinloader', name: 'CustomSkinLoader' }
    ]
  },
  {
    id: 'astrix-client-1.8.9',
    name: 'Astrix Client 1.8.9',
    tagline: 'Hypixel Bedwars & Classic PvP Performance',
    mcVersion: '1.8.9',
    loader: 'forge',
    loaderVersion: '11.15.1.2318',
    recommendedRam: '3',
    icon: 'target',
    features: [
      'Hypixel & Bedwars Optimized Network Tick',
      '1.8 Classic Hitreg & Animations',
      'Custom Cape & OptiFine Performance'
    ],
    coreMods: []
  }
]

function sendPresetLog(msg: string): void {
  try {
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send('launch:log', msg)
      }
    }
  } catch {}
}

/**
 * Returns available Astrix Client presets along with their matching installed instance (if any).
 */
export function getAstrixPresets(): {
  preset: AstrixPresetDefinition
  installedInstance: GameInstance | null
}[] {
  const allInstances = getInstances()
  return ASTRIX_PRESETS.map((p) => {
    const found =
      allInstances.find(
        (i) =>
          i.name.toLowerCase().includes(p.id) ||
          i.name.toLowerCase() === p.name.toLowerCase() ||
          (i.mcVersion === p.mcVersion && i.modLoader?.type === p.loader && i.name.toLowerCase().includes('astrix'))
      ) || null

    return {
      preset: p,
      installedInstance: found
    }
  })
}

/**
 * Ensures that the flagship "Astrix Client 1.21.4" instance is created on first launch
 * so that users have a zero-configuration, ready-to-play client instantly.
 */
export async function ensureDefaultAstrixPreset(): Promise<GameInstance> {
  const presets = getAstrixPresets()
  const defaultPreset = presets[0]

  if (defaultPreset.installedInstance) {
    try {
      const modsDir = join(defaultPreset.installedInstance.gameDirectory, 'mods')
      const existing = existsSync(modsDir)
        ? readdirSync(modsDir).filter((f: string) => f.endsWith('.jar') && !f.endsWith('.disabled'))
        : []
      if (existing.length < 3) {
        installOrSyncAstrixPresetMods(defaultPreset.installedInstance.id).catch(() => {})
      }
    } catch {}
    return defaultPreset.installedInstance
  }

  // Create official Astrix Client 1.21.4 instance
  const newInst = createInstance({
    name: defaultPreset.preset.name,
    mcVersion: defaultPreset.preset.mcVersion,
    icon: defaultPreset.preset.icon,
    modLoader: {
      type: defaultPreset.preset.loader as 'fabric' | 'forge' | 'quilt',
      version: defaultPreset.preset.loaderVersion
    },
    memoryMin: '2',
    memoryMax: defaultPreset.preset.recommendedRam,
    jvmArgs: '-XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=15 -XX:MaxGCPauseMillis=50'
  })

  // Pre-seed Astrix Client in-game UI, options & mods
  setupAstrixClientEnvironment(newInst.id)
  installOrSyncAstrixPresetMods(newInst.id).catch(() => {})

  return newInst
}

/**
 * Configures the in-game environment for Astrix Client (options.txt, custom resource pack, cape).
 */
export function setupAstrixClientEnvironment(instanceId: string): void {
  const inst = getInstance(instanceId)
  if (!inst) return

  try {
    // 1. Inject AstrixMC-UI client resource pack
    const rpDir = join(inst.gameDirectory, 'resourcepacks', 'AstrixMC-UI')
    buildAstrixPackInDirectory(rpDir)

    // 2. Setup options.txt to automatically load AstrixMC-UI and optimize graphics
    const optionsPath = join(inst.gameDirectory, 'options.txt')
    let optionsContent = ''
    if (existsSync(optionsPath)) {
      optionsContent = readFileSync(optionsPath, 'utf8')
    }

    if (!optionsContent.includes('AstrixMC-UI')) {
      if (optionsContent.includes('resourcePacks:[')) {
        optionsContent = optionsContent.replace('resourcePacks:[', 'resourcePacks:["file/AstrixMC-UI",')
      } else {
        optionsContent += '\nresourcePacks:["file/AstrixMC-UI"]'
      }
    }

    // Auto-disable annoying auto-jump for PvP & set clean FOV
    if (!optionsContent.includes('autoJump:')) {
      optionsContent += '\nautoJump:false'
    } else {
      optionsContent = optionsContent.replace(/autoJump:(true|false)/, 'autoJump:false')
    }

    writeFileSync(optionsPath, optionsContent, 'utf8')

    // 3. Inject custom Astrix cape buffer for CustomSkinLoader
    const cslDir = join(inst.gameDirectory, 'CustomSkinLoader', 'LocalSkin', 'capes')
    mkdirSync(cslDir, { recursive: true })
    const capeBuffer = getCapeTextureBuffer('cloak-astrix-chroma')
    writeFileSync(join(cslDir, 'default.png'), capeBuffer)
  } catch (err) {
    sendPresetLog(`[AstrixClient] Environment setup notice: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/**
 * Installs or updates all core client mods for an Astrix Client instance from Modrinth.
 */
export async function installOrSyncAstrixPresetMods(
  instanceId: string,
  onProgress?: (status: string) => void
): Promise<{ success: boolean; installedCount: number; errors: string[] }> {
  const inst = getInstance(instanceId)
  if (!inst) return { success: false, installedCount: 0, errors: ['Instance not found'] }

  const preset = ASTRIX_PRESETS.find(
    (p) =>
      p.mcVersion === inst.mcVersion &&
      p.loader === (inst.modLoader?.type || 'fabric')
  ) || ASTRIX_PRESETS[0]

  setupAstrixClientEnvironment(instanceId)

  const loader = inst.modLoader?.type || 'fabric'
  const version = inst.mcVersion
  const modsDir = join(inst.gameDirectory, 'mods')
  mkdirSync(modsDir, { recursive: true })

  let installedCount = 0
  const errors: string[] = []

  sendPresetLog(`[AstrixClient] Synchronizing core client mods for ${preset.name}...`)
  onProgress?.(`Synchronizing core mods for ${preset.name}...`)

  for (const mod of preset.coreMods) {
    try {
      onProgress?.(`Checking ${mod.name}...`)
      const versions = await getModrinthVersions(mod.slug, loader, version)
      if (versions && versions.length > 0 && versions[0].files && versions[0].files.length > 0) {
        const file = versions[0].files.find((f: any) => f.primary) || versions[0].files[0]
        const dest = join(modsDir, file.filename)

        if (!existsSync(dest)) {
          onProgress?.(`Downloading ${mod.name} (${file.filename})...`)
          sendPresetLog(`[AstrixClient] Installing core client mod: ${mod.name}`)
          const res = await installModFile(instanceId, file.url, file.filename, 'mods')
          if (res.success) {
            installedCount++
          } else {
            errors.push(`Could not install ${mod.name}: ${res.error}`)
          }
        }
      }
    } catch (err) {
      errors.push(`Failed fetching ${mod.name}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  sendPresetLog(`[AstrixClient] Core client pack synchronized (${installedCount} new mods installed).`)
  return { success: errors.length === 0, installedCount, errors }
}
