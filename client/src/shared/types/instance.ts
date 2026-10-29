export interface GameInstance {
  id: string
  name: string
  icon: string
  mcVersion: string
  modLoader?: {
    type: 'fabric' | 'forge' | 'quilt' | 'neoforge'
    version: string
  }
  javaPath?: string
  memoryMin: string
  memoryMax: string
  resolution?: { width: number; height: number }
  gameDirectory: string
  jvmArgs?: string
  lastPlayed?: string
  totalPlaytime?: number
  created: string
}
