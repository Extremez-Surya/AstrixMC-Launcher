export interface CapeItem {
  id: string
  name: string
  description: string
  category?: 'official' | 'player' | 'custom'
  badge?: string
  textureUrl?: string
  getTexture: () => string
}

/**
 * Creates a standard 64x32 Minecraft cape canvas data URI.
 */
export function createCapeCanvasUri(
  renderBack: (ctx: CanvasRenderingContext2D) => void,
  renderFront?: (ctx: CanvasRenderingContext2D) => void
): string {
  if (typeof document === 'undefined') return ''
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, 64, 32)

  // Render Back Face (12, 1, 10, 16)
  ctx.save()
  ctx.translate(12, 1)
  renderBack(ctx)
  ctx.restore()

  // Render Front Face (1, 1, 10, 16)
  ctx.save()
  ctx.translate(1, 1)
  if (renderFront) {
    renderFront(ctx)
  } else {
    renderBack(ctx)
  }
  ctx.restore()

  // Edge trims
  ctx.fillStyle = ctx.fillStyle || '#111827'
  ctx.fillRect(0, 1, 1, 16)
  ctx.fillRect(11, 1, 1, 16)
  ctx.fillRect(1, 0, 10, 1)
  ctx.fillRect(11, 0, 10, 1)

  return canvas.toDataURL('image/png')
}

/**
 * Known official player capes dictionary for instant lookup
 */
export const KNOWN_PLAYER_CAPES: Record<string, { url: string; name: string; source: string }> = {
  notch: {
    url: 'https://textures.minecraft.net/texture/5786fe99be377dfb6e588c7f217707038b72521f928e14e1f7480a74ea8e759',
    name: "Notch's Classic Mojang Cape",
    source: 'Official Mojang Creator'
  },
  jeb_: {
    url: 'https://textures.minecraft.net/texture/5786fe99be377dfb6e588c7f217707038b72521f928e14e1f7480a74ea8e759',
    name: "Jeb's Mojang Studios Cape",
    source: 'Mojang Studios Team'
  },
  dinnerbone: {
    url: 'https://textures.minecraft.net/texture/5786fe99be377dfb6e588c7f217707038b72521f928e14e1f7480a74ea8e759',
    name: "Dinnerbone's Mojang Cape",
    source: 'Mojang Studios Team'
  }
}

/**
 * Generates an exclusive personalized player cape texture on-the-fly for ANY Minecraft username.
 */
export function generatePersonalizedPlayerCape(username: string): string {
  const clean = (username || 'Player').toUpperCase()
  let hash = 0
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  const colorPrimary = `hsl(${hue}, 80%, 35%)`
  const colorSecondary = `hsl(${hue}, 90%, 55%)`
  const colorAccent = `hsl(${(hue + 45) % 360}, 95%, 70%)`

  return createCapeCanvasUri((ctx) => {
    ctx.fillStyle = colorPrimary
    ctx.fillRect(0, 0, 10, 16)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.fillRect(0, 14, 10, 2)

    ctx.strokeStyle = colorSecondary
    ctx.lineWidth = 1
    ctx.strokeRect(1, 1, 8, 14)

    ctx.fillStyle = colorAccent
    const initial = clean.charAt(0) || 'A'
    if (initial === 'N') {
      ctx.fillRect(3, 5, 1, 6)
      ctx.fillRect(6, 5, 1, 6)
      ctx.fillRect(4, 7, 1, 1)
      ctx.fillRect(5, 8, 1, 1)
    } else if (initial === 'D') {
      ctx.fillRect(3, 5, 3, 6)
      ctx.fillRect(3, 5, 4, 1)
      ctx.fillRect(3, 10, 4, 1)
      ctx.fillRect(6, 6, 1, 4)
      ctx.clearRect(4, 6, 1, 4)
    } else {
      ctx.fillRect(4, 6, 2, 4)
      ctx.fillRect(3, 7, 4, 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(4, 7, 2, 2)
    }
  })
}
