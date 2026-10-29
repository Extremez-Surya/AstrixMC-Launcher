import { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { is } from '@electron-toolkit/utils'
import { IPC_CHANNELS } from '../shared/types/ipc'
import { registerAuthIPC } from './ipc/auth.ipc'
import { registerLaunchIPC } from './ipc/launch.ipc'
import { registerInstancesIPC } from './ipc/instances.ipc'
import { registerModsIPC } from './ipc/mods.ipc'
import { registerSettingsIPC } from './ipc/settings.ipc'
import { registerCosmeticsIpc } from './ipc/cosmetics.ipc'
import { registerServersIPC } from './ipc/servers.ipc'
import { discordRpcService } from './services/discord-rpc'
import { getSettings } from './services/settings'
import { launchEngine } from './services/launcher/launch-engine'
import { initAutoUpdater } from './services/auto-updater'

// Enforce single instance lock to prevent duplicate launcher processes in Task Manager
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show()
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

function getTrayIcon(): nativeImage {
  const candidatePaths = [
    join(__dirname, '../../resources/icon.ico'),
    join(process.resourcesPath, 'resources', 'icon.ico'),
    join(process.resourcesPath, 'icon.ico'),
    join(app.getAppPath(), 'resources', 'icon.ico'),
    join(__dirname, '../../../resources/icon.ico')
  ]
  for (const p of candidatePaths) {
    if (existsSync(p)) {
      try {
        const img = nativeImage.createFromPath(p)
        if (!img.isEmpty()) return img
      } catch {}
    }
  }
  // Safe embedded fallback so Tray is GUARANTEED to appear even if icon file path shifts
  return nativeImage.createFromBuffer(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA7SURBVDhPY/wPBAxUAIwMjAxQmgFNAQ7N+A2gqRm/ATQ1g89gYjWDMxghmhEZjBDNiAxGiGZ0v7EAADs5BhH+zBwYAAAAAElFTkSuQmCC',
      'base64'
    )
  )
}

function createTray(): void {
  try {
    const icon = getTrayIcon()
    tray = new Tray(icon)
    tray.setToolTip('AstrixMC Launcher v1.0.1')
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open AstrixMC Launcher',
        click: () => {
          if (mainWindow) {
            if (!mainWindow.isVisible()) mainWindow.show()
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Exit Launcher Completely',
        click: () => {
          isQuitting = true
          if (tray) {
            tray.destroy()
            tray = null
          }
          app.quit()
        }
      }
    ])
    tray.setContextMenu(contextMenu)

    // Left click toggles window
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.focus()
        }
      }
    })

    tray.on('double-click', () => {
      if (mainWindow) {
        if (!mainWindow.isVisible()) mainWindow.show()
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })
  } catch (err) {
    console.warn('[Tray] Failed to initialize tray:', err)
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    title: 'AstrixMC Launcher',
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#101726',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false
    }
  })

  // Show window when ready
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    // If Minecraft is already running, notify renderer so UI immediately enters Playing state
    try {
      if (launchEngine.isRunning()) {
        mainWindow?.webContents.send(IPC_CHANNELS.LAUNCH_PROGRESS, {
          stage: 'running',
          progress: 100,
          message: 'Minecraft is running!'
        })
      }
    } catch {}
  })

  // Prevent window destroy on close if minimizeToTray is active and tray exists
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      const settings = getSettings()
      if (settings.minimizeToTray && tray) {
        e.preventDefault()
        mainWindow?.hide()
        return false
      }
      isQuitting = true
    }
    return true
  })

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Notify renderer of maximize state changes
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximize-change', true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximize-change', false)
  })

  // Initialize in-app auto updater
  try {
    initAutoUpdater(mainWindow)
  } catch (err) {
    console.warn('[Main] Auto-updater init warning:', err)
  }

  // Load the renderer
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Window control IPC handlers
function registerWindowIPC(): void {
  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    mainWindow?.minimize()
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
    const settings = getSettings()
    if (settings.minimizeToTray && tray) {
      mainWindow?.hide()
    } else {
      isQuitting = true
      mainWindow?.close()
      app.quit()
    }
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => {
    return mainWindow?.isMaximized() ?? false
  })
}

// App lifecycle
app.whenReady().then(() => {
  registerWindowIPC()
  registerAuthIPC()
  registerLaunchIPC()
  registerInstancesIPC()
  registerModsIPC()
  registerSettingsIPC()
  registerCosmeticsIpc()
  registerServersIPC()

  // Check if Minecraft was already running before launcher started
  try {
    launchEngine.checkRunningGame()
  } catch (err) {
    console.warn('[Main] Check running game error:', err)
  }

  createWindow()
  createTray()

  // Initialize Discord Rich Presence
  try {
    discordRpcService.init()
  } catch (err) {
    console.warn('[Main] Discord RPC init error:', err)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
})

app.on('before-quit', () => {
  isQuitting = true
  if (tray) {
    try {
      tray.destroy()
    } catch {}
    tray = null
  }
  try {
    discordRpcService.disconnect()
  } catch {}
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    const settings = getSettings()
    if (!settings.minimizeToTray || !tray) {
      isQuitting = true
      app.quit()
    }
  }
})
