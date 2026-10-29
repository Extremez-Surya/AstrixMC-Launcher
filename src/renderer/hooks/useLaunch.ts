import { useEffect } from 'react'
import { useLaunchStore } from '../stores/launch-store'

export function useLaunch() {
  const store = useLaunchStore()

  useEffect(() => {
    // Check if Minecraft was already running before launcher was opened
    store.checkGameStatus()

    const pollTimer = setInterval(() => {
      // Only poll status if game is launching or playing to save background CPU
      const state = useLaunchStore.getState()
      if (state.isPlaying || state.isLaunching) {
        state.checkGameStatus()
      }
    }, 4000)

    let cleanupProgress: any
    let cleanupLog: any
    let pendingLogs: string[] = []
    let flushTimer: any = null

    if (window.electronAPI?.onLaunchProgress) {
      cleanupProgress = window.electronAPI.onLaunchProgress((progress) => {
        store.setProgress(progress)
      })
    }

    if (window.electronAPI?.onLaunchLog) {
      cleanupLog = window.electronAPI.onLaunchLog((log) => {
        pendingLogs.push(log)
        if (!flushTimer) {
          flushTimer = setTimeout(() => {
            if (pendingLogs.length > 0) {
              store.addLogs(pendingLogs)
              pendingLogs = []
            }
            flushTimer = null
          }, 300)
        }
      })
    }

    return () => {
      clearInterval(pollTimer)
      if (flushTimer) clearTimeout(flushTimer)
      if (typeof cleanupProgress === 'function') cleanupProgress()
      if (typeof cleanupLog === 'function') cleanupLog()
    }
  }, [])

  return store
}
