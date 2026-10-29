import { fetchJSON } from '../http'
import type { ModSearchResult } from '../../../shared/types/mod'

interface ModrinthSearchHit {
  project_id: string
  slug: string
  title: string
  description: string
  categories: string[]
  client_side: string
  server_side: string
  icon_url?: string
  downloads: number
  date_modified: string
  author: string
}

interface ModrinthSearchResponse {
  hits: ModrinthSearchHit[]
  total_hits: number
  offset: number
  limit: number
}

export interface ModrinthVersionFile {
  url: string
  filename: string
  primary: boolean
  size: number
}

export interface ModrinthDependency {
  version_id: string | null
  project_id: string | null
  file_name: string | null
  dependency_type: 'required' | 'optional' | 'incompatible' | 'embedded'
}

export interface ModrinthVersion {
  id: string
  project_id: string
  name: string
  version_number: string
  game_versions: string[]
  loaders: string[]
  files: ModrinthVersionFile[]
  dependencies?: ModrinthDependency[]
}

const MODRINTH_API = 'https://api.modrinth.com/v2'

export async function searchModrinth(query: {
  query?: string
  loader?: string
  version?: string
  limit?: number
  index?: 'relevance' | 'downloads' | 'newest' | 'updated'
  projectType?: 'mod' | 'shader' | 'resourcepack' | 'modpack'
}): Promise<ModSearchResult[]> {
  const pType = query.projectType || 'mod'
  const facets: string[][] = [[`project_type:${pType}`]]

  if (query.loader && query.loader !== 'All Loaders' && pType === 'mod') {
    facets.push([`categories:${query.loader.toLowerCase()}`])
  }
  if (query.version && query.version !== 'All Versions') {
    facets.push([`versions:${query.version}`])
  }

  const params = new URLSearchParams()
  if (query.query) params.set('query', query.query)
  params.set('facets', JSON.stringify(facets))
  params.set('limit', String(query.limit ?? 24))
  if (query.index) params.set('index', query.index)

  const url = `${MODRINTH_API}/search?${params.toString()}`
  const data = await fetchJSON<ModrinthSearchResponse>(url)

  return (data.hits || []).map((hit) => ({
    id: hit.project_id,
    name: hit.title,
    author: hit.author,
    description: hit.description,
    iconUrl: hit.icon_url,
    downloads: hit.downloads,
    source: 'modrinth',
    slug: hit.slug,
    categories: hit.categories,
    dateModified: hit.date_modified
  }))
}

export async function getModrinthProject(id: string): Promise<any> {
  return await fetchJSON(`${MODRINTH_API}/project/${id}`)
}

export async function getModrinthVersions(
  projectId: string,
  loader?: string,
  gameVersion?: string
): Promise<ModrinthVersion[]> {
  const params = new URLSearchParams()
  if (loader && loader !== 'All Loaders') {
    params.set('loaders', JSON.stringify([loader.toLowerCase()]))
  }
  if (gameVersion && gameVersion !== 'All Versions') {
    params.set('game_versions', JSON.stringify([gameVersion]))
  }

  try {
    const url = `${MODRINTH_API}/project/${projectId}/version?${params.toString()}`
    const res = await fetchJSON<ModrinthVersion[]>(url)
    if (Array.isArray(res) && res.length > 0) return res
  } catch {}

  // Resilient fallback: fetch all versions of project and filter in-memory
  try {
    const rawUrl = `${MODRINTH_API}/project/${projectId}/version`
    const all = await fetchJSON<ModrinthVersion[]>(rawUrl)
    if (Array.isArray(all)) {
      const filtered = all.filter((v) => {
        const matchLoader =
          !loader || loader === 'All Loaders' || v.loaders.some((l) => l.toLowerCase() === loader.toLowerCase())
        const matchVersion =
          !gameVersion || gameVersion === 'All Versions' || v.game_versions.includes(gameVersion)
        return matchLoader && matchVersion
      })
      if (filtered.length > 0) return filtered
    }
  } catch {}

  return []
}
