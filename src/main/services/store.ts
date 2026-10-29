import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

/** Root directory for all launcher-managed data */
export function getLauncherRoot(): string {
  const root = join(app.getPath('userData'), 'launcher')
  if (!existsSync(root)) mkdirSync(root, { recursive: true })
  return root
}

/** Root directory where user instances live */
export function getInstancesRoot(): string {
  const root = join(getLauncherRoot(), 'instances')
  if (!existsSync(root)) mkdirSync(root, { recursive: true })
  return root
}

/** Read a JSON object file, returning a fallback when missing or corrupt */
export function readJSONFile<O>(name: string, fallback: O): O {
  try {
    const file = join(getLauncherRoot(), `${name}.json`)
    if (!existsSync(file)) return fallback
    return { ...fallback, ...JSON.parse(readFileSync(file, 'utf-8')) } as O
  } catch {
    return fallback
  }
}

/** Write a JSON object file */
export function writeJSONFile<O>(name: string, data: O): void {
  const file = join(getLauncherRoot(), `${name}.json`)
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

/**
 * Minimal persistent JSON store (array of records) with atomic-ish writes.
 * Used for accounts and installed-mod metadata.
 */
export class JSONStore<T extends { id?: string }> {
  private readonly file: string
  private cache: T[] | null = null

  constructor(name: string) {
    this.file = join(getLauncherRoot(), `${name}.json`)
  }

  read(): T[] {
    try {
      if (!existsSync(this.file)) return (this.cache = [])
      const raw = readFileSync(this.file, 'utf-8')
      const parsed = JSON.parse(raw)
      this.cache = Array.isArray(parsed) ? (parsed as T[]) : []
    } catch {
      if (!this.cache) this.cache = []
    }
    return this.cache
  }

  write(items: T[]): void {
    this.cache = items
    try {
      writeFileSync(this.file, JSON.stringify(items, null, 2), 'utf-8')
    } catch (err) {
      console.error(`[JSONStore] Failed to write to ${this.file}:`, err)
    }
  }
}
