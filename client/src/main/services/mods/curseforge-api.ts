import { fetchJSON } from '../http'
import type { ModSearchResult } from '../../../shared/types/mod'

interface CurseForgeMod {
  id: number
  name: string
  authors: Array<{ name: string }>
  summary: string
  description: string
  categories: Array<{ name: string }>
  dateModified: string
  downloadCount: number
  logo?: { url: string }
  slug: string
  gameVersion: string
  classId: number
}

interface CurseForgeSearchResponse {
  data: CurseForgeMod[]
  pagination: { index: number; pageSize: number; totalCount: number }
}

interface CurseForgeFile {
  id: number
  displayName: string
  fileName: string
  downloadUrl: string
  gameVersions: string[]
  modLoaders: Array<{ id: number; name: string }>
  releaseType: number
  fileDate: string
}

const CURSEFORGE_API = 'https://api.curseforge.com/v1'

async function getHeaders(): Promise<Record<string, string>> {
  const { getSettings } = await import('../settings')
  const settings = getSettings()
  return {
    'Accept': 'application/json',
    'x-api-key': settings.curseforgeApiKey || ''
  }
}

export async function searchCurseForge(query: {
  query?: string
  gameVersion?: string
  modLoaderType?: number
  classId?: number
  categoryId?: number
  index?: number
  pageSize?: number
}): Promise<ModSearchResult[]> {
  const headers = await getHeaders()
  if (!headers['x-api-key']) {
    throw new Error('CurseForge API key not configured')
  }

  const params = new URLSearchParams()
  if (query.query) params.set('searchFilter', query.query)
  if (query.gameVersion) params.set('gameVersion', query.gameVersion)
  if (query.modLoaderType) params.set('modLoaderType', String(query.modLoaderType))
  if (query.classId) params.set('classId', String(query.classId))
  if (query.categoryId) params.set('categoryId', String(query.categoryId))
  params.set('index', String(query.index ?? 0))
  params.set('pageSize', String(query.pageSize ?? 24))

  const url = `${CURSEFORGE_API}/mods/search?${params.toString()}`
  const data = await fetchJSON<CurseForgeSearchResponse>(url, { headers })

  return (data.data || []).map((mod) => ({
    id: String(mod.id),
    name: mod.name,
    author: mod.authors[0]?.name || 'Unknown',
    description: mod.summary,
    iconUrl: mod.logo?.url,
    downloads: mod.downloadCount,
    source: 'curseforge' as const,
    slug: mod.slug,
    categories: mod.categories.map(c => c.name),
    dateModified: mod.dateModified
  }))
}

export async function getCurseForgeProject(id: string): Promise<any> {
  const headers = await getHeaders()
  if (!headers['x-api-key']) {
    throw new Error('CurseForge API key not configured')
  }
  return await fetchJSON(`${CURSEFORGE_API}/mods/${id}`, { headers })
}

export async function getCurseForgeVersions(
  projectId: string,
  gameVersion?: string,
  modLoaderType?: number
): Promise<CurseForgeFile[]> {
  const headers = await getHeaders()
  if (!headers['x-api-key']) {
    throw new Error('CurseForge API key not configured')
  }

  const params = new URLSearchParams()
  if (gameVersion) params.set('gameVersion', gameVersion)
  if (modLoaderType) params.set('modLoaderType', String(modLoaderType))

  const url = `${CURSEFORGE_API}/mods/${projectId}/files?${params.toString()}`
  const data = await fetchJSON<{ data: CurseForgeFile[] }>(url, { headers })
  return data.data || []
}