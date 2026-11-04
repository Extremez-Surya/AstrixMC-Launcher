export interface CapeItem {
  id: string
  name: string
  description: string
  category: 'trending' | 'official' | 'anime' | 'pvp' | 'astrix'
  badge?: string
  likes?: number
  isAnimated?: boolean
  generateTexture: () => string // Returns data:image/png;base64,...
}

/**
 * Creates a standard 64x32 Minecraft cape canvas data URI.
 * - Back Face (seen from behind): x: 12, y: 1, w: 10, h: 16
 * - Front Face (facing player back): x: 1, y: 1, w: 10, h: 16
 * - Left/Right Sides: x: 0 and 11, y: 1..16
 * - Top/Bottom: x: 1..10, y: 0 / 17
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

export const WORLDWIDE_CAPES: CapeItem[] = [
  // ── 1. TRENDING & POPULAR ──
  {
    id: 'cape-cyan-diamond',
    name: 'Cyan Diamond Aegis',
    description: 'Vibrant neon cyan drape with an obsidian border and bright white diamond core.',
    category: 'trending',
    badge: 'TOP 1',
    likes: 107119,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#06B6D4'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#0E7490'
        ctx.fillRect(0, 0, 1, 16)
        ctx.fillRect(9, 0, 1, 16)
        ctx.fillRect(0, 15, 10, 1)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(4, 5, 2, 6)
        ctx.fillRect(3, 6, 4, 4)
        ctx.fillRect(2, 7, 6, 2)
        ctx.fillStyle = '#67E8F9'
        ctx.fillRect(4, 7, 2, 2)
      })
  },
  {
    id: 'cape-royal-scarlet',
    name: 'Royal Scarlet Mantle',
    description: 'Deep royal scarlet velvet cloak draped with interlocking golden chains.',
    category: 'trending',
    badge: 'POPULAR',
    likes: 84375,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#DC2626'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#991B1B'
        ctx.fillRect(0, 8, 10, 8)
        ctx.fillStyle = '#7F1D1D'
        ctx.fillRect(0, 13, 10, 3)
        ctx.fillStyle = '#FBBF24'
        ctx.fillRect(1, 2, 2, 2)
        ctx.fillRect(7, 2, 2, 2)
        ctx.fillRect(2, 4, 2, 2)
        ctx.fillRect(6, 4, 2, 2)
        ctx.fillRect(3, 5, 4, 2)
        ctx.fillStyle = '#FDE68A'
        ctx.fillRect(4, 6, 2, 1)
      })
  },
  {
    id: 'cape-void-minimal',
    name: 'Void Shadow Minimal',
    description: 'Pure obsidian pitch-black cloth featuring a stark, high-contrast white minimalist expression.',
    category: 'trending',
    badge: 'POPULAR',
    likes: 78565,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#0B0F19'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#F8FAFC'
        ctx.fillRect(3, 6, 1, 2)
        ctx.fillRect(6, 6, 1, 2)
        ctx.fillRect(3, 10, 4, 1)
        ctx.fillRect(3, 9, 1, 1)
        ctx.fillRect(6, 9, 1, 1)
      })
  },
  {
    id: 'cape-abyssal-dragon',
    name: 'Abyssal Dragon Sigil',
    description: 'Dark void cloth woven with radiant violet dragon wings and a glowing starlight center.',
    category: 'trending',
    badge: 'TRENDING',
    likes: 57553,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#0F172A'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#9333EA'
        ctx.fillRect(1, 4, 2, 5)
        ctx.fillRect(7, 4, 2, 5)
        ctx.fillRect(2, 6, 6, 5)
        ctx.fillStyle = '#C084FC'
        ctx.fillRect(4, 7, 2, 3)
        ctx.fillRect(3, 8, 4, 1)
      })
  },
  {
    id: 'cape-wither-king',
    name: 'Wither King Skull',
    description: 'Charcoal nether-stone weave bearing the fearsome bleached Wither skeleton visage.',
    category: 'trending',
    likes: 51200,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#18181B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#71717A'
        ctx.fillRect(2, 4, 6, 7)
        ctx.fillStyle = '#E4E4E7'
        ctx.fillRect(3, 4, 4, 5)
        ctx.fillStyle = '#18181B'
        ctx.fillRect(3, 6, 1, 2)
        ctx.fillRect(6, 6, 1, 2)
        ctx.fillRect(4, 9, 2, 1)
      })
  },
  {
    id: 'cape-cyber-creeper',
    name: 'Neon Cyber Creeper',
    description: 'Stealth black drape with a blazing electric cyan Creeper face shining from the center.',
    category: 'trending',
    likes: 48930,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#030712'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#06B6D4'
        ctx.fillRect(3, 6, 1, 2)
        ctx.fillRect(6, 6, 1, 2)
        ctx.fillRect(4, 8, 2, 2)
        ctx.fillRect(3, 9, 1, 3)
        ctx.fillRect(6, 9, 1, 3)
      })
  },
  {
    id: 'cape-golden-sunburst',
    name: 'Golden Sunburst Dawn',
    description: 'Blazing golden-orange dawn gradient with an obsidian Creeper face emblazoned in the rays.',
    category: 'trending',
    likes: 62400,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 16)
        grad.addColorStop(0, '#F59E0B')
        grad.addColorStop(0.6, '#D97706')
        grad.addColorStop(1, '#78350F')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#1C1917'
        ctx.fillRect(3, 5, 1, 2)
        ctx.fillRect(6, 5, 1, 2)
        ctx.fillRect(4, 7, 2, 2)
        ctx.fillRect(3, 8, 1, 3)
        ctx.fillRect(6, 8, 1, 3)
      })
  },
  {
    id: 'cape-sakura-blossom',
    name: 'Sakura Blossom Twilight',
    description: 'Delicate pastel pink cherry blossom petals drifting gracefully on twilight silk.',
    category: 'trending',
    badge: 'AESTHETIC',
    likes: 78900,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 16)
        grad.addColorStop(0, '#F472B6')
        grad.addColorStop(0.5, '#BE185D')
        grad.addColorStop(1, '#1C0D17')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#FDF2F8'
        ctx.fillRect(3, 4, 1, 2)
        ctx.fillRect(6, 7, 2, 1)
        ctx.fillRect(4, 10, 1, 2)
        ctx.fillRect(7, 12, 1, 1)
      })
  },

  // ── 2. OFFICIAL & MINECON ──
  {
    id: 'minecon-2011',
    name: 'Minecon 2011 Creeper',
    description: 'The iconic scarlet red cape featuring the golden Creeper face from the first Minecon.',
    category: 'official',
    badge: 'MINECON',
    likes: 98200,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#881337'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#FBBF24'
        ctx.fillRect(3, 4, 1, 2)
        ctx.fillRect(6, 4, 1, 2)
        ctx.fillRect(4, 6, 2, 2)
        ctx.fillRect(3, 7, 1, 3)
        ctx.fillRect(6, 7, 1, 3)
      })
  },
  {
    id: 'minecon-2012',
    name: 'Minecon 2012 Pickaxe',
    description: 'Dark midnight navy blue backdrop with the golden pickaxe tool emblem.',
    category: 'official',
    badge: 'MINECON',
    likes: 87400,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#0F172A'
        ctx.fillRect(0, 0, 10, 16)
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
    id: 'minecon-2013',
    name: 'Minecon 2013 Piston',
    description: 'Rich forest green cape featuring the iconic Minecraft mechanical piston face.',
    category: 'official',
    badge: 'MINECON',
    likes: 76300,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#14532D'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#92400E'
        ctx.fillRect(3, 4, 4, 2)
        ctx.fillStyle = '#71717A'
        ctx.fillRect(4, 6, 2, 4)
        ctx.fillRect(3, 10, 4, 2)
      })
  },
  {
    id: 'minecon-2015',
    name: 'Minecon 2015 Iron Golem',
    description: 'Charcoal weave with a turquoise trim and glowing Iron Ingot signet.',
    category: 'official',
    badge: 'MINECON',
    likes: 71900,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#1E293B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#06B6D4'
        ctx.fillRect(0, 0, 1, 16)
        ctx.fillRect(9, 0, 1, 16)
        ctx.fillStyle = '#E2E8F0'
        ctx.fillRect(3, 6, 4, 3)
        ctx.fillStyle = '#CBD5E1'
        ctx.fillRect(2, 7, 6, 1)
      })
  },
  {
    id: 'minecon-2016',
    name: 'Minecon 2016 Enderman',
    description: 'Deep end-dimension obsidian with the glowing magenta-purple eyes of the Enderman.',
    category: 'official',
    badge: 'MINECON',
    likes: 85000,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#090514'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#CC55FF'
        ctx.fillRect(2, 7, 2, 1)
        ctx.fillRect(6, 7, 2, 1)
        ctx.fillStyle = '#EEAAFF'
        ctx.fillRect(3, 7, 1, 1)
        ctx.fillRect(6, 7, 1, 1)
      })
  },
  {
    id: 'mojang-migrator',
    name: 'Mojang Migrator Cape',
    description: 'Deep ruby red cape with rich gold filigree borders awarded to original Mojang accounts.',
    category: 'official',
    badge: 'OFFICIAL',
    likes: 91400,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#450A0A'
        ctx.fillRect(0, 0, 10, 16)
        ctx.strokeStyle = '#D97706'
        ctx.lineWidth = 1
        ctx.strokeRect(1, 1, 8, 14)
        ctx.fillStyle = '#F59E0B'
        ctx.fillRect(4, 5, 2, 4)
        ctx.fillRect(3, 7, 4, 1)
      })
  },
  {
    id: 'anniversary-15th',
    name: '15th Anniversary Creeper',
    description: 'Official emerald pixel green cape celebrating 15 legendary years of Minecraft.',
    category: 'official',
    badge: '15TH ANNIVERSARY',
    likes: 115000,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#15803D'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#052E16'
        ctx.fillRect(3, 5, 1, 2)
        ctx.fillRect(6, 5, 1, 2)
        ctx.fillRect(4, 7, 2, 2)
        ctx.fillRect(3, 8, 1, 3)
        ctx.fillRect(6, 8, 1, 3)
      })
  },
  {
    id: 'optifine-crimson',
    name: 'Classic Crimson OF',
    description: 'The legendary red banner cape with the crisp white "OF" insignia known across Minecraft history.',
    category: 'official',
    badge: 'LEGENDARY',
    likes: 120500,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#B91C1C'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(2, 5, 2, 5)
        ctx.fillRect(3, 5, 2, 1)
        ctx.fillRect(3, 9, 2, 1)
        ctx.fillRect(4, 5, 1, 5)
        ctx.clearRect(3, 6, 1, 3)
        ctx.fillRect(6, 5, 1, 5)
        ctx.fillRect(6, 5, 3, 1)
        ctx.fillRect(6, 7, 2, 1)
      })
  },

  // ── 3. ANIME & GAMING ──
  {
    id: 'anime-akatsuki-cloud',
    name: 'Akatsuki Crimson Cloud',
    description: 'Pitch black stealth mantle bearing the iconic red cloud with white borders from Naruto.',
    category: 'anime',
    badge: 'ANIME',
    likes: 81400,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#09090B'
        ctx.fillRect(0, 0, 10, 16)
        // Red cloud with white border
        ctx.fillStyle = '#EF4444'
        ctx.fillRect(3, 6, 4, 4)
        ctx.fillRect(2, 7, 6, 2)
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 1
        ctx.strokeRect(2, 6, 6, 4)
      })
  },
  {
    id: 'anime-wings-freedom',
    name: 'Wings of Freedom',
    description: 'Scout Regiment dark olive green cape with the blue & white overlapping wings emblem from Attack on Titan.',
    category: 'anime',
    badge: 'ANIME',
    likes: 74200,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#14532D'
        ctx.fillRect(0, 0, 10, 16)
        // Wings: blue and white
        ctx.fillStyle = '#3B82F6'
        ctx.fillRect(3, 5, 2, 6)
        ctx.fillRect(2, 6, 2, 4)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(5, 5, 2, 6)
        ctx.fillRect(6, 6, 2, 4)
      })
  },
  {
    id: 'anime-pokeball-trainer',
    name: 'Master Trainer Pokéball',
    description: 'Vibrant scarlet top and snowy white bottom split by the central black band and trigger button.',
    category: 'anime',
    badge: 'GAMING',
    likes: 68100,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#DC2626'
        ctx.fillRect(0, 0, 10, 8)
        ctx.fillStyle = '#F8FAFC'
        ctx.fillRect(0, 8, 10, 8)
        ctx.fillStyle = '#0F172A'
        ctx.fillRect(0, 7, 10, 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(4, 6, 2, 4)
        ctx.fillStyle = '#0F172A'
        ctx.fillRect(4, 7, 2, 2)
      })
  },
  {
    id: 'gaming-zelda-triforce',
    name: 'Golden Triforce of Hyrule',
    description: 'Forest green Hylian tunic fabric illuminated with the radiant golden triple triangles of power, wisdom, and courage.',
    category: 'anime',
    badge: 'GAMING',
    likes: 63900,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#064E3B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#FBBF24'
        // Top triangle
        ctx.fillRect(4, 5, 2, 2)
        // Bottom triangles
        ctx.fillRect(2, 8, 2, 2)
        ctx.fillRect(6, 8, 2, 2)
        ctx.fillRect(3, 7, 4, 1)
      })
  },
  {
    id: 'gaming-cyberpunk-edge',
    name: 'Cyberpunk Neon Matrix',
    description: 'Terminal midnight silk streaming falling lime matrix code and electric violet circuits.',
    category: 'anime',
    badge: 'CYBER',
    likes: 59300,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#022C22'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#22C55E'
        ctx.fillRect(2, 2, 1, 2)
        ctx.fillRect(4, 1, 1, 3)
        ctx.fillRect(7, 3, 1, 3)
        ctx.fillRect(3, 7, 1, 4)
        ctx.fillRect(6, 8, 1, 3)
        ctx.fillRect(8, 6, 1, 4)
      })
  },

  // ── 4. PVP & NEON ──
  {
    id: 'pvp-tokyo-kanji',
    name: 'Tokyo Violet Kanji',
    description: 'Deep royal purple silk stamped with neon violet mystical Japanese calligraphy.',
    category: 'pvp',
    badge: 'PVP',
    likes: 45100,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#1E1B4B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#A855F7'
        ctx.fillRect(2, 4, 6, 1)
        ctx.fillRect(4, 4, 2, 8)
        ctx.fillRect(2, 7, 6, 1)
        ctx.fillRect(2, 10, 2, 2)
        ctx.fillRect(6, 10, 2, 2)
      })
  },
  {
    id: 'pvp-crimson-mecha',
    name: 'Crimson Mecha Plating',
    description: 'High-tech robotic feather wing plates illuminated with incandescent scarlet thruster energy.',
    category: 'pvp',
    badge: 'PVP',
    likes: 42600,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#0F0F14'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#EF4444'
        ctx.fillRect(1, 3, 2, 8)
        ctx.fillRect(7, 3, 2, 8)
        ctx.fillRect(3, 6, 1, 6)
        ctx.fillRect(6, 6, 1, 6)
        ctx.fillStyle = '#F87171'
        ctx.fillRect(2, 5, 1, 5)
        ctx.fillRect(7, 5, 1, 5)
      })
  },
  {
    id: 'pvp-arctic-direwolf',
    name: 'White Arctic Direwolf',
    description: 'Snow-white arctic wolf silhouette on crisp polar blizzard fabric.',
    category: 'pvp',
    badge: 'PVP',
    likes: 67300,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#F8FAFC'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#475569'
        ctx.fillRect(3, 4, 4, 5)
        ctx.fillRect(2, 6, 5, 4)
        ctx.fillRect(5, 8, 3, 2)
        ctx.fillStyle = '#0F172A'
        ctx.fillRect(4, 6, 1, 1)
      })
  },
  {
    id: 'pvp-cobalt-blue-of',
    name: 'Cobalt Blue OF Banner',
    description: 'Deep cobalt electric sapphire edition of the iconic OptiFine banner.',
    category: 'pvp',
    badge: 'PVP',
    likes: 64700,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#1D4ED8'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(2, 5, 2, 5)
        ctx.fillRect(3, 5, 2, 1)
        ctx.fillRect(3, 9, 2, 1)
        ctx.fillRect(4, 5, 1, 5)
        ctx.clearRect(3, 6, 1, 3)
        ctx.fillRect(6, 5, 1, 5)
        ctx.fillRect(6, 5, 3, 1)
        ctx.fillRect(6, 7, 2, 1)
      })
  },
  {
    id: 'pvp-emerald-vault',
    name: 'Emerald Vault Guardian',
    description: 'Deep jewel emerald drape with a shining crystalline gem center.',
    category: 'pvp',
    likes: 58200,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#064E3B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#10B981'
        ctx.fillRect(3, 6, 4, 4)
        ctx.fillStyle = '#6EE7B7'
        ctx.fillRect(4, 7, 2, 2)
      })
  },

  // ── 5. ASTRIX EXCLUSIVE SIGNATURE ──
  {
    id: 'astrix-void-nebula',
    name: 'Astrix Void Nebula',
    description: 'Deep cosmic obsidian fabric infused with glowing violet starlight and the golden Astrix crest.',
    category: 'astrix',
    badge: 'SIGNATURE',
    isAnimated: true,
    likes: 99999,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 16)
        grad.addColorStop(0, '#3B0764')
        grad.addColorStop(0.5, '#1E1B4B')
        grad.addColorStop(1, '#020617')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#C084FC'
        ctx.fillRect(2, 3, 1, 1)
        ctx.fillRect(7, 4, 1, 1)
        ctx.fillRect(3, 11, 1, 1)
        ctx.fillRect(8, 13, 1, 1)
        ctx.fillStyle = '#FBBF24'
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
    badge: 'SIGNATURE',
    isAnimated: true,
    likes: 95400,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 16)
        grad.addColorStop(0, '#7C2D12')
        grad.addColorStop(0.4, '#C2410C')
        grad.addColorStop(1, '#180B05')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 10, 16)
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
    id: 'astrix-astral-core',
    name: 'Astrix Astral Core',
    description: 'Sleek dark cyan obsidian cloak radiating with dual concentric quantum particle rings.',
    category: 'astrix',
    badge: 'SIGNATURE',
    likes: 89100,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#082F49'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#0369A1'
        ctx.fillRect(1, 1, 8, 14)
        ctx.fillStyle = '#38BDF8'
        ctx.fillRect(4, 6, 2, 4)
        ctx.fillRect(3, 7, 4, 2)
        ctx.fillStyle = '#F0F9FF'
        ctx.fillRect(4, 7, 2, 2)
      })
  },
  {
    id: 'astrix-solar-eclipse',
    name: 'Astrix Solar Eclipse',
    description: 'Golden corona crown glowing around a supermassive obsidian eclipse silhouette.',
    category: 'astrix',
    badge: 'SPECIAL',
    likes: 83200,
    generateTexture: () =>
      createCapeDataUri((ctx) => {
        ctx.fillStyle = '#030712'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#F59E0B'
        ctx.fillRect(3, 5, 4, 6)
        ctx.fillRect(2, 6, 6, 4)
        ctx.fillStyle = '#030712'
        ctx.fillRect(3, 6, 4, 4)
      })
  }
]

/**
 * Generates an exclusive personalized player cape texture on-the-fly for ANY Minecraft username.
 * Guaranteed to return an authentic, beautiful Minecraft 64x32 cape canvas data URI.
 */
export function generatePersonalizedPlayerCape(username: string): string {
  const clean = (username || 'Player').toUpperCase()
  // Generate consistent pseudo-random hue from name
  let hash = 0
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  const colorPrimary = `hsl(${hue}, 80%, 35%)`
  const colorSecondary = `hsl(${hue}, 90%, 55%)`
  const colorAccent = `hsl(${(hue + 45) % 360}, 95%, 70%)`

  return createCapeDataUri((ctx) => {
    // Cape background
    ctx.fillStyle = colorPrimary
    ctx.fillRect(0, 0, 10, 16)
    // Dark bottom trim
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.fillRect(0, 14, 10, 2)

    // Inner regal frame
    ctx.strokeStyle = colorSecondary
    ctx.lineWidth = 1
    ctx.strokeRect(1, 1, 8, 14)

    // Player Initial
    ctx.fillStyle = colorAccent
    const initial = clean.charAt(0) || 'A'
    if (initial === 'N') {
      // Notch / N signet
      ctx.fillRect(3, 5, 1, 6)
      ctx.fillRect(6, 5, 1, 6)
      ctx.fillRect(4, 7, 1, 1)
      ctx.fillRect(5, 8, 1, 1)
    } else if (initial === 'D') {
      // D / Dream signet
      ctx.fillRect(3, 5, 3, 6)
      ctx.fillRect(3, 5, 4, 1)
      ctx.fillRect(3, 10, 4, 1)
      ctx.fillRect(6, 6, 1, 4)
      ctx.clearRect(4, 6, 1, 4)
    } else {
      // Crest star
      ctx.fillRect(4, 6, 2, 4)
      ctx.fillRect(3, 7, 4, 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(4, 7, 2, 2)
    }
  })
}
