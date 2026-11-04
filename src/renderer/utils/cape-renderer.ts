/**
 * Utility to generate high-fidelity 2.5D Steve-with-Cape back view previews
 * matching SKlauncher and TLauncher card layouts.
 */

export function generateSteveBackViewWithCape(capeTextureUrl: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      return resolve('')
    }

    const canvas = document.createElement('canvas')
    canvas.width = 120
    canvas.height = 160
    const ctx = canvas.getContext('2d')
    if (!ctx) return resolve('')

    ctx.imageSmoothingEnabled = false

    const capeImg = new Image()
    capeImg.crossOrigin = 'anonymous'
    capeImg.onload = () => {
      // 1. Draw Steve from Back
      // Background transparent
      ctx.clearRect(0, 0, 120, 160)

      // Hair (Head from back: 32x32 centered at x: 44, y: 16)
      ctx.fillStyle = '#2B1A0E'
      ctx.fillRect(44, 16, 32, 32)
      // Hair texture depth
      ctx.fillStyle = '#3E2715'
      ctx.fillRect(48, 16, 24, 10)
      ctx.fillRect(44, 26, 8, 16)
      ctx.fillRect(68, 26, 8, 16)

      // Arms (left: 26..42, right: 78..94, y: 48..96)
      ctx.fillStyle = '#008B8B'
      ctx.fillRect(28, 48, 16, 32)
      ctx.fillRect(76, 48, 16, 32)
      // Skin on wrists
      ctx.fillStyle = '#B47A57'
      ctx.fillRect(28, 80, 16, 14)
      ctx.fillRect(76, 80, 16, 14)

      // Legs / Pants (y: 96..144)
      ctx.fillStyle = '#28256B'
      ctx.fillRect(44, 96, 15, 38)
      ctx.fillRect(61, 96, 15, 38)
      // Shoes
      ctx.fillStyle = '#4A4A4A'
      ctx.fillRect(44, 134, 15, 12)
      ctx.fillRect(61, 134, 15, 12)

      // 2. Overlay Cape on Back (centered at x: 38, y: 46, width: 44, height: 70)
      // Subtle ambient shadow behind cape
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
      ctx.fillRect(36, 48, 48, 72)

      // In standard 64x32 cape textures, the BACK face is located at (12, 1) with size 10x16.
      // In 128x64 HD cape textures, it is located at (24, 2) with size 20x32.
      let sx = 12
      let sy = 1
      let sw = 10
      let sh = 16

      if (capeImg.width >= 128) {
        const scale = capeImg.width / 64
        sx = Math.round(12 * scale)
        sy = Math.round(1 * scale)
        sw = Math.round(10 * scale)
        sh = Math.round(16 * scale)
      }

      try {
        ctx.drawImage(capeImg, sx, sy, sw, sh, 38, 46, 44, 70)
      } catch {
        // Fallback draw full image scaled
        ctx.drawImage(capeImg, 38, 46, 44, 70)
      }

      // Cape collar clip (connecting cape to neck)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(42, 45, 36, 3)

      resolve(canvas.toDataURL('image/png'))
    }

    capeImg.onerror = () => {
      resolve('')
    }

    capeImg.src = capeTextureUrl
  })
}

