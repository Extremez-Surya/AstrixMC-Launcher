import type { PublicServerItem, PublicServerListResponse } from '../../shared/types/server'

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

export const KNOWN_STATIC_BANNERS: Record<string, string> = {
  'play.boholmc.net': 'https://minecraftserve.rs/uploads/banner-bohol-network.webp',
  'sl.twenture.net': 'https://minecraftserve.rs/uploads/banner-freshsmp.webp',
  'play.pika-network.net': 'https://minecraftserve.rs/uploads/banner-fadecloud.webp',
  'play.blocksmc.com': 'https://minecraftserve.rs/uploads/seed-blocksmc.webp',
  'mc.hypixel.net': 'https://minecraftserve.rs/uploads/seed-hypixel.webp',
  'herobrine.org': 'https://minecraftserve.rs/uploads/banner-saltymc.webp',
  'play.bluemc.net': 'https://minecraftserve.rs/uploads/banner-archmc.webp',
  'sl.extremecraft.net': 'https://minecraftserve.rs/uploads/banner-applemc.webp',
  'play.jartexnetwork.com': 'https://minecraftserve.rs/uploads/banner-vortex-network.webp',
  'mc-sl.illuminati.onl': 'https://minecraftserve.rs/uploads/banner-archmc.webp',
  'mc.mineberry.net': 'https://minecraftserve.rs/uploads/banner-mineberry.webp',
  'play.bananasmp.net': 'https://minecraftserve.rs/uploads/banner-freshsmp.webp',
  'play.fatalmc.com': 'https://minecraftserve.rs/uploads/banner-bohol-network.webp',
  'play.potionmc.com': 'https://minecraftserve.rs/uploads/banner-applemc.webp',
  'play.omniversesmp.com': 'https://minecraftserve.rs/uploads/banner-vortex-network.webp',
  'play.ascendiamc.com': 'https://minecraftserve.rs/uploads/banner-mineberry.webp',
  'donutsmp.net': 'https://minecraftserve.rs/uploads/banner-donutsmp.webp',
  'play.applemc.fun': 'https://minecraftserve.rs/uploads/banner-applemc.webp',
  'hub.lemoncloud.net': 'https://minecraftserve.rs/uploads/banner-fadecloud.webp',
  'play.opblocks.com': 'https://minecraftserve.rs/uploads/banner-vortex-network.webp',
  'play.cubecraft.net': 'https://minecraftserve.rs/uploads/seed-hypixel.webp',
  'play.manacube.com': 'https://minecraftserve.rs/uploads/banner-vortex-network.webp',
  'org.complexgaming.net': 'https://minecraftserve.rs/uploads/banner-mineberry.webp'
}


export const FALLBACK_FEATURED_SERVERS: PublicServerItem[] = [
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
  },
  {
    id: 'bananasmp-net',
    name: 'BananaSMP',
    host: 'play.bananasmp.net',
    port: 25565,
    edition: 'crossplay',
    version: '1.19 - 1.21',
    description: 'Premier Competitive Lifesteal and Survival SMP community featuring custom economy, custom enchants, and friendly player base.',
    motd: 'BananaSMP · Competitive Lifesteal & Survival SMP',
    online: true,
    players: { online: 1090, max: 2500 },
    tags: ['Lifesteal', 'Survival SMP', 'Economy', 'Custom Items', 'Cracked', 'Cross-Play'],
    banner: 'https://minecraftserve.rs/uploads/banner-freshsmp.webp',
    icon: null,
    isFeatured: false,
    isCracked: true
  },
  {
    id: 'minemen-club',
    name: 'Minemen Club',
    host: 'minemen.club',
    port: 25565,
    edition: 'java',
    version: '1.7 - 1.21',
    description: 'Premier competitive practice PvP network with custom anti-cheat, ranked queue, and global tournaments.',
    motd: 'Minemen Club · Premier Competitive Practice PvP',
    online: true,
    players: { online: 1840, max: 4000 },
    tags: ['PvP', 'Practice', 'Ranked', 'Duels', 'Official'],
    banner: 'https://minecraftserve.rs/uploads/banner-fadecloud.webp',
    icon: null,
    isFeatured: false,
    isCracked: false
  },
  {
    id: 'fatalmc-com',
    name: 'FatalMC',
    host: 'play.fatalmc.com',
    port: 25565,
    edition: 'crossplay',
    version: '1.16 - 1.21',
    description: 'Fast-paced BoxPvP, Ranked Arena Duels, and competitive tournament practice with optimized knockback and hit detection.',
    motd: 'FatalMC · Fast-Paced BoxPvP & Arena Duels',
    online: true,
    players: { online: 87, max: 500 },
    tags: ['BoxPvP', 'Duels', 'Practice', 'PvP', 'Cracked'],
    banner: 'https://minecraftserve.rs/uploads/banner-bohol-network.webp',
    icon: null,
    isFeatured: false,
    isCracked: true
  },
  {
    id: 'potionmc-com',
    name: 'PotionMC',
    host: 'play.potionmc.com',
    port: 25565,
    edition: 'java',
    version: '1.8 - 1.21',
    description: 'Classic competitive PotPvP and NoDebuff arena server. Custom leaderboards, ELO ratings, and instant queue matchmaking.',
    motd: 'PotionMC · Classic PotPvP & NoDebuff Arena',
    online: true,
    players: { online: 79, max: 300 },
    tags: ['PotPvP', 'NoDebuff', 'Ranked ELO', 'Practice', 'PvP', 'Cracked'],
    banner: 'https://minecraftserve.rs/uploads/banner-applemc.webp',
    icon: null,
    isFeatured: false,
    isCracked: true
  },
  {
    id: 'bluemc-net',
    name: 'BlueMC',
    host: 'play.bluemc.net',
    port: 25565,
    edition: 'crossplay',
    version: '1.20+',
    description: 'Vibrant minigames network offering Bedwars, Skyblock islands, Custom Survival, and community events.',
    motd: 'BlueMC · Bedwars, Skyblock & Custom Minigames',
    online: true,
    players: { online: 245, max: 1000 },
    tags: ['Bedwars', 'Skyblock', 'Minigames', 'Cross-Play', 'Cracked'],
    banner: 'https://minecraftserve.rs/uploads/banner-archmc.webp',
    icon: null,
    isFeatured: false,
    isCracked: true
  },
  {
    id: 'omni-verse',
    name: 'Omni-Verse MMORPG',
    host: 'play.omniversesmp.com',
    port: 25565,
    edition: 'crossplay',
    version: '1.20.4',
    description: 'Next-generation MMORPG Minecraft experience with procedural dungeons, boss raids, custom guilds, and cross-play support.',
    motd: 'Omni-Verse · Procedural MMORPG Dungeons & Raids',
    online: true,
    players: { online: 180, max: 800 },
    tags: ['MMORPG', 'Custom Dungeons', 'Guilds', 'Survival', 'Cross-Play', 'Cracked'],
    banner: 'https://minecraftserve.rs/uploads/banner-vortex-network.webp',
    icon: null,
    isFeatured: false,
    isCracked: true
  },
  {
    id: 'ascendiamc-com',
    name: 'AscendiaMC Earth',
    host: 'play.ascendiamc.com',
    port: 25565,
    edition: 'java',
    version: '1.20.2+',
    description: 'Expansive Earth SMP, Towny politics, player-driven trading markets, and nation wars on a real 1:1000 world map.',
    motd: 'AscendiaMC · Earth SMP & Towny Politics',
    online: true,
    players: { online: 320, max: 1500 },
    tags: ['Earth SMP', 'Towny', 'Nations', 'Player Economy', 'Survival', 'Cracked'],
    banner: 'https://minecraftserve.rs/uploads/banner-mineberry.webp',
    icon: null,
    isFeatured: false,
    isCracked: true
  }
]

export async function fetchServersWithFallback(
  page = 1,
  category = 'all',
  search = ''
): Promise<PublicServerListResponse> {
  // 1. First try IPC if available
  if (window.electronAPI?.fetchPublicServers) {
    try {
      const ipcRes = await window.electronAPI.fetchPublicServers(page, category, search)
      if (ipcRes && Array.isArray(ipcRes.servers) && ipcRes.servers.length > 0) {
        return ipcRes
      }
    } catch (ipcErr) {
      console.warn('[ServerFinder] IPC fetch failed, falling back to direct web fetch:', ipcErr)
    }
  }

  // 2. Direct browser fetch fallback (Zero disk storage, 100% in-memory)
  try {
    const cleanTag = category.toLowerCase().trim()
    let apiUrl = `https://minecraftserve.rs/api/servers?page=${page}`
    if (cleanTag && cleanTag !== 'all' && cleanTag !== 'cracked' && cleanTag !== 'crossplay') {
      apiUrl += `&tag=${encodeURIComponent(cleanTag)}`
    }

    const res = await fetch(apiUrl)
    if (res.ok) {
      const data = await res.json()
      const remoteServers: PublicServerItem[] = (data.servers || []).map((s: any) => {
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
          players: { online: s.players?.online || 0, max: s.players?.max || 1000 },
          tags: s.tags || [],
          banner: KNOWN_ANIMATED_BANNERS[(s.host || '').toLowerCase()] || s.banner || null,
          icon: s.icon || null,
          isFeatured: false,
          isCracked
        }
      })

      // Combine with featured servers on page 1
      const combined: PublicServerItem[] = []
      const seenHosts = new Set<string>()

      if (page === 1) {
        for (const feat of FALLBACK_FEATURED_SERVERS) {
          if (!seenHosts.has(feat.host.toLowerCase())) {
            seenHosts.add(feat.host.toLowerCase())
            combined.push(feat)
          }
        }
      }

      for (const rem of remoteServers) {
        if (!seenHosts.has(rem.host.toLowerCase())) {
          seenHosts.add(rem.host.toLowerCase())
          combined.push(rem)
        }
      }

      // Filter (AstrixMC Official Network always stays pinned at #1)
      let filtered = combined
      if (cleanTag === 'cracked') {
        filtered = filtered.filter(
          (s) =>
            s.id === 'astrixmc-official' ||
            s.isCracked ||
            s.tags.some((t) => t.toLowerCase().includes('cracked') || t.toLowerCase().includes('offline'))
        )
      } else if (cleanTag === 'crossplay') {
        filtered = filtered.filter(
          (s) =>
            s.id === 'astrixmc-official' ||
            s.edition === 'crossplay' ||
            s.tags.some((t) => t.toLowerCase().includes('cross-play') || t.toLowerCase().includes('bedrock'))
        )
      } else if (cleanTag !== 'all') {
        filtered = filtered.filter((s) =>
          s.id === 'astrixmc-official' || s.tags.some((t) => t.toLowerCase().includes(cleanTag))
        )
      }

      const cleanSearch = search.toLowerCase().trim()
      if (cleanSearch) {
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(cleanSearch) ||
            s.host.toLowerCase().includes(cleanSearch) ||
            s.tags.some((t) => t.toLowerCase().includes(cleanSearch))
        )
      }

      return {
        servers: filtered,
        total: Math.max(data.total || 0, filtered.length),
        page: data.page || page,
        pages: data.pages || Math.ceil(filtered.length / 20) || 1
      }
    }
  } catch (webErr) {
    console.warn('[ServerFinder] Direct web fetch failed, using featured servers:', webErr)
  }

  // 3. Ultra-fallback: return featured community servers
  let fallback = FALLBACK_FEATURED_SERVERS
  const cleanTag = category.toLowerCase().trim()
  if (cleanTag === 'cracked') {
    fallback = fallback.filter((s) => s.id === 'astrixmc-official' || s.isCracked)
  } else if (cleanTag !== 'all') {
    fallback = fallback.filter((s) => s.id === 'astrixmc-official' || s.tags.some((t) => t.toLowerCase().includes(cleanTag)))
  }
  const cleanSearch = search.toLowerCase().trim()
  if (cleanSearch) {
    fallback = fallback.filter(
      (s) =>
        s.name.toLowerCase().includes(cleanSearch) ||
        s.host.toLowerCase().includes(cleanSearch)
    )
  }

  return {
    servers: fallback,
    total: fallback.length,
    page: 1,
    pages: 1
  }
}
