import { existsSync, mkdirSync, writeFileSync, copyFileSync, unlinkSync, readFileSync } from 'fs'
import { join } from 'path'
import https from 'https'
import http from 'http'
import AdmZip from 'adm-zip'
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
 * Resolves player skin bytes from local data URI, remote texture, player name, or username.
 */
async function resolveAccountSkinBuffer(account: MinecraftAccount): Promise<Buffer | null> {
  // 1. Local Data URI (base64)
  if (account.skinUrl?.startsWith('data:image/')) {
    const base64Data = account.skinUrl.replace(/^data:image\/\w+;base64,/, '')
    return Buffer.from(base64Data, 'base64')
  }

  // 2. Direct HTTP/HTTPS texture url
  if (account.skinUrl && account.skinUrl.startsWith('http') && !account.skinUrl.includes('/avatar/')) {
    try {
      const buf = await fetchBuffer(account.skinUrl)
      if (buf && buf.length > 100) return buf
    } catch {}
  }

  // 3. Custom target player skin
  if (account.skinPlayerName && account.skinPlayerName.trim()) {
    try {
      const buf = await fetchBuffer(`https://minotar.net/skin/${encodeURIComponent(account.skinPlayerName.trim())}`)
      if (buf && buf.length > 100) return buf
    } catch {}
  }

  // 4. Default account username (minotar / mojang)
  if (account.username && account.username.trim()) {
    try {
      const buf = await fetchBuffer(`https://minotar.net/skin/${encodeURIComponent(account.username.trim())}`)
      if (buf && buf.length > 100) return buf
    } catch {}
  }

  return null
}

/**
 * Builds or updates the dynamic native AstrixSkin.zip resourcepack inside the instance.
 * Overwrites all vanilla/default player skin models (Steve, Alex, Sunny, Zuri, etc.)
 * so the player's skin appears reliably offline, online, and even if AuthLib read times out.
 */
function buildAstrixSkinPack(gameDirectory: string, skinBuffer: Buffer): void {
  const rpDir = join(gameDirectory, 'resourcepacks')
  if (!existsSync(rpDir)) {
    mkdirSync(rpDir, { recursive: true })
  }

  const zip = new AdmZip()
  const mcmeta = JSON.stringify(
    {
      pack: {
        pack_format: 48,
        supported_formats: {
          min_inclusive: 1,
          max_inclusive: 99
        },
        description: 'AstrixMC Dynamic Skin Pack'
      }
    },
    null,
    2
  )

  zip.addFile('pack.mcmeta', Buffer.from(mcmeta))

  // Legacy Minecraft versions (1.8 - 1.19)
  zip.addFile('assets/minecraft/textures/entity/steve.png', skinBuffer)
  zip.addFile('assets/minecraft/textures/entity/alex.png', skinBuffer)

  // Modern Minecraft versions (1.20 - 26.x) default models
  const wideSkins = ['steve', 'sunny', 'zuri', 'efe', 'kai', 'makena', 'noor']
  const slimSkins = ['alex', 'ari']

  for (const s of wideSkins) {
    zip.addFile(`assets/minecraft/textures/entity/player/wide/${s}.png`, skinBuffer)
  }
  for (const s of slimSkins) {
    zip.addFile(`assets/minecraft/textures/entity/player/slim/${s}.png`, skinBuffer)
  }

  const outZip = join(rpDir, 'AstrixSkin.zip')
  writeFileSync(outZip, zip.toBuffer())

  // Ensure file/AstrixSkin.zip is active in options.txt
  const optFile = join(gameDirectory, 'options.txt')
  if (existsSync(optFile)) {
    try {
      let optContent = readFileSync(optFile, 'utf-8')
      if (optContent.includes('resourcePacks:[')) {
        if (!optContent.includes('file/AstrixSkin.zip')) {
          optContent = optContent.replace(/resourcePacks:\[(.*?)\]/, (match, inner) => {
            const list = inner
              .split(',')
              .map((s: string) => s.trim().replace(/^"|"$/g, ''))
              .filter(Boolean)
            if (!list.includes('vanilla')) list.unshift('vanilla')
            if (!list.includes('file/AstrixSkin.zip')) list.push('file/AstrixSkin.zip')
            return `resourcePacks:[${list.map((x: string) => `"${x}"`).join(',')}]`
          })
          writeFileSync(optFile, optContent, 'utf-8')
          sendInAppLog('[AstrixMC SkinSync] Enabled AstrixSkin pack in options.txt')
        }
      } else {
        optContent += '\nresourcePacks:["vanilla","file/AstrixSkin.zip"]'
        writeFileSync(optFile, optContent, 'utf-8')
      }
    } catch (e) {
      // ignore
    }
  }
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

    // 1. Resolve skin buffer from account or online texture endpoints
    const skinBuffer = await resolveAccountSkinBuffer(account)

    if (skinBuffer && skinBuffer.length > 100) {
      // 2. Build native AstrixSkin.zip resourcepack for 100% reliable in-game skin display
      buildAstrixSkinPack(gameDirectory, skinBuffer)
      sendInAppLog(`[AstrixMC SkinSync] In-game skin synchronized for: ${account.username}`)
    }

    if (isModded) {
      // 3. Ensure CustomSkinLoader mod is installed in instance mods/ ONLY for compatible MC versions (1.8 - 1.20)
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
            sendInAppLog(`[AstrixMC SkinSync] Cleaned legacy CSL mod for MC ${mcVersion}`)
          } catch {}
        }
      }

      // 4. Ensure CustomSkinLoader configuration is active with full loadlist
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

      // 5. Synchronize local custom skin for CustomSkinLoader
      const cslSkinsDir = join(cslDir, 'LocalSkin', 'skins')
      const cslSkinFile = join(cslSkinsDir, `${account.username}.png`)

      if (skinBuffer && skinBuffer.length > 100) {
        if (!existsSync(cslSkinsDir)) {
          mkdirSync(cslSkinsDir, { recursive: true })
        }
        writeFileSync(cslSkinFile, skinBuffer)
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
