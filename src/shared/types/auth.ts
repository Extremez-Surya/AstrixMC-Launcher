export interface MinecraftAccount {
  id: string
  username: string
  uuid: string
  type: 'microsoft' | 'offline'
  skinUrl?: string
  skinType?: 'default' | 'player' | 'custom'
  skinPlayerName?: string
  customSkinModel?: 'classic' | 'slim'
  capeId?: string
  capeUrl?: string
  capeEnabled?: boolean
  accessToken: string
  refreshToken?: string
  xuid?: string
  isDefault: boolean
  lastUsed?: string
}

export interface AuthResult {
  success: boolean
  account?: MinecraftAccount
  error?: string
}
