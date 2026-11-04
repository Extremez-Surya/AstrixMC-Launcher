export interface CapeItem {
  id: string
  name: string
  description: string
  category: 'astrix' | 'official' | 'community' | 'animated'
  badge?: string
  gradient: string
  isAnimated?: boolean
  generateTexture: () => string // Returns data:image/png;base64,...
}

/**
 * Creates a standard 64x32 Minecraft cape canvas data URI.
 * In 64x32 cape textures:
 * - Back Face (seen from behind): x: 12, y: 1, w: 10, h: 16
 * - Front Face (facing back of player): x: 1, y: 1, w: 10, h: 16
 * - Top / Bottom: x: 1..10, y: 0
 */
function createCapeDataUri(
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

  // Default transparent base
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

  // Edges (fill with matching tone)
  ctx.fillStyle = ctx.fillStyle || '#111827'
  ctx.fillRect(0, 1, 1, 16)
  ctx.fillRect(11, 1, 1, 16)
  ctx.fillRect(1, 0, 10, 1)
  ctx.fillRect(11, 0, 10, 1)

  return canvas.toDataURL('image/png')
}

export const CURATED_CAPES: CapeItem[] = [
  {
    id: 'astrix-void-nebula',
    name: 'Astrix Void Nebula',
    description: 'Deep cosmic obsidian fabric infused with glowing violet starlight and the golden Astrix crest.',
    category: 'astrix',
    badge: 'SIGNATURE',
    gradient: 'from-purple-900 via-indigo-950 to-black',
    isAnimated: true,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, 16)
        grad.addColorStop(0, '#3B0764')
        grad.addColorStop(0.5, '#1E1B4B')
        grad.addColorStop(1, '#020617')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 10, 16)

        // Cosmic Nebula Stars
        ctx.fillStyle = '#C084FC'
        ctx.fillRect(2, 3, 1, 1)
        ctx.fillRect(7, 4, 1, 1)
        ctx.fillRect(3, 11, 1, 1)
        ctx.fillRect(8, 13, 1, 1)

        ctx.fillStyle = '#FBBF24'
        // Astrix Golden Star Crest in Center
        ctx.fillRect(4, 7, 2, 2)
        ctx.fillRect(5, 6, 1, 1)
        ctx.fillRect(5, 9, 1, 1)
        ctx.fillRect(3, 7, 1, 1)
        ctx.fillRect(7, 7, 1, 1)
      })
  },
  {
    id: 'astrix-cyber-phoenix',
    name: 'Astrix Cyber Phoenix',
    description: 'Molten ember wings with radiant neon orange and gold aerodynamic feather strands.',
    category: 'astrix',
    badge: 'NEW',
    gradient: 'from-amber-600 via-orange-900 to-black',
    isAnimated: true,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 16)
        grad.addColorStop(0, '#7C2D12')
        grad.addColorStop(0.4, '#C2410C')
        grad.addColorStop(1, '#180B05')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 10, 16)

        // Phoenix Flame Crest
        ctx.fillStyle = '#FDE047'
        ctx.fillRect(4, 4, 2, 4)
        ctx.fillRect(3, 6, 1, 3)
        ctx.fillRect(6, 6, 1, 3)
        ctx.fillRect(2, 9, 1, 3)
        ctx.fillRect(7, 9, 1, 3)
        ctx.fillStyle = '#EF4444'
        ctx.fillRect(4, 9, 2, 3)
      })
  },
  {
    id: 'optifine-classic',
    name: 'Classic OptiFine OF',
    description: 'The legendary red banner cape with the crisp white "OF" insignia known across Minecraft history.',
    category: 'community',
    badge: 'LEGENDARY',
    gradient: 'from-rose-700 via-red-900 to-black',
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#B91C1C'
        ctx.fillRect(0, 0, 10, 16)

        // White "O"
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(2, 5, 2, 5)
        ctx.fillRect(3, 5, 2, 1)
        ctx.fillRect(3, 9, 2, 1)
        ctx.fillRect(4, 5, 1, 5)
        ctx.clearRect(3, 6, 1, 3)

        // White "F"
        ctx.fillRect(6, 5, 1, 5)
        ctx.fillRect(6, 5, 3, 1)
        ctx.fillRect(6, 7, 2, 1)
      })
  },
  {
    id: 'minecon-2011-creeper',
    name: 'Minecon 2011 Creeper',
    description: 'The iconic scarlet red cape featuring the golden Creeper face from the first Minecon.',
    category: 'official',
    badge: 'MINECON',
    gradient: 'from-red-800 via-red-950 to-black',
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#881337'
        ctx.fillRect(0, 0, 10, 16)

        // Creeper Face in Gold
        ctx.fillStyle = '#FBBF24'
        ctx.fillRect(3, 4, 1, 2)
        ctx.fillRect(6, 4, 1, 2)
        ctx.fillRect(4, 6, 2, 2)
        ctx.fillRect(3, 7, 1, 3)
        ctx.fillRect(6, 7, 1, 3)
      })
  },
  {
    id: 'minecon-2012-pickaxe',
    name: 'Minecon 2012 Pickaxe',
    description: 'Dark midnight navy blue backdrop with the golden pickaxe tool emblem.',
    category: 'official',
    badge: 'MINECON',
    gradient: 'from-blue-900 via-slate-950 to-black',
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#0F172A'
        ctx.fillRect(0, 0, 10, 16)

        // Golden Pickaxe
        ctx.fillStyle = '#F59E0B'
        ctx.fillRect(3, 3, 4, 1)
        ctx.fillRect(2, 4, 1, 2)
        ctx.fillRect(7, 4, 1, 2)
        ctx.fillStyle = '#78350F'
        ctx.fillRect(4, 5, 1, 5)
        ctx.fillRect(5, 6, 1, 4)
      })
  },
  {
    id: 'cherry-blossom-sakura',
    name: 'Sakura Blossom',
    description: 'Delicate pastel pink cherry blossom petals drifting gracefully on twilight silk.',
    category: 'community',
    gradient: 'from-pink-800 via-rose-950 to-black',
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 16)
        grad.addColorStop(0, '#F472B6')
        grad.addColorStop(0.5, '#BE185D')
        grad.addColorStop(1, '#1C0D17')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 10, 16)

        // Floating petals
        ctx.fillStyle = '#FDF2F8'
        ctx.fillRect(3, 4, 1, 2)
        ctx.fillRect(6, 7, 2, 1)
        ctx.fillRect(4, 10, 1, 2)
        ctx.fillRect(7, 12, 1, 1)
      })
  },
  {
    id: 'mojang-migrator',
    name: 'Mojang Migrator',
    description: 'Deep ruby red cape with rich gold filigree borders awarded to original Mojang accounts.',
    category: 'official',
    gradient: 'from-amber-700 via-red-950 to-black',
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#450A0A'
        ctx.fillRect(0, 0, 10, 16)

        // Golden Border
        ctx.strokeStyle = '#D97706'
        ctx.lineWidth = 1
        ctx.strokeRect(1, 1, 8, 14)

        // Central Migration Signet
        ctx.fillStyle = '#F59E0B'
        ctx.fillRect(4, 5, 2, 4)
        ctx.fillRect(3, 7, 4, 1)
      })
  }
]

