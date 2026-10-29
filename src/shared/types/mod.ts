export type ModSource = 'curseforge' | 'modrinth'

export interface ModSearchResult {
  id: string
  name: string
  author: string
  description: string
  iconUrl?: string
  downloads: number
  source: ModSource
  slug: string
  categories: string[]
  dateModified: string
}

export interface InstalledMod {
  id: string
  name: string
  version: string
  fileName: string
  source: ModSource
  sourceId: string
  enabled: boolean
  instanceId: string
}
