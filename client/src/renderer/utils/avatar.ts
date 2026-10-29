import type { MinecraftAccount } from '../../shared/types/auth'

/**
 * Returns a reliable avatar image URL for a Minecraft account,
 * taking into account custom player skins (e.g. TechnoBlade) or custom uploaded skins.
 */
export function getAccountAvatar(account: MinecraftAccount | null | undefined, size = 100): string {
  if (!account) return `https://mc-heads.net/avatar/Steve/${size}`

  // If user applied another player's skin (e.g. TechnoBlade, Dream)
  if (account.skinPlayerName) {
    return `https://mc-heads.net/avatar/${encodeURIComponent(account.skinPlayerName)}/${size}`
  }

  // If user applied a minotar skin URL with username
  if (account.skinUrl && !account.skinUrl.startsWith('data:') && !account.skinUrl.includes('/avatar/')) {
    const parts = account.skinUrl.split('/')
    const name = parts[parts.length - 1]
    if (name && name !== account.username) {
      return `https://mc-heads.net/avatar/${encodeURIComponent(name)}/${size}`
    }
  }

  // If user uploaded a custom skin with an extracted head data URL
  if (account.skinUrl?.startsWith('data:')) {
    return account.skinUrl
  }

  return `https://mc-heads.net/avatar/${encodeURIComponent(account.username || 'Steve')}/${size}`
}

/**
 * Returns a 3D bust / body URL for a Minecraft account.
 */
export function getAccountBody(account: MinecraftAccount | null | undefined, size = 240): string {
  if (!account) return `https://mc-heads.net/body/Steve/${size}`

  if (account.skinPlayerName) {
    return `https://mc-heads.net/body/${encodeURIComponent(account.skinPlayerName)}/${size}`
  }

  if (account.skinUrl && !account.skinUrl.startsWith('data:') && !account.skinUrl.includes('/avatar/')) {
    const parts = account.skinUrl.split('/')
    const name = parts[parts.length - 1]
    if (name && name !== account.username) {
      return `https://mc-heads.net/body/${encodeURIComponent(name)}/${size}`
    }
  }

  return `https://mc-heads.net/body/${encodeURIComponent(account.username || 'Steve')}/${size}`
}
