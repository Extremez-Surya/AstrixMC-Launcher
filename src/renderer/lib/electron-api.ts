import type { ElectronAPI } from '../../preload/index'

export type { ElectronAPI }

/**
 * Access the preload bridge safely.
 */
export function getElectronAPI(): ElectronAPI | undefined {
  return (window as unknown as { electronAPI?: ElectronAPI }).electronAPI
}
