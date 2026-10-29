import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { IPC_CHANNELS } from '../../shared/types/ipc'

export interface UpdateStatus {
  state: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  version?: string
  percent?: number
  bytesPerSecond?: number
  transferred?: number
  total?: number
  releaseNotes?: string
  error?: string
}

let currentStatus: UpdateStatus = { state: 'idle' }
let targetWindow: BrowserWindow | null = null

function sendUpdateStatus(status: UpdateStatus) {
  currentStatus = status
  if (targetWindow && !targetWindow.isDestroyed()) {
    targetWindow.webContents.send(IPC_CHANNELS.UPDATER_STATUS, status)
  }
}

export function initAutoUpdater(win: BrowserWindow) {
  targetWindow = win

  // Auto-download when update is found
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.allowPrerelease = false

  // Disable in development so it doesn't throw dev-app-update.yml errors
  if (!app.isPackaged) {
    console.log('[AutoUpdater] Development mode: Auto-updater active but skipping automatic check.')
  }

  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Checking for updates...')
    sendUpdateStatus({ state: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Update available:', info.version)
    sendUpdateStatus({
      state: 'available',
      version: info.version,
      releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : undefined
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('[AutoUpdater] Update not available. Current version is latest:', info.version)
    sendUpdateStatus({ state: 'not-available', version: info.version })
  })

  autoUpdater.on('download-progress', (progressObj) => {
    sendUpdateStatus({
      state: 'downloading',
      percent: Math.round(progressObj.percent),
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[AutoUpdater] Update downloaded successfully:', info.version)
    sendUpdateStatus({
      state: 'downloaded',
      version: info.version
    })
  })

  autoUpdater.on('error', (err) => {
    // Fail silently in background without popping up XML stack traces on player screens
    console.warn('[AutoUpdater] Silent check notice:', err?.message || err)
    sendUpdateStatus({
      state: 'idle'
    })
  })

  // IPC Handlers
  ipcMain.handle(IPC_CHANNELS.UPDATER_CHECK, async () => {
    try {
      if (!app.isPackaged) {
        return { success: false, message: 'Auto-update is only available in packaged app builds.' }
      }
      const checkResult = await autoUpdater.checkForUpdates()
      return { success: true, version: checkResult?.updateInfo?.version }
    } catch (err: any) {
      return { success: false, error: err?.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.UPDATER_RESTART_AND_INSTALL, () => {
    try {
      // isSilent: false, isForceRunAfter: true
      autoUpdater.quitAndInstall(false, true)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message }
    }
  })

  // Automatically check for updates 3 seconds after launcher starts (in production)
  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        console.warn('[AutoUpdater] Initial check error:', err?.message)
      })
    }, 3000)
  }
}

export function getCurrentUpdateStatus(): UpdateStatus {
  return currentStatus
}

