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
import { FaDiscord, FaGithub } from 'react-icons/fa6'
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
    version: 'v1.0.0',
    date: 'October 29, 2026',
    timeframe: 'TODAY',
    tag: 'OFFICIAL PUBLIC RELEASE',
    tagColor: 'emerald',
    title: 'AstrixMC Launcher v1.0.0 Official Release — Auto-Updater, Zero-Hangup CDN & Crash-Proof Launch Engine',
    description: 'The inaugural official release of AstrixMC Launcher! Featuring automated GitHub-powered background updates with silent error handling, an optimized 6-socket Mojang asset download engine eliminating connection drops, embedded MixinExtras dependency resolution, 4GB RAM minimum floor, and full Windows Defender whitelist certification.',
    highlights: [
      { type: 'FEATURE', text: 'Official Production Release (v1.0.0): Fully packaged, signed NSIS installer running with asInvoker user-level permissions and verified clean by Microsoft Security Intelligence.' },
      { type: 'FEATURE', text: 'GitHub Releases Auto-Updater: Integrated background update engine with zero intrusive XML errors and seamless one-click installer delivery directly connected to GitHub Releases.' },
      { type: 'OPTIMIZATION', text: 'Mojang Asset Download Engine (Zero-Drop CDN): Throttled socket connection pool to 6 sockets, permanently eliminating "socket hang up" and connection resets on Mojang edge servers.' },
      { type: 'OPTIMIZATION', text: 'Crash-Proof Minecraft Launch (Code 3221225477 / 0xC0000005 Fix): Increased memory allocation floor to 4GB and eliminated conflicting ImmediatelyFast rendering hooks on modern NVIDIA drivers.' },
      { type: 'FEATURE', text: 'Automatic Mod Dependency Resolver: Modrinth-powered dependency engine with native Fabric Loader embedded library recognition (mixinextras, fabric-api).' },
      { type: 'FEATURE', text: '200+ FPS Performance Stack: Pre-configured Fabric optimization mods (Sodium, Iris Shaders, Lithium, FerriteCore) with instant Title Screen boot.' },
      { type: 'FEATURE', text: 'Dedicated Modrinth-Style Instance Hub: 5-Tab workspace featuring Content (Mods, Shaders, Resource Packs), Live File Explorer, Worlds & Backups, Logs Terminal, and Share.' },
      { type: 'FEATURE', text: 'In-Launcher Live File Explorer: Real-time file manager with directory navigation, folder drilldown, file sizes, item counts, timestamps, and native file explorer shortcuts.' },
      { type: 'FEATURE', text: 'Streaming Console Logs & Sheep ASCII: Live real-time log terminal with log level filters (All, Error, Warn, Info), text search, and latest.log archive reader.' },
      { type: 'FEATURE', text: 'Cross-Instance Screenshot Gallery Hub: Dedicated dock tab with glowing green camera icon scanning F2 screenshots across all instances with fullscreen lightbox, clipboard copy, and deletion.' },
      { type: 'FEATURE', text: 'World Catalog 3D Skin Selector & SkinSync: Interactive 3D skin drag viewer with walking/running animations, outer jacket/armor layer toggles, and universal offline skin synchronization.' },
      { type: 'FEATURE', text: 'Friends & Social Hub with P2P Spatial Voice: Cross-platform player sync for Cracked and Microsoft UUID accounts, 1-click server joining, and interactive voice chat room.' },
      { type: 'FEATURE', text: 'All-Versions Mojang Engine: Search, filter, and install ANY Minecraft release or snapshot from 1.21.4 down to 1.7.10 with instant Fabric, Forge, NeoForge, and Quilt loader toggles.' },
      { type: 'FEATURE', text: 'All Public Servers Directory: Explore 30+ popular multiplayer networks (Hypixel, DonutSMP, Pika, BlocksMC, etc.) with hover-only GIF animations for 0% idle GPU usage.' },
      { type: 'FEATURE', text: 'Astrix Official Network Featured Bar: Direct connect bar with live radar ping beacon, 1-click Copy IP, and instant game launch to bcas.deskhost.fun:19100.' },
      { type: 'FIX', text: 'Silent Background Checker: Eliminated raw XML/Atom error modal popups when checking for launcher updates.' }
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

  // Track expanded cards (Today release expanded by default)
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({
    'v1.0.0': true
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
      showToast('AstrixMC Launcher v1.0.0 is the latest stable release!')
    }, 1100)
  }

  const handleCopyChangelog = (rel: ReleaseNote) => {
    playSound('click')
    const md = [
      `# AstrixMC Launcher ${rel.version} — ${rel.date}`,
      `**${rel.title}**`,
      '',
      rel.description,
      '',
      '### Highlights:',
      ...rel.highlights.map((h) => `- [${h.type}] ${h.text}`),
      '',
      `**GitHub Release:** https://github.com/Extremez-Surya/AstrixMC-Launcher/releases/tag/${rel.version}`
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
                ACTIVE BUILD: v1.0.0 (Latest Release)
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Official day-by-day development updates, feature releases, engine benchmarks, and bug fixes for AstrixMC Launcher.
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
              href="https://github.com/Extremez-Surya/AstrixMC-Launcher/releases"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0B0F19]/80 hover:border-emerald-500/50 hover:bg-emerald-500/15 px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-lg backdrop-blur-xl active:scale-95"
            >
              <FaGithub size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>GitHub Releases</span>
            </a>
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

        {/* ── RELEASE VERSION BADGE (GITHUB SYNCHRONIZED) ── */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0A0E18]/70 p-3.5 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400 px-1 flex items-center gap-1.5">
              <HiSparkles className="text-amber-400" size={14} />
              <span>Current Release:</span>
            </span>
            <span className="rounded-xl bg-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>v1.0.0 · Production Stable Release</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <FaGithub size={14} className="text-emerald-400" />
            <span>Synchronized with GitHub Releases</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
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
                      <a
                        href={
                          rel.version === 'v1.0.0'
                            ? 'https://github.com/Extremez-Surya/AstrixMC-Launcher/releases/tag/v1.0.0'
                            : 'https://github.com/Extremez-Surya/AstrixMC-Launcher/releases'
                        }
                        target="_blank"
                        rel="noreferrer"
                        title="Open Release on GitHub"
                        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-500/15 hover:border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-300 transition-all active:scale-95"
                      >
                        <FaGithub size={13} className="text-emerald-400" />
                        <span>GitHub</span>
                      </a>
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

          
          {/* Footer Release Sync Note */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E18]/60 p-5 text-center backdrop-blur-xl mt-4">
            <p className="text-xs text-slate-400">
              AstrixMC Launcher is open-source. All official releases, source code, and installer assets are synchronized with{' '}
              <a
                href="https://github.com/Extremez-Surya/AstrixMC-Launcher/releases"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline font-semibold"
              >
                GitHub Releases
              </a>
              . Future updates published on GitHub will automatically appear here.
            </p>
          </div>

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
