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
import { registerPresetsIPC } from './ipc/presets.ipc'
import { ensureDefaultAstrixPreset } from './services/presets/preset-manager'
import { discordRpcService } from './services/discord-rpc'
import { getSettings } from './services/settings'
import { launchEngine } from './services/launcher/launch-engine'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

function getIconPath(): string {
  const asarPath = join(__dirname, '../../resources/icon.ico')
  if (existsSync(asarPath)) return asarPath
  const extraPath = join(process.resourcesPath, 'resources/icon.ico')
  if (existsSync(extraPath)) return extraPath
  const directPath = join(process.resourcesPath, 'icon.ico')
  if (existsSync(directPath)) return directPath
  return asarPath
}

function createTray(): void {
  const iconPath = getIconPath()
  if (existsSync(iconPath)) {
    try {
      const icon = nativeImage.createFromPath(iconPath)
      tray = new Tray(icon)
      tray.setToolTip('Astrix Client v4.2')
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Open Astrix Client',
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
          label: 'Exit Astrix Client',
          click: () => {
            isQuitting = true
            app.quit()
          }
        }
      ])
      tray.setContextMenu(contextMenu)
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
}

function createWindow(): void {
  const iconPath = getIconPath()
  mainWindow = new BrowserWindow({
    title: 'Astrix Client',
    icon: existsSync(iconPath) ? iconPath : undefined,
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
  mainWindow.once('ready-to-show', () => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show()
      mainWindow.focus()
    }
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

  // Safety fallback: ensure window is forced visible if ready-to-show delays on low-end hardware
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show()
      mainWindow.focus()
    }
  }, 1200)

  // Prevent window destroy on close if minimizeToTray is active
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      const settings = getSettings()
      if (settings.minimizeToTray) {
        e.preventDefault()
        mainWindow?.hide()
        return false
      }
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
    if (settings.minimizeToTray) {
      mainWindow?.hide()
    } else {
      isQuitting = true
      mainWindow?.close()
    }
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => {
    return mainWindow?.isMaximized() ?? false
  })
}

// App lifecycle - Single instance lock to prevent duplicate ghost processes
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

  app.setName('Astrix Client')
  app.whenReady().then(() => {
    try {
      app.setAppUserModelId('com.astrixmc.client')
    } catch {}
    registerWindowIPC()
    registerAuthIPC()
    registerLaunchIPC()
    registerInstancesIPC()
    registerModsIPC()
    registerSettingsIPC()
    registerCosmeticsIpc()
    registerServersIPC()
    registerPresetsIPC()

    // Ensure flagship Astrix Client preset is available
    try {
      ensureDefaultAstrixPreset().catch(() => {})
    } catch {}

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
}

app.on('before-quit', () => {
  isQuitting = true
  try {
    discordRpcService.disconnect()
  } catch {}
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    const settings = getSettings()
    if (!settings.minimizeToTray) {
      app.quit()
    }
  }
})
