import { createWriteStream, existsSync, mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'

/** GET a JSON document with a browser-ish UA (CDNs reject bare node agents) */
export async function fetchJSON<T>(
  url: string,
  optionsOrHeaders?: { headers?: Record<string, string> } | Record<string, string>
): Promise<T> {
  const customHeaders: Record<string, string> =
    optionsOrHeaders && 'headers' in optionsOrHeaders && typeof optionsOrHeaders.headers === 'object'
      ? (optionsOrHeaders.headers as Record<string, string>)
      : ((optionsOrHeaders as Record<string, string>) ?? {})

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout for metadata

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AstrixMCLauncher/1.0',
        Accept: 'application/json',
        ...customHeaders
      }
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`)
    }
    return (await res.json()) as T
  } finally {
    clearTimeout(timeoutId)
  }
}

/** Download a file to disk, reporting progress (bytes) to the callback */
export async function downloadFile(
  url: string,
  dest: string,
  onProgress?: (transferred: number, total: number) => void,
  headers?: Record<string, string>
): Promise<void> {
  if (!existsSync(dirname(dest))) mkdirSync(dirname(dest), { recursive: true })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout

  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: '*/*',
        ...headers
      }
    })
    if (!res.ok) {
      throw new Error(`Download failed (${res.status}) for ${url}`)
    }

    // Fast direct buffer write for individual files without progress listeners (mods, assets, textures)
    if (!onProgress) {
      const arrayBuffer = await res.arrayBuffer()
      writeFileSync(dest, Buffer.from(arrayBuffer))
      return
    }

    if (!res.body) {
      throw new Error(`Download body empty for ${url}`)
    }
    const total = Number(res.headers.get('content-length') ?? 0)
    const reader = res.body.getReader()
    const out = createWriteStream(dest)
    let transferred = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        transferred += value.byteLength
        onProgress?.(transferred, total)
        if (!out.write(Buffer.from(value))) {
          await new Promise<void>((resolve) => out.once('drain', resolve))
        }
      }
    }
    await new Promise<void>((resolve, reject) => {
      out.end(() => resolve())
      out.on('error', reject)
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

/** Small concurrency-limited batch runner */
export async function runLimited<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  let index = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index++]
      await worker(current)
    }
  })
  await Promise.all(runners)
}
