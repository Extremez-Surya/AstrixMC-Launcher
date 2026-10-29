import { fetchJSON } from '../http'

export interface FabricLoaderVersion {
  loader: {
    separator: string
    build: number
    maven: string
    version: string
    stable: boolean
  }
}

export async function getFabricLoaders(gameVersion: string): Promise<FabricLoaderVersion[]> {
  try {
    const url = `https://meta.fabricmc.net/v2/versions/loader/${gameVersion}`
    const list = await fetchJSON<FabricLoaderVersion[]>(url)
    return list
  } catch {
    return []
  }
}
