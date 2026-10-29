/**
 * Utility for rendering 2D/2.5D Minecraft skin previews from standard 64x64 or 64x32 PNG textures.
 */

export function generateSkinBodyDataUrl(
  img: HTMLImageElement,
  model: 'classic' | 'slim' = 'classic',
  width = 240,
  height = 360
): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  ctx.clearRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = false

  const s = Math.floor(height / 38)
  const totalW = 16 * s
  const totalH = 32 * s
  const dx = Math.floor((width - totalW) / 2)
  const dy = Math.floor((height - totalH) / 2)

  // 1. Head + Hat (Layer 1 + 2)
  ctx.drawImage(img, 8, 8, 8, 8, dx + 4 * s, dy, 8 * s, 8 * s)
  ctx.drawImage(img, 40, 8, 8, 8, dx + 4 * s, dy, 8 * s, 8 * s)

  // 2. Torso + Jacket
  ctx.drawImage(img, 20, 20, 8, 12, dx + 4 * s, dy + 8 * s, 8 * s, 12 * s)
  if (img.height >= 64) {
    ctx.drawImage(img, 20, 36, 8, 12, dx + 4 * s, dy + 8 * s, 8 * s, 12 * s)
  }

  // 3. Right Arm + Sleeve
  const armW = model === 'slim' ? 3 * s : 4 * s
  ctx.drawImage(img, 44, 20, 4, 12, dx + 4 * s - armW, dy + 8 * s, armW, 12 * s)
  if (img.height >= 64) {
    ctx.drawImage(img, 44, 36, 4, 12, dx + 4 * s - armW, dy + 8 * s, armW, 12 * s)
  }

  // 4. Left Arm + Sleeve
  if (img.height >= 64) {
    ctx.drawImage(img, 36, 52, 4, 12, dx + 12 * s, dy + 8 * s, armW, 12 * s)
    ctx.drawImage(img, 52, 52, 4, 12, dx + 12 * s, dy + 8 * s, armW, 12 * s)
  } else {
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(img, 44, 20, 4, 12, -(dx + 12 * s + armW), dy + 8 * s, armW, 12 * s)
    ctx.restore()
  }

  // 5. Right Leg + Pants
  ctx.drawImage(img, 4, 20, 4, 12, dx + 4 * s, dy + 20 * s, 4 * s, 12 * s)
  if (img.height >= 64) {
    ctx.drawImage(img, 4, 36, 4, 12, dx + 4 * s, dy + 20 * s, 4 * s, 12 * s)
  }

  // 6. Left Leg + Pants
  if (img.height >= 64) {
    ctx.drawImage(img, 20, 52, 4, 12, dx + 8 * s, dy + 20 * s, 4 * s, 12 * s)
    ctx.drawImage(img, 0, 52, 4, 12, dx + 8 * s, dy + 20 * s, 4 * s, 12 * s)
  } else {
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(img, 4, 20, 4, 12, -(dx + 12 * s), dy + 20 * s, 4 * s, 12 * s)
    ctx.restore()
  }

  return canvas.toDataURL('image/png')
}

export function generateSkinHeadDataUrl(img: HTMLImageElement, size = 128): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  ctx.clearRect(0, 0, size, size)
  ctx.imageSmoothingEnabled = false

  const s = Math.floor(size / 8)
  ctx.drawImage(img, 8, 8, 8, 8, 0, 0, 8 * s, 8 * s)
  ctx.drawImage(img, 40, 8, 8, 8, 0, 0, 8 * s, 8 * s)

  return canvas.toDataURL('image/png')
}
