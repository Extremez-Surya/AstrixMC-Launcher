export interface CapeItem {
  id: string
  name: string
  description: string
  category: 'animated' | 'official' | 'trending' | 'community'
  badge?: string
  likes?: number
  isAnimated?: boolean
  frameCount?: number
  textureUrl?: string
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
  // ════════════════════════════════════════════════════════════
  // ── 1. LIVE ANIMATED CAPES (20 REAL DYNAMIC ANIMATED CLOAKS) ──
  // ════════════════════════════════════════════════════════════
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
        ctx.fillStyle = '#450A0A'
        ctx.fillRect(0, 0, 10, 16)
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
        const flameHeight = 4 + (offset % 4)
        ctx.fillStyle = '#FDE047'
        ctx.fillRect(4, 8 - ((flameHeight / 2) | 0), 2, flameHeight)
        ctx.fillStyle = '#EF4444'
        ctx.fillRect(3, 7 - ((flameHeight / 3) | 0), 4, flameHeight)
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
    id: 'anim-portal-vortex',
    name: 'Nether Portal Vortex',
    description: 'Animated swirling obsidian and neon magenta nether portal gateway distortion.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 104500,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#1E1B4B'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 8
        ctx.fillStyle = '#7E22CE'
        ctx.fillRect(2, 2, 6, 12)
        ctx.fillStyle = '#C084FC'
        for (let i = 0; i < 4; i++) {
          const py = (f * 2 + i * 4) % 14 + 1
          const px = (Math.sin(py + f) * 2 + 5) | 0
          ctx.fillRect(px, py, 2, 2)
        }
        ctx.fillStyle = '#F3E8FF'
        ctx.fillRect(4, (f * 2) % 12 + 2, 2, 2)
      })
  },
  {
    id: 'anim-aurora-borealis',
    name: 'Aurora Polar Wave',
    description: 'Animated shifting emerald green and celestial violet curtains of arctic northern lights.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 97800,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#020617'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 8
        for (let y = 3; y < 14; y++) {
          const wave = Math.sin((y + f) * 0.7) * 2.5 + 4.5
          ctx.fillStyle = '#10B981'
          ctx.fillRect((wave | 0), y, 2, 1)
          ctx.fillStyle = '#34D399'
          ctx.fillRect(((wave + 1) | 0), y, 1, 1)
          ctx.fillStyle = '#818CF8'
          ctx.fillRect(((wave - 1) | 0), y, 1, 1)
        }
      })
  },
  {
    id: 'anim-soul-fire',
    name: 'Soul Sand Valley Fire',
    description: 'Animated ghostly turquoise soul fire flickering and emitting ethereal blue embers.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 6,
    likes: 92300,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#0F172A'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 6
        ctx.fillStyle = '#0284C7'
        ctx.fillRect(2, 8 - (f % 3), 6, 6 + (f % 3))
        ctx.fillStyle = '#38BDF8'
        ctx.fillRect(3, 7 - (f % 2), 4, 6)
        ctx.fillStyle = '#E0F2FE'
        ctx.fillRect(4, 8, 2, 3)
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
  {
    id: 'anim-glitch-cyberpunk',
    name: 'Cyber Glitch Horizon',
    description: 'Animated glitch displacement with flickering cyan and magenta digital noise scanlines.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 6,
    likes: 86400,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#09090B'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 6
        ctx.fillStyle = '#06B6D4'
        ctx.fillRect(1, (f * 3) % 15, 6, 2)
        ctx.fillStyle = '#EC4899'
        ctx.fillRect(3, ((f + 2) * 3) % 15, 6, 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(4, 7, 2, 2)
      })
  },
  {
    id: 'anim-ocean-tidal',
    name: 'Aquatic Tidal Wave',
    description: 'Animated rolling deep ocean swell with cresting azure ripples and frothing white foam.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 81200,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#082F49'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 8
        ctx.fillStyle = '#0284C7'
        ctx.fillRect(0, 8 + (Math.sin(f) * 2 | 0), 10, 8)
        ctx.fillStyle = '#38BDF8'
        ctx.fillRect(0, 6 + (Math.sin(f + 1) * 2 | 0), 10, 3)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(1, 5 + (Math.sin(f + 1) * 2 | 0), 8, 1)
      })
  },
  {
    id: 'anim-heartbeat-pulse',
    name: 'Cyber Neon Heartbeat',
    description: 'Animated pulsing magenta-ruby cyber heart expanding and contracting with a live pulse.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 6,
    likes: 95300,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#180B14'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 6
        const pulse = f < 3 ? 1 : 0
        ctx.fillStyle = '#E11D48'
        ctx.fillRect(3 - pulse, 6 - pulse, 2 + pulse * 2, 2 + pulse)
        ctx.fillRect(6, 6 - pulse, 2 + pulse * 2, 2 + pulse)
        ctx.fillRect(2 - pulse, 7 - pulse, 7 + pulse * 2, 4 + pulse * 2)
        ctx.fillRect(3, 11, 5, 2)
        ctx.fillRect(4, 13, 3, 1)
        ctx.fillStyle = '#FECDD3'
        ctx.fillRect(4, 7, 2, 2)
      })
  },
  {
    id: 'anim-dragon-flame',
    name: 'Dragon Breath Inferno',
    description: 'Animated flapping dragon wings ablaze with surging incandescent flame embers.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 6,
    likes: 108900,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#180B05'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 6
        const wingY = (Math.sin(f * 1.0) * 2 | 0)
        ctx.fillStyle = '#DC2626'
        ctx.fillRect(1, 4 + wingY, 3, 7)
        ctx.fillRect(6, 4 + wingY, 3, 7)
        ctx.fillStyle = '#EA580C'
        ctx.fillRect(2, 5 + wingY, 2, 5)
        ctx.fillRect(6, 5 + wingY, 2, 5)
        ctx.fillStyle = '#FBBF24'
        ctx.fillRect(4, 3, 2, 8)
        ctx.fillRect(3, 6, 4, 3)
      })
  },
  {
    id: 'anim-supernova-cosmic',
    name: 'Cosmic Supernova Blast',
    description: 'Animated pulsating stellar core discharging expanding shockwaves of golden stardust.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 114200,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#030712'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 8
        const r = (f % 4) + 1
        ctx.fillStyle = '#8B5CF6'
        ctx.fillRect(5 - r, 8 - r, r * 2, r * 2)
        ctx.fillStyle = '#F59E0B'
        ctx.fillRect(4, 7, 2, 2)
        ctx.fillStyle = '#FEF08A'
        ctx.fillRect((f * 3) % 9 + 1, ((f + 2) * 4) % 15 + 1, 1, 1)
        ctx.fillRect(((f + 4) * 2) % 9 + 1, ((f + 1) * 3) % 15 + 1, 1, 1)
      })
  },
  {
    id: 'anim-toxic-biohazard',
    name: 'Toxic Sludge Biohazard',
    description: 'Animated boiling radioactive acid bubbling with glowing neon lime toxic fumes.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 6,
    likes: 84100,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#052E16'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 6
        ctx.fillStyle = '#16A34A'
        ctx.fillRect(0, 8, 10, 8)
        ctx.fillStyle = '#22C55E'
        ctx.fillRect(2, 6 - (f % 3), 2, 2)
        ctx.fillRect(6, 7 - ((f + 2) % 3), 2, 2)
        ctx.fillStyle = '#86EFAC'
        ctx.fillRect(4, 9, 2, 2)
      })
  },
  {
    id: 'anim-sakura-falling',
    name: 'Floating Sakura Petals',
    description: 'Animated drifting cherry blossom petals swirling and descending through spring twilight breeze.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 99400,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 16)
        grad.addColorStop(0, '#831843')
        grad.addColorStop(1, '#1C0D17')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 8
        ctx.fillStyle = '#FBCFE8'
        for (let i = 0; i < 4; i++) {
          const y = (f * 2 + i * 4) % 16
          const x = (Math.sin(y * 0.8 + f) * 3 + 5) | 0
          ctx.fillRect(x, y, 1, 2)
          ctx.fillRect(Math.max(1, x - 1), y + 1, 1, 1)
        }
      })
  },
  {
    id: 'anim-blood-moon',
    name: 'Blood Moon Eclipse',
    description: 'Animated crimson lunar eclipse with swirling dark clouds and a pulsating blood halo.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 6,
    likes: 103000,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#0A0508'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 6
        const halo = f % 2 === 0 ? 1 : 0
        ctx.fillStyle = '#991B1B'
        ctx.fillRect(2 - halo, 5 - halo, 6 + halo * 2, 6 + halo * 2)
        ctx.fillStyle = '#DC2626'
        ctx.fillRect(3, 6, 4, 4)
        ctx.fillStyle = '#0A0508'
        ctx.fillRect(4, 7, 3, 3)
      })
  },
  {
    id: 'anim-quantum-circuits',
    name: 'Quantum Cyber Core',
    description: 'Animated golden quantum data packets traveling along cyan printed circuit board traces.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 91700,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#042F2E'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#0D9488'
        ctx.fillRect(4, 1, 2, 14)
        ctx.fillRect(1, 6, 8, 2)
        ctx.fillRect(1, 11, 8, 2)
        const f = frame % 8
        ctx.fillStyle = '#FBBF24'
        ctx.fillRect(4, (f * 2) % 14 + 1, 2, 2)
        ctx.fillRect((f * 2) % 8 + 1, 6, 2, 2)
      })
  },

  {
    id: 'anim-galaxy-spiral',
    name: 'Andromeda Galaxy Spiral',
    description: 'Animated celestial cosmic vortex with swirling purple and cyan spiral arms revolving continuously.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 118400,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#020617'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 8
        const cx = 5
        const cy = 8
        ctx.fillStyle = '#C084FC'
        for (let a = 0; a < 8; a++) {
          const angle = ((f + a) * 0.785)
          const r = 1 + a * 0.5
          const px = Math.round(cx + Math.cos(angle) * r)
          const py = Math.round(cy + Math.sin(angle) * r)
          if (px >= 0 && px < 10 && py >= 0 && py < 16) {
            ctx.fillRect(px, py, 1, 1)
          }
        }
        ctx.fillStyle = '#38BDF8'
        for (let a = 0; a < 8; a++) {
          const angle = ((f + a) * 0.785) + Math.PI
          const r = 1 + a * 0.5
          const px = Math.round(cx + Math.cos(angle) * r)
          const py = Math.round(cy + Math.sin(angle) * r)
          if (px >= 0 && px < 10 && py >= 0 && py < 16) {
            ctx.fillRect(px, py, 1, 1)
          }
        }
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(cx, cy, 1, 1)
      })
  },
  {
    id: 'anim-synthwave-sun',
    name: 'Synthwave Retro Grid Sun',
    description: 'Animated 80s outrun sunset with sliced neon magenta sun setting over a scrolling cyan digital grid.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 6,
    likes: 104200,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#1E1035'
        ctx.fillRect(0, 0, 10, 16)
        // Sun
        ctx.fillStyle = '#F43F5E'
        ctx.fillRect(2, 3, 6, 6)
        ctx.fillStyle = '#FBBF24'
        ctx.fillRect(3, 4, 4, 3)
        // Scanlines
        ctx.fillStyle = '#1E1035'
        ctx.fillRect(2, 5, 6, 1)
        ctx.fillRect(2, 7, 6, 1)
        // Perspective Grid at bottom
        const f = frame % 6
        ctx.fillStyle = '#06B6D4'
        ctx.fillRect(0, 10, 10, 1)
        ctx.fillRect(0, 12, 10, 1)
        ctx.fillRect(0, 14, 10, 1)
        const gridX = (f * 2) % 10
        ctx.fillRect(gridX, 10, 1, 6)
        ctx.fillRect((gridX + 5) % 10, 10, 1, 6)
      })
  },
  {
    id: 'anim-living-ender-eye',
    name: 'Living Eye of Ender',
    description: 'Animated living void relic with a shifting, dilating emerald slit pupil and floating Ender particles.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 6,
    likes: 99600,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#064E3B'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 6
        // Sclera
        ctx.fillStyle = '#10B981'
        ctx.fillRect(2, 5, 6, 6)
        ctx.fillRect(3, 4, 4, 8)
        ctx.fillStyle = '#6EE7B7'
        ctx.fillRect(3, 6, 4, 4)
        // Slit Pupil shifts
        ctx.fillStyle = '#022C22'
        const pupilShift = f < 3 ? 0 : 1
        ctx.fillRect(4 + pupilShift, 5, 1, 6)
        ctx.fillRect(4 + pupilShift, 7, 2, 2)
        // Ender particles
        ctx.fillStyle = '#C084FC'
        ctx.fillRect((f * 2) % 8 + 1, (f * 3) % 14 + 1, 1, 1)
        ctx.fillRect(((f + 3) * 3) % 8 + 1, ((f + 2) * 4) % 14 + 1, 1, 1)
      })
  },
  {
    id: 'anim-hypercube-tesseract',
    name: 'Hypercube 4D Tesseract',
    description: 'Animated rotating 4D wireframe hypercube glowing with shifting cyan and violet neon vertices.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 96800,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#09090B'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 8
        // Outer box
        ctx.strokeStyle = '#06B6D4'
        ctx.strokeRect(1, 4, 8, 8)
        // Inner shifting box
        const innerOffset = f < 4 ? f : 8 - f
        ctx.strokeStyle = '#A855F7'
        ctx.strokeRect(3, 6 + (innerOffset * 0.25 | 0), 4, 4)
        // Connecting lines
        ctx.fillStyle = '#38BDF8'
        ctx.fillRect(2, 5, 1, 1)
        ctx.fillRect(7, 5, 1, 1)
        ctx.fillRect(2, 10, 1, 1)
        ctx.fillRect(7, 10, 1, 1)
      })
  },
  {
    id: 'anim-radiation-hazard',
    name: 'Nuclear Radiation Core',
    description: 'Animated radioactive hazard emblem pulsing with expanding rings of neon lime bio-energy.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 6,
    likes: 91400,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#18181B'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 6
        // Pulsing rings
        ctx.strokeStyle = f % 2 === 0 ? '#84CC16' : '#65A30D'
        ctx.strokeRect(1, 4, 8, 8)
        // Trefoil hazard
        ctx.fillStyle = '#EAB308'
        ctx.fillRect(4, 7, 2, 2)
        ctx.fillRect(4, 5, 2, 1)
        ctx.fillRect(2, 9, 2, 1)
        ctx.fillRect(6, 9, 2, 1)
        ctx.fillStyle = '#FACC15'
        ctx.fillRect(4, 7, 2, 2)
      })
  },
  {
    id: 'anim-subzero-frost',
    name: 'Sub-Zero Frost Nova',
    description: 'Animated glacial blizzards drifting downward with crystalline snowflakes and freezing mist.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 89300,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#082F49'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 8
        ctx.fillStyle = '#E0F2FE'
        // Snowflakes falling
        const snowCols = [1, 3, 5, 7, 9]
        snowCols.forEach((col, idx) => {
          const y = (f * 2 + idx * 3) % 16
          ctx.fillRect(col, y, 1, 1)
          ctx.fillStyle = '#38BDF8'
          ctx.fillRect(col, (y + 1) % 16, 1, 1)
          ctx.fillStyle = '#E0F2FE'
        })
        // Central frost crystal
        ctx.fillStyle = '#BAE6FD'
        ctx.fillRect(4, 7, 2, 2)
        ctx.fillRect(5, 6, 1, 4)
        ctx.fillRect(3, 7, 4, 1)
      })
  },
  {
    id: 'anim-divine-godray',
    name: 'Ascendant Divine Halo',
    description: 'Animated heavenly white velvet draped with flowing golden beams of sacred light and a glowing halo.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 114700,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#1E293B'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 8
        // Halo
        ctx.fillStyle = '#FDE047'
        ctx.fillRect(3, 2, 4, 1)
        ctx.fillRect(2, 3, 1, 1)
        ctx.fillRect(7, 3, 1, 1)
        // Cascading Light Rays
        ctx.fillStyle = '#FEF08A'
        for (let x = 1; x < 9; x += 2) {
          const rayY = (f + x * 2) % 12 + 4
          ctx.fillRect(x, rayY, 1, 4)
        }
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(4, 7, 2, 4)
      })
  },
  {
    id: 'anim-tactical-sonar',
    name: 'Military Tactical Sonar',
    description: 'Animated tactical radar screen with an active 360-degree sweep revealing pinged coordinates.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 85900,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#022C22'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 8
        // Concentric Rings
        ctx.strokeStyle = '#065F46'
        ctx.strokeRect(1, 4, 8, 8)
        ctx.strokeRect(3, 6, 4, 4)
        // Sweeping beam
        const angle = (f / 8) * Math.PI * 2
        ctx.fillStyle = '#4ADE80'
        const px = Math.round(5 + Math.cos(angle) * 3.5)
        const py = Math.round(8 + Math.sin(angle) * 3.5)
        ctx.fillRect(px, py, 1, 1)
        ctx.fillStyle = '#86EFAC'
        ctx.fillRect(5, 8, 1, 1)
        // Ping dot
        if (f === 2 || f === 3) {
          ctx.fillStyle = '#F87171'
          ctx.fillRect(7, 6, 1, 1)
        }
      })
  },
  {
    id: 'anim-laser-tripwire',
    name: 'Security Laser Grid',
    description: 'Animated high-security infrared defense grid with moving crimson laser tripwires.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 6,
    likes: 94300,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#0A0A0A'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 6
        ctx.fillStyle = '#EF4444'
        const y1 = (f * 2) % 15 + 1
        const y2 = ((f + 3) * 2) % 15 + 1
        ctx.fillRect(0, y1, 10, 1)
        ctx.fillRect(0, y2, 10, 1)
        ctx.fillStyle = '#FCA5A5'
        ctx.fillRect(3, y1, 4, 1)
        ctx.fillRect(3, y2, 4, 1)
      })
  },
  {
    id: 'anim-void-reaper',
    name: 'Reaper Void Miasma',
    description: 'Animated dark shadow miasma rising into the air with glowing violet soul sockets.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 107600,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#030712'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 8
        // Smoke curling up
        ctx.fillStyle = '#581C87'
        for (let y = 15; y >= 2; y--) {
          const shift = (Math.sin((y + f) * 0.9) * 2.5 + 4.5) | 0
          ctx.fillRect(shift, y, 2, 1)
        }
        ctx.fillStyle = '#9333EA'
        for (let y = 14; y >= 3; y -= 2) {
          const shift = (Math.sin((y + f + 2) * 0.9) * 2 + 4.5) | 0
          ctx.fillRect(shift, y, 1, 1)
        }
        // Soul eyes
        ctx.fillStyle = '#E9D5FF'
        ctx.fillRect(3, 5, 1, 2)
        ctx.fillRect(6, 5, 1, 2)
      })
  },
  {
    id: 'anim-firefly-grove',
    name: 'Whispering Firefly Grove',
    description: 'Animated magical twilight forest canopy illuminated by blinking glowing firefly orbs.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 87100,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#052E16'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 8
        // Pine silhouettes
        ctx.fillStyle = '#022C22'
        ctx.fillRect(4, 2, 2, 14)
        ctx.fillRect(3, 5, 4, 4)
        ctx.fillRect(2, 9, 6, 6)
        // Fireflies
        ctx.fillStyle = '#FEF08A'
        ctx.fillRect((f * 2) % 8 + 1, ((f * 3) % 12) + 2, 1, 1)
        ctx.fillRect(((f + 4) * 3) % 8 + 1, (((f + 2) * 2) % 12) + 2, 1, 1)
        ctx.fillStyle = '#FDE047'
        ctx.fillRect(((f + 2) * 2) % 8 + 1, (((f + 5) * 3) % 12) + 2, 1, 1)
      })
  },
  {
    id: 'anim-neon-equalizer',
    name: 'Neon Audio Visualizer',
    description: 'Animated retro-futuristic club equalizer with dancing multicolored frequency bars.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 6,
    likes: 92800,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#09090B'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 6
        const heights = [
          4 + ((f * 3) % 9),
          7 + (((f + 2) * 2) % 8),
          10 - (f % 5),
          5 + (((f + 4) * 2) % 9),
          3 + ((f * 2) % 10)
        ]
        const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4']
        heights.forEach((h, i) => {
          ctx.fillStyle = colors[i]
          const x = 1 + i * 2
          ctx.fillRect(x, 15 - h, 1, h)
          // Peak dot
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(x, Math.max(1, 14 - h), 1, 1)
        })
      })
  },
  {
    id: 'anim-chromatic-flow',
    name: 'Chromatic Prism Cascade',
    description: 'Animated vertical liquid rainbow waterfall shifting seamlessly through all visible hues.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 12,
    likes: 111300,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        for (let y = 0; y < 16; y++) {
          const hue = ((frame * 25) + y * 20) % 360
          ctx.fillStyle = `hsl(${hue}, 85%, 50%)`
          ctx.fillRect(0, y, 10, 1)
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.fillRect(2, 4, 6, 8)
      })
  },
  {
    id: 'anim-volcanic-sparks',
    name: 'Volcanic Obsidian Sparks',
    description: 'Animated molten obsidian with blazing thermal cracks discharging rising ember sparks.',
    category: 'animated',
    badge: 'LIVE ANIMATED',
    isAnimated: true,
    frameCount: 8,
    likes: 105800,
    getTexture: (frame = 0) =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#1C1917'
        ctx.fillRect(0, 0, 10, 16)
        const f = frame % 8
        // Magma cracks
        ctx.fillStyle = '#EA580C'
        ctx.fillRect(2, 6, 6, 1)
        ctx.fillRect(4, 7, 2, 5)
        ctx.fillRect(1, 12, 8, 1)
        ctx.fillStyle = '#FDE047'
        ctx.fillRect(3, 6, 2, 1)
        ctx.fillRect(4, 8, 1, 2)
        // Rising sparks
        ctx.fillStyle = '#FEF08A'
        ctx.fillRect((f * 3) % 8 + 1, 15 - ((f * 2) % 14), 1, 1)
        ctx.fillRect(((f + 4) * 2) % 8 + 1, 15 - (((f + 2) * 2) % 14), 1, 1)
      })
  },

  // ════════════════════════════════════════════════════════════
  // ── 2. ACTUAL OFFICIAL MOJANG MINECRAFT CAPES (DIRECT CDN) ──
  // ════════════════════════════════════════════════════════════
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

  {
    id: 'official-mojang-classic-red',
    name: 'Official Mojang Studios Classic',
    description: 'Official Mojang Studios signature red cape with the crisp white studio insignia.',
    category: 'official',
    badge: 'OFFICIAL MOJANG',
    likes: 198000,
    textureUrl: 'https://textures.minecraft.net/texture/5786fe99be377dfb6e588c7f217707038b72521f928e14e1f7480a74ea8e759',
    getTexture: () => 'https://textures.minecraft.net/texture/5786fe99be377dfb6e588c7f217707038b72521f928e14e1f7480a74ea8e759'
  },
  {
    id: 'official-crowdin-translator',
    name: 'Official Crowdin Translator',
    description: 'Rare official cape awarded to key international Minecraft localization translators.',
    category: 'official',
    badge: 'OFFICIAL MOJANG',
    likes: 135000,
    textureUrl: 'https://textures.minecraft.net/texture/b056882c217467657c273a39e37866d9269430c451da7eb318a6669911e2f81',
    getTexture: () => 'https://textures.minecraft.net/texture/b056882c217467657c273a39e37866d9269430c451da7eb318a6669911e2f81'
  },
  {
    id: 'official-cobalt-scrolls',
    name: 'Official Cobalt Scrolls',
    description: 'Historic official Mojang cape celebrating the release of the strategic game Scrolls.',
    category: 'official',
    badge: 'OFFICIAL MOJANG',
    likes: 128000,
    textureUrl: 'https://textures.minecraft.net/texture/8f120319597978313de34ced13fa4841b5b14194c7b8dfa97b21dc80e3c54a',
    getTexture: () => 'https://textures.minecraft.net/texture/8f120319597978313de34ced13fa4841b5b14194c7b8dfa97b21dc80e3c54a'
  },
  {
    id: 'official-notch-bacon',
    name: 'Notch Birthday Bacon Cape',
    description: 'One-of-a-kind legendary cape featuring crispy strips of bacon created for Notch on his birthday.',
    category: 'official',
    badge: 'LEGENDARY',
    likes: 164000,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#7F1D1D'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#DC2626'
        ctx.fillRect(2, 2, 6, 12)
        ctx.fillStyle = '#FECDD3'
        ctx.fillRect(3, 3, 4, 2)
        ctx.fillRect(3, 7, 4, 2)
        ctx.fillRect(3, 11, 4, 2)
        ctx.fillStyle = '#991B1B'
        ctx.fillRect(4, 5, 2, 2)
        ctx.fillRect(4, 9, 2, 2)
      })
  },
  {
    id: 'official-ocean-turtle',
    name: 'Official Ocean Turtle Milestone',
    description: 'Rare ocean conservation milestone cape featuring the serene emerald sea turtle.',
    category: 'official',
    badge: 'OFFICIAL EVENT',
    likes: 141000,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#065F46'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#059669'
        ctx.fillRect(2, 4, 6, 8)
        ctx.fillStyle = '#34D399'
        ctx.fillRect(3, 5, 4, 6)
        ctx.fillStyle = '#022C22'
        ctx.fillRect(4, 7, 2, 2)
      })
  },
  {
    id: 'official-prismarine-monument',
    name: 'Official Prismarine Monument',
    description: 'Ocean monument prismarine cape with an enigmatic watchful elder guardian core.',
    category: 'official',
    badge: 'COMMUNITY REWARD',
    likes: 132000,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#0D9488'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#115E59'
        ctx.fillRect(1, 3, 8, 10)
        ctx.fillStyle = '#F97316'
        ctx.fillRect(4, 7, 2, 2)
        ctx.fillStyle = '#FEF08A'
        ctx.fillRect(4, 7, 1, 1)
      })
  },
  {
    id: 'official-millionth-customer',
    name: '1,000,000th Player Star Cape',
    description: 'Historic commemorative cape featuring a golden star created for the 1 millionth Minecraft player.',
    category: 'official',
    badge: 'HISTORIC',
    likes: 153000,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#991B1B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#FBBF24'
        ctx.fillRect(4, 4, 2, 8)
        ctx.fillRect(2, 7, 6, 2)
        ctx.fillStyle = '#FDE68A'
        ctx.fillRect(4, 7, 2, 2)
      })
  },

  // ════════════════════════════════════════════════════════════
  // ── 3. TRENDING COMMUNITY & PVP FAVORITES ──
  // ════════════════════════════════════════════════════════════
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
  {
    id: 'trend-emerald-vault',
    name: 'Emerald Vault Sovereign',
    description: 'Deep jewel emerald drape with a shimmering runic gem center.',
    category: 'trending',
    likes: 58200,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#064E3B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#10B981'
        ctx.fillRect(3, 6, 4, 4)
        ctx.fillStyle = '#6EE7B7'
        ctx.fillRect(4, 7, 2, 2)
      })
  },
  {
    id: 'trend-crimson-mecha',
    name: 'Crimson Mecha Plating',
    description: 'High-tech robotic feather wing plates illuminated with incandescent scarlet thrusters.',
    category: 'trending',
    likes: 42600,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
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
    id: 'trend-lunar-valkyrie',
    name: 'Lunar Valkyrie Wings',
    description: 'Tournament PvP white and silver angel wings on sleek deep slate navy fabric.',
    category: 'trending',
    badge: 'PVP TOURNAMENT',
    likes: 98200,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#0F172A'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#F8FAFC'
        ctx.fillRect(1, 3, 3, 8)
        ctx.fillRect(6, 3, 3, 8)
        ctx.fillStyle = '#94A3B8'
        ctx.fillRect(2, 4, 2, 6)
        ctx.fillRect(6, 4, 2, 6)
      })
  },
  {
    id: 'trend-badlion-aegis',
    name: 'Badlion Aegis War Shield',
    description: 'Heavy knightly heater shield with crossed gold swords emblazoned on obsidian chainmail.',
    category: 'trending',
    badge: 'COMPETITIVE',
    likes: 87400,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#18181B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#E4E4E7'
        ctx.fillRect(2, 4, 6, 7)
        ctx.fillRect(3, 11, 4, 2)
        ctx.fillStyle = '#EAB308'
        ctx.fillRect(4, 5, 2, 5)
        ctx.fillRect(3, 7, 4, 1)
      })
  },
  {
    id: 'trend-feather-stealth',
    name: 'Feather Stealth Wings',
    description: 'Aerodynamic feather wings rendered in pitch black carbon fiber with silver tips.',
    category: 'trending',
    badge: 'STEALTH',
    likes: 82100,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#09090B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#71717A'
        ctx.fillRect(2, 3, 2, 9)
        ctx.fillRect(6, 3, 2, 9)
        ctx.fillStyle = '#E4E4E7'
        ctx.fillRect(2, 10, 2, 2)
        ctx.fillRect(6, 10, 2, 2)
      })
  },
  {
    id: 'trend-pure-white-minimal',
    name: 'Pure Snow Minimalist Fade',
    description: 'Crisp ultra-clean tournament PvP white gradient down to soft morning mist slate.',
    category: 'trending',
    badge: 'PVP CLEAN',
    likes: 91500,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 16)
        grad.addColorStop(0, '#FFFFFF')
        grad.addColorStop(1, '#94A3B8')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 10, 16)
      })
  },
  {
    id: 'trend-pitch-vantablack',
    name: 'Vantablack Void Mantle',
    description: 'Absolute light-absorbing black cloth with a subtle graphite geometric hem.',
    category: 'trending',
    badge: 'STEALTH',
    likes: 103400,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#18181B'
        ctx.fillRect(1, 14, 8, 1)
      })
  },
  {
    id: 'trend-flaming-cross',
    name: 'Flaming Nordic Rune Cross',
    description: 'Rich scarlet velvet with an interlocking solar rune cross forged from solar gold.',
    category: 'trending',
    likes: 76300,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#991B1B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#F59E0B'
        ctx.fillRect(4, 2, 2, 12)
        ctx.fillRect(1, 5, 8, 2)
        ctx.fillStyle = '#FDE68A'
        ctx.fillRect(4, 5, 2, 2)
      })
  },
  {
    id: 'trend-crown-monarch',
    name: 'Sovereign Royal Gold Crown',
    description: 'Regal imperial violet velvet with an ornate golden crown adorned with radiant rubies.',
    category: 'trending',
    badge: 'REGAL',
    likes: 94600,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#3B0764'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#FBBF24'
        ctx.fillRect(2, 8, 6, 2)
        ctx.fillRect(2, 6, 2, 2)
        ctx.fillRect(4, 5, 2, 3)
        ctx.fillRect(6, 6, 2, 2)
        ctx.fillStyle = '#EF4444'
        ctx.fillRect(4, 7, 2, 1)
      })
  },
  {
    id: 'trend-bonsai-twilight',
    name: 'Bonsai Twilight Silhouette',
    description: 'Graceful ancient bonsai tree silhouette standing against a serene violet dusk gradient.',
    category: 'trending',
    badge: 'AESTHETIC',
    likes: 85200,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 16)
        grad.addColorStop(0, '#C084FC')
        grad.addColorStop(0.5, '#F43F5E')
        grad.addColorStop(1, '#180B14')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#09090B'
        ctx.fillRect(4, 8, 2, 7)
        ctx.fillRect(2, 6, 6, 3)
        ctx.fillRect(1, 7, 8, 1)
      })
  },
  {
    id: 'trend-astral-orion',
    name: 'Orion Starlight Astrolabe',
    description: 'Midnight navy cloth illuminated with fine silver constellation lines and bright navigational stars.',
    category: 'trending',
    likes: 71900,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#0B1120'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(2, 3, 1, 1)
        ctx.fillRect(7, 4, 1, 1)
        ctx.fillRect(4, 8, 2, 1)
        ctx.fillRect(3, 12, 1, 1)
        ctx.fillRect(6, 13, 1, 1)
        ctx.fillStyle = '#38BDF8'
        ctx.fillRect(4, 8, 1, 1)
      })
  },
  {
    id: 'trend-demon-oni',
    name: 'Crimson Oni Demon Visage',
    description: 'Traditional Japanese horned Oni demon mask painted in deep vermilion and gold accents.',
    category: 'trending',
    badge: 'WARRIOR',
    likes: 89700,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#18181B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#DC2626'
        ctx.fillRect(2, 4, 6, 8)
        ctx.fillStyle = '#FBBF24'
        ctx.fillRect(1, 3, 2, 2)
        ctx.fillRect(7, 3, 2, 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(3, 7, 1, 1)
        ctx.fillRect(6, 7, 1, 1)
        ctx.fillRect(3, 10, 4, 1)
      })
  },
  {
    id: 'trend-angelic-seraph',
    name: 'Celestial Seraphic Wings',
    description: 'Radiant six-winged seraphim emblem woven from pure golden sunlight and ivory dawn.',
    category: 'trending',
    likes: 83400,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#0F172A'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#FEF08A'
        ctx.fillRect(1, 4, 3, 4)
        ctx.fillRect(6, 4, 3, 4)
        ctx.fillRect(1, 9, 3, 4)
        ctx.fillRect(6, 9, 3, 4)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(4, 6, 2, 4)
      })
  },
  {
    id: 'trend-twin-katanas',
    name: 'Cyberpunk Twin Katanas',
    description: 'Crossed ceremonial katanas glowing with incandescent neon cyan edge energy on carbon weave.',
    category: 'trending',
    badge: 'CYBER',
    likes: 92300,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#09090B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#06B6D4'
        for (let i = 0; i < 8; i++) {
          ctx.fillRect(1 + i, 3 + i, 1, 1)
          ctx.fillRect(8 - i, 3 + i, 1, 1)
        }
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(4, 6, 2, 2)
      })
  },
  {
    id: 'trend-ghast-sorrow',
    name: 'Nether Ghast Sorrow Tear',
    description: 'Pale alabaster cloth stamped with the sorrowful visage of the Nether Ghast crying fiery tears.',
    category: 'trending',
    likes: 67800,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#F8FAFC'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#475569'
        ctx.fillRect(2, 5, 2, 1)
        ctx.fillRect(6, 5, 2, 1)
        ctx.fillRect(4, 9, 2, 2)
        ctx.fillStyle = '#EF4444'
        ctx.fillRect(2, 6, 1, 4)
        ctx.fillRect(7, 6, 1, 4)
      })
  },
  {
    id: 'trend-enchanted-sword',
    name: 'Master Enchanted Diamond Blade',
    description: 'Enchanted broadsword bathed in celestial purple arcane glyphs and sharp cyan edge shimmer.',
    category: 'trending',
    badge: 'LEGEND',
    likes: 99400,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#1E1B4B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#38BDF8'
        ctx.fillRect(4, 2, 2, 8)
        ctx.fillStyle = '#0284C7'
        ctx.fillRect(3, 10, 4, 1)
        ctx.fillRect(4, 11, 2, 2)
        ctx.fillStyle = '#C084FC'
        ctx.fillRect(1, 4, 1, 1)
        ctx.fillRect(8, 7, 1, 1)
        ctx.fillRect(2, 9, 1, 1)
      })
  },
  {
    id: 'trend-ender-dragon-wings',
    name: 'Ender Dragon Wings',
    description: 'Majestic leathery dragon wings stretching across obsidian void armor with glowing magenta joints.',
    category: 'trending',
    badge: 'BOSS',
    likes: 108200,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#030712'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#3B0764'
        ctx.fillRect(1, 4, 4, 6)
        ctx.fillRect(5, 4, 4, 6)
        ctx.fillStyle = '#A855F7'
        ctx.fillRect(2, 3, 2, 1)
        ctx.fillRect(6, 3, 2, 1)
        ctx.fillRect(4, 6, 2, 4)
      })
  },

  // ════════════════════════════════════════════════════════════
  // ── 4. ANIME, GAMING & COMMUNITY FAVORITES ──
  // ════════════════════════════════════════════════════════════
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
  },
  {
    id: 'comm-sakura-blossom',
    name: 'Sakura Blossom Twilight',
    description: 'Delicate pastel pink cherry blossom petals drifting gracefully on twilight silk.',
    category: 'community',
    badge: 'AESTHETIC',
    likes: 78900,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
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
  {
    id: 'comm-sharingan-eye',
    name: 'Uchiha Blood Sharingan',
    description: 'Crimson ocular doujutsu iris with three black tomoe seals spinning in deep pitch-black silk.',
    category: 'community',
    badge: 'ANIME',
    likes: 114000,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#09090B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#DC2626'
        ctx.fillRect(2, 5, 6, 6)
        ctx.fillStyle = '#09090B'
        ctx.fillRect(4, 7, 2, 2)
        ctx.fillRect(3, 6, 1, 1)
        ctx.fillRect(6, 6, 1, 1)
        ctx.fillRect(5, 10, 1, 1)
      })
  },
  {
    id: 'comm-straw-hat',
    name: 'Pirate King Straw Hat',
    description: 'Black pirate flag bearing the iconic Jolly Roger skull wearing the yellow straw hat with red ribbon.',
    category: 'community',
    badge: 'ANIME',
    likes: 109200,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#18181B'
        ctx.fillRect(0, 0, 10, 16)
        // Straw Hat
        ctx.fillStyle = '#EAB308'
        ctx.fillRect(1, 4, 8, 2)
        ctx.fillRect(3, 2, 4, 2)
        ctx.fillStyle = '#DC2626'
        ctx.fillRect(3, 4, 4, 1)
        // Skull
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(3, 6, 4, 4)
        ctx.fillStyle = '#18181B'
        ctx.fillRect(4, 7, 1, 1)
        ctx.fillRect(5, 7, 1, 1)
      })
  },
  {
    id: 'comm-tanjiro-haori',
    name: 'Demon Slayer Checkered Haori',
    description: 'Iconic emerald green and obsidian checkered geometric haori pattern worn by Tanjiro Kamado.',
    category: 'community',
    badge: 'ANIME',
    likes: 95400,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        for (let y = 0; y < 16; y += 4) {
          for (let x = 0; x < 10; x += 3) {
            const isGreen = ((x / 3 | 0) + (y / 4 | 0)) % 2 === 0
            ctx.fillStyle = isGreen ? '#16A34A' : '#18181B'
            ctx.fillRect(x, y, 3, 4)
          }
        }
      })
  },
  {
    id: 'comm-ichigo-hollow',
    name: 'Bleach Hollow Visard Mask',
    description: 'Bone-white jagged hollow mask stamped with aggressive crimson demon war stripes.',
    category: 'community',
    badge: 'ANIME',
    likes: 88700,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#09090B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#F8FAFC'
        ctx.fillRect(2, 4, 6, 8)
        ctx.fillStyle = '#DC2626'
        ctx.fillRect(3, 4, 1, 4)
        ctx.fillRect(4, 5, 1, 3)
        ctx.fillStyle = '#09090B'
        ctx.fillRect(3, 7, 1, 1)
        ctx.fillRect(6, 7, 1, 1)
      })
  },
  {
    id: 'comm-jojo-menacing',
    name: 'JoJo Menacing Kanji Aura',
    description: 'Imperial deep purple velvet embroidered with floating neon magenta "Menacing" ゴ symbols.',
    category: 'community',
    badge: 'ANIME',
    likes: 97800,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#1E1B4B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#C084FC'
        // First Go
        ctx.fillRect(2, 4, 3, 1)
        ctx.fillRect(3, 5, 2, 2)
        ctx.fillRect(2, 7, 2, 1)
        // Second Go
        ctx.fillRect(6, 9, 3, 1)
        ctx.fillRect(7, 10, 2, 2)
        ctx.fillRect(6, 12, 2, 1)
      })
  },
  {
    id: 'comm-genshin-anemo',
    name: 'Anemo Vision Wind Crest',
    description: 'Radiant turquoise winged crest of the Anemo Archon bordered by refined silver filigree.',
    category: 'community',
    badge: 'GAMING',
    likes: 89300,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#064E3B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#2DD4BF'
        ctx.fillRect(4, 4, 2, 8)
        ctx.fillRect(2, 6, 6, 2)
        ctx.fillStyle = '#99F6E4'
        ctx.fillRect(4, 6, 2, 2)
      })
  },
  {
    id: 'comm-undertale-soul',
    name: 'Determination Red Soul Heart',
    description: 'Pitch-black retro canvas bearing the glowing pixelated 8-bit Red Soul of Determination.',
    category: 'community',
    badge: 'GAMING',
    likes: 94100,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#EF4444'
        ctx.fillRect(2, 5, 2, 2)
        ctx.fillRect(6, 5, 2, 2)
        ctx.fillRect(2, 6, 6, 3)
        ctx.fillRect(3, 9, 4, 2)
        ctx.fillRect(4, 11, 2, 1)
      })
  },
  {
    id: 'comm-edgerunners-logo',
    name: 'Edgerunners Sandevistan',
    description: 'Cyberpunk neon electric lime and hazardous yellow skull logo from Night City.',
    category: 'community',
    badge: 'CYBER',
    likes: 96400,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#09090B'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#84CC16'
        ctx.fillRect(2, 4, 6, 7)
        ctx.fillStyle = '#FACC15'
        ctx.fillRect(3, 5, 4, 4)
        ctx.fillStyle = '#09090B'
        ctx.fillRect(3, 6, 1, 2)
        ctx.fillRect(6, 6, 1, 2)
      })
  },
  {
    id: 'comm-fallout-vault-tec',
    name: 'Vault-Tec 111 Emblem',
    description: 'Vault-Tec navy blue jumpsuit fabric with the iconic bright yellow gear and 111 vault insignia.',
    category: 'community',
    badge: 'GAMING',
    likes: 81200,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#1E3A8A'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#FACC15'
        ctx.fillRect(2, 5, 6, 6)
        ctx.fillStyle = '#1E3A8A'
        ctx.fillRect(4, 7, 2, 2)
        ctx.fillStyle = '#FACC15'
        ctx.fillRect(3, 7, 1, 2)
        ctx.fillRect(6, 7, 1, 2)
      })
  },
  {
    id: 'comm-super-star',
    name: 'Super Mario Invincibility Star',
    description: 'Joyful radiant golden star of invincibility sparkling on retro 8-bit sky blue fabric.',
    category: 'community',
    badge: 'GAMING',
    likes: 92700,
    getTexture: () =>
      createCapeCanvasUri((ctx) => {
        ctx.fillStyle = '#0284C7'
        ctx.fillRect(0, 0, 10, 16)
        ctx.fillStyle = '#FDE047'
        ctx.fillRect(4, 4, 2, 8)
        ctx.fillRect(2, 6, 6, 4)
        ctx.fillStyle = '#0F172A'
        ctx.fillRect(4, 6, 1, 2)
        ctx.fillRect(5, 6, 1, 2)
      })
  },
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
