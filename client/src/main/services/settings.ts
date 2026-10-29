import { readJSONFile, writeJSONFile } from './store'

export interface LauncherSettings {
  /** Path to javaw.exe / java executable used when an instance has no override */
  javaPath: string
  /** Memory limits in GB applied at launch */
  memoryMin: number
  memoryMax: number
  /** Base directory for game files (defaults inside launcher data) */
  gameDirectory: string
  /** Include snapshot / beta versions in version lists */
  showSnapshots: boolean
  /** Keep running in the system tray when the window is closed */
  minimizeToTray: boolean
  /** Hide the launcher window once the game starts */
  closeOnLaunch: boolean
  /** Check for mod/launcher updates automatically */
  autoCheckUpdates: boolean
  /** Optional CurseForge API key (Modrinth needs none) */
  curseforgeApiKey: string
  /** Enable Feather-style custom in-game title screen and client UI */
  customClientUi: boolean
  /** UI theme preference (persisted; crimson, dark, light, custom, etc.) */
  theme: string
  customTheme?: any
  // FastClient-style settings
  startOnBoot?: boolean
  hide3dCharacter?: boolean
  discordRpc?: boolean
  soundEffects?: boolean
  hardwareAcceleration?: boolean
  rpcConfig?: DiscordRpcConfig
  simultaneousDownloads?: number
  jvmArgs?: string
  useAikarZgc?: boolean
  fullscreen?: boolean
  windowWidth?: number
  windowHeight?: number
  highPriorityProcess?: boolean
  forceDiscreteGpu?: boolean
  centerWindow?: boolean
}

export interface DiscordRpcConfig {
  clientId?: string
  enabled?: boolean
  launcherDetails?: string
  launcherState?: string
  gameDetails?: string
  gameState?: string
  showTimestamps?: boolean
  largeImageKey?: string
  largeImageText?: string
  smallImageKey?: string
  smallImageText?: string
  button1Label?: string
  button1Url?: string
  button2Label?: string
  button2Url?: string
}

const DEFAULTS: LauncherSettings = {
  javaPath: '',
  memoryMin: 2,
  memoryMax: 4,
  gameDirectory: '',
  showSnapshots: false,
  minimizeToTray: true,
  closeOnLaunch: false,
  autoCheckUpdates: true,
  customClientUi: true,
  curseforgeApiKey: '',
  theme: 'dark',
  startOnBoot: false,
  hide3dCharacter: false,
  discordRpc: true,
  soundEffects: true,
  hardwareAcceleration: true,
  rpcConfig: {
    clientId: '1526903059857543218',
    enabled: true,
    launcherDetails: 'Astrix Client v4.2',
    launcherState: 'Idling in Launcher Deck',
    gameDetails: 'Playing Minecraft {version}',
    gameState: 'In-Game Session',
    showTimestamps: true,
    largeImageKey: 'minecraft',
    largeImageText: 'AstrixMC Client',
    smallImageKey: 'astrix',
    smallImageText: 'alone.deskhost.fun',
    button1Label: 'Join Astrix Discord',
    button1Url: 'https://discord.gg/FR9pXG2Mwb',
    button2Label: 'Astrix Web Deck',
    button2Url: 'https://astrixmc.net'
  },
  simultaneousDownloads: 6,
  jvmArgs: '',
  useAikarZgc: true,
  fullscreen: false,
  windowWidth: 1280,
  windowHeight: 720,
  highPriorityProcess: true,
  forceDiscreteGpu: true,
  centerWindow: true
}

export function getSettings(): LauncherSettings {
  return readJSONFile('settings', DEFAULTS)
}

export function setSettings(patch: Partial<LauncherSettings>): LauncherSettings {
  const next = { ...getSettings(), ...patch }
  writeJSONFile('settings', next)
  return next
}

export function resetSettings(): LauncherSettings {
  writeJSONFile('settings', DEFAULTS)
  return DEFAULTS
}
