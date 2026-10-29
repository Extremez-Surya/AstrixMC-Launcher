import type { PublicServerItem, PublicServerListResponse, PublicServerQuery } from '../../../shared/types/server'

export const KNOWN_ANIMATED_BANNERS: Record<string, string> = {
  'play.boholmc.net': 'https://minecraftservers.org/banners/6884571787824213.gif',
  'sl.twenture.net': 'https://minecraftservers.org/banners/6500701698499053.gif',
  'play.pika-network.net': 'https://minecraftservers.org/banners/1127211483828295.gif',
  'play.blocksmc.com': 'https://minecraftservers.org/banners/6807581764218263.gif',
  'mc.hypixel.net': 'https://minecraftservers.org/banners/2218431430479118.gif',
  'herobrine.org': 'https://minecraftservers.org/banners/4154971485790235.gif',
  'play.bluemc.net': 'https://minecraftservers.org/banners/6870011777553583.gif',
  'sl.extremecraft.net': 'https://minecraftservers.org/banners/3915821632785058.gif',
  'play.jartexnetwork.com': 'https://minecraftservers.org/banners/5037901758819515.gif',
  'mc-sl.illuminati.onl': 'https://minecraftservers.org/banners/6429261791821510.gif',
  'mc.mineberry.net': 'https://minecraftservers.org/banners/4404881533796292.gif',
  'play.bananasmp.net': 'https://minecraftservers.org/banners/6836221770189278.gif',
  'play.fatalmc.com': 'https://minecraftservers.org/banners/6884571787824213.gif',
  'play.potionmc.com': 'https://minecraftservers.org/banners/3915821632785058.gif',
  'play.omniversesmp.com': 'https://minecraftservers.org/banners/6429261791821510.gif',
  'play.ascendiamc.com': 'https://minecraftservers.org/banners/4154971485790235.gif',
  'donutsmp.net': 'https://minecraftservers.org/banners/6429261791821510.gif',
  'play.applemc.fun': 'https://minecraftservers.org/banners/6836221770189278.gif',
  'hub.lemoncloud.net': 'https://minecraftservers.org/banners/3727601768762844.gif',
  'play.opblocks.com': 'https://minecraftservers.org/banners/4001981758762480.gif',
  'play.cubecraft.net': 'https://minecraftservers.org/banners/255311591637300.gif',
  'play.manacube.com': 'https://minecraftservers.org/banners/5037901758819515.gif',
  'org.complexgaming.net': 'https://minecraftservers.org/banners/4671771790734147.gif'
}

// In-memory cache: NO data written to disk
const cache = new Map<string, { timestamp: number; data: PublicServerListResponse }>()
const pingCache = new Map<string, { timestamp: number; data: any }>()
const CACHE_TTL = 3 * 60 * 1000 // 3 minutes

// Curated top community & cracked servers (matches user screenshot & popular networks)
const FEATURED_COMMUNITY_SERVERS: PublicServerItem[] = [
  {
    id: 'astrixmc-official',
    name: 'AstrixMC Official Network',
    host: 'bcas.deskhost.fun',
    port: 19100,
    edition: 'crossplay',
    version: '1.20 - 1.21.4',
    description: 'The official AstrixMC Minecraft server. Pure Vanilla Survival SMP — no pay-to-win, no money economy. Raw authentic Minecraft experience with zero latency.',
    motd: 'AstrixMC Official Server · Pure Vanilla Survival',
    online: true,
    players: { online: 1, max: 20 },
    tags: ['Official Network', 'Survival SMP', 'Pure Survival', 'Vanilla', 'No P2W', 'Cracked', 'Cross-Play'],
    banner: null,
    icon: null,
    isFeatured: true,
    isCracked: true
  },
  {
    id: 'bohol-network',
    name: 'BOHOL NETWORK',
    host: 'play.boholmc.net',
    port: 25565,
    edition: 'crossplay',
    version: '1.21+',
    description: 'Top-ranked adventure and competitive PvP network with custom dungeons, bosses, economy, auctions, and active community.',
    motd: 'BOHOL NETWORK 1.21+ · DUNGEONS & SURVIVAL',
    online: true,
    players: { online: 765, max: 999 },
    tags: ['Anarchy', 'Auctions', 'Cross-Play', 'Economy', 'PvE', 'PvP', 'Cracked'],
    banner: 'https://minecraftservers.org/banners/6884571787824213.gif',
    icon: 'https://minecraftserve.rs/uploads/icon-bohol-network.png',
    isFeatured: true,
    isCracked: true
  },
  {
    id: 'twenture',
    name: 'TWENTURE',
    host: 'sl.twenture.net',
    port: 25565,
    edition: 'crossplay',
    version: '1.21 - 26.3',
    description: '#1 Competitive Survival SMP, Earth Towny, LifeSteal Anarchy, and OneBlock SkyBlock network.',
    motd: 'TWENTURE [1.21-26.3] · Survival · OneBlock · Earth · LifeSteal',
    online: true,
    players: { online: 195, max: 500 },
    tags: ['Anarchy', 'Hardcore', 'Jobs', 'Lifesteal', 'PvP', 'Roleplay', 'OneBlock', 'Cracked', 'Cross-Play'],
    banner: 'https://minecraftservers.org/banners/6500701698499053.gif',
    icon: null,
    isFeatured: true,
    isCracked: true
  },
  {
    id: 'extremecraft',
    name: 'EXTREMECRAFT',
    host: 'sl.extremecraft.net',
    port: 25565,
    edition: 'java',
    version: '1.8 - 1.21',
    description: 'Survival reset: New Bosses, Wands, Pets, Crates, Boosters. Massive network with BedWars, Skyblock, and Factions.',
    motd: 'ExtremeCraft Network [1.8 - 1.21] · BedWars · Factions · KitPvP',
    online: true,
    players: { online: 820, max: 2000 },
    tags: ['Anarchy', 'BedWars', 'Creative', 'Factions', 'KitPvP', 'Lifesteal', 'Java Edition', 'Cracked'],
    banner: 'https://minecraftservers.org/banners/3915821632785058.gif',
    icon: null,
    isFeatured: true,
    isCracked: true
  },
  {
    id: 'illuminati-lifesteal',
    name: 'ILLUMINATI LIFESTEAL',
    host: 'mc-sl.illuminati.onl',
    port: 25565,
    edition: 'crossplay',
    version: '1.20 - 1.21',
    description: 'Custom enchants, lifesteal heart harvesting, player-driven auctions, jobs, and PvE dungeons.',
    motd: 'Illuminati Lifesteal · Custom Enchants & SMP',
    online: true,
    players: { online: 32, max: 250 },
    tags: ['Auctions', 'Economy', 'Jobs', 'Lifesteal', 'PvE', 'PvP', 'Cross-Play', 'Cracked'],
    banner: 'https://minecraftservers.org/banners/6429261791821510.gif',
    icon: null,
    isFeatured: true,
    isCracked: true
  },
  {
    id: 'pika-network',
    name: 'PikaNetwork',
    host: 'play.pika-network.net',
    port: 25565,
    edition: 'java',
    version: '1.8 - 1.21',
    description: '#1 Offline-friendly network with Bedwars, Skyblock, Practice, and KitPvP.',
    motd: 'PikaNetwork · Bedwars, Skyblock & OP Factions',
    online: true,
    players: { online: 12450, max: 20000 },
    tags: ['Bedwars', 'Skyblock', 'Practice', 'KitPvP', 'Cracked'],
    banner: 'https://minecraftservers.org/banners/1127211483828295.gif',
    icon: null,
    isFeatured: true,
    isCracked: true
  },
  {
    id: 'jartex-network',
    name: 'JartexNetwork',
    host: 'play.jartexnetwork.com',
    port: 25565,
    edition: 'java',
    version: '1.8 - 1.21',
    description: 'Massive community server featuring OP Factions, Prison, Lifesteal, and Skywars.',
    motd: 'JartexNetwork · Lifesteal, OP Factions, Prison',
    online: true,
    players: { online: 8920, max: 15000 },
    tags: ['Factions', 'Prison', 'Lifesteal', 'Skywars', 'Cracked'],
    banner: 'https://minecraftservers.org/banners/5037901758819515.gif',
    icon: null,
    isFeatured: true,
    isCracked: true
  },
  {
    id: 'blocksmc',
    name: 'BlocksMC',
    host: 'play.blocksmc.com',
    port: 25565,
    edition: 'java',
    version: '1.8 - 1.21',
    description: 'Practice PvP, Bed Wars and SkyWars, with 100% offline and cracked accounts supported.',
    motd: 'BlocksMC · Practice PvP, Bed Wars, SkyWars',
    online: true,
    players: { online: 450, max: 10000 },
    tags: ['Practice', 'BedWars', 'SkyWars', 'Minigames', 'Cracked'],
    banner: 'https://minecraftservers.org/banners/6807581764218263.gif',
    icon: null,
    isFeatured: true,
    isCracked: true
  },
  {
    id: 'mineberry',
    name: 'MineBerry',
    host: 'mc.mineberry.net',
    port: 25565,
    edition: 'java',
    version: '1.8 - 1.21',
    description: 'Brand new offline-mode minecraft network with Survival, Anarchy, Bedwars, Skywars, and KitPvP.',
    motd: 'MINEBERRY · Survival / Anarchy / BedWars / SkyWars / KitPvP',
    online: true,
    players: { online: 4407, max: 15000 },
    tags: ['Survival', 'Anarchy', 'BedWars', 'SkyWars', 'KitPvP', 'Cracked'],
    banner: 'https://minecraftservers.org/banners/4404881533796292.gif',
    icon: 'https://minecraftserve.rs/uploads/icon-mineberry.png',
    isFeatured: true,
    isCracked: true
  },
  {
    id: 'herobrine-org',
    name: 'Herobrine.org',
    host: 'herobrine.org',
    port: 25565,
    edition: 'java',
    version: '1.8 - 1.21',
    description: 'Top classic survival, Earth Towny, Skyblock, and Bedwars network.',
    motd: 'Herobrine.org · Earth Towny, Survival, Skyblock',
    online: true,
    players: { online: 4150, max: 8000 },
    tags: ['Survival', 'Earth', 'Towny', 'Skyblock', 'Bedwars', 'Cracked'],
    banner: 'https://minecraftservers.org/banners/4154971485790235.gif',
    icon: null,
    isFeatured: true,
    isCracked: true
  },
  {
    id: 'hypixel-net',
    name: 'Hypixel Network',
    host: 'mc.hypixel.net',
    port: 25565,
    edition: 'java',
    version: '1.8 - 1.21',
    description: "The world's largest Minecraft minigame network, home of SkyBlock, Bed Wars, and Arcade.",
    motd: 'Hypixel Network · SkyBlock, Bed Wars, Arcade',
    online: true,
    players: { online: 24571, max: 200000 },
    tags: ['Skyblock', 'Bedwars', 'Minigames', 'Competitive', 'Official'],
    banner: 'https://minecraftservers.org/banners/2218431430479118.gif',
    icon: null,
    isFeatured: true,
    isCracked: false
  },
  {
    id: 'donutsmp-net',
    name: 'DonutSMP',
    host: 'donutsmp.net',
    port: 25565,
    edition: 'java',
    version: '1.20 - 1.21',
    description: '#1 Hardcore Vanilla Minecraft SMP with real stealing, griefing, and PvP.',
    motd: 'DonutSMP.net · Hardcore Survival SMP',
    online: true,
    players: { online: 36945, max: 50000 },
    tags: ['Hardcore', 'Lifesteal', 'Vanilla', 'SMP', 'Anarchy'],
    banner: 'https://minecraftserve.rs/uploads/banner-donutsmp.webp',
    icon: 'https://minecraftserve.rs/uploads/icon-donutsmp.png',
    isFeatured: true,
    isCracked: false
  }
]

export async function fetchPublicServers(query: PublicServerQuery = {}): Promise<PublicServerListResponse> {
  const page = query.page && query.page > 0 ? query.page : 1
  const tagFilter = (query.tag || 'all').toLowerCase().trim()
  const searchFilter = (query.search || '').toLowerCase().trim()
  const cacheKey = `servers-${page}-${tagFilter}-${searchFilter}`

  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    let apiUrl = `https://minecraftserve.rs/api/servers?page=${page}`
    if (tagFilter && tagFilter !== 'all' && tagFilter !== 'cracked' && tagFilter !== 'crossplay') {
      apiUrl += `&tag=${encodeURIComponent(tagFilter)}`
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 7000)

    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AstrixLauncher/1.0.0 (Windows; Minecraft Client)'
      }
    })
    clearTimeout(timeout)

    let apiData: any = { servers: [], total: 0, page: 1, pages: 1 }
    if (res.ok) {
      apiData = await res.json()
    }

    // Map remote API servers
    const apiServers: PublicServerItem[] = (apiData.servers || []).map((s: any) => {
      const lowerTags = (s.tags || []).map((t: string) => t.toLowerCase())
      const isCracked =
        lowerTags.includes('cracked') ||
        lowerTags.includes('offline') ||
        (s.tagline || '').toLowerCase().includes('cracked') ||
        (s.tagline || '').toLowerCase().includes('offline')

      return {
        id: s.slug || s.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: s.name,
        host: s.host,
        port: s.port || 25565,
        edition: s.edition || 'java',
        version: s.version || '1.21',
        description: s.tagline || s.motd || '',
        motd: s.motd || s.tagline || '',
        online: s.online ?? true,
        players: {
          online: s.players?.online || 0,
          max: s.players?.max || 1000
        },
        tags: s.tags || [],
        banner: KNOWN_ANIMATED_BANNERS[(s.host || '').toLowerCase()] || s.banner || null,
        icon: s.icon || null,
        isFeatured: false,
        isCracked
      }
    })

    // Combine with featured community servers on page 1
    const combined: PublicServerItem[] = []
    const seenHosts = new Set<string>()

    if (page === 1) {
      for (const feat of FEATURED_COMMUNITY_SERVERS) {
        if (!seenHosts.has(feat.host.toLowerCase())) {
          seenHosts.add(feat.host.toLowerCase())
          combined.push(feat)
        }
      }
    }

    for (const serv of apiServers) {
      if (!seenHosts.has(serv.host.toLowerCase())) {
        seenHosts.add(serv.host.toLowerCase())
        combined.push(serv)
      }
    }

    // Apply filtering (AstrixMC Official Network always stays pinned at #1)
    let filtered = combined
    if (tagFilter === 'cracked') {
      filtered = filtered.filter(
        (s) =>
          s.id === 'astrixmc-official' ||
          s.isCracked ||
          s.tags.some((t) => t.toLowerCase().includes('cracked') || t.toLowerCase().includes('offline'))
      )
    } else if (tagFilter === 'crossplay') {
      filtered = filtered.filter(
        (s) =>
          s.id === 'astrixmc-official' ||
          s.edition === 'crossplay' ||
          s.tags.some((t) => t.toLowerCase().includes('cross-play') || t.toLowerCase().includes('bedrock'))
      )
    } else if (tagFilter !== 'all') {
      filtered = filtered.filter((s) =>
        s.id === 'astrixmc-official' || s.tags.some((t) => t.toLowerCase().includes(tagFilter))
      )
    }

    if (searchFilter) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchFilter) ||
          s.host.toLowerCase().includes(searchFilter) ||
          (s.description && s.description.toLowerCase().includes(searchFilter)) ||
          s.tags.some((t) => t.toLowerCase().includes(searchFilter))
      )
    }

    const result: PublicServerListResponse = {
      servers: filtered,
      total: Math.max(apiData.total || 0, filtered.length),
      page: apiData.page || page,
      pages: apiData.pages || Math.ceil(filtered.length / 20) || 1
    }

    cache.set(cacheKey, { timestamp: Date.now(), data: result })
    return result
  } catch (err) {
    console.warn('[ServerFinder] Fetch error, returning featured servers:', err)
    // Fallback: Return featured servers if offline
    let fallback = FEATURED_COMMUNITY_SERVERS
    if (tagFilter === 'cracked') {
      fallback = fallback.filter((s) => s.isCracked)
    } else if (tagFilter !== 'all') {
      fallback = fallback.filter((s) => s.tags.some((t) => t.toLowerCase().includes(tagFilter)))
    }
    if (searchFilter) {
      fallback = fallback.filter(
        (s) =>
          s.name.toLowerCase().includes(searchFilter) ||
          s.host.toLowerCase().includes(searchFilter)
      )
    }
    return {
      servers: fallback,
      total: fallback.length,
      page: 1,
      pages: 1
    }
  }
}

export async function pingServerStatus(host: string): Promise<any> {
  const cleanHost = host.trim()
  if (!cleanHost) return { online: false }

  const cached = pingCache.get(cleanHost)
  if (cached && Date.now() - cached.timestamp < 60 * 1000) {
    return cached.data
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(cleanHost)}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AstrixLauncher/1.0.0' }
    })
    clearTimeout(timeout)

    if (res.ok) {
      const data = (await res.json()) as any
      const formatted = {
        online: !!data.online,
        players: {
          online: data.players?.online || 0,
          max: data.players?.max || 0
        },
        motd: data.motd?.clean ? data.motd.clean.join(' ') : '',
        icon: data.icon || null,
        version: data.version || null
      }
      pingCache.set(cleanHost, { timestamp: Date.now(), data: formatted })
      return formatted
    }
  } catch (err) {
    console.warn('[ServerFinder] Ping error for', cleanHost, err)
  }

  return { online: false }
}
