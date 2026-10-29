import { Client } from 'minecraft-launcher-core'
import { BrowserWindow } from 'electron'
import type { LaunchConfig, LaunchResult, LaunchProgress } from '../../../shared/types/launch'
import { getDefaultAccount, getSavedAccounts } from '../auth/token-store'
import { refreshMicrosoftAccount } from '../auth/microsoft'
import { detectJavaInstallations, findBestJavaForVersion, parseJavaMajorVersion, normalizeJavaExe } from './java-manager'
import { getSettings } from '../settings'
import { IPC_CHANNELS } from '../../../shared/types/ipc'
import { join } from 'path'
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, readFileSync, writeFileSync } from 'fs'
import { spawn, execSync } from 'child_process'
import os from 'os'
import { getInstancesRoot, getLauncherRoot } from '../store'
import { getInstance, updateInstance } from '../instances/instance-manager'
import { prepareModLoader } from '../modloaders/loader-manager'
import { discordRpcService } from '../discord-rpc'

// Modern, ultra-smooth G1GC client optimization flags for high FPS without memory freeze
const FPS_BOOST_JVM_ARGS = [
  '-XX:+UnlockExperimentalVMOptions',
  '-XX:+UseG1GC',
  '-XX:G1NewSizePercent=20',
  '-XX:G1ReservePercent=15',
  '-XX:MaxGCPauseMillis=50',
  '-XX:+DisableExplicitGC',
  '-Diris.update.check=false'
]

function extractXuidFromJwt(token?: string): string | undefined {
  if (!token) return undefined
  try {
    const parts = token.split('.')
    if (parts.length >= 2) {
      const base64Url = parts[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const json = Buffer.from(base64, 'base64').toString('utf8')
      const payload = JSON.parse(json)
      return payload.xuid || payload.sub
    }
  } catch {}
  return undefined
}

export interface RunningGameInfo {
  pid: number
  instanceId?: string
  instanceName?: string
  mcVersion?: string
  serverAddress?: string
  startTime: number
  accountName?: string
}

class LaunchEngine {
  private activeClient: Client | null = null
  private activeProcess: any = null
  private isLaunching = false
  private isGameRunning = false
  private isCancelled = false
  private runningGamePid: number | null = null
  private runningGameInfo: RunningGameInfo | null = null
  private processCheckTimer: NodeJS.Timeout | null = null
  private sessionLogs: string[] = []
  private instanceSessionLogs: Map<string, string[]> = new Map()
  private currentInstanceId: string | null = null

  constructor() {
    // Check if game was already running from previous session on engine instantiation
    setTimeout(() => {
      this.checkRunningGame()
    }, 500)
  }

  public isRunning(): boolean {
    if (this.isLaunching) return true
    if (this.isGameRunning && this.runningGamePid && this.isProcessAlive(this.runningGamePid)) {
      return true
    }
    if (this.activeProcess && this.activeProcess.exitCode === null && !this.activeProcess.killed) {
      return true
    }
    return false
  }

  public getStatus(): { isRunning: boolean; isLaunching: boolean; pid?: number; mcVersion?: string; instanceName?: string } {
    const isRunning = this.checkRunningGame()
    return {
      isRunning,
      isLaunching: this.isLaunching,
      pid: this.runningGamePid || (this.activeProcess ? this.activeProcess.pid : undefined),
      mcVersion: this.runningGameInfo?.mcVersion,
      instanceName: this.runningGameInfo?.instanceName
    }
  }

  private isProcessAlive(pid: number): boolean {
    if (!pid || typeof pid !== 'number' || isNaN(pid) || pid <= 0) return false
    if (this.activeProcess && this.activeProcess.pid === pid) {
      if (this.activeProcess.exitCode === null && !this.activeProcess.killed) {
        return true
      }
    }
    try {
      process.kill(pid, 0)
      return true
    } catch (err: any) {
      // On Windows, EPERM means process exists but we lack permissions to signal it -> IT IS ALIVE
      if (err && err.code === 'EPERM') {
        return true
      }
      return false
    }
  }

  private saveRunningGame(info: RunningGameInfo): void {
    try {
      const filePath = join(getLauncherRoot(), 'running_game.json')
      writeFileSync(filePath, JSON.stringify(info, null, 2), 'utf8')
    } catch (err) {
      console.warn('[LaunchEngine] Failed to save running_game.json:', err)
    }
  }

  private clearRunningGame(): void {
    try {
      const filePath = join(getLauncherRoot(), 'running_game.json')
      if (existsSync(filePath)) {
        unlinkSync(filePath)
      }
    } catch {}
  }

  public checkRunningGame(): boolean {
    // 0. If actively launching, do not interrupt or reset state
    if (this.isLaunching) {
      return true
    }

    // 1. If currently marked running and PID is confirmed alive
    if (this.isGameRunning && this.runningGamePid && this.isProcessAlive(this.runningGamePid)) {
      return true
    }

    // 2. If activeProcess is still running
    if (this.activeProcess && this.activeProcess.pid && this.activeProcess.exitCode === null && !this.activeProcess.killed) {
      this.runningGamePid = this.activeProcess.pid
      this.isGameRunning = true
      return true
    }

    // 3. Check running_game.json persisted from prior launcher run (only attach if we actually started it)
    const filePath = join(getLauncherRoot(), 'running_game.json')
    let loadedInfo: RunningGameInfo | null = null
    if (existsSync(filePath)) {
      try {
        loadedInfo = JSON.parse(readFileSync(filePath, 'utf8'))
      } catch {}
    }

    if (loadedInfo && loadedInfo.pid && this.isProcessAlive(loadedInfo.pid)) {
      this.runningGamePid = loadedInfo.pid
      this.runningGameInfo = loadedInfo
      this.isGameRunning = true
      this.startProcessMonitor(loadedInfo.pid)
      this.updateDiscordRpc(loadedInfo)
      return true
    }

    // Process is no longer alive, clean up if file exists
    if (existsSync(filePath)) {
      this.clearRunningGame()
    }
    // Only notify exited if we were previously tracking a monitored running game
    if (this.isGameRunning) {
      this.handleGameExited(0)
    }
    return false
  }

  private startProcessMonitor(pid: number): void {
    this.stopProcessMonitor()
    this.processCheckTimer = setInterval(() => {
      if (!this.isProcessAlive(pid)) {
        this.sendConsoleLog(`[AstrixMC Launcher] Monitored Minecraft process (${pid}) exited.`)
        this.handleGameExited(0)
      }
    }, 2500)
  }

  private stopProcessMonitor(): void {
    if (this.processCheckTimer) {
      clearInterval(this.processCheckTimer)
      this.processCheckTimer = null
    }
  }

  private updateDiscordRpc(info: RunningGameInfo): void {
    try {
      discordRpcService.setGameState({
        inGame: true,
        version: info.mcVersion || '1.20.4',
        instanceName: info.instanceName || 'Minecraft',
        serverAddress: info.serverAddress,
        player: info.accountName
      })
    } catch (err) {
      console.warn('[LaunchEngine] Discord RPC update error:', err)
    }
  }

  public handleGameExited(code: number | null): void {
    if (!this.isGameRunning && !this.isLaunching && !this.activeProcess && !this.runningGamePid) {
      return
    }
    this.stopProcessMonitor()
    this.clearRunningGame()
    this.isLaunching = false
    this.isGameRunning = false
    this.isCancelled = false
    this.runningGamePid = null
    this.runningGameInfo = null
    this.activeClient = null
    this.activeProcess = null

    try {
      discordRpcService.setGameState({ inGame: false })
    } catch {}

    let exitMsg = ''
    if (code === 0 || code === null) {
      this.sendProgress({
        stage: 'idle',
        progress: 0,
        message: 'Minecraft closed normally'
      })
    } else {
      exitMsg = `Minecraft exited (code ${code}).`
      if (code === 4294967291 || code === -5) {
        exitMsg = `Minecraft exited with code ${code} (Java runtime conflict or out of memory).`
      } else if (code === 3221225477 || code === -1073741819) {
        exitMsg = `Minecraft crashed with code 3221225477 (Access Violation: GPU driver or conflicting rendering mod). Try allocating 4GB+ RAM.`
      } else if (code === 1) {
        exitMsg = `Minecraft crashed (code 1). Check instance logs for mod issues.`
      }
      this.sendProgress({
        stage: 'error',
        progress: 0,
        message: exitMsg
      })
    }
    this.sendConsoleLog(`[AstrixMC Launcher] Minecraft process exited.`)

    const win = BrowserWindow.getAllWindows()[0]
    if (win && !win.isDestroyed()) {
      if (!win.isVisible()) win.show()
      if (win.isMinimized()) win.restore()
      win.focus()

      if (code !== 0 && code !== null) {
        win.webContents.send('game:crashed', {
          code,
          message: exitMsg,
          instanceId: this.currentInstanceId
        })
      }
    }
  }

  public getIsCancelled(): boolean {
    return this.isCancelled
  }

  public setActiveProcess(proc: any): void {
    this.activeProcess = proc
    if (proc && proc.pid) {
      this.runningGamePid = proc.pid
      if (this.runningGameInfo) {
        this.runningGameInfo.pid = proc.pid
        this.saveRunningGame(this.runningGameInfo)
      }
      this.startProcessMonitor(proc.pid)
    }
    if (this.isCancelled) {
      try {
        if (proc && proc.pid) {
          spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { shell: true })
        }
        proc.kill('SIGKILL')
      } catch {}
      this.activeProcess = null
    }
  }

  public async launch(config: LaunchConfig): Promise<LaunchResult> {
    // Strict Single-Instance Enforcement:
    // Only one Minecraft game can run at any given time.
    if (this.isRunning()) {
      if (config.serverAddress) {
        this.sendConsoleLog('[AstrixMC Launcher] Game is already running. Stopping previous instance to switch to server: ' + config.serverAddress)
        this.sendProgress({
          stage: 'preparing',
          progress: 5,
          message: `Closing running game to connect to ${config.serverAddress}...`
        })
        this.stop()
        // Wait for previous process to cleanly exit
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } else {
        return {
          success: false,
          error: 'Minecraft is already running! Only one game can run at a time.'
        }
      }
    }

    this.isLaunching = true
    this.isGameRunning = false
    this.isCancelled = false
    this.currentInstanceId = config.instanceId || null
    if (config.instanceId && !this.instanceSessionLogs.has(config.instanceId)) {
      this.instanceSessionLogs.set(config.instanceId, [])
    }
    this.sendConsoleLog(`[AstrixMC Launcher] Initializing launch sequence (instance: ${config.instanceId || 'default'})...`)
    const settings = getSettings()

    // 1. Resolve Account
    const accounts = getSavedAccounts()
    let account =
      (config.accountId ? accounts.find((a) => a.id === config.accountId) : null) ||
      getDefaultAccount()

    if (!account) {
      return {
        success: false,
        error: 'No active Minecraft account found. Please add or select an account in Accounts.'
      }
    }

    // Auto-refresh Microsoft session to ensure valid, unexpired token on Hypixel & Mojang session servers
    if (account.type === 'microsoft' && account.refreshToken) {
      try {
        this.sendProgress({
          stage: 'preparing',
          progress: 6,
          message: `Authenticating ${account.username} with Mojang session server...`
        })
        const refreshed = await refreshMicrosoftAccount(account.id)
        if (refreshed.success && refreshed.account) {
          account = refreshed.account
          this.sendConsoleLog(`[AstrixMC Launcher] Microsoft session validated for ${account.username}`)
        } else if (refreshed.error) {
          this.sendConsoleLog(`[AstrixMC Launcher] Microsoft session refresh notice: ${refreshed.error}`)
        }
      } catch (refreshErr) {
        this.sendConsoleLog(`[AstrixMC Launcher] Could not refresh Microsoft session (proceeding with cached token)`)
      }
    }

    // 2. Resolve Instance & Game Directory
    let gameDirectory = join(getInstancesRoot(), config.instanceId || 'default')
    let mcVersion = '1.20.4'
    let modLoader: any = undefined
    let customArgs = [...FPS_BOOST_JVM_ARGS]
    let memMin = config.memoryMin ?? settings.memoryMin ?? 2
    let memMax = config.memoryMax ?? settings.memoryMax ?? 6
    let instJavaPath: string | undefined = undefined

    let inst: any = null
    if (config.instanceId) {
      inst = getInstance(config.instanceId)
      if (inst) {
        mcVersion = inst.mcVersion || mcVersion
        modLoader = inst.modLoader
        if (inst.name.toLowerCase().includes('astrix') && modLoader?.type === 'fabric') {
          modLoader = { ...modLoader, version: 'latest' }
        }
        if (inst.memoryMin) memMin = Number(inst.memoryMin)
        if (inst.memoryMax) memMax = Number(inst.memoryMax)
        if (inst.gameDirectory) gameDirectory = inst.gameDirectory
        if (inst.javaPath) instJavaPath = inst.javaPath
        if (inst.jvmArgs) customArgs.push(...inst.jvmArgs.split(' ').filter(Boolean))
        updateInstance(inst.id, {
          ...(modLoader ? { modLoader } : {}),
          lastPlayed: new Date().toISOString()
        })
      }
    }

    // Ensure at least 4GB max memory for modern Minecraft instances (1.20+ / 26.x) to prevent 0xC0000005 off-heap exhaustion
    if (memMax < 4) {
      memMax = 4
    }

    // 3. Resolve Optimal Java Runtime (Matches MC version requirement; avoids Java 26 crashes on 26.2/Fabric)
    const preferredJava = config.javaPath || instJavaPath || settings.javaPath
    let javaPath = findBestJavaForVersion(mcVersion, preferredJava)

    if (!javaPath && preferredJava && existsSync(preferredJava)) {
      javaPath = normalizeJavaExe(preferredJava)
    }
    if (!javaPath) {
      const installed = detectJavaInstallations()
      if (installed.length > 0) {
        javaPath = normalizeJavaExe(installed[0].path)
      }
    }

    if (!javaPath) {
      return {
        success: false,
        error: 'No compatible Java installation found. Please configure a Java path in Settings.'
      }
    }

    // Always ensure java.exe is used rather than javaw.exe on Windows to prevent FreeConsole() stream breaks
    javaPath = normalizeJavaExe(javaPath)
    this.sendConsoleLog(`[AstrixMC Launcher] Java runtime selected for MC ${mcVersion}: ${javaPath}`)

    // Add modern Java reflection opens & native access flags for modern Minecraft / Fabric
    const isModernMc =
      !mcVersion.startsWith('1.16') &&
      !mcVersion.startsWith('1.15') &&
      !mcVersion.startsWith('1.14') &&
      !mcVersion.startsWith('1.12') &&
      !mcVersion.startsWith('1.8')
    if (isModernMc) {
      customArgs.push(
        '--enable-native-access=ALL-UNNAMED',
        '--add-opens=java.base/java.lang=ALL-UNNAMED',
        '--add-opens=java.base/java.lang.invoke=ALL-UNNAMED',
        '--add-opens=java.base/java.lang.reflect=ALL-UNNAMED',
        '--add-opens=java.base/java.io=ALL-UNNAMED',
        '--add-opens=java.base/java.net=ALL-UNNAMED',
        '--add-opens=java.base/java.nio=ALL-UNNAMED',
        '--add-opens=java.base/java.util=ALL-UNNAMED'
      )
    }

    // High performance discrete GPU preference (NVIDIA / AMD)
    if (settings.forceDiscreteGpu !== false && process.platform === 'linux') {
      process.env.__NV_PRIME_RENDER_OFFLOAD = '1'
      process.env.__GLX_VENDOR_LIBRARY_NAME = 'nvidia'
      process.env.DRI_PRIME = '1'
    }

    if (!existsSync(gameDirectory)) {
      mkdirSync(gameDirectory, { recursive: true })
    }

    // Auto-resolve any missing Fabric/Quilt mod dependencies (e.g. yacl, cicada, fabric-api)
    if (modLoader?.type === 'fabric' || modLoader?.type === 'quilt') {
      try {
        const { resolveMissingModDependencies } = await import('../mods/mod-manager')
        await resolveMissingModDependencies(join(gameDirectory, 'mods'), mcVersion, modLoader.type)
      } catch (depErr) {
        console.warn('[LaunchEngine] Dependency auto-resolution warning:', depErr)
      }
    }

    // Auto-synchronize custom player skin into game instance (via CustomSkinLoader / internal skinpack)
    try {
      const { syncInGameSkin, getSkinAgentJvmArgs } = await import('./skin-synchronizer')
      await syncInGameSkin(gameDirectory, account, modLoader, mcVersion)
      const agentArgs = getSkinAgentJvmArgs(modLoader)
      if (agentArgs && agentArgs.length > 0) {
        customArgs.push(...agentArgs)
      }
    } catch (skinErr) {
      console.warn('[LaunchEngine] Skin synchronization warning:', skinErr)
    }

    const resolvedXuid = account.xuid || extractXuidFromJwt(account.accessToken) || account.uuid

    const mclcAuth: any = {
      access_token: account.accessToken,
      client_token: account.uuid,
      uuid: account.uuid,
      name: account.username,
      user_properties: '{}',
      meta:
        account.type === 'microsoft'
          ? {
              type: 'msa',
              xuid: resolvedXuid,
              demo: false
            }
          : {
              type: 'mojang',
              xuid: account.uuid,
              demo: false
            }
    }

    if (config.extraJvmArgs) {
      customArgs.push(...config.extraJvmArgs.split(' ').filter(Boolean))
    }

    // Notify UI
    this.sendProgress({
      stage: 'preparing',
      progress: 5,
      message: `Preparing ${account.username} (${account.type})...`
    })

    const launcher = new Client()
    this.activeClient = launcher
    this.isLaunching = true
    this.isGameRunning = false

    // Event listeners
    launcher.on('debug', (e) => {
      const line = String(e)
      if (line.includes('[MCLC]: Launching with arguments') || line.includes('Failed') || line.includes('Error')) {
        this.sendConsoleLog(line)
      }
    })

    let hasSentRunning = false
    launcher.on('data', (e) => {
      const line = String(e)
      // Route directly to launcher in-app logs (do not spam external terminal)
      this.sendConsoleLog(line)

      if (!hasSentRunning) {
        hasSentRunning = true
        this.sendProgress({
          stage: 'running',
          progress: 100,
          message: 'Minecraft is running!'
        })

        // Update Discord Rich Presence to show in-game status
        try {
          const currentInst = config.instanceId ? getInstance(config.instanceId) : null
          discordRpcService.setGameState({
            inGame: true,
            version: mcVersion,
            instanceName: currentInst?.name || 'Minecraft',
            serverAddress: config.serverAddress || 'bcas.deskhost.fun:19100',
            player: account.username
          })
        } catch (rpcErr) {
          // ignore
        }

        // Minimize or hide launcher window only if closeOnLaunch is explicitly true
        const win = BrowserWindow.getAllWindows()[0]
        if (win && !win.isDestroyed() && win.isVisible()) {
          if (settings.closeOnLaunch) {
            win.hide()
          }
        }
      }
    })

    launcher.on('progress', (e: { type?: string; task?: number; total?: number }) => {
      const task = e.task ?? 0
      const total = e.total ?? 1
      const percent = total > 0 ? Math.round((task / total) * 100) : 0
      const typeLabel =
        e.type === 'assets' ? 'Assets' : e.type === 'classes' ? 'Libraries' : e.type ?? 'Files'
      this.sendProgress({
        stage: 'downloading',
        progress: Math.min(95, Math.max(5, percent)),
        message: `Downloading ${typeLabel}: ${task} / ${total} (${percent}%)`
      })
    })

    launcher.on('download-status', (e: { current?: number; total?: number; type?: string }) => {
      const current = e.current ?? 0
      const total = e.total ?? 1
      const percent = total > 0 ? Math.round((current / total) * 100) : 0
      this.sendProgress({
        stage: 'downloading',
        progress: Math.min(95, Math.max(5, percent)),
        message: `Downloading ${e.type ?? 'game files'} (${percent}%)`
      })
    })

    launcher.on('close', (code) => {
      this.handleGameExited(code)
    })

    try {
      this.sendProgress({
        stage: 'preparing',
        progress: 10,
        message: modLoader ? `Configuring ${modLoader.type} loader...` : 'Preparing Minecraft client...'
      })

      const preparedLoader = await prepareModLoader(
        gameDirectory,
        mcVersion,
        modLoader,
        (msg) => {
          this.sendProgress({ stage: 'preparing', progress: 20, message: msg })
        }
      )

      if (this.isCancelled) {
        this.isGameRunning = false
        this.activeClient = null
        this.sendProgress({
          stage: 'idle',
          progress: 0,
          message: 'Launch cancelled'
        })
        return { success: false, error: 'Launch cancelled by user' }
      }

      this.sendProgress({
        stage: 'launching',
        progress: 25,
        message: `Starting Minecraft ${mcVersion}...`
      })

      // Normalize memory units: values > 64 are in Megabytes, safely clamp to 2G - 6G
      let resolvedMax = memMax > 64 ? Math.round(memMax / 1024) : Math.round(memMax)
      let resolvedMin = memMin > 64 ? Math.round(memMin / 1024) : Math.round(memMin)
      resolvedMax = Math.max(2, Math.min(resolvedMax || 4, 6))
      resolvedMin = Math.max(1, Math.min(resolvedMin || 2, resolvedMax))

      const maxMemStr = `${resolvedMax}G`
      const minMemStr = `${resolvedMin}G`

      // Options for MCLC
      const maxDownloadSockets = Math.max(2, Math.min(8, Number(settings.simultaneousDownloads) || 6))
      const opts: any = {
        authorization: mclcAuth,
        root: gameDirectory,
        overrides: {
          detached: false,
          windowsHide: true,
          maxSockets: maxDownloadSockets,
          assetRoot: join(getLauncherRoot(), 'assets')
        },
        version: {
          number: mcVersion,
          type: 'release',
          ...(preparedLoader.customVersion ? { custom: preparedLoader.customVersion } : {})
        },
        ...(preparedLoader.forgeJarPath ? { forge: preparedLoader.forgeJarPath } : {}),
        memory: {
          max: maxMemStr,
          min: minMemStr
        },
        javaPath,
        customArgs
      }

      const isFullscreen = Boolean(config.fullscreen ?? settings.fullscreen)
      const winW = Number(config.resolution?.width ?? settings.windowWidth ?? 1280) || 1280
      const winH = Number(config.resolution?.height ?? settings.windowHeight ?? 720) || 720
      opts.window = {
        width: winW,
        height: winH,
        fullscreen: isFullscreen
      }

      // Sync options.txt with requested resolution & window mode
      try {
        const optFile = join(gameDirectory, 'options.txt')
        if (existsSync(optFile)) {
          let optContent = readFileSync(optFile, 'utf-8')
          if (/fullscreen:(true|false)/.test(optContent)) {
            optContent = optContent.replace(/fullscreen:(true|false)/g, `fullscreen:${isFullscreen}`)
          } else {
            optContent += `\nfullscreen:${isFullscreen}`
          }
          // In Minecraft options.txt, overrideWidth & overrideHeight are for fullscreen mode resolution only (0 = default native).
          // Windowed resolution is driven by --width and --height CLI arguments.
          if (/overrideWidth:\d+/.test(optContent)) {
            optContent = optContent.replace(/overrideWidth:\d+/g, 'overrideWidth:0')
          } else {
            optContent += '\noverrideWidth:0'
          }
          if (/overrideHeight:\d+/.test(optContent)) {
            optContent = optContent.replace(/overrideHeight:\d+/g, 'overrideHeight:0')
          } else {
            optContent += '\noverrideHeight:0'
          }
          writeFileSync(optFile, optContent, 'utf-8')
        }
      } catch (optErr) {
        console.warn('[AstrixMC] Failed to sync options.txt resolution:', optErr)
      }

      if (config.serverAddress) {
        const isQuickPlaySupported = (() => {
          const parts = mcVersion.split('.')
          const major = parseInt(parts[0], 10)
          const minor = parseInt(parts[1] || '0', 10)
          return major > 1 || (major === 1 && minor >= 20)
        })()

        opts.quickPlay = {
          type: isQuickPlaySupported ? 'multiplayer' : 'legacy',
          identifier: config.serverAddress
        }
      }

      // Launch in background with full process tracking and error recovery
      launcher
        .launch(opts)
        .then((child: any) => {
          if (this.isCancelled || !child) {
            if (child && child.pid) {
              try {
                spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], { shell: true })
              } catch {
                try {
                  child.kill('SIGKILL')
                } catch {}
              }
            }
            this.handleGameExited(0)
            return
          }

          this.isLaunching = false
          this.isGameRunning = true
          this.activeProcess = child
          if (child && child.pid) {
            this.runningGamePid = child.pid
            if (settings.highPriorityProcess !== false) {
              try {
                // Use ABOVE_NORMAL priority so Minecraft gets priority without freezing Windows OS/mouse
                os.setPriority(child.pid, os.constants.priority.PRIORITY_ABOVE_NORMAL)
              } catch (priorityErr) {
                // Ignore if platform denies elevated priority
              }
            }
            const currentInst = config.instanceId ? getInstance(config.instanceId) : null
            this.runningGameInfo = {
              pid: child.pid,
              instanceId: config.instanceId,
              instanceName: currentInst?.name || 'Minecraft',
              mcVersion,
              serverAddress: config.serverAddress,
              startTime: Math.floor(Date.now() / 1000),
              accountName: account.username
            }
            this.saveRunningGame(this.runningGameInfo)
            this.startProcessMonitor(child.pid)
            child.on('exit', (code: any) => {
              this.handleGameExited(code)
            })
            child.on('close', (code: any) => {
              this.handleGameExited(code)
            })
          }
        })
        .catch((err: unknown) => {
          if (this.isCancelled) {
            return
          }
          this.handleGameExited(1)
          const msg = err instanceof Error ? err.message : String(err)
          this.sendProgress({
            stage: 'error',
            progress: 0,
            message: `Launch failed: ${msg}`
          })
          const win = BrowserWindow.getAllWindows()[0]
          if (win && !win.isDestroyed() && !win.isVisible()) {
            win.show()
          }
        })

      return { success: true }
    } catch (err: unknown) {
      this.handleGameExited(1)
      const msg = err instanceof Error ? err.message : String(err)
      this.sendProgress({
        stage: 'error',
        progress: 0,
        message: `Launch error: ${msg}`
      })
      return { success: false, error: msg }
    }
  }

  public stop(): boolean {
    this.isCancelled = true
    this.isGameRunning = false
    this.stopProcessMonitor()

    if (this.activeClient) {
      try {
        ;(this.activeClient as any)._isCancelled = true
        this.activeClient.emit('close', 0)
      } catch {}
      this.activeClient = null
    }

    // Only kill the exact PID started by this launcher
    const pidToKill = this.runningGamePid || (this.activeProcess && this.activeProcess.pid)
    if (pidToKill) {
      try {
        spawn('taskkill', ['/pid', String(pidToKill), '/f', '/t'], { shell: true })
      } catch {
        try {
          process.kill(pidToKill, 'SIGKILL')
        } catch {}
      }
      this.activeProcess = null
    }

    this.handleGameExited(0)
    return true
  }

  private sendProgress(progress: LaunchProgress): void {
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.LAUNCH_PROGRESS, progress)
      }
    }
  }

  public sendConsoleLog(log: string): void {
    const cleanLog = log.trimEnd()
    if (!cleanLog) return

    this.sessionLogs.push(cleanLog)
    if (this.sessionLogs.length > 3000) {
      this.sessionLogs.shift()
    }

    if (this.currentInstanceId) {
      let instLogs = this.instanceSessionLogs.get(this.currentInstanceId)
      if (!instLogs) {
        instLogs = []
        this.instanceSessionLogs.set(this.currentInstanceId, instLogs)
      }
      instLogs.push(cleanLog)
      if (instLogs.length > 3000) {
        instLogs.shift()
      }
    }

    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send('launch:log', cleanLog)
      }
    }
  }

  public getSessionLogs(instanceId?: string): string[] {
    if (instanceId && this.instanceSessionLogs.has(instanceId)) {
      const logs = this.instanceSessionLogs.get(instanceId)
      if (logs && logs.length > 0) return [...logs]
    }
    return [...this.sessionLogs]
  }

  public clearSessionLogs(instanceId?: string): void {
    if (instanceId) {
      this.instanceSessionLogs.delete(instanceId)
    } else {
      this.sessionLogs = []
      this.instanceSessionLogs.clear()
    }
  }
}

export const launchEngine = new LaunchEngine()

// Patch Handler.prototype.downloadAsync to abort instantly when launch is cancelled
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Handler = require('minecraft-launcher-core/components/handler')
  if (Handler && Handler.prototype) {
    const origDownloadAsync = Handler.prototype.downloadAsync
    Handler.prototype.downloadAsync = function (url: string, directory: string, name: string, retry: boolean, type: string) {
      if (this.client && ((this.client as any)._isCancelled || launchEngine.getIsCancelled())) {
        return Promise.resolve(false)
      }
      return origDownloadAsync.call(this, url, directory, name, retry, type)
    }
  }
} catch {
  // ignore
}

// Patch Client.prototype.startMinecraft to abort if cancelled, sanitize arguments & cleanly spawn with hidden console
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const MCLCore = require('minecraft-launcher-core/components/launcher')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const child = require('child_process')
  if (MCLCore && MCLCore.prototype) {
    MCLCore.prototype.startMinecraft = function (launchArguments: any) {
      if ((this as any)._isCancelled || launchEngine.getIsCancelled()) {
        this.emit('debug', '[AstrixMC] Launch was cancelled before Minecraft started. Aborting spawn.')
        return null
      }

      // Sanitize arguments: ensure all arguments are strings, keep numbers (e.g. --width 1280),
      // eliminate invalid/empty values, and strip incompatible flags like UseAdaptiveSizePolicy.
      let cleanArgs: string[] = []
      if (Array.isArray(launchArguments)) {
        const rawStrings = launchArguments
          .map((arg: any) => (arg !== null && arg !== undefined ? String(arg) : ''))
          .filter((arg: string) => arg.length > 0 && !arg.includes('UseAdaptiveSizePolicy'))

        const sanitized: string[] = []
        let seenWidth = false
        let seenHeight = false

        for (let i = 0; i < rawStrings.length; i++) {
          const arg = rawStrings[i]
          if (arg === '--width') {
            const val = rawStrings[i + 1]
            if (!seenWidth && val && !val.startsWith('--') && !isNaN(Number(val))) {
              sanitized.push(arg, val)
              seenWidth = true
              i++
            }
            continue
          }
          if (arg === '--height') {
            const val = rawStrings[i + 1]
            if (!seenHeight && val && !val.startsWith('--') && !isNaN(Number(val))) {
              sanitized.push(arg, val)
              seenHeight = true
              i++
            }
            continue
          }
          sanitized.push(arg)
        }
        cleanArgs = sanitized
      } else {
        cleanArgs = launchArguments
      }

      const cwd = this.options.overrides?.cwd || this.options.root
      const javaExecutable = this.options.javaPath ? normalizeJavaExe(this.options.javaPath) : 'java'

      const childProc = child.spawn(javaExecutable, cleanArgs, {
        cwd,
        detached: false,
        windowsHide: true
      })

      if (childProc.stdout) {
        childProc.stdout.on('data', (data: any) => this.emit('data', data.toString('utf-8')))
        childProc.stdout.on('error', () => {})
      }
      if (childProc.stderr) {
        childProc.stderr.on('data', (data: any) => this.emit('data', data.toString('utf-8')))
        childProc.stderr.on('error', () => {})
      }
      childProc.on('exit', (code: any) => this.emit('close', code))
      childProc.on('close', (code: any) => this.emit('close', code))

      launchEngine.setActiveProcess(childProc)
      return childProc
    }
  }
} catch {
  // ignore
}
