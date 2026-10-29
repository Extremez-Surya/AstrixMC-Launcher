import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { getLauncherRoot, readJSONFile, writeJSONFile } from '../store'

export interface EquippedCosmetics {
  skinPath?: string
  skinModel: 'classic' | 'slim'
  capeId?: string
  capePath?: string
  elytraId?: string
  lastUpdated?: string
}

const DEFAULT_COSMETICS: EquippedCosmetics = {
  skinModel: 'classic',
  capeId: 'cloak-astrix-chroma'
}

export function getCosmeticsDir(): string {
  const dir = join(getLauncherRoot(), 'cosmetics')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

export function getEquippedCosmetics(): EquippedCosmetics {
  return readJSONFile<EquippedCosmetics>('cosmetics', DEFAULT_COSMETICS)
}

export function saveEquippedCosmetics(data: Partial<EquippedCosmetics>): EquippedCosmetics {
  const current = getEquippedCosmetics()
  const updated: EquippedCosmetics = {
    ...current,
    ...data,
    lastUpdated: new Date().toISOString()
  }
  writeJSONFile('cosmetics', updated)
  return updated
}

/**
 * Save an uploaded skin PNG base64 string or buffer into the active skin file.
 */
export function saveUploadedSkin(base64Data: string, model: 'classic' | 'slim'): string {
  const dir = getCosmeticsDir()
  const skinFile = join(dir, 'active-skin.png')
  const cleanBase64 = base64Data.replace(/^data:image\/png;base64,/, '')
  const buffer = Buffer.from(cleanBase64, 'base64')
  writeFileSync(skinFile, buffer)

  saveEquippedCosmetics({
    skinPath: skinFile,
    skinModel: model
  })

  return skinFile
}

/**
 * Generate a standard Minecraft 64x32 cape PNG buffer for the built-in cloaks.
 * Minecraft cape textures are exactly 64x32 pixels (or 64x64 for OptiFine HD capes).
 */
export function getCapeTextureBuffer(capeId: string): Buffer {
  const dir = getCosmeticsDir()
  const customCapeFile = join(dir, `${capeId}.png`)
  if (existsSync(customCapeFile)) {
    return readFileSync(customCapeFile)
  }

  // Generate real procedural 64x32 Minecraft Cape PNG
  return createProceduralCape(capeId)
}

/**
 * Create a real 64x32 PNG for Minecraft capes
 */
function createProceduralCape(capeId: string): Buffer {
  // Simple 64x32 raw RGBA buffer generator
  const width = 64
  const height = 32
  const rawRgba = Buffer.alloc(width * height * 4)

  // Primary color based on cape theme
  let r = 255, g = 49, b = 84 // Default Astrix Red
  if (capeId.includes('glacier')) {
    r = 69; g = 183; b = 255 // Ice Cyan
  } else if (capeId.includes('matrix')) {
    r = 45; g = 226; b = 166 // Matrix Emerald
  } else if (capeId.includes('void')) {
    r = 168; g = 85; b = 247 // Void Purple
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      // Cape front & back faces (top-left 12x18 and 12x18)
      const isPattern = (x + y) % 6 === 0 || (x - y) % 6 === 0
      const shade = Math.sin((x + y * 2) / 4) * 20
      
      rawRgba[idx] = Math.min(255, Math.max(0, r + shade))
      rawRgba[idx + 1] = Math.min(255, Math.max(0, g + shade))
      rawRgba[idx + 2] = Math.min(255, Math.max(0, b + shade))
      rawRgba[idx + 3] = isPattern ? 220 : 255
    }
  }

  return encodePng(width, height, rawRgba)
}

/**
 * Minimal pure-Node PNG encoder for 64x32 textures (no external binary dependency)
 */
function encodePng(width: number, height: number, rgba: Buffer): Buffer {
  // Use zlib deflate
  const zlib = require('zlib')
  const rowBytes = width * 4
  const rawScanlines = Buffer.alloc(height * (1 + rowBytes))

  for (let y = 0; y < height; y++) {
    rawScanlines[y * (1 + rowBytes)] = 0 // Filter type: None
    rgba.copy(rawScanlines, y * (1 + rowBytes) + 1, y * rowBytes, (y + 1) * rowBytes)
  }

  const compressed = zlib.deflateSync(rawScanlines)

  const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR chunk
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr)
  const idatChunk = makeChunk('IDAT', compressed)
  const iendChunk = makeChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk])
}

function makeChunk(type: string, data: Buffer): Buffer {
  const length = data.length
  const chunk = Buffer.alloc(12 + length)
  chunk.writeUInt32BE(length, 0)
  chunk.write(type, 4, 4, 'ascii')
  data.copy(chunk, 8)

  const crc = crc32(chunk.subarray(4, 8 + length))
  chunk.writeUInt32BE(crc, 8 + length)
  return chunk
}

function crc32(buf: Buffer): number {
  let crc = -1
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i]
    for (let j = 0; j < 8; j++) {
      const bit = (crc ^ byte) & 1
      crc >>>= 1
      if (bit) crc ^= 0xedb88320
      byte >>>= 1
    }
  }
  return (crc ^ -1) >>> 0
}

/**
 * Upload skin directly to Mojang servers for official Microsoft accounts.
 */
export async function uploadSkinToMojang(
  accessToken: string,
  skinBuffer: Buffer,
  model: 'classic' | 'slim'
): Promise<{ success: boolean; error?: string }> {
  try {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2)
    const header = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="variant"\r\n\r\n${model}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="skin.png"\r\nContent-Type: image/png\r\n\r\n`
    )
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`)
    const body = Buffer.concat([header, skinBuffer, footer])

    await fetch('https://api.minecraftservices.com/minecraft/profile/skins', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body
    })

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to upload skin to Mojang' }
  }
}
