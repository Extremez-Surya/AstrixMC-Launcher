import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, cpSync } from 'fs'
import { join } from 'path'
import { getLauncherRoot, getInstancesRoot } from '../store'

export interface ClientThemeData {
  config: {
    backgroundType: 'preset' | 'custom'
    presetId: string
    customBackgroundUrl?: string
    buttonStyle: 'glassmorphism' | 'cyber_glow' | 'sapphire_ice' | 'emerald_matrix' | 'classic_dark'
    titleText: string
    subtitleText: string
    accentColor: string
    glassOpacity?: number
  }
  backgroundDataUrl?: string
  panoramaSquareDataUrl?: string
  buttonNormalDataUrl?: string
  buttonHoverDataUrl?: string
  buttonDisabledDataUrl?: string
  widgetsDataUrl?: string
  logoDataUrl?: string
  editionDataUrl?: string
  dirtDataUrl?: string
}

function writeBase64Image(filePath: string, dataUrl: string): void {
  if (!dataUrl) return
  try {
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    writeFileSync(filePath, buffer)
  } catch (err) {
    console.warn(`[ClientUI] Failed to write image to ${filePath}:`, err)
  }
}

/**
 * Creates or updates the AstrixMC-UI resource pack in a target directory
 */
export function buildAstrixPackInDirectory(
  packDir: string,
  payload?: ClientThemeData
): void {
  const mcDir     = join(packDir, 'assets', 'minecraft')
  const guiDir    = join(mcDir, 'textures', 'gui')
  const titleDir  = join(guiDir, 'title')
  const bgDir     = join(titleDir, 'background')
  const spriteDir = join(guiDir, 'sprites', 'widget')
  const blockDir  = join(mcDir, 'textures', 'block')
  const textsDir  = join(mcDir, 'texts')
  const langDir   = join(mcDir, 'lang')

  for (const d of [bgDir, spriteDir, blockDir, textsDir, langDir]) {
    mkdirSync(d, { recursive: true })
  }

  // Suppress copyright credits on main menu
  writeFileSync(
    join(langDir, 'en_us.json'),
    JSON.stringify({ 'title.credits': '' }, null, 2),
    'utf-8'
  )

  // 1. Pack mcmeta
  writeFileSync(
    join(packDir, 'pack.mcmeta'),
    JSON.stringify(
      {
        pack: {
          pack_format: 34,
          description: 'AstrixMC — Glassmorphism Client UI'
        }
      },
      null,
      2
    )
  )

  // 2. Custom Splashes
  const customSplash = (payload?.config as any)?.splashText || 'Glassmorphism activated!'
  writeFileSync(
    join(textsDir, 'splashes.txt'),
    customSplash + '\n'
  )

  // 3. Write Custom Background (Panorama 0 to 5)
  // 3. Write Still Background (panorama_overlay.png for static 2D, panorama_0-5 for square cubemap)
  if (payload?.backgroundDataUrl) {
    // panorama_overlay.png renders as a static 2D screen quad over the 3D rotating cube.
    // Writing the 16:9 wallpaper here locks the background completely STILL with NO ROTATION and NO CUBE SEAMS!
    writeBase64Image(join(bgDir, 'panorama_overlay.png'), payload.backgroundDataUrl)
  } else {
    // 100% Fully transparent PNG fallback so Minecraft does not blackout the background
    const transparentPixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=',
      'base64'
    )
    writeFileSync(join(bgDir, 'panorama_overlay.png'), transparentPixel)
  }

  // Cubemap textures MUST be square (1024x1024) to satisfy Minecraft's CubeMapTexture requirement!
  if (payload?.panoramaSquareDataUrl) {
    for (let i = 0; i <= 5; i++) {
      writeBase64Image(join(bgDir, `panorama_${i}.png`), payload.panoramaSquareDataUrl)
    }
  }

  // 4. Buttons (Modern 1.20.2+ sprite widgets)
  if (payload?.buttonNormalDataUrl) {
    writeBase64Image(join(spriteDir, 'button.png'), payload.buttonNormalDataUrl)
  }
  if (payload?.buttonHoverDataUrl) {
    writeBase64Image(join(spriteDir, 'button_highlighted.png'), payload.buttonHoverDataUrl)
  }
  if (payload?.buttonDisabledDataUrl) {
    writeBase64Image(join(spriteDir, 'button_disabled.png'), payload.buttonDisabledDataUrl)
  }

  // 5. Legacy widgets (1.16 - 1.20.1)
  if (payload?.widgetsDataUrl) {
    writeBase64Image(join(guiDir, 'widgets.png'), payload.widgetsDataUrl)
  }

  // 6. Title Logo & Edition (Suppress vanilla 2D logos so only the 3D video logo renders)
  const transparentPixel = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=',
    'base64'
  )
  if (payload?.logoDataUrl) {
    writeBase64Image(join(titleDir, 'minecraft.png'), payload.logoDataUrl)
  } else {
    writeFileSync(join(titleDir, 'minecraft.png'), transparentPixel)
    writeFileSync(join(titleDir, 'minceraft.png'), transparentPixel)
  }
  if (payload?.editionDataUrl) {
    writeBase64Image(join(titleDir, 'edition.png'), payload.editionDataUrl)
  } else {
    writeFileSync(join(titleDir, 'edition.png'), transparentPixel)
  }

  // 7. Loading Backgrounds (Dirt & Inworld Menu)
  if (payload?.dirtDataUrl) {
    writeBase64Image(join(blockDir, 'dirt.png'), payload.dirtDataUrl)
    writeBase64Image(join(guiDir, 'inworld_menu_background.png'), payload.dirtDataUrl)
  }
}

/**
 * Ensures "file/AstrixMC-UI" is active at highest priority in options.txt
 */
export function enableAstrixResourcePack(gameDirectory: string): void {
  const optFile = join(gameDirectory, 'options.txt')

  if (!existsSync(optFile)) {
    writeFileSync(optFile, 'resourcePacks:["vanilla","file/AstrixMC-UI"]\n', 'utf-8')
    return
  }

  try {
    let content = readFileSync(optFile, 'utf-8')

    if (/resourcePacks:\[/.test(content)) {
      content = content.replace(/resourcePacks:\[([^\]]*)\]/, (_, inner) => {
        const list = inner
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s && !s.includes('AstrixMC-UI'))

        list.push('"file/AstrixMC-UI"')
        return `resourcePacks:[${list.join(',')}]`
      })
    } else {
      content += '\nresourcePacks:["vanilla","file/AstrixMC-UI"]'
    }

    writeFileSync(optFile, content, 'utf-8')
  } catch (err) {
    console.warn('[ClientUI] Failed to update options.txt:', err)
  }
}

/**
 * Save custom client theme from the UI Studio and apply to all instances
 */
export async function saveCustomClientTheme(
  payload: ClientThemeData
): Promise<{ success: boolean; appliedCount: number }> {
  try {
    const launcherRoot = getLauncherRoot()
    const templatePackDir = join(launcherRoot, 'client-theme', 'AstrixMC-UI')
    mkdirSync(templatePackDir, { recursive: true })

    // 1. Build template pack in launcher data
    buildAstrixPackInDirectory(templatePackDir, payload)

    // 2. Save config JSON
    writeFileSync(
      join(launcherRoot, 'client-theme-config.json'),
      JSON.stringify(payload.config || {}, null, 2),
      'utf-8'
    )

    // 3. Sync to all existing instances
    let appliedCount = 0
    const instancesRoot = getInstancesRoot()

    if (existsSync(instancesRoot)) {
      const dirs = readdirSync(instancesRoot, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)

      for (const dirName of dirs) {
        const instDir = join(instancesRoot, dirName)
        const instPackDir = join(instDir, 'resourcepacks', 'AstrixMC-UI')
        mkdirSync(join(instDir, 'resourcepacks'), { recursive: true })

        try {
          cpSync(templatePackDir, instPackDir, { recursive: true })
          enableAstrixResourcePack(instDir)
          appliedCount++
        } catch (copyErr) {
          console.warn(`[ClientUI] Failed to sync to instance ${dirName}:`, copyErr)
        }
      }
    }

    return { success: true, appliedCount }
  } catch (err) {
    console.error('[ClientUI] saveCustomClientTheme error:', err)
    return { success: false, appliedCount: 0 }
  }
}

/**
 * Retrieve saved client theme config
 */
export function getCustomClientTheme(): any {
  const configFile = join(getLauncherRoot(), 'client-theme-config.json')
  if (existsSync(configFile)) {
    try {
      return JSON.parse(readFileSync(configFile, 'utf-8'))
    } catch {}
  }
  return {
    backgroundType: 'preset',
    presetId: 'crimson_nebula',
    buttonStyle: 'glassmorphism',
    titleText: 'ASTRIXMC',
    subtitleText: 'Glassmorphism Client',
    accentColor: '#FF3154'
  }
}

/**
 * Setup called on launch: syncs the Feather Client UI layout, FancyMenu mod jars, and theme
 */
export async function setupAstrixFeatherMenu(
  _gameDirectory: string,
  _mcVersion: string = '1.20.4',
  _loaderType: string = 'vanilla',
  _onProgress?: (msg: string) => void
): Promise<void> {
  // Custom client UI disabled as requested by user
  return
}

