export interface PublicServerItem {
  id: string
  name: string
  host: string
  port?: number
  edition?: 'java' | 'bedrock' | 'crossplay' | string
  version?: string
  description?: string
  motd?: string
  online: boolean
  players: {
    online: number
    max: number
  }
  ping?: number
  tags: string[]
  banner?: string | null
  icon?: string | null
  isFeatured?: boolean
  isCracked?: boolean
}

export interface PublicServerQuery {
  page?: number
  tag?: string
  search?: string
}

export interface PublicServerListResponse {
  servers: PublicServerItem[]
  total: number
  page: number
  pages: number
}
