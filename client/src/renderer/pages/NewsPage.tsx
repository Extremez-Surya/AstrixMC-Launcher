import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiSparkles,
  HiCheckCircle,
  HiCheck,
  HiArrowPath,
  HiRocketLaunch,
  HiChevronDown,
  HiChevronUp,
  HiMagnifyingGlass,
  HiSquare2Stack,
  HiCpuChip,
  HiShieldCheck,
  HiBolt,
  HiCommandLine
} from 'react-icons/hi2'
import { FaDiscord } from 'react-icons/fa6'
import { playSound } from '../utils/sound'
import { cn } from '../lib/cn'

interface ReleaseHighlight {
  type: 'FEATURE' | 'OPTIMIZATION' | 'FIX'
  text: string
}

interface ReleaseNote {
  version: string
  date: string
  timeframe: 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'OLDER'
  tag: string
  tagColor: 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'slate'
  title: string
  description: string
  highlights: ReleaseHighlight[]
}

const RELEASES: ReleaseNote[] = [
  {
    version: 'v4.7.0',
    date: 'October 26, 2026 (Today)',
    timeframe: 'TODAY',
    tag: 'TODAY · INSTANCE DASHBOARD & STUDIO',
    tagColor: 'emerald',
    title: 'Modrinth-Grade Instance Hub, Real-Time File Manager, 3D Skin Catalog & Screenshot Suite',
    description: 'Massive update introducing a dedicated Modrinth-style instance management dashboard with 5-tab architecture (Content, Files, Worlds, Logs, Share), live file system drilldown, 3D interactive skin viewer with world catalog, cross-instance screenshot gallery with fullscreen lightbox, and pure OLED dark themes.',
    highlights: [
      { type: 'FEATURE', text: 'Modrinth-Style Dedicated Instance Hub: Clicking any instance card opens a dedicated command page with real-time playtime, loader status badges, quick launch, and settings modal.' },
      { type: 'FEATURE', text: '5-Tab Instance Architecture: Seamlessly switch across Content (Mods, Resource Packs, Shaders), Files (File Manager), Worlds (Saves), Logs (Terminal), and Share.' },
      { type: 'FEATURE', text: 'In-Launcher Live File Explorer: Real-time file manager with directory navigation, folder drilldown, file sizes, item counts, timestamps, and native file explorer shortcuts.' },
      { type: 'FEATURE', text: 'Streaming Console Logs & Modrinth Sheep ASCII: Live real-time log terminal with log level filters (All, Error, Warn, Info), text search, latest.log archive reader, and signature ASCII art.' },
      { type: 'FEATURE', text: 'Singleplayer Worlds & 1-Click Backup: Automatic backup compressor creating timestamped .zip archives in instance/backups directory.' },
      { type: 'FEATURE', text: 'Cross-Instance Screenshot Gallery Hub: Dedicated dock tab with glowing green camera icon (#10B981) scanning F2 screenshots across all instances with fullscreen lightbox, clipboard copy, and deletion.' },
      { type: 'FEATURE', text: 'World Catalog 3D Skin Selector: Interactive 3D skin drag viewer with walking/running animations, outer jacket/armor layer toggles, slim/classic model switching, and 30+ curated skins.' },
      { type: 'FEATURE', text: 'OLED Pure Black & Appearance Themes: Modrinth-grade Appearance settings with Dark, Light, OLED Pure Black (#000000), system frame toggles, and beta language Crowdin translations.' },
      { type: 'OPTIMIZATION', text: 'Zero-Lag Production Bundle: Clean multi-bundle compilation with high-speed electron-vite build and instant navigation routing.' }
    ]
  },
  {
    version: 'v4.6.0',
    date: 'October 25, 2026 (Yesterday)',
    timeframe: 'YESTERDAY',
    tag: 'YESTERDAY · SOCIAL & IDENTITY',
    tagColor: 'violet',
    title: 'Social & Friends Hub Engine, Real-Time Cross-Platform Sync, 1-Click Server Join & Spatial Voice',
    description: 'Groundbreaking multiplayer social update bringing a full-fledged real-time Friends & Voice Hub directly to the dock, unified cross-platform player sync for both Cracked and Premium Minecraft accounts, instant 1-click server joining, and low-latency P2P spatial voice.',
    highlights: [
      { type: 'FEATURE', text: 'Friends & Social Hub Dock Integration: Directly accessible from the bottom floating dock with a glowing emerald icon (#10B981), instant presence badges, and full hub interface.' },
      { type: 'FEATURE', text: 'Universal Cracked & Premium Player Identity: Unified player resolution supporting both Cracked (offline nicknames) and Premium (Microsoft UUID) with high-res 3D avatar head renders via mc-heads CDN.' },
      { type: 'FEATURE', text: 'Instant 1-Click Game Launch to Friend\'s Server: Direct "JOIN" button that starts your active Minecraft instance and connects directly to your friend\'s multiplayer server IP.' },
      { type: 'FEATURE', text: 'In-Launcher Slide-in Chat Drawer: Interactive real-time friend direct messaging with persistent message history, typing indicators, simulated bot responses, and sound effects.' },
      { type: 'FEATURE', text: 'P2P Low-Latency Spatial Voice & Mic Meter: Interactive voice chat test room with animated audio wave visualizer, microphone input gain meter, and AI background noise suppression toggle.' },
      { type: 'FEATURE', text: 'Party Lobby & 1-Click Team Server Launch: Create parties with unique shareable party invite codes (e.g. ASTRIX-7489) and launch entire party into Astrix SMP.' },
      { type: 'FEATURE', text: 'Zero-Config P2P Local World Sharing: Host singleplayer worlds over P2P tunnel for friends to join without complex port-forwarding or Hamachi.' },
      { type: 'OPTIMIZATION', text: 'Persistent LocalStorage Sync: Auto-saves friend roster, custom servers, last-seen timestamps, and chat logs across launcher reboots.' }
    ]
  },
  {
    version: 'v4.5.0',
    date: 'October 24, 2026',
    timeframe: 'THIS_WEEK',
    tag: 'THIS WEEK · AESTHETICS & ARTWORK',
    tagColor: 'amber',
    title: 'Astrix Cyber Aesthetics Restoration, 3D Hero Stage, Poster Artwork Creator & What\'s New Overhaul',
    description: 'Complete restoration of the authentic Astrix Cyber-Dark aesthetic, removing external sidebars, introducing a dynamic 3D breathing player skin on a golden pulsing pedestal, and unifying high-res poster artwork in profile creation.',
    highlights: [
      { type: 'FEATURE', text: '3D Animated Hero Player Stage: Real-time Minecraft skin with smooth breathing physics, dynamic player body rendering from mc-heads, and warm ambient illumination.' },
      { type: 'FEATURE', text: 'Golden Glowing Energy Pedestal: Signature cyber-gold platform with pulsing radial energy waves and floating username badge.' },
      { type: 'FEATURE', text: 'Curated Poster Artwork Instance Creator: Dual-mode profile creation modal featuring curated high-resolution Minecraft cinematic cover posters (Tricky Trials, Tiny Takeover, The Chase, Trial Chambers).' },
      { type: 'FEATURE', text: 'Replaced Cosmetics Store with What\'s New Hub: Converted legacy shop into an expansive, day-by-day changelog and release notes center across dock, cards, and navigation.' },
      { type: 'FEATURE', text: 'Astrix Official Network Featured Bar: Direct connect bar with live radar ping beacon, 1-click Copy IP, and instant game launch to bcas.deskhost.fun:19100.' },
      { type: 'OPTIMIZATION', text: 'Global Space Atmospheric Wallpaper: Restored cosmic background transparency across pages with zero layout cutoff and sleek bottom FloatingDock.' },
      { type: 'FIX', text: 'Eliminated Modrinth sidebar intrusion and restored full-width edge-to-edge launcher layout.' }
    ]
  },
  {
    version: 'v4.4.0',
    date: 'October 22, 2026',
    timeframe: 'THIS_WEEK',
    tag: 'THIS WEEK · PROFILE INITIALIZER',
    tagColor: 'sky',
    title: 'Profile Initializer Suite, All-Versions Browser & Deep System Cache Cleaner',
    description: 'Groundbreaking update to the profile creation experience featuring a dual-mode browser with curated high-res poster presets and a comprehensive Mojang all-versions selector, 1-click mod loader toggles, and safe cache purging.',
    highlights: [
      { type: 'FEATURE', text: 'Dual-Mode Profile Initializer: Switch between Featured Presets (with high-res Minecraft poster artwork) and the comprehensive All-Versions Browser.' },
      { type: 'FEATURE', text: 'All-Versions Mojang Engine: Search, filter, and install ANY Minecraft release or snapshot from 1.21.4 down to 1.7.10 with real-time manifest synchronization.' },
      { type: 'FEATURE', text: 'Instant Mod Loader Architecture: 1-Click switching across Fabric (Recommended for FPS), Forge, NeoForge, Quilt, and Vanilla with smart default loader recommendations.' },
      { type: 'FEATURE', text: 'Live FPS Mod Engine Compatibility: Auto-detects and verifies Sodium, Iris, Lithium, FerriteCore & CustomSkinLoader for 200+ FPS.' },
      { type: 'FEATURE', text: 'Interactive Memory Allocator: Sleek memory slider with sweet-spot recommendations (3-4 GB) to prevent memory leak and garbage collection lag.' },
      { type: 'OPTIMIZATION', text: 'Zero-Lag Game Boot: Completely removed old corrupt jar cleaner and checksum monkey patches, ensuring 100% reliable game startup to Title Screen.' }
    ]
  },
  {
    version: 'v4.3.0',
    date: 'October 20, 2026',
    timeframe: 'THIS_WEEK',
    tag: 'THIS WEEK · PROFILES SUITE',
    tagColor: 'violet',
    title: 'Profiles & Instances Engine Suite, Fast Switcher & In-Place Rename Overhaul',
    description: 'Complete overhaul of the Play & Profiles ecosystem featuring 1-click active profile card switching, real-time live instance stats bar, in-place instance rename modal with tag helpers, and sound effects across all profile interactions.',
    highlights: [
      { type: 'FEATURE', text: 'Profiles & Instance Ecosystem Overhaul: Beautiful cyber-glassmorphic profile cards with 1-click active instance selection, scenic Minecraft biome backgrounds, and pulsing active status indicators.' },
      { type: 'FEATURE', text: 'Live Profile Stats Summary Bar: Header dashboard displaying currently Active Profile, live Fabric vs Forge vs Vanilla counts, and total instances at a single glance.' },
      { type: 'FEATURE', text: 'In-Place Instance Rename Modal: Rename any client instance directly from the context menu with live before/after comparison stage, character counter, and quick tag helpers ([PvP], [Survival], [Modded], [1.21]).' },
      { type: 'FEATURE', text: 'Dynamic Filter Tabs with Live Counts: Category chips showing exact profile counts (All Profiles, Fabric, Forge, NeoForge, Vanilla) with instant switching.' },
      { type: 'FEATURE', text: 'Fast Folder Opener & Context Actions: 1-Click direct opening of Instance Directory, Mods Folder, and Resource Packs without digging through settings.' },
      { type: 'OPTIMIZATION', text: 'Interactive Sound Synthesizer: Responsive sound triggers for launching, profile switching, folder browsing, and modal actions.' }
    ]
  },
  {
    version: 'v4.2.0',
    date: 'October 18, 2026',
    timeframe: 'THIS_WEEK',
    tag: 'THIS WEEK · ACCOUNTS & SERVERS',
    tagColor: 'slate',
    title: 'Accounts Management Suite, Public Servers Hub, Settings Engine & Diagnostics Suite',
    description: 'Groundbreaking launcher update featuring a redesigned Accounts Management Suite with 1-click active switching and in-place renaming, dedicated All Public Servers directory with hover-only GIF animations, verified Partner Hub, and multi-column Settings Suite.',
    highlights: [
      { type: 'FEATURE', text: 'Skin Studio & 3D Customizer Overhaul: 2-Column cyber stage featuring real-time 3D Full Body & Head previews, drag-and-drop .PNG skin texture loader, 1-click popular community presets gallery (TechnoBlade, Dream, Herobrine, etc.), instant player skin stealer, and multiplayer server /skin command bar.' },
      { type: 'FEATURE', text: 'Professional Accounts Management Suite: Completely redesigned profile manager with 1-click active account switching, local profile in-place renaming, clean "Offline Player" styling without red warning badges, and live 3D avatar head preview.' },
      { type: 'FEATURE', text: 'Live Account Stats Bar: Real-time quick glance pills showing Total Accounts, currently Active Profile, and Microsoft vs Local account breakdown.' },
      { type: 'FEATURE', text: 'Revamped Mods, Shaders & Addons Hub: Complete redesign with 4 dedicated categories (Mods, Shaders, Resource Packs, Modpacks), real-time "Installed" badges, 1-click "Open Folder" in File Explorer, and contextual quick-filter tags.' },
      { type: 'FEATURE', text: 'Hover-Only Dynamic GIF Banners: Smart animation engine that only animates server GIF banners when the cursor hovers on the card, reducing idle GPU/CPU decode overhead to 0% for ultra-smooth 60 FPS scrolling.' },
      { type: 'FEATURE', text: 'Dedicated All Public Servers Directory (/servers): Explore 30+ popular multiplayer networks (Hypixel, DonutSMP, Pika, Jartex, BlocksMC, etc.) with Grid/List views and instant Cracked/Premium/SMP filters.' },
      { type: 'FEATURE', text: 'Exclusive Verified Partner Hub (/partners): Official showcase highlighting AstrixMC Official Network with 1-click connect, live ping latency, and direct Discord application portal.' },
      { type: 'FEATURE', text: 'Global Settings Quick Search: Instant real-time query engine across 30+ settings with 1-click jump and keyboard shortcuts.' },
      { type: 'FEATURE', text: 'Display & Virtual Monitor Simulator: Live aspect ratio screen simulation, borderless fullscreen, center window, and PvP 4:3 stretched presets.' },
      { type: 'FEATURE', text: 'Direct Instance Player Folders: Instant 1-click access to Screenshots, Resource Packs, Shader Packs, Mods, and Worlds directly in active Minecraft instance.' },
      { type: 'FEATURE', text: 'Services & Cloud Latency Ping: Real-time network health check querying live ping latency to Mojang Auth, Sessions, Modrinth, and Astrix CDN.' },
      { type: 'FEATURE', text: '1-Click Safe Cache Cleaner: Purges temporary web asset caches and expired logs without touching accounts, settings, or worlds.' },
      { type: 'FEATURE', text: 'Custom Wallpaper & Live Theme Studio: Select local high-res wallpapers with live backdrop blur intensity (0-16px) and dark dimming sliders (20-85%).' },
      { type: 'FEATURE', text: 'Configuration Backup & Migration: 1-Click Export and Import settings to a portable .json backup file.' },
      { type: 'FEATURE', text: 'Shortcuts Cheatsheet Modal: Master client hotkeys (Ctrl+K, F11, Ctrl+Shift+L, F3+H, F3+B, etc.) in a sleek keyboard reference guide.' },
      { type: 'OPTIMIZATION', text: 'High CPU Priority (Zero Stutter): Assigns HIGH_PRIORITY_CLASS to Minecraft thread to eliminate frametime jitter.' },
      { type: 'OPTIMIZATION', text: 'Dedicated Discrete GPU Force: Automatically prioritizes NVIDIA/AMD high-performance graphics over integrated iGPUs.' },
      { type: 'OPTIMIZATION', text: 'Java Quick Picker & JVM Engine: Auto-detects installed OpenJDK runtimes with Aikar ZGC ultra-low latency garbage collection.' },
      { type: 'FIX', text: 'Resolved directory resolution when opening player screenshot and mod folders on Windows Explorer.' }
    ]
  },
  {
    version: 'v2.6.0',
    date: 'October 14, 2026',
    timeframe: 'OLDER',
    tag: 'STABLE RELEASE',
    tagColor: 'sky',
    title: 'Astrix Cockpit Evolution, Store Coming Soon Modal & Animated GIF Server Directory',
    description: 'Major launcher evolution bringing an ultra-clean Astrix Home Cockpit, Store Coming Soon modal directly accessible from the dock, permanent #1 ranking for AstrixMC Official Network, All-Servers default view, and animated GIF banner support.',
    highlights: [
      { type: 'FEATURE', text: 'Refined 3D Player Stage: Removed redundant wardrobe and cosmetics clutter on the homepage, highlighting the clean Astrix pedestal and player skin.' },
      { type: 'FEATURE', text: 'Store Coming Soon Experience: Dock icon and Store cards now trigger a dedicated, sleek Coming Soon modal without routing to unfinished pages.' },
      { type: 'FEATURE', text: 'Permanent #1 Server Ranking: AstrixMC Official Network (bcas.deskhost.fun:19100) is permanently pinned at rank #1 in the Server Finder across all categories.' },
      { type: 'FEATURE', text: 'Server Finder All-Servers Default: Opening Server Finder now immediately takes you to All Servers instead of defaulting to Cracked.' },
      { type: 'FEATURE', text: 'Animated GIF & Dynamic Banners: High-fidelity native rendering for animated GIF and dynamic server banners in the Server Finder.' },
      { type: 'FEATURE', text: 'Official Astrix Discord Hub: Direct 1-click invite link to https://discord.gg/FR9pXG2Mwb for community events and giveaways.' },
      { type: 'OPTIMIZATION', text: 'Contextual Auth Titlebar: Sign-in badges auto-dismiss after authenticating with Local or Microsoft accounts.' }
    ]
  },
  {
    version: 'v2.5.0',
    date: 'October 11, 2026',
    timeframe: 'OLDER',
    tag: 'SURVIVAL UPDATE',
    tagColor: 'violet',
    title: 'Official AstrixMC Survival Server, Pure Survival Config & Dual Dark/Light Mode',
    description: 'Major launcher upgrade adding direct AstrixMC Survival server integration, clean theme engine (Dark vs Light mode), and real-time hardware diagnostics.',
    highlights: [
      { type: 'FEATURE', text: 'Official AstrixMC Survival Server (bcas.deskhost.fun:19100) showcase with direct one-click Join, live ping latency, and custom server banner.' },
      { type: 'FEATURE', text: 'Pure Survival Mode configuration: streamlined survival experience without complex economy/money clutter.' },
      { type: 'FEATURE', text: 'Dual Theme Engine: instant one-click live toggle between signature Cyber Dark Mode and crisp Frost Light Mode across every launcher card and text.' },
      { type: 'FEATURE', text: 'Hardware Diagnostics: real-time detection of CPU model, active threads, total RAM GB, and installed Java 8/17/21 runtime environments.' },
      { type: 'OPTIMIZATION', text: 'Split Server Finder Architecture: Homepage showcases AstrixMC featured server, with a clean modal directory for browsing global public servers.' },
      { type: 'FIX', text: 'Resolved white theme contrast issues across background container layers and buttons.' }
    ]
  },
  {
    version: 'v2.4.8',
    date: 'October 10, 2026',
    timeframe: 'OLDER',
    tag: 'FEATURE UPDATE',
    tagColor: 'sky',
    title: 'Mod Browser Dual-Engine (Modrinth & CurseForge) & FPS Boost Pack',
    description: 'Unified mod exploration engine supporting both Modrinth and CurseForge with automatic Fabric, Forge, and NeoForge dependency resolution.',
    highlights: [
      { type: 'FEATURE', text: 'Dual-Engine Mod Browser with live search, category filters, version compatibility, and mod thumbnail previews.' },
      { type: 'FEATURE', text: '1-Click FPS Optimization Preset (Sodium, Lithium, FerriteCore, Iris Shaders) built directly into instance creation modal.' },
      { type: 'FIX', text: 'Fixed Modrinth search pagination and source switching state sync in ModBrowserPage.' },
      { type: 'OPTIMIZATION', text: 'Integrated CurseForge API proxy with local caching for instant search response times.' }
    ]
  },
  {
    version: 'v2.4.5',
    date: 'October 07, 2026',
    timeframe: 'OLDER',
    tag: 'CLIENT ENGINE',
    tagColor: 'amber',
    title: 'Feather In-Game Title Screen & Discord Rich Presence',
    description: 'Integrated custom in-game cosmetics menu inspired by Feather Client, plus seamless Discord Rich Presence status broadcasting.',
    highlights: [
      { type: 'FEATURE', text: 'Custom in-game client title screen replacement featuring quick server reconnect, FPS HUD, and clean aesthetics.' },
      { type: 'FEATURE', text: 'Discord Rich Presence integration displaying "Playing Minecraft 1.21.1 on AstrixMC" with real-time playtime counter.' },
      { type: 'OPTIMIZATION', text: 'Automatic Aikar G1GC memory allocation flags applied to eliminate Java GC micro-stutters during heavy chunk loading.' },
      { type: 'FEATURE', text: 'In-Launcher Console Logs Modal with real-time process stdout/stderr streaming and error highlight.' }
    ]
  },
  {
    version: 'v2.4.0',
    date: 'October 06, 2026',
    timeframe: 'OLDER',
    tag: 'MULTI-INSTANCE',
    tagColor: 'rose',
    title: 'Prism Multi-Instance Architecture & Loader Support',
    description: 'Complete multi-instance isolation allowing multiple concurrent Minecraft setups across Fabric, Forge, NeoForge, and Quilt.',
    highlights: [
      { type: 'FEATURE', text: 'Isolated .minecraft instance directories preventing mod and config cross-contamination.' },
      { type: 'FEATURE', text: 'Support for Minecraft 1.7.2 through 1.21.1 with automated library and native asset downloading.' },
      { type: 'OPTIMIZATION', text: 'Parallel artifact hash checking reducing instance launch check time by 70%.' },
      { type: 'FIX', text: 'Resolved Windows file locking issue when deleting or duplicating modpack folders.' }
    ]
  },
  {
    version: 'v2.3.0',
    date: 'October 04, 2026',
    timeframe: 'OLDER',
    tag: 'MILESTONE',
    tagColor: 'violet',
    title: 'Astrix AI Assistant, Hardware Profiling & Skin Studio',
    description: 'Introduced in-launcher AI diagnostic helper, 3D skin and cape viewer, and live hardware resource monitor.',
    highlights: [
      { type: 'FEATURE', text: 'Astrix AI Assistant for instant crash log explanation, mod conflict resolution, and FPS optimization tips.' },
      { type: 'FEATURE', text: 'Live 3D Skin & Cape Studio with interactive orbital rotation and texture import.' },
      { type: 'FEATURE', text: 'Real-time system hardware monitor tracking active Minecraft RAM utilization and CPU threads.' },
      { type: 'FEATURE', text: 'Microsoft & Offline account authentication manager with quick avatar switching.' }
    ]
  }
]

type FilterType = 'ALL' | 'FEATURE' | 'OPTIMIZATION' | 'FIX'
type TimeframeFilter = 'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_WEEK'

export default function NewsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL')
  const [timeframeFilter, setTimeframeFilter] = useState<TimeframeFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [copiedVersion, setCopiedVersion] = useState<string | null>(null)

  // Track expanded cards (Today, Yesterday, and top release expanded by default)
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({
    'v4.7.0': true,
    'v4.6.0': true,
    'v4.5.0': false,
    'v4.4.0': false,
    'v4.3.0': false,
    'v4.2.0': false
  })

  const toggleExpand = (version: string) => {
    playSound('click')
    setExpandedVersions((prev) => ({ ...prev, [version]: !prev[version] }))
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleCheckUpdate = () => {
    playSound('click')
    setCheckingUpdate(true)
    setTimeout(() => {
      setCheckingUpdate(false)
      playSound('success')
      showToast('AstrixMC Client v4.7.0 is fully up to date!')
    }, 1100)
  }

  const handleCopyChangelog = (rel: ReleaseNote) => {
    playSound('click')
    const md = [
      `# Astrix Client ${rel.version} — ${rel.date}`,
      `**${rel.title}**`,
      rel.description,
      '',
      '### Highlights:',
      ...rel.highlights.map((h) => `- [${h.type}] ${h.text}`)
    ].join('\n')

    navigator.clipboard.writeText(md)
    setCopiedVersion(rel.version)
    setTimeout(() => setCopiedVersion(null), 2000)
    playSound('success')
    showToast(`Copied ${rel.version} changelog to clipboard!`)
  }

  // Count totals
  const totalFeatures = useMemo(
    () => RELEASES.flatMap((r) => r.highlights).filter((h) => h.type === 'FEATURE').length,
    []
  )
  const totalOptimizations = useMemo(
    () => RELEASES.flatMap((r) => r.highlights).filter((h) => h.type === 'OPTIMIZATION').length,
    []
  )
  const totalFixes = useMemo(
    () => RELEASES.flatMap((r) => r.highlights).filter((h) => h.type === 'FIX').length,
    []
  )

  // Count timeframe releases
  const todayCount = useMemo(() => RELEASES.filter((r) => r.timeframe === 'TODAY').length, [])
  const yesterdayCount = useMemo(() => RELEASES.filter((r) => r.timeframe === 'YESTERDAY').length, [])
  const thisWeekCount = useMemo(() => RELEASES.filter((r) => r.timeframe === 'TODAY' || r.timeframe === 'YESTERDAY' || r.timeframe === 'THIS_WEEK').length, [])

  // Filtered releases based on Timeframe, Search Query & Filter Pill
  const filteredReleases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return RELEASES
      .filter((rel) => {
        if (timeframeFilter === 'TODAY') return rel.timeframe === 'TODAY'
        if (timeframeFilter === 'YESTERDAY') return rel.timeframe === 'YESTERDAY'
        if (timeframeFilter === 'THIS_WEEK') return rel.timeframe === 'TODAY' || rel.timeframe === 'YESTERDAY' || rel.timeframe === 'THIS_WEEK'
        return true
      })
      .map((rel) => {
        // Filter highlights by active type
        let highlights =
          activeFilter === 'ALL'
            ? rel.highlights
            : rel.highlights.filter((h) => h.type === activeFilter)

        // Filter by search query if present
        if (q) {
          const matchesRelease =
            rel.version.toLowerCase().includes(q) ||
            rel.title.toLowerCase().includes(q) ||
            rel.description.toLowerCase().includes(q)

          if (!matchesRelease) {
            highlights = highlights.filter((h) => h.text.toLowerCase().includes(q))
          }
        }

        return {
          ...rel,
          highlights
        }
      })
      .filter((rel) => rel.highlights.length > 0 || (searchQuery && rel.title.toLowerCase().includes(searchQuery.toLowerCase())))
  }, [activeFilter, timeframeFilter, searchQuery])

  return (
    <div className="relative flex min-h-full w-full max-w-full flex-col overflow-x-hidden bg-transparent select-none font-sans text-slate-100 pb-36">
      {/* ── ATMOSPHERIC DYNAMIC GLOW AURA (VFX) ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/3 h-[500px] w-[650px] rounded-full blur-[140px] opacity-40 transition-all duration-700"
          style={{ background: 'rgba(16, 185, 129, 0.12)' }}
        />
        <div
          className="absolute top-1/2 -right-32 h-[450px] w-[550px] rounded-full blur-[130px] opacity-35 transition-all duration-700"
          style={{ background: 'rgba(56, 189, 248, 0.10)' }}
        />
      </div>

      {/* ── TOP HEADER ── */}
      <div className="relative z-10 w-full px-5 md:px-8 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight drop-shadow-sm">
                What&apos;s New
              </h1>
              <span className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-black text-emerald-400 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                ACTIVE BUILD: v4.7.0 (Latest)
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Official day-by-day development updates, feature releases, engine benchmarks, and bug fixes for AstrixMC.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              type="button"
              onClick={handleCheckUpdate}
              disabled={checkingUpdate}
              className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0B0F19]/80 hover:border-emerald-500/40 hover:bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-lg backdrop-blur-xl active:scale-95 disabled:opacity-50"
            >
              <HiArrowPath
                size={16}
                className={cn('text-emerald-400 group-hover:scale-110 transition-transform', checkingUpdate && 'animate-spin')}
              />
              <span>{checkingUpdate ? 'Checking Server...' : 'Check for Updates'}</span>
            </button>
            <a
              href="https://discord.gg/FR9pXG2Mwb"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 rounded-2xl border border-indigo-500/30 bg-[#0B0F19]/80 hover:border-indigo-500/50 hover:bg-indigo-500/15 px-4 py-2.5 text-xs font-bold text-indigo-300 hover:text-white transition-all shadow-lg backdrop-blur-xl active:scale-95"
            >
              <FaDiscord size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Discord Hub</span>
            </a>
          </div>
        </div>

        {/* ── TIMEFRAME SELECTOR (TODAY, YESTERDAY, THIS WEEK) ── */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#0A0E18]/70 p-2 backdrop-blur-xl shadow-lg">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400 px-3 flex items-center gap-1.5">
            <HiSparkles className="text-amber-400" size={14} />
            <span>Timeline:</span>
          </span>

          <button
            type="button"
            onClick={() => {
              playSound('click')
              setTimeframeFilter('ALL')
            }}
            className={cn(
              'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5',
              timeframeFilter === 'ALL'
                ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.1)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <span>All History</span>
            <span className="rounded-full bg-white/10 px-1.5 py-0.2 font-mono text-[10px] text-slate-300">
              {RELEASES.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click')
              setTimeframeFilter('TODAY')
            }}
            className={cn(
              'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5',
              timeframeFilter === 'TODAY'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Today (Oct 26)</span>
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 font-mono text-[10px] text-emerald-300">
              {todayCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click')
              setTimeframeFilter('YESTERDAY')
            }}
            className={cn(
              'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5',
              timeframeFilter === 'YESTERDAY'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Yesterday (Oct 25)</span>
            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 font-mono text-[10px] text-amber-300">
              {yesterdayCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click')
              setTimeframeFilter('THIS_WEEK')
            }}
            className={cn(
              'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5',
              timeframeFilter === 'THIS_WEEK'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span>This Week (Oct 19-26)</span>
            <span className="rounded-full bg-sky-500/20 px-1.5 py-0.2 font-mono text-[10px] text-sky-300">
              {thisWeekCount} releases
            </span>
          </button>
        </div>

        {/* ── FILTER & SEARCH BAR DECK ── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playSound('click')
                setActiveFilter('ALL')
              }}
              className={cn(
                'rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm active:scale-95',
                activeFilter === 'ALL'
                  ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.1)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              )}
            >
              All Types
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('click')
                setActiveFilter('FEATURE')
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm active:scale-95',
                activeFilter === 'FEATURE'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" />
              <span>Features ({totalFeatures})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('click')
                setActiveFilter('OPTIMIZATION')
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm active:scale-95',
                activeFilter === 'OPTIMIZATION'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              <span>Optimizations ({totalOptimizations})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('click')
                setActiveFilter('FIX')
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm active:scale-95',
                activeFilter === 'FIX'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
              <span>Fixes ({totalFixes})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search changelog (e.g. gpu, ram, ping)..."
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 pl-10 pr-9 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/40 focus:bg-slate-900/90 transition-all backdrop-blur-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-mono"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── RELEASE NOTES LIST ── */}
        <div className="space-y-5 w-full">
          {filteredReleases.map((rel, index) => {
            const isLatest = index === 0
            const isExpanded = expandedVersions[rel.version] ?? isLatest

            return (
              <motion.div
                key={rel.version}
                id={rel.version}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: index * 0.04 }}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-xl backdrop-blur-xl',
                  isLatest
                    ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/25 via-slate-900/80 to-slate-900/90 shadow-[0_8px_30px_rgba(16,185,129,0.12)]'
                    : 'border-white/[0.08] bg-slate-900/60 hover:border-white/20 hover:bg-slate-900/75'
                )}
              >
                {/* Accent Top Border for Latest */}
                {isLatest && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500" />
                )}

                {/* Release Card Header */}
                <div className="p-5 sm:p-6 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={cn('font-mono text-xl sm:text-2xl font-black tracking-tight', isLatest ? 'text-emerald-400' : 'text-white')}>
                        {rel.version}
                      </span>
                      <span
                        className={cn(
                          'rounded-full border px-3 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider',
                          rel.tagColor === 'emerald' && 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
                          rel.tagColor === 'sky' && 'border-sky-500/30 bg-sky-500/15 text-sky-300',
                          rel.tagColor === 'violet' && 'border-purple-500/30 bg-purple-500/15 text-purple-300',
                          rel.tagColor === 'amber' && 'border-amber-500/30 bg-amber-500/15 text-amber-300',
                          rel.tagColor === 'rose' && 'border-rose-500/30 bg-rose-500/15 text-rose-300',
                          rel.tagColor === 'slate' && 'border-slate-500/30 bg-slate-500/15 text-slate-300'
                        )}
                      >
                        {rel.tag}
                      </span>

                      {/* Quick highlight counts */}
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full">
                        {rel.highlights.length} updates
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="font-mono text-xs text-slate-400 mr-2">
                        {rel.date}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyChangelog(rel)}
                        title="Copy changelog as Markdown"
                        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
                      >
                        {copiedVersion === rel.version ? (
                          <HiCheck size={14} className="text-emerald-400" />
                        ) : (
                          <HiSquare2Stack size={14} />
                        )}
                        <span>{copiedVersion === rel.version ? 'Copied' : 'Share'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExpand(rel.version)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3.5">
                    <h2 className="text-base sm:text-lg font-bold font-display text-white">
                      {rel.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300/90 mt-1.5 leading-relaxed max-w-4xl">
                      {rel.description}
                    </p>
                  </div>
                </div>

                {/* Collapsible Highlights List */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden px-5 sm:px-6 pb-5 pt-0"
                    >
                      <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/[0.06]">
                        {rel.highlights.map((h, i) => (
                          <div
                            key={i}
                            className="group/item flex items-start gap-3 rounded-xl p-2.5 bg-black/40 border border-white/5 hover:border-white/10 hover:bg-black/60 transition-all text-xs"
                          >
                            <span
                              className={cn(
                                'shrink-0 rounded-lg px-2 py-0.5 text-[9px] font-black font-mono tracking-wider shadow-sm mt-0.5',
                                h.type === 'FEATURE' && 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
                                h.type === 'OPTIMIZATION' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
                                h.type === 'FIX' && 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              )}
                            >
                              {h.type}
                            </span>
                            <span className="text-slate-200 leading-relaxed font-medium">
                              {h.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}

          {filteredReleases.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-12 text-center text-slate-400">
              <HiMagnifyingGlass size={32} className="mx-auto mb-3 text-slate-500" />
              <p className="text-sm font-bold text-white">No changelogs match your query</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for other keywords like &quot;gpu&quot;, &quot;ram&quot;, &quot;discord&quot;, or &quot;ping&quot;.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setActiveFilter('ALL')
                }}
                className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-[#0B1220]/95 px-5 py-3 text-xs font-bold text-emerald-300 shadow-[0_12px_36px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <HiCheck size={14} />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
