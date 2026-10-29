/**
 * Canvas utility to bake pixel-perfect Minecraft GUI textures for AstrixMC Glassmorphism
 */

export interface ButtonThemeConfig {
  styleId: 'frosted' | 'cyber_crimson' | 'sapphire' | 'emerald' | 'amethyst'
  accentColor: string
  glassOpacity: number // 0.1 to 0.9
  borderGlow: boolean
  borderRadius: number
  titleText: string
  subtitleText: string
}

export const THEME_PRESETS: Record<string, { name: string; accentColor: string; bgFill: string; border: string; glow: string }> = {
  frosted: {
    name: 'Frosted Ice Glass',
    accentColor: '#FFFFFF',
    bgFill: 'rgba(255, 255, 255, 0.18)',
    border: 'rgba(255, 255, 255, 0.45)',
    glow: 'rgba(255, 255, 255, 0.35)'
  },
  cyber_crimson: {
    name: 'Cyber Crimson',
    accentColor: '#FF3154',
    bgFill: 'rgba(255, 49, 84, 0.18)',
    border: 'rgba(255, 49, 84, 0.7)',
    glow: 'rgba(255, 49, 84, 0.5)'
  },
  sapphire: {
    name: 'Sapphire Cyan',
    accentColor: '#00D2FF',
    bgFill: 'rgba(0, 210, 255, 0.18)',
    border: 'rgba(0, 210, 255, 0.7)',
    glow: 'rgba(0, 210, 255, 0.5)'
  },
  emerald: {
    name: 'Emerald Matrix',
    accentColor: '#00FF9D',
    bgFill: 'rgba(0, 255, 157, 0.18)',
    border: 'rgba(0, 255, 157, 0.7)',
    glow: 'rgba(0, 255, 157, 0.5)'
  },
  amethyst: {
    name: 'Amethyst Void',
    accentColor: '#C084FC',
    bgFill: 'rgba(192, 132, 252, 0.18)',
    border: 'rgba(192, 132, 252, 0.7)',
    glow: 'rgba(192, 132, 252, 0.5)'
  }
}

/**
 * Renders a single glassmorphic button to a canvas and returns its dataURL.
 * Supports modern 1.20.2+ (200x20 or scaled 400x40).
 */
export function drawGlassButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  config: ButtonThemeConfig,
  state: 'normal' | 'hover' | 'disabled'
): void {
  const preset = THEME_PRESETS[config.styleId] || THEME_PRESETS.frosted
  const r = Math.min(config.borderRadius, h / 2)

  ctx.save()

  // Helper rounded rect path
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()

  // 1. True glass translucent base (NOT solid black! Allows background to shine through)
  const baseDarkOpacity = state === 'disabled' ? 0.35 : state === 'hover' ? 0.22 : 0.14
  ctx.fillStyle = `rgba(10, 15, 24, ${baseDarkOpacity})`
  ctx.fill()

  // 2. Translucent glass gradient tint with specular lighting
  const grad = ctx.createLinearGradient(x, y, x, y + h)
  const tintAlpha = Math.min(0.35, Math.max(0.06, config.glassOpacity * 0.7))
  if (state === 'disabled') {
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.08)')
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.01)')
  } else if (state === 'hover') {
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)') // Crisp specular glass sheen
    grad.addColorStop(0.2, preset.bgFill.replace(/[\d.]+\)$/, `${tintAlpha * 1.6})`))
    grad.addColorStop(0.8, preset.bgFill.replace(/[\d.]+\)$/, `${tintAlpha * 0.9})`))
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.12)')
  } else {
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.28)') // Top glass light reflection
    grad.addColorStop(0.25, preset.bgFill.replace(/[\d.]+\)$/, `${tintAlpha})`))
    grad.addColorStop(0.75, preset.bgFill.replace(/[\d.]+\)$/, `${tintAlpha * 0.6})`))
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.08)')
  }

  ctx.fillStyle = grad
  ctx.fill()

  // 3. Specular highlight line (top reflection)
  if (state !== 'disabled') {
    ctx.save()
    ctx.clip()
    ctx.beginPath()
    ctx.moveTo(x + r, y + 1)
    ctx.lineTo(x + w - r, y + 1)
    ctx.strokeStyle = state === 'hover' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.65)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.restore()
  }

  // 4. Glowing glass border
  ctx.lineWidth = state === 'hover' ? 1.5 : 1
  if (state === 'disabled') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
  } else if (state === 'hover') {
    ctx.strokeStyle = preset.border
    ctx.shadowColor = preset.glow
    ctx.shadowBlur = 10
  } else {
    ctx.strokeStyle = config.borderGlow ? preset.border : 'rgba(255, 255, 255, 0.40)'
    ctx.shadowColor = preset.glow
    ctx.shadowBlur = config.borderGlow ? 5 : 0
  }
  ctx.stroke()

  ctx.restore()
}

/**
 * Generate separate 200x20 button PNGs for 1.20.2+
 */
export function generateModernButtonPng(
  config: ButtonThemeConfig,
  state: 'normal' | 'hover' | 'disabled'
): string {
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 20
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  drawGlassButton(ctx, 0.5, 0.5, 199, 19, config, state)
  return canvas.toDataURL('image/png')
}

/**
 * Generate Minecraft legacy 1.16 - 1.20.1 `widgets.png` sprite sheet (256x256).
 * In vanilla widgets.png:
 * - y: 46-65, x: 0-199 is Disabled button
 * - y: 66-85, x: 0-199 is Normal button
 * - y: 86-105, x: 0-199 is Hover button
 */
export function generateLegacyWidgetsPng(config: ButtonThemeConfig): string {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // Row 1: Disabled (y=46)
  drawGlassButton(ctx, 0, 46, 200, 20, config, 'disabled')
  // Row 2: Normal (y=66)
  drawGlassButton(ctx, 0, 66, 200, 20, config, 'normal')
  // Row 3: Hover (y=86)
  drawGlassButton(ctx, 0, 86, 200, 20, config, 'hover')

  return canvas.toDataURL('image/png')
}

/**
 * Generate smooth dark frosted obsidian glass texture for in-world menus & loading screen (dirt.png replacement)
 */
export function generateDirtGlassTexture(config: ButtonThemeConfig): string {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const preset = THEME_PRESETS[config.styleId] || THEME_PRESETS.frosted

  // Smooth dark obsidian gradient (NO harsh dotted patterns)
  const bgGrad = ctx.createLinearGradient(0, 0, 64, 64)
  bgGrad.addColorStop(0, '#090D14')
  bgGrad.addColorStop(1, '#05070B')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 64, 64)

  // Soft translucent ambient sheen
  ctx.fillStyle = preset.bgFill.replace(/[\d.]+\)$/, '0.06)')
  ctx.fillRect(0, 0, 64, 64)

  // Subtle frosted vignette
  const radGrad = ctx.createRadialGradient(32, 32, 0, 32, 32, 45)
  radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.02)')
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)')
  ctx.fillStyle = radGrad
  ctx.fillRect(0, 0, 64, 64)

  return canvas.toDataURL('image/png')
}

/**
 * Generate custom Minecraft Title Logo (minecraft.png, 256x64 or 512x128)
 */
export function generateTitleLogoPng(titleText: string, accentColor: string): string {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  ctx.clearRect(0, 0, 512, 128)

  const text = (titleText || 'ASTRIXMC').toUpperCase()
  ctx.font = '900 64px "Montserrat", "Inter", "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const cx = 256
  const cy = 64

  // Outer ambient neon glow
  ctx.save()
  ctx.shadowColor = accentColor || '#FF3154'
  ctx.shadowBlur = 24
  ctx.fillStyle = accentColor || '#FF3154'
  ctx.fillText(text, cx, cy)
  ctx.restore()

  // 3D Drop shadow layers
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
  ctx.fillText(text, cx + 4, cy + 4)

  // Metallic Glass Gradient
  const grad = ctx.createLinearGradient(cx, cy - 30, cx, cy + 30)
  grad.addColorStop(0, '#FFFFFF')
  grad.addColorStop(0.4, '#E2E8F0')
  grad.addColorStop(0.5, '#94A3B8')
  grad.addColorStop(1, '#FFFFFF')
  ctx.fillStyle = grad
  ctx.fillText(text, cx, cy)

  // Crisp border stroke
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.strokeText(text, cx, cy)

  return canvas.toDataURL('image/png')
}

/**
 * Generate edition logo (edition.png, 256x32)
 */
export function generateEditionLogoPng(subtitleText: string): string {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  ctx.clearRect(0, 0, 256, 32)
  const text = (subtitleText || 'GLASS CLIENT EDITION').toUpperCase()

  ctx.font = 'bold 16px "Montserrat", "Inter", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Subtle glow
  ctx.shadowColor = '#00D2FF'
  ctx.shadowBlur = 6
  ctx.fillStyle = '#E0F2FE'
  ctx.fillText(text, 128, 16)

  return canvas.toDataURL('image/png')
}

/**
 * Loads an image from a URL or dataURL and fits it to a 1024x1024 panorama face
 */
export async function createPanoramaFaceFromImage(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 1024
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve('')
        return
      }

      // Cover scaling
      const scale = Math.max(1024 / img.width, 1024 / img.height)
      const w = img.width * scale
      const h = img.height * scale
      const x = (1024 - w) / 2
      const y = (1024 - h) / 2

      ctx.drawImage(img, x, y, w, h)

      // Slight cinematic color tone and vignette
      const vig = ctx.createRadialGradient(512, 512, 200, 512, 512, 700)
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)')
      vig.addColorStop(1, 'rgba(0, 0, 0, 0.45)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, 1024, 1024)

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      resolve('')
    }
    img.src = imageSrc
  })
}

/**
 * Loads an image and fits it to 1920x1080 (16:9 widescreen) for the STILL non-rotating background.
 * In Minecraft, panorama_overlay.png is blitted as a static 2D screen quad over the 3D rotating box.
 * Supplying this 16:9 wallpaper locks the background in place so it DOES NOT ROTATE!
 */
export async function createStillWallpaperFromImage(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1920
      canvas.height = 1080
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve('')
        return
      }

      // Cover scaling 16:9
      const scale = Math.max(1920 / img.width, 1080 / img.height)
      const w = img.width * scale
      const h = img.height * scale
      const x = (1920 - w) / 2
      const y = (1080 - h) / 2

      ctx.drawImage(img, x, y, w, h)

      // Slight subtle ambient shading so white text and buttons pop
      const grad = ctx.createLinearGradient(0, 0, 0, 1080)
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.18)')
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.02)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.28)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 1920, 1080)

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      resolve('')
    }
    img.src = imageSrc
  })
}
