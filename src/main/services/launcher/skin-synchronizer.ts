import { existsSync, mkdirSync, writeFileSync, copyFileSync, unlinkSync, readFileSync } from 'fs'
import { join } from 'path'
import https from 'https'
import http from 'http'
import { BrowserWindow } from 'electron'
import type { MinecraftAccount } from '../../../shared/types/auth'
import { getLauncherRoot } from '../store'

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

const CSL_MOD_FILENAME = 'CustomSkinLoader_Universal-15.1.jar'
const CSL_DOWNLOAD_URL =
  'https://cdn.modrinth.com/data/idMHQ4n2/versions/yyYvYfZI/CustomSkinLoader_Universal-15.1.jar'

/**
 * Downloads a file via HTTPS or HTTP, following redirects.
 */
function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    protocol
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadFile(res.headers.location, destPath).then(resolve).catch(reject)
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to download ${url}: HTTP status ${res.statusCode}`))
        }
        const chunks: Buffer[] = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          try {
            writeFileSync(destPath, Buffer.concat(chunks))
            resolve()
          } catch (err) {
            reject(err)
          }
        })
      })
      .on('error', reject)
  })
}

/**
 * Fetches an image buffer from a remote URL.
 */
function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    protocol
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchBuffer(res.headers.location).then(resolve).catch(reject)
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to fetch image from ${url}: HTTP ${res.statusCode}`))
        }
        const chunks: Buffer[] = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks)))
      })
      .on('error', reject)
  })
}

/**
 * Ensures the CustomSkinLoader Universal jar is downloaded and cached locally.
 */
export async function ensureCustomSkinLoaderCached(): Promise<string> {
  const cacheDir = join(getLauncherRoot(), 'assets', 'mods')
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true })
  }
  const cachedJarPath = join(cacheDir, CSL_MOD_FILENAME)
  if (!existsSync(cachedJarPath)) {
    sendInAppLog('[AstrixMC SkinSync] Downloading CustomSkinLoader Universal jar to cache...')
    await downloadFile(CSL_DOWNLOAD_URL, cachedJarPath)
  }
  return cachedJarPath
}

/**
 * Locates or caches the Java Agent for vanilla skin loading if available on the system.
 */
export function getSkinAgentPath(): string | null {
  const assetsAgentPath = join(getLauncherRoot(), 'assets', 'agents', 'skin-agent.jar')
  if (existsSync(assetsAgentPath)) {
    return assetsAgentPath
  }

  // Check common local path (e.g. from existing launcher installation)
  const appData = process.env.APPDATA || ''
  const externalAgent = join(appData, '.minecraft', 'sklauncher-fx.jar')
  if (existsSync(externalAgent)) {
    try {
      const agentDir = join(getLauncherRoot(), 'assets', 'agents')
      if (!existsSync(agentDir)) {
        mkdirSync(agentDir, { recursive: true })
      }
      copyFileSync(externalAgent, assetsAgentPath)
      return assetsAgentPath
    } catch {
      return externalAgent
    }
  }

  return null
}

/**
 * Returns JVM args for skin loading via javaagent when running vanilla instances.
 */
export function getSkinAgentJvmArgs(modLoader?: { type: string; version: string }): string[] {
  const isModded = Boolean(
    modLoader?.type && ['fabric', 'quilt', 'forge', 'neoforge'].includes(modLoader.type.toLowerCase())
  )
  // For modded instances, CustomSkinLoader is loaded via the instance mods directory.
  // For vanilla instances, inject the javaagent if available.
  if (!isModded) {
    const agentPath = getSkinAgentPath()
    if (agentPath && existsSync(agentPath)) {
      return [`-javaagent:${agentPath}`]
    }
  }
  return []
}

function isCslCompatible(mcVersion?: string): boolean {
  if (!mcVersion) return false
  const parts = mcVersion.split('.')
  const major = parseInt(parts[0], 10)
  const minor = parseInt(parts[1] || '0', 10)
  // Only Minecraft 1.8 through 1.20 are supported by CustomSkinLoader Universal 15.1
  // Modern Minecraft (1.21+ and 26.x) causes Mixin crashes if ancient CSL is loaded
  return major === 1 && minor <= 20
}

/**
 * Automatically synchronizes player skins and ensures skin loaders are active
 * so all players' skins (Mojang, SkinsRestorer, Ely.by, local) appear accurately in-game.
 */
export async function syncInGameSkin(
  gameDirectory: string,
  account: MinecraftAccount,
  modLoader?: { type: string; version: string },
  mcVersion?: string
): Promise<void> {
  try {
    const isModded = Boolean(
      modLoader?.type && ['fabric', 'quilt', 'forge', 'neoforge'].includes(modLoader.type.toLowerCase())
    )

    // Remove legacy fallback resource packs (AstrixSkin.zip and Astrix-Cosmetics.zip)
    // so default Steve and Alex player models are never corrupted with custom skins.
    try {
      const rpDir = join(gameDirectory, 'resourcepacks')
      for (const pack of ['AstrixSkin.zip', 'Astrix-Cosmetics.zip']) {
        const p = join(rpDir, pack)
        if (existsSync(p)) {
          try {
            unlinkSync(p)
            sendInAppLog(`[AstrixMC SkinSync] Removed legacy resourcepack: ${pack}`)
          } catch {}
        }
      }

      // Sanitize options.txt so removed resourcepacks are not loaded
      const optFile = join(gameDirectory, 'options.txt')
      if (existsSync(optFile)) {
        let optText = readFileSync(optFile, 'utf-8')
        if (optText.includes('Astrix-Cosmetics.zip') || optText.includes('AstrixSkin.zip')) {
          optText = optText.replace(/,?\"file\/Astrix-Cosmetics\.zip\"/g, '')
          optText = optText.replace(/,?\"file\/AstrixSkin\.zip\"/g, '')
          optText = optText.replace(/\[,/g, '[').replace(/,,/g, ',').replace(/,\]/g, ']')
          writeFileSync(optFile, optText, 'utf-8')
          sendInAppLog('[AstrixMC SkinSync] Cleaned options.txt resourcepack list.')
        }
      }
    } catch (e) {
      // ignore
    }

    if (isModded) {
      // 1. Ensure CustomSkinLoader mod is installed in instance mods/ ONLY for compatible MC versions
      const modsDir = join(gameDirectory, 'mods')
      if (!existsSync(modsDir)) {
        mkdirSync(modsDir, { recursive: true })
      }

      const cslInstanceModPath = join(modsDir, CSL_MOD_FILENAME)
      if (isCslCompatible(mcVersion)) {
        try {
          const cachedJarPath = await ensureCustomSkinLoaderCached()
          if (!existsSync(cslInstanceModPath)) {
            copyFileSync(cachedJarPath, cslInstanceModPath)
            sendInAppLog('[AstrixMC SkinSync] Installed CustomSkinLoader Universal to mods directory.')
          }
        } catch (err) {
          // ignore
        }
      } else {
        // Modern version: remove incompatible CSL mod to prevent game launch crash
        if (existsSync(cslInstanceModPath)) {
          try {
            unlinkSync(cslInstanceModPath)
            sendInAppLog(`[AstrixMC SkinSync] Removed incompatible CSL mod for MC ${mcVersion}`)
          } catch {}
        }
      }

      // 2. Ensure CustomSkinLoader configuration is active with full loadlist
      const cslDir = join(gameDirectory, 'CustomSkinLoader')
      if (!existsSync(cslDir)) {
        mkdirSync(cslDir, { recursive: true })
      }

      const cslConfigFile = join(cslDir, 'CustomSkinLoader.json')
      const cslConfig = {
        version: '15.1',
        buildNumber: 41,
        enable: true,
        loadlist: [
          {
            name: 'Server',
            type: 'GameProfile'
          },
          {
            name: 'Local',
            type: 'Legacy',
            skin: 'LocalSkin/skins/{USERNAME}.png',
            model: 'auto'
          },
          {
            name: 'Mojang',
            type: 'MojangAPI',
            apiRoot: 'https://api.mojang.com/',
            sessionRoot: 'https://sessionserver.mojang.com/'
          },
          {
            name: 'ElyBy',
            type: 'ElyByAPI'
          }
        ],
        enableTransparentSkin: false,
        forceLoadAllTextures: false,
        enableCape: true,
        threadPoolSize: 4,
        enableLogStdOut: false,
        cacheExpiry: 30,
        forceUpdateSkull: false,
        enableLocalProfileCache: false,
        enableCacheAutoClean: true,
        forceDisableCache: false
      }

      try {
        writeFileSync(cslConfigFile, JSON.stringify(cslConfig, null, 2), 'utf-8')
      } catch (err) {
        console.warn('[SkinSync] Failed to write CustomSkinLoader config:', err)
      }

      // 3. Synchronize local custom skin for the active user if configured
      const cslSkinsDir = join(cslDir, 'LocalSkin', 'skins')
      const cslSkinFile = join(cslSkinsDir, `${account.username}.png`)

      const hasCustomSkin =
        Boolean(account.skinType === 'player' && account.skinPlayerName) ||
        Boolean(account.skinType === 'custom' && account.skinUrl) ||
        Boolean(account.skinPlayerName) ||
        Boolean(account.skinUrl && !account.skinUrl.includes('/avatar/'))

      if (hasCustomSkin) {
        let skinBuffer: Buffer | null = null
        if (account.skinUrl?.startsWith('data:image/')) {
          const base64Data = account.skinUrl.replace(/^data:image\/\w+;base64,/, '')
          skinBuffer = Buffer.from(base64Data, 'base64')
        } else if (account.skinPlayerName) {
          const targetName = account.skinPlayerName.trim()
          skinBuffer = await fetchBuffer(`https://minotar.net/skin/${encodeURIComponent(targetName)}`)
        } else if (account.skinUrl && account.skinUrl.startsWith('http')) {
          skinBuffer = await fetchBuffer(account.skinUrl)
        }

        if (skinBuffer && skinBuffer.length > 100) {
          if (!existsSync(cslSkinsDir)) {
            mkdirSync(cslSkinsDir, { recursive: true })
          }
          writeFileSync(cslSkinFile, skinBuffer)
          sendInAppLog(`[AstrixMC SkinSync] Synchronized player skin for: ${account.username}`)
        }
      } else {
        if (existsSync(cslSkinFile)) {
          try {
            unlinkSync(cslSkinFile)
          } catch {}
        }
      }
    }
  } catch (err) {
    sendInAppLog(`[AstrixMC SkinSync] Notice: ${err instanceof Error ? err.message : String(err)}`)
  }
}
