import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/types/ipc'

const electronAPI = {
  // Window controls
  minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
  close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
  isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED),
  onMaximizeChange: (callback: (maximized: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, maximized: boolean) => callback(maximized)
    ipcRenderer.on('window:maximize-change', handler)
    return () => ipcRenderer.removeListener('window:maximize-change', handler)
  },

  // Auth
  microsoftLogin: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_MICROSOFT_LOGIN),
  offlineLogin: (username: string) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_OFFLINE_LOGIN, username),
  getAccounts: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_GET_ACCOUNTS),
  removeAccount: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_REMOVE_ACCOUNT, id),
  setDefaultAccount: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_SET_DEFAULT, id),
  updateAccount: (id: string, data: any) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_UPDATE_ACCOUNT, id, data),
  refreshAuth: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_REFRESH, id),

  // Launch
  getVersions: () => ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_GET_VERSIONS),
  launchGame: (config: any) => ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_START, config),
  stopGame: () => ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_STOP),
  getLaunchStatus: () => ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_GET_STATUS),
  getJavaInstallations: () => ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_GET_JAVA),
  onLaunchProgress: (callback: (progress: any) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: any) => callback(progress)
    ipcRenderer.on(IPC_CHANNELS.LAUNCH_PROGRESS, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.LAUNCH_PROGRESS, handler)
  },

  // Instances
  getInstances: () => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_LIST),
  createInstance: (data: any) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_CREATE, data),
  updateInstance: (id: string, data: any) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_UPDATE, id, data),
  deleteInstance: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_DELETE, id),
  deleteVersion: (versionId: string) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_DELETE_VERSION, versionId),
  duplicateInstance: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_DUPLICATE, id),
  openInstanceFolder: (id: string, subfolder?: string) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_OPEN_FOLDER, id, subfolder),
  getInstanceDetail: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_GET_DETAIL, id),

  // Mods
  searchMods: (query: any) => ipcRenderer.invoke(IPC_CHANNELS.MODS_SEARCH, query),
  getModDetails: (source: string, id: string) => ipcRenderer.invoke(IPC_CHANNELS.MODS_GET_DETAILS, source, id),
  getModVersions: (source: string, id: string, loader?: string, gameVersion?: string) => ipcRenderer.invoke(IPC_CHANNELS.MODS_GET_VERSIONS, source, id, loader, gameVersion),
  installMod: (data: any) => ipcRenderer.invoke(IPC_CHANNELS.MODS_INSTALL, data),
  removeMod: (instanceId: string, modId: string) => ipcRenderer.invoke(IPC_CHANNELS.MODS_REMOVE, instanceId, modId),
  getInstalledMods: (instanceId: string) => ipcRenderer.invoke(IPC_CHANNELS.MODS_LIST_INSTALLED, instanceId),
  toggleMod: (instanceId: string, modId: string) => ipcRenderer.invoke(IPC_CHANNELS.MODS_TOGGLE, instanceId, modId),
  checkModUpdates: (instanceId: string) => ipcRenderer.invoke(IPC_CHANNELS.MODS_CHECK_UPDATES, instanceId),
  checkFpsCompatibility: (version: string, loader?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.MODS_CHECK_FPS_COMPATIBILITY, version, loader),

  // Settings
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
  setSettings: (settings: any) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings),
  resetSettings: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_RESET),
  getSystemInfo: () =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET_SYSTEM_INFO).catch(() => {
      const mem = (navigator as any)?.deviceMemory || 16
      return {
        cpuModel: 'Intel/AMD Multi-Core Processor',
        cpuCores: navigator.hardwareConcurrency || 8,
        totalRamGb: mem,
        freeRamGb: Math.round(mem * 0.5),
        usedRamGb: Math.round(mem * 0.5),
        platform: 'Windows',
        release: '11',
        arch: 'x64'
      }
    }),
  selectJavaFile: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SELECT_JAVA_FILE).catch(() => null),
  selectWallpaper: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SELECT_WALLPAPER).catch(() => null),
  openSettingsDir: (type: string) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_OPEN_DIR, type).catch(() => false),
  selectDirectory: () => ipcRenderer.invoke('settings:select-directory').catch(() => null),
  setLoginItem: (openAtLogin: boolean) => ipcRenderer.invoke('settings:set-login-item', openAtLogin).catch(() => false),
  getLoginItem: () => ipcRenderer.invoke('settings:get-login-item').catch(() => false),
  testJavaLaunch: (customJavaPath?: string) => ipcRenderer.invoke('settings:test-java', customJavaPath).catch((err: any) => ({ success: false, message: err?.message })),
  cleanCache: () => ipcRenderer.invoke('settings:clean-cache').catch(() => ({ success: false, freedMb: 0, message: 'Failed to clean cache' })),
  checkServices: () => ipcRenderer.invoke('settings:check-services').catch(() => []),
  checkUpdates: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_CHECK_UPDATES).catch(() => ({ hasUpdate: false, currentVersion: '4.2.0' })),

  // Discord Rich Presence & Custom RPC Studio
  getRpcStatus: () => ipcRenderer.invoke(IPC_CHANNELS.RPC_GET_STATUS).catch(() => ({ connected: false })),
  updateRpcPresence: (config?: any) => ipcRenderer.invoke(IPC_CHANNELS.RPC_UPDATE_PRESENCE, config).catch(() => ({ connected: false })),
  toggleRpc: (enabled: boolean) => ipcRenderer.invoke(IPC_CHANNELS.RPC_TOGGLE, enabled).catch(() => ({ connected: false })),
  uploadRpcImage: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPLOAD_RPC_IMAGE).catch(() => null),

  // Prism Launcher & Modrinth File/Log Features
  getInstanceFiles: (instanceId: string, category: string) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_GET_FILES, instanceId, category),
  getInstanceRawFiles: (instanceId: string, subPath?: string) => ipcRenderer.invoke('instances:get-raw-files', instanceId, subPath),
  readInstanceLog: (instanceId: string, logFile?: string) => ipcRenderer.invoke('instances:read-log', instanceId, logFile),
  toggleInstanceFile: (instanceId: string, category: string, fileName: string) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_TOGGLE_FILE, instanceId, category, fileName),
  deleteInstanceFile: (instanceId: string, category: string, fileName: string) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_DELETE_FILE, instanceId, category, fileName),
  backupWorld: (instanceId: string, worldName: string) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_BACKUP_WORLD, instanceId, worldName),
  exportInstance: (instanceId: string) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_EXPORT, instanceId),
  importInstance: () => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_IMPORT),
  uploadLogs: (logContent: string) => ipcRenderer.invoke(IPC_CHANNELS.LOGS_UPLOAD, logContent),
  onLaunchLog: (callback: (log: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, log: string) => callback(log)
    ipcRenderer.on('launch:log', handler)
    return () => ipcRenderer.removeListener('launch:log', handler)
  },
  getCurrentLogs: (instanceId?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_GET_CURRENT_LOGS, instanceId).catch(() => []),
  clearCurrentLogs: (instanceId?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_CLEAR_CURRENT_LOGS, instanceId).catch(() => true),

  // Cosmetics & Skins
  getCosmetics: () => ipcRenderer.invoke(IPC_CHANNELS.COSMETICS_GET),
  saveCosmetics: (data: any) => ipcRenderer.invoke(IPC_CHANNELS.COSMETICS_SAVE, data),
  uploadSkin: (data: { base64Data: string; model: 'classic' | 'slim' }) => ipcRenderer.invoke(IPC_CHANNELS.COSMETICS_UPLOAD_SKIN, data),
  syncMojangSkin: () => ipcRenderer.invoke(IPC_CHANNELS.COSMETICS_SYNC_MOJANG),

  // Server Finder
  fetchPublicServers: (page?: number, tag?: string, search?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SERVERS_FETCH_PUBLIC, page, tag, search),
  pingServerStatus: (host: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SERVERS_PING_STATUS, host),

  // Client In-Game Title Screen & UI Studio
  applyClientTheme: (data: any) =>
    ipcRenderer.invoke(IPC_CHANNELS.CLIENT_UI_APPLY_THEME, data),
  getClientTheme: () =>
    ipcRenderer.invoke(IPC_CHANNELS.CLIENT_UI_GET_THEME),

  // Astrix Presets & Client Profiles
  getPresets: () => ipcRenderer.invoke(IPC_CHANNELS.PRESETS_GET_ALL).catch(() => []),
  ensureDefaultPreset: () => ipcRenderer.invoke(IPC_CHANNELS.PRESETS_ENSURE_DEFAULT),
  installOrSyncPreset: (instanceId: string) => ipcRenderer.invoke(IPC_CHANNELS.PRESETS_INSTALL_OR_SYNC, instanceId)
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type declaration for renderer
export type ElectronAPI = typeof electronAPI
