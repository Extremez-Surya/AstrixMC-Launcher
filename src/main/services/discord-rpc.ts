import net from 'net'
import { getSettings, DiscordRpcConfig } from './settings'

interface DiscordActivityAssets {
  large_image?: string
  large_text?: string
  small_image?: string
  small_text?: string
}

interface DiscordActivityButton {
  label: string
  url: string
}

interface DiscordActivity {
  details?: string
  state?: string
  timestamps?: {
    start?: number
    end?: number
  }
  assets?: DiscordActivityAssets
  buttons?: DiscordActivityButton[]
}

export const ASTRIX_RPC_CONFIG = {
  CLIENT_ID: '1526903059857543218',
  ASTRIX_LOGO_URL: 'https://i.postimg.cc/prTNvbVj/download.jpg',
  MINECRAFT_LOGO_URL: 'https://files.catbox.moe/9wc0rb.png',
  DISCORD_INVITE_URL: 'https://discord.gg/FR9pXG2Mwb',
  YOUTUBE_URL: 'https://youtube.com/@alone_vinay'
}

class DiscordRpcManager {
  private socket: net.Socket | null = null
  private connected: boolean = false
  private clientId: string = '1526903059857543218'
  private currentUser: any = null
  private lastError: string | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private startTime: number = Math.floor(Date.now() / 1000)
  private currentGameState: {
    inGame: boolean
    version?: string
    instanceName?: string
    serverAddress?: string
    player?: string
  } = { inGame: false }

  constructor() {
    // Initialized
  }

  private isConnecting: boolean = false

  public init(): void {
    const settings = getSettings()
    if (settings.discordRpc !== false) {
      this.connect()
    }
  }

  public getStatus(): { connected: boolean; user: any; lastError: string | null } {
    return {
      connected: this.connected,
      user: this.currentUser,
      lastError: this.lastError
    }
  }

  public connect(newClientId?: string): void {
    const settings = getSettings()
    const config = settings.rpcConfig || {}
    const targetClientId = newClientId || config.clientId?.trim() || '1526903059857543218'

    // If already connected with the same client ID and active socket, just push latest activity
    if (this.connected && this.socket && !this.socket.destroyed && this.clientId === targetClientId) {
      this.refreshActivity()
      return
    }

    if (this.socket) {
      try {
        this.socket.destroy()
      } catch {}
      this.socket = null
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.clientId = targetClientId
    this.connected = false
    this.isConnecting = true

    const pipePath = this.getPipePath()
    if (!pipePath) {
      this.lastError = 'No Discord IPC pipe available'
      this.isConnecting = false
      this.scheduleReconnect()
      return
    }

    try {
      const client = net.createConnection(pipePath)

      client.on('connect', () => {
        this.socket = client
        this.lastError = null
        this.sendHandshake()
      })

      let bufferAccumulator = Buffer.alloc(0)

      client.on('data', (chunk) => {
        bufferAccumulator = Buffer.concat([bufferAccumulator, chunk])

        while (bufferAccumulator.length >= 8) {
          const opcode = bufferAccumulator.readInt32LE(0)
          const length = bufferAccumulator.readInt32LE(4)

          if (bufferAccumulator.length < 8 + length) {
            break // Wait for more data
          }

          const rawData = bufferAccumulator.slice(8, 8 + length)
          bufferAccumulator = bufferAccumulator.slice(8 + length)

          try {
            const parsed = JSON.parse(rawData.toString('utf8'))
            this.handleMessage(opcode, parsed)
          } catch (err) {
            console.warn('[DiscordRPC] Parse error:', err)
          }
        }
      })

      client.on('error', (err) => {
        this.connected = false
        this.isConnecting = false
        this.currentUser = null
        this.lastError = err.message
        this.socket = null
        this.scheduleReconnect()
      })

      client.on('close', () => {
        this.connected = false
        this.isConnecting = false
        this.currentUser = null
        this.socket = null
        this.scheduleReconnect()
      })
    } catch (err: any) {
      this.connected = false
      this.isConnecting = false
      this.currentUser = null
      this.lastError = err?.message || 'Connection failed'
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    const settings = getSettings()
    if (settings.discordRpc === false) return

    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null
        if (!this.connected) {
          this.connect()
        }
      }, 15000)
    }
  }

  private getPipePath(): string | null {
    if (process.platform === 'win32') {
      return '\\\\.\\pipe\\discord-ipc-0'
    }
    const env = process.env
    const dir = env.XDG_RUNTIME_DIR || env.TMPDIR || env.TMP || env.TEMP || '/tmp'
    return `${dir}/discord-ipc-0`
  }

  private sendHandshake(): void {
    if (!this.socket) return
    const payload = JSON.stringify({ v: 1, client_id: this.clientId })
    this.sendRaw(0, payload)
  }

  private sendRaw(opcode: number, jsonString: string): void {
    if (!this.socket || this.socket.destroyed) return
    try {
      const dataBuf = Buffer.from(jsonString, 'utf8')
      const headerBuf = Buffer.alloc(8)
      headerBuf.writeInt32LE(opcode, 0)
      headerBuf.writeInt32LE(dataBuf.length, 4)
      this.socket.write(Buffer.concat([headerBuf, dataBuf]))
    } catch (err) {
      console.warn('[DiscordRPC] sendRaw error:', err)
    }
  }

  private handleMessage(opcode: number, data: any): void {
    if (opcode === 1 && data.evt === 'READY') {
      this.connected = true
      this.isConnecting = false
      this.currentUser = data.data?.user || null
      console.log('[DiscordRPC] Connected to Discord as:', this.currentUser?.username)
      // Immediately broadcast activity
      this.refreshActivity()
    } else if (opcode === 1 && data.evt === 'ERROR') {
      console.warn('[DiscordRPC] Discord error frame:', data)
      this.lastError = data.data?.message || 'Discord RPC error'
    } else if (opcode === 1 && data.cmd === 'SET_ACTIVITY') {
      // Activity set response from Discord
      if (data.evt === null) {
        console.log('[DiscordRPC] SET_ACTIVITY confirmed by Discord:', data.data?.name)
      }
    } else if (opcode === 2) {
      // Close from Discord
      this.connected = false
      this.isConnecting = false
      this.currentUser = null
      this.lastError = data.message || 'Discord closed connection'
      if (this.socket) {
        try {
          this.socket.destroy()
        } catch {}
        this.socket = null
      }
    }
  }

  public setGameState(params: {
    inGame: boolean
    version?: string
    instanceName?: string
    serverAddress?: string
    player?: string
  }): void {
    this.currentGameState = { ...params }
    if (params.inGame) {
      this.startTime = Math.floor(Date.now() / 1000)
    }
    this.refreshActivity()
  }

  public refreshActivity(): void {
    const settings = getSettings()
    if (settings.discordRpc === false) {
      this.clearActivity()
      return
    }

    if (!this.connected) {
      if (!this.isConnecting) {
        this.connect()
      }
      return
    }

    const { inGame, version = '1.20.4' } = this.currentGameState

    const activity: DiscordActivity = {}

    if (inGame) {
      // IN-GAME MODE:
      // - Large Image: Minecraft Logo
      // - Small Badge: Astrix Client Logo
      // - NO BUTTONS (clean in-game mode)
      // - No hardcoded server name
      activity.details = `Playing Minecraft ${version}`
      activity.state = 'In-Game Session'
      activity.timestamps = {
        start: this.startTime
      }
      activity.assets = {
        large_image: ASTRIX_RPC_CONFIG.MINECRAFT_LOGO_URL,
        large_text: `Minecraft ${version}`,
        small_image: ASTRIX_RPC_CONFIG.ASTRIX_LOGO_URL,
        small_text: 'Astrix Client'
      }
      // Strictly no buttons when in-game
    } else {
      // LAUNCHER MODE:
      // - Large Image: Astrix Client Logo
      // - Small Badge: Minecraft Logo
      // - Action Buttons: Discord and YouTube links
      activity.details = 'Astrix Client v4.2'
      activity.state = 'Idling in Launcher Deck'
      activity.timestamps = {
        start: this.startTime
      }
      activity.assets = {
        large_image: ASTRIX_RPC_CONFIG.ASTRIX_LOGO_URL,
        large_text: 'Astrix Client',
        small_image: ASTRIX_RPC_CONFIG.MINECRAFT_LOGO_URL,
        small_text: 'Minecraft Launcher'
      }
      activity.buttons = [
        {
          label: 'Astrix Discord',
          url: ASTRIX_RPC_CONFIG.DISCORD_INVITE_URL
        },
        {
          label: 'Astrix YT',
          url: ASTRIX_RPC_CONFIG.YOUTUBE_URL
        }
      ]
    }

    this.sendActivity(activity)
  }

  public clearActivity(): void {
    if (!this.connected) return
    const payload = JSON.stringify({
      cmd: 'SET_ACTIVITY',
      args: {
        pid: process.pid,
        activity: null
      },
      nonce: String(Date.now())
    })
    this.sendRaw(1, payload)
  }

  private sendActivity(activity: DiscordActivity): void {
    const payload = JSON.stringify({
      cmd: 'SET_ACTIVITY',
      args: {
        pid: process.pid,
        activity
      },
      nonce: String(Date.now())
    })
    this.sendRaw(1, payload)
  }

  public disconnect(): void {
    this.clearActivity()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.socket) {
      try {
        this.socket.destroy()
      } catch {}
      this.socket = null
    }
    this.connected = false
    this.currentUser = null
  }
}

export const discordRpcService = new DiscordRpcManager()
