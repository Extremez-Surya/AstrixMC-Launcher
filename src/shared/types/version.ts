export interface MinecraftVersion {
  id: string
  type: 'release' | 'snapshot' | 'old_beta' | 'old_alpha'
  url: string
  releaseTime: string
}

export interface JavaInstallation {
  path: string
  version: string
  is64Bit: boolean
}

export interface LaunchProgress {
  stage: 'idle' | 'preparing' | 'downloading' | 'extracting' | 'launching' | 'running' | 'error'
  progress: number // 0-100
  message: string
  speed?: string
}
