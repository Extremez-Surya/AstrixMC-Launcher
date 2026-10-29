import type { JavaInstallation, LaunchProgress, MinecraftVersion } from './version'

/** Options accepted by the `launch:start` IPC call */
export interface LaunchConfig {
  instanceId: string
  /** Overrides the instance default account */
  accountId?: string
  javaPath?: string
  memoryMin?: number
  memoryMax?: number
  resolution?: { width: number; height: number }
  fullscreen?: boolean
  extraJvmArgs?: string
  serverAddress?: string
}

export interface LaunchResult {
  success: boolean
  error?: string
  pid?: number
}

/** Aggregate payload exposed by `launch:*` channels */
export interface LaunchServiceStatus {
  running: boolean
  pid?: number
  instanceId?: string
  startedAt?: string
}

export type { JavaInstallation, LaunchProgress, MinecraftVersion }
