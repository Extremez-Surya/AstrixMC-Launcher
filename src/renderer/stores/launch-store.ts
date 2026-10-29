import { create } from 'zustand'
import type { LaunchProgress } from '../../shared/types/version'

interface LaunchState {
  isLaunching: boolean
  isPlaying: boolean
  progress: LaunchProgress | null
  logs: string[]
  error: string | null

  checkGameStatus: () => Promise<void>
  launchGame: (instanceId?: string, serverAddress?: string) => Promise<boolean>
  stopGame: () => Promise<boolean>
  clearLogs: () => void
  setProgress: (progress: LaunchProgress) => void
  addLog: (log: string) => void
  addLogs: (newLogs: string[]) => void
}

export const useLaunchStore = create<LaunchState>((set, get) => ({
  isLaunching: false,
  isPlaying: false,
  progress: null,
  logs: [],
  error: null,

  clearLogs: () => set({ logs: [] }),

  checkGameStatus: async () => {
    try {
      if (window.electronAPI?.getLaunchStatus) {
        const status = await window.electronAPI.getLaunchStatus()
        if (status?.isRunning) {
          set({
            isPlaying: true,
            isLaunching: false,
            progress: {
              stage: 'running',
              progress: 100,
              message: `Minecraft ${status.mcVersion || ''} is running`
            }
          })
        } else {
          const current = get()
          if (current.isPlaying) {
            set({ isPlaying: false, isLaunching: false, progress: null })
          }
        }
      }
    } catch (err) {
      console.warn('[LaunchStore] checkGameStatus error:', err)
    }
  },

  setProgress: (progress) => {
    set({ progress })
    if (progress.stage === 'running') {
      set({ isLaunching: false, isPlaying: true })
    } else if (progress.stage === 'error') {
      set({ isLaunching: false, isPlaying: false, error: progress.message })
    } else if (progress.stage === 'idle') {
      set({ isLaunching: false, isPlaying: false, progress: null })
    }
  },

  addLog: (log) => {
    set((state) => ({ logs: [...state.logs.slice(-300), log] }))
  },

  addLogs: (newLogs) => {
    if (!newLogs.length) return
    set((state) => ({ logs: [...state.logs.slice(-300), ...newLogs] }))
  },

  launchGame: async (instanceId?: string, serverAddress?: string) => {
    set({ isLaunching: true, error: null, progress: { stage: 'preparing', progress: 0, message: 'Initiating launch...' } })
    try {
      if (!window.electronAPI?.launchGame) {
        throw new Error('Electron API not available')
      }
      const res = await window.electronAPI.launchGame({ instanceId: instanceId || '', serverAddress })
      if (!res.success) {
        set({
          isLaunching: false,
          isPlaying: false,
          error: res.error || 'Failed to start Minecraft'
        })
        return false
      }
      return true
    } catch (err) {
      set({
        isLaunching: false,
        isPlaying: false,
        error: err instanceof Error ? err.message : 'Launch failed'
      })
      return false
    }
  },

  stopGame: async () => {
    set({ isPlaying: false, isLaunching: false, progress: null })
    try {
      if (window.electronAPI?.stopGame) {
        await window.electronAPI.stopGame()
      }
      return true
    } catch {
      return true
    }
  }
}))
