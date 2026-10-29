import { createHash, randomUUID } from 'crypto'
import type { MinecraftAccount, AuthResult } from '../../../shared/types/auth'
import { saveAccount } from './token-store'

/**
 * Generates an official Minecraft Offline UUID (UUID v3 based on MD5 of "OfflinePlayer:" + username)
 */
export function getOfflineUUID(username: string): string {
  const hash = createHash('md5').update(`OfflinePlayer:${username}`).digest()
  // Set version to 3 (UUIDv3)
  hash[6] = (hash[6] & 0x0f) | 0x30
  // Set variant to IETF
  hash[8] = (hash[8] & 0x3f) | 0x80

  const hex = hash.toString('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function loginOffline(username: string): AuthResult {
  const trimmed = username.trim()
  if (!trimmed || trimmed.length < 3 || trimmed.length > 16) {
    return {
      success: false,
      error: 'Username must be between 3 and 16 characters'
    }
  }

  // Minecraft username regex (alphanumeric and underscores)
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return {
      success: false,
      error: 'Username can only contain letters, numbers, and underscores'
    }
  }

  const uuid = getOfflineUUID(trimmed)
  const account: MinecraftAccount = {
    id: randomUUID(),
    username: trimmed,
    uuid,
    type: 'offline',
    accessToken: '0',
    isDefault: false,
    lastUsed: new Date().toISOString()
  }

  const saved = saveAccount(account)
  return {
    success: true,
    account: saved
  }
}
