export interface CapeItem {
  id: string
  name: string
  description: string
  category: 'animated' | 'official' | 'trending' | 'community'
  badge?: string
  likes?: number
  isAnimated?: boolean
  frameCount?: number
  textureUrl?: string // Direct official Mojang CDN or external PNG
  getTexture: (frame?: number) => string
}

/**
 * Creates a standard 64x32 Minecraft cape canvas data URI.
 */
function createCapeCanvasUri(
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
  // ── 1. ANIMATED CAPES (Real Dynamic Multi-Frame Animation) ──
  {
    id: 'anim-infernal-magma',
    name: 'Infernal Magma Flow',
    description: 'Animated flowing molten nether lava cascading continuously down the cloak fabric.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 112400,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        // Lava stone dark background
        ctx.fillStyle = '#450A0A'
        ctx.fillRect(0, 0, 10, 16)

        // Flowing Lava streams shifting with frame
        const offset = frame % 8
        ctx.fillStyle = '#EA580C'
        for (let y = 0; y < 16; y++) {
          const x = (Math.sin((y + offset) * 0.8) * 2 + 5) | 0
          ctx.fillRect(Math.max(1, x - 1), y, 3, 1)
        }

        ctx.fillStyle = '#FBBF24'
        for (let y = 0; y < 16; y++) {
          const x = (Math.sin((y + offset) * 0.8) * 2 + 5) | 0
          ctx.fillRect(x, y, 1, 1)
        }

        // Bubbling embers
        ctx.fillStyle = '#FEF08A'
        ctx.fillRect((offset * 2) % 8 + 1, (offset * 3) % 14 + 1, 1, 1)
        ctx.fillRect(((offset + 4) * 3) % 8 + 1, ((offset + 3) * 2) % 14 + 1, 1, 1)
      })
  },
  {
    id: 'anim-matrix-digital',
    name: 'Matrix Digital Rain',
    description: 'Animated cyberpunk terminal streaming falling lime neon matrix binary raindrops.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 98400,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#022C22'
        ctx.fillRect(0, 0, 10, 16)

        const offset = frame % 8
        ctx.fillStyle = '#22C55E'
        const cols = [2, 4, 6, 8]
        cols.forEach((col, idx) => {
          const dropY = (offset * 2 + idx * 4) % 16
          ctx.fillRect(col, dropY, 1, 3)
          ctx.fillStyle = '#BBF7D0'
          ctx.fillRect(col, (dropY + 2) % 16, 1, 1)
          ctx.fillStyle = '#22C55E'
        })
      })
  },
  {
    id: 'anim-astrix-phoenix',
    name: 'Astrix Cyber Phoenix',
    description: 'Animated aerodynamic ember wings with pulsing neon orange aerodynamic feather strands.',
    category: 'animated',
    badge: 'ASTRIX ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 125000,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        const offset = frame % 8
        const grad = ctx.createLinearGradient(0, 0, 0, 16)
        grad.addColorStop(0, '#7C2D12')
        grad.addColorStop(0.5, '#C2410C')
        grad.addColorStop(1, '#180B05')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 10, 16)

        // Pulsing Flame Crest
        const flameHeight = 4 + (offset % 4)
        ctx.fillStyle = '#FDE047'
        ctx.fillRect(4, 8 - (flameHeight / 2) | 0, 2, flameHeight)
        ctx.fillStyle = '#EF4444'
        ctx.fillRect(3, 7 - (flameHeight / 3) | 0, 4, flameHeight)
        ctx.fillStyle = '#FBBF24'
        ctx.fillRect(2, 6, 1, 4 + (offset % 3))
        ctx.fillRect(7, 6, 1, 4 + (offset % 3))
      })
  },
  {
    id: 'anim-void-starlight',
    name: 'Astrix Void Starlight',
    description: 'Animated cosmic obsidian velvet infused with twinkling violet and golden starlight.',
    category: 'animated',
    badge: 'ASTRIX ANIMATED',
    isAnimated: true,
    frameCount: 6,
    likes: 119000,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 16)
        grad.addColorStop(0, '#3B0764')
        grad.addColorStop(0.5, '#1E1B4B')
        grad.addColorStop(1, '#020617')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 10, 16)

        // Twinkling stars changing positions per frame
        const f = frame % 6
        ctx.fillStyle = f % 2 === 0 ? '#FDE047' : '#FBBF24'
        ctx.fillRect(4, 7, 2, 2)
        ctx.fillRect(5, 6, 1, 1)
        ctx.fillRect(5, 9, 1, 1)
        ctx.fillRect(3, 7, 1, 1)
        ctx.fillRect(7, 7, 1, 1)

        ctx.fillStyle = '#C084FC'
        ctx.fillRect((f * 3) % 9 + 1, (f * 4) % 15 + 1, 1, 1)
        ctx.fillRect(((f + 3) * 2) % 9 + 1, ((f + 2) * 5) % 15 + 1, 1, 1)
      })
  },
  {
    id: 'anim-electric-lightning',
    name: 'Electric Arc Lightning',
    description: 'Animated deep cyan thunderstorm fabric flashing with crackling electric blue lightning arcs.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 6,
    likes: 88500,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#082F49'
        ctx.fillRect(0, 0, 10, 16)

        const f = frame % 6
        ctx.fillStyle = '#38BDF8'
        if (f % 2 === 0) {
          ctx.fillRect(5, 2, 1, 4)
          ctx.fillRect(4, 5, 2, 1)
          ctx.fillRect(4, 6, 1, 4)
          ctx.fillRect(3, 9, 2, 1)
          ctx.fillRect(3, 10, 1, 4)
        } else {
          ctx.fillRect(4, 3, 1, 3)
          ctx.fillRect(5, 5, 2, 1)
          ctx.fillRect(6, 6, 1, 4)
          ctx.fillRect(5, 9, 2, 1)
          ctx.fillRect(5, 10, 1, 4)
        }
        ctx.fillStyle = '#F0F9FF'
        ctx.fillRect(4, 7, 2, 2)
      })
  },
  {
    id: 'anim-prism-rainbow',
    name: 'Prism Cyber Spectrum',
    description: 'Animated radiant RGB spectrum shifting and cycling through chromatic hues in real-time.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 12,
    likes: 93200,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        const hue = ((frame % 12) * 30) % 360
        ctx.fillStyle = `hsl(${hue}, 80%, 25%)`
        ctx.fillRect(0, 0, 10, 16)

        ctx.fillStyle = `hsl(${(hue + 45) % 360}, 90%, 55%)`
        ctx.fillRect(2, 4, 6, 8)

        ctx.fillStyle = `hsl(${(hue + 90) % 360}, 95%, 75%)`
        ctx.fillRect(4, 6, 2, 4)
        ctx.fillRect(3, 7, 4, 2)
      })
  },

  // ── 2. ACTUAL OFFICIAL MOJANG MINECRAFT CAPES (Direct CDN Textures) ──
  {
    id: 'official-minecon-2011',
    name: 'Minecon 2011 Red Creeper',
    description: 'The legendary red cape with the golden Creeper face from the first Minecon in Las Vegas.',
    category: 'official',
    badge: 'OFFICIAL MOJANG',
    likes: 184000,
    textureUrl: 'https://textures.minecraft.net/texture/953cac8b779fe41383e675ee2b86071a71658f2180f56fbce8aa315ea70e2ed6',
    getTexture: () => 'https://textures.minecraft.net/texture/953cac8b779fe41383e675ee2b86071a71658f2180f56fbce8aa315ea70e2ed6'
  },
  {
    id: 'official-minecon-2012',
    name: 'Minecon 2012 Dark Blue Pickaxe',
    description: 'Authentic Minecon 2012 Paris cape featuring the iconic golden pickaxe on midnight navy.',
    category: 'official',
    badge: 'OFFICIAL MOJANG',
    likes: 162000,
    textureUrl: 'https://textures.minecraft.net/texture/a2e8d97ec79100e90a75d369d1b3ba81273c4f82bc1b737e934eed4a854be1b6',
    getTexture: () => 'https://textures.minecraft.net/texture/a2e8d97ec79100e90a75d369d1b3ba81273c4f82bc1b737e934eed4a854be1b6'
  },
  {
    id: 'official-minecon-2013',
    name: 'Minecon 2013 Green Piston',
    description: 'Authentic Minecon 2013 Orlando forest green cape with the golden mechanical piston signet.',
    category: 'official',
    badge: 'OFFICIAL MOJANG',
    likes: 149000,
    textureUrl: 'https://textures.minecraft.net/texture/153b1a0dfcbae953cdeb6f2c2bf6bf79943239b1372780da44bcbb29273131da',
    getTexture: () => 'https://textures.minecraft.net/texture/153b1a0dfcbae953cdeb6f2c2bf6bf79943239b1372780da44bcbb29273131da'
  },
  {
    id: 'official-minecon-2015',
    name: 'Minecon 2015 Iron Golem',
    description: 'Authentic Minecon 2015 London dark charcoal cape with cyan edge and iron ingot.',
    category: 'official',
    badge: 'OFFICIAL MOJANG',
    likes: 138000,
    textureUrl: 'https://textures.minecraft.net/texture/b0cc08840700447322d953a02b965f1d65a13a603bf64b17c803c21446fe1635',
    getTexture: () => 'https://textures.minecraft.net/texture/b0cc08840700447322d953a02b965f1d65a13a603bf64b17c803c21446fe1635'
  },
  {
    id: 'official-minecon-2016',
    name: 'Minecon 2016 Enderman',
    description: 'Authentic Minecon 2016 Anaheim end-dimension obsidian with magenta glowing eyes.',
    category: 'official',
    badge: 'OFFICIAL MOJANG',
    likes: 175000,
    textureUrl: 'https://textures.minecraft.net/texture/e7dfea16dc83c97df01a12fabbd1216359c0cd0ea42f9999b6e97c584963e980',
    getTexture: () => 'https://textures.minecraft.net/texture/e7dfea16dc83c97df01a12fabbd1216359c0cd0ea42f9999b6e97c584963e980'
  },
  {
    id: 'official-mojang-migrator',
    name: 'Official Mojang Migrator',
    description: 'Real Mojang migration cape awarded for migrating from legacy Mojang to Microsoft accounts.',
    category: 'official',
    badge: 'OFFICIAL MOJANG',
    likes: 154000,
    textureUrl: 'https://textures.minecraft.net/texture/2340c0e03dd24a11b15a8b33c2a7e9e32abb2051b2481d0ba7defd635ca7a933',
    getTexture: () => 'https://textures.minecraft.net/texture/2340c0e03dd24a11b15a8b33c2a7e9e32abb2051b2481d0ba7defd635ca7a933'
  },
  {
    id: 'official-cherry-blossom',
    name: 'Official Cherry Blossom',
    description: 'Official Mob Vote 2023 celebratory cape featuring delicate pastel pink sakura blossom petals.',
    category: 'official',
    badge: 'OFFICIAL MOJANG',
    likes: 168000,
    textureUrl: 'https://textures.minecraft.net/texture/afd553b39358a24edfe3b8a9a939fa5fa4faa4d9a9c3d6af8eafb377fa05c2bb',
    getTexture: () => 'https://textures.minecraft.net/texture/afd553b39358a24edfe3b8a9a939fa5fa4faa4d9a9c3d6af8eafb377fa05c2bb'
  },
  {
    id: 'official-15th-anniversary',
    name: '15th Anniversary Creeper',
    description: 'Real official 15-year Minecraft birthday cape with the emerald green pixel creeper face.',
    category: 'official',
    badge: 'OFFICIAL MOJANG',
    likes: 191000,
    textureUrl: 'https://textures.minecraft.net/texture/cd9d82ab17fd92022dbd4a86cde4c382a7540e117fae7b9a2853658505a80625',
    getTexture: () => 'https://textures.minecraft.net/texture/cd9d82ab17fd92022dbd4a86cde4c382a7540e117fae7b9a2853658505a80625'
  },
  {
    id: 'official-vanilla-cape',
    name: 'Official Vanilla Cape',
    description: 'Official cape rewarded to players who owned both Java and Bedrock Edition before the PC bundle.',
    category: 'official',
    badge: 'OFFICIAL MOJANG',
    likes: 147000,
    textureUrl: 'https://textures.minecraft.net/texture/f9a76537647989f9a0b6d001e320dac591c359e9e61a31f4ce11c88f207f0ad4',
    getTexture: () => 'https://textures.minecraft.net/texture/f9a76537647989f9a0b6d001e320dac591c359e9e61a31f4ce11c88f207f0ad4'
  },
  {
    id: 'official-twitch-purple-heart',
    name: 'Official Twitch Heart Cape',
    description: 'Official Twitch 15th anniversary promotional cape featuring the pixelated purple Twitch heart.',
    category: 'official',
    badge: 'OFFICIAL EVENT',
    likes: 159000,
    textureUrl: 'https://textures.minecraft.net/texture/cb40a92e32b57fd732a00fc325e7afb00a7ca74936ad50d8e860152e482cfbde',
    getTexture: () => 'https://textures.minecraft.net/texture/cb40a92e32b57fd732a00fc325e7afb00a7ca74936ad50d8e860152e482cfbde'
  },
  {
    id: 'official-tiktok-cape',
    name: 'Official TikTok Cape',
    description: 'Official TikTok promotion cape with custom cyan and magenta glitch badge.',
    category: 'official',
    badge: 'OFFICIAL EVENT',
    likes: 142000,
    textureUrl: 'https://textures.minecraft.net/texture/569b7f2a1d00d26f30efe3f9ab9ac817b1e6d35f4f3cfb0324ef2d328223d350',
    getTexture: () => 'https://textures.minecraft.net/texture/569b7f2a1d00d26f30efe3f9ab9ac817b1e6d35f4f3cfb0324ef2d328223d350'
  },

  // ── 3. TRENDING COMMUNITY & PVP FAVORITES ──
  {
    id: 'trend-optifine-crimson',
    name: 'Classic OptiFine OF Red',
    description: 'The legendary red banner cape with the crisp white "OF" insignia known across Minecraft history.',
    category: 'trending',
    badge: 'ALL-TIME LEGEND',
    likes: 215000,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
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
  {
    id: 'trend-cyan-diamond',
    name: 'Cyan Diamond Aegis',
    description: 'Vibrant neon cyan drape with an obsidian border and bright white diamond core.',
    category: 'trending',
    badge: 'TOP TRENDING',
    likes: 107119,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
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
    id: 'trend-royal-scarlet',
    name: 'Royal Scarlet Mantle',
    description: 'Deep royal scarlet velvet cloak draped with interlocking golden chains.',
    category: 'trending',
    badge: 'TRENDING',
    likes: 84375,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
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
    id: 'trend-void-minimal',
    name: 'Void Shadow Minimal',
    description: 'Pure obsidian pitch-black cloth featuring a stark, high-contrast white minimalist expression.',
    category: 'trending',
    badge: 'PVP CLEAN',
    likes: 78565,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
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
    id: 'trend-wither-skull',
    name: 'Wither King Skull',
    description: 'Charcoal nether-stone weave bearing the fearsome bleached Wither skeleton visage.',
    category: 'trending',
    likes: 51200,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
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
    id: 'trend-cyber-creeper',
    name: 'Neon Cyber Creeper',
    description: 'Stealth black drape with a blazing electric cyan Creeper face shining from the center.',
    category: 'trending',
    likes: 48930,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
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
    id: 'trend-golden-sunburst',
    name: 'Golden Sunburst Dawn',
    description: 'Blazing golden-orange dawn gradient with an obsidian Creeper face emblazoned in the rays.',
    category: 'trending',
    likes: 62400,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
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
    id: 'trend-cobalt-of',
    name: 'Cobalt Blue OptiFine OF',
    description: 'Deep cobalt electric sapphire edition of the iconic OptiFine banner.',
    category: 'trending',
    badge: 'POPULAR',
    likes: 64700,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
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

  // ── 4. ANIME, GAMING & COMMUNITY ──
  {
    id: 'comm-akatsuki-cloud',
    name: 'Akatsuki Crimson Cloud',
    description: 'Pitch black stealth mantle bearing the iconic red cloud with white borders from Naruto.',
    category: 'community',
    badge: 'ANIME',
    likes: 81400,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#09090B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#EF4444'
        ctx.fillRect(3, 6, 4, 4)
        ctx.fillRect(2, 7, 6, 2)
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 1
        ctx.strokeRect(2, 6, 6, 4)
      })
  },
  {
    id: 'comm-wings-freedom',
    name: 'Wings of Freedom',
    description: 'Scout Regiment dark olive green cape with the blue & white overlapping wings emblem from Attack on Titan.',
    category: 'community',
    badge: 'ANIME',
    likes: 74200,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#14532D'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#3B82F6'
        ctx.fillRect(3, 5, 2, 6)
        ctx.fillRect(2, 6, 2, 4)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(5, 5, 2, 6)
        ctx.fillRect(6, 6, 2, 4)
      })
  },
  {
    id: 'comm-pokeball-trainer',
    name: 'Master Trainer Pokéball',
    description: 'Vibrant scarlet top and snowy white bottom split by the central black band and trigger button.',
    category: 'community',
    badge: 'GAMING',
    likes: 68100,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
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
    id: 'comm-zelda-triforce',
    name: 'Golden Triforce of Hyrule',
    description: 'Forest green Hylian tunic fabric illuminated with the radiant golden triple triangles of power.',
    category: 'community',
    badge: 'GAMING',
    likes: 63900,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#064E3B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#FBBF24'
        ctx.fillRect(4, 5, 2, 2)
        ctx.fillRect(2, 8, 2, 2)
        ctx.fillRect(6, 8, 2, 2)
        ctx.fillRect(3, 7, 4, 1)
      })
  },
  {
    id: 'comm-arctic-direwolf',
    name: 'White Arctic Direwolf',
    description: 'Snow-white arctic wolf silhouette on crisp polar blizzard fabric.',
    category: 'community',
    badge: 'PVP CLEAN',
    likes: 67300,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
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
    id: 'comm-tokyo-kanji',
    name: 'Tokyo Violet Kanji',
    description: 'Deep royal purple silk stamped with neon violet mystical Japanese calligraphy.',
    category: 'community',
    badge: 'PVP',
    likes: 45100,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#1E1B4B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#A855F7'
        ctx.fillRect(2, 4, 6, 1)
        ctx.fillRect(4, 4, 2, 8)
        ctx.fillRect(2, 7, 6, 1)
        ctx.fillRect(2, 10, 2, 2)
        ctx.fillRect(6, 10, 2, 2)
      })
  }
]

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
