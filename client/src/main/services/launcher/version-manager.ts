import { fetchJSON } from '../http'
import { readJSONFile, writeJSONFile } from '../store'
import type { MinecraftVersion } from '../../../shared/types/version'

interface VersionManifestResponse {
  latest: {
    release: string
    snapshot: string
  }
  versions: Array<{
    id: string
    type: 'release' | 'snapshot' | 'old_beta' | 'old_alpha'
    url: string
    time: string
    releaseTime: string
  }>
}

interface ManifestCache {
  timestamp: number
  data: {
    latest: { release: string; snapshot: string }
    versions: MinecraftVersion[]
  }
}

const MANIFEST_URL = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
const CACHE_TTL_MS = 1000 * 60 * 60 // 1 hour

export async function getMinecraftVersions(forceRefresh = false): Promise<{
  latest: { release: string; snapshot: string }
  versions: MinecraftVersion[]
}> {
  const cached = readJSONFile<ManifestCache | null>('versions_cache', null)
  const now = Date.now()

  if (!forceRefresh && cached && cached.data && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  try {
    const raw = await fetchJSON<VersionManifestResponse>(MANIFEST_URL)
    const formatted = {
      latest: raw.latest,
      versions: raw.versions.map((v) => ({
        id: v.id,
        type: v.type,
        url: v.url,
        releaseTime: v.releaseTime
      }))
    }

    writeJSONFile<ManifestCache>('versions_cache', {
      timestamp: now,
      data: formatted
    })

    return formatted
  } catch (err) {
    // If network fails, return cached if available
    if (cached?.data) {
      return cached.data
    }
    throw err
  }
}
