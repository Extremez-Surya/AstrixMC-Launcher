import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { getInstance } from './instance-manager'

export interface GameSettingsData {
  gamma: number
  fov: number
  guiScale: number
  soundVolume: number
  musicVolume: number
  fullscreen: boolean
}

/**
 * Reads options.txt from an instance and parses standard properties
 */
export function readGameOptions(instanceId: string): GameSettingsData {
  const instance = getInstance(instanceId)
  const defaultSettings: GameSettingsData = {
    gamma: 1.0,
    fov: 0.0, // 0.0 is Normal 70 in options.txt
    guiScale: 0,
    soundVolume: 1.0,
    musicVolume: 1.0,
    fullscreen: false
  }

  if (!instance?.gameDirectory) return defaultSettings

  const optionsPath = join(instance.gameDirectory, 'options.txt')
  if (!existsSync(optionsPath)) return defaultSettings

  try {
    const content = readFileSync(optionsPath, 'utf-8')
    const lines = content.split(/\r?\n/)

    for (const line of lines) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1).trim()

      if (key === 'gamma') {
        const num = parseFloat(val)
        if (!isNaN(num)) defaultSettings.gamma = num
      } else if (key === 'fov') {
        const num = parseFloat(val)
        if (!isNaN(num)) defaultSettings.fov = num
      } else if (key === 'guiScale') {
        const num = parseInt(val, 10)
        if (!isNaN(num)) defaultSettings.guiScale = num
      } else if (key === 'soundVolume') {
        const num = parseFloat(val)
        if (!isNaN(num)) defaultSettings.soundVolume = num
      } else if (key === 'musicVolume') {
        const num = parseFloat(val)
        if (!isNaN(num)) defaultSettings.musicVolume = num
      } else if (key === 'fullscreen') {
        defaultSettings.fullscreen = val === 'true'
      }
    }
  } catch (err) {
    console.warn(`[GameSettings] Failed to read options.txt for ${instanceId}:`, err)
  }

  return defaultSettings
}

/**
 * Updates a specific key in options.txt (or appends if not present)
 */
export function setGameOption(instanceId: string, key: string, value: string | number | boolean): boolean {
  const instance = getInstance(instanceId)
  if (!instance?.gameDirectory) return false

  const optionsPath = join(instance.gameDirectory, 'options.txt')
  try {
    let lines: string[] = []
    if (existsSync(optionsPath)) {
      lines = readFileSync(optionsPath, 'utf-8').split(/\r?\n/)
    }

    const valStr = String(value)
    let found = false
    const updated = lines.map((line) => {
      const idx = line.indexOf(':')
      if (idx !== -1 && line.slice(0, idx).trim() === key) {
        found = true
        return `${key}:${valStr}`
      }
      return line
    })

    if (!found) {
      updated.push(`${key}:${valStr}`)
    }

    writeFileSync(optionsPath, updated.join('\n'), 'utf-8')
    return true
  } catch (err) {
    console.error(`[GameSettings] Failed to update options.txt for ${instanceId}:`, err)
    return false
  }
}

/**
 * Finds the latest crash report file in the instance's crash-reports/ folder
 */
export function getLatestCrashReport(instanceId: string): { fileName: string; content: string; path: string } | null {
  const instance = getInstance(instanceId)
  if (!instance?.gameDirectory) return null

  const crashDir = join(instance.gameDirectory, 'crash-reports')
  if (!existsSync(crashDir)) return null

  try {
    const files = readdirSync(crashDir)
      .filter((f) => f.endsWith('.txt'))
      .map((f) => {
        const p = join(crashDir, f)
        const stats = statSync(p)
        return { name: f, path: p, mtime: stats.mtimeMs }
      })
      .sort((a, b) => b.mtime - a.mtime)

    if (files.length === 0) return null

    const latest = files[0]
    const content = readFileSync(latest.path, 'utf-8')
    return {
      fileName: latest.name,
      content,
      path: latest.path
    }
  } catch (err) {
    console.error(`[GameSettings] Failed to find crash reports for ${instanceId}:`, err)
    return null
  }
}

