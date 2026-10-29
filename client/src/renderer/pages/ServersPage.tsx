import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiGlobeAlt,
  HiSignal,
  HiPlay,
  HiMagnifyingGlass,
  HiCheck,
  HiArrowPath,
  HiSparkles,
  HiXMark,
  HiStar,
  HiSquare2Stack,
  HiSquares2X2,
  HiBars3,
  HiUsers,
  HiBolt,
  HiShieldCheck
} from 'react-icons/hi2'
import { FaHandshake } from 'react-icons/fa6'
import { useLaunch } from '../hooks/useLaunch'
import { useInstances } from '../hooks/useInstances'
import type { PublicServerItem } from '../../shared/types/server'
import {
  fetchServersWithFallback,
  FALLBACK_FEATURED_SERVERS,
  KNOWN_ANIMATED_BANNERS,
  KNOWN_STATIC_BANNERS
} from '../services/server-finder-client'
import { playSound } from '../utils/sound'
import { cn } from '../lib/cn'
import logoImg from '../assets/logo.jpg'
import astrixBannerImg from '../assets/astrix_server_banner.jpg'

const SERVER_CATEGORIES = [
  { id: 'all', label: 'All Servers' },
  { id: 'cracked', label: 'Cracked / Offline' },
  { id: 'premium', label: 'Premium Java' },
  { id: 'crossplay', label: 'Cross-Play (Bedrock+Java)' },
  { id: 'survival', label: 'Survival & SMP' },
  { id: 'bedwars', label: 'BedWars & Minigames' },
  { id: 'pvp', label: 'PvP & Practice' },
  { id: 'lifesteal', label: 'LifeSteal' },
  { id: 'skyblock', label: 'SkyBlock' },
  { id: 'anarchy', label: 'Anarchy' }
]

function getAnimatedBanner(server: PublicServerItem): string | null {
  if (server.id === 'astrixmc-official') return astrixBannerImg
  const host = (server.host || '').toLowerCase().trim()
  const id = (server.id || '').toLowerCase().trim()

  if (KNOWN_ANIMATED_BANNERS[host]) return KNOWN_ANIMATED_BANNERS[host]
  if (KNOWN_ANIMATED_BANNERS[id]) return KNOWN_ANIMATED_BANNERS[id]

  // Check partial key matching
  for (const [key, gifUrl] of Object.entries(KNOWN_ANIMATED_BANNERS)) {
    if (host.includes(key) || key.includes(host)) return gifUrl
  }

  if (server.banner && server.banner.endsWith('.gif')) return server.banner

  return server.banner || null
}

function getStaticBanner(server: PublicServerItem): string | null {
  if (server.id === 'astrixmc-official') return astrixBannerImg
  const host = (server.host || '').toLowerCase().trim()
  const id = (server.id || '').toLowerCase().trim()

  if (KNOWN_STATIC_BANNERS[host]) return KNOWN_STATIC_BANNERS[host]
  if (KNOWN_STATIC_BANNERS[id]) return KNOWN_STATIC_BANNERS[id]

  for (const [key, staticUrl] of Object.entries(KNOWN_STATIC_BANNERS)) {
    if (host.includes(key) || key.includes(host)) return staticUrl
  }

  if (server.banner && !server.banner.endsWith('.gif')) return server.banner

  return null
}

/**
 * ServerBanner:
 * - Idle / Not Hovered: Renders a completely static WebP or frozen canvas frame (0 CPU/GPU decode cycles, zero lag).
 * - Active Hover: Dynamically mounts the multi-frame animated GIF for smooth eye-catching animation only when cursor is present!
 */
function ServerBanner({
  server,
  isHovered,
  className,
  isAstrix = false
}: {
  server: PublicServerItem
  isHovered: boolean
  className?: string
  isAstrix?: boolean
}) {
  const animatedSrc = getAnimatedBanner(server)
  const staticSrc = getStaticBanner(server)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [hasCanvasFrame, setHasCanvasFrame] = useState(false)

  // Preload animated GIF silently in memory so hover animation appears instantly without network delay
  useEffect(() => {
    if (!animatedSrc || isAstrix) return
    const preloader = new Image()
    preloader.src = animatedSrc
  }, [animatedSrc, isAstrix])

  // Fallback if no static banner image is mapped: capture first frame onto canvas to guarantee a static idle view
  useEffect(() => {
    if (staticSrc || !animatedSrc || hasCanvasFrame || isAstrix) return

    let isMounted = true
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = animatedSrc
    img.onload = () => {
      if (!isMounted || !canvasRef.current) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      canvas.width = img.naturalWidth || 468
      canvas.height = img.naturalHeight || 60
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setHasCanvasFrame(true)
    }

    return () => {
      isMounted = false
    }
  }, [animatedSrc, staticSrc, hasCanvasFrame, isAstrix])

  if (!animatedSrc && !staticSrc) {
    return (
      <div className="text-xs font-mono font-bold text-slate-500 tracking-wider uppercase">
        {server.name}
      </div>
    )
  }

  // Active hover: Play the vibrant multi-frame GIF
  if (isHovered && animatedSrc) {
    return (
      <img
        src={animatedSrc}
        alt={`${server.name} animated banner`}
        loading="eager"
        onError={(e) => {
          ;(e.target as HTMLElement).style.display = 'none'
        }}
        className={className}
      />
    )
  }

  // Idle state: Display static WebP / PNG / JPG (zero decode cycles)
  if (staticSrc) {
    return (
      <img
        src={staticSrc}
        alt={`${server.name} banner`}
        loading="lazy"
        onError={(e) => {
          ;(e.target as HTMLElement).style.display = 'none'
        }}
        className={className}
      />
    )
  }

  // Fallback idle state: Frozen canvas frame
  return (
    <>
      <canvas
        ref={canvasRef}
        className={className}
        style={{ display: hasCanvasFrame ? 'block' : 'none' }}
      />
      {!hasCanvasFrame && (
        <div className="text-xs font-mono font-bold text-slate-500 tracking-wider uppercase">
          {server.name}
        </div>
      )}
    </>
  )
}

interface ServerCardProps {
  server: PublicServerItem
  rank: number
  isCopied: boolean
  onCopyIp: (ip: string) => void
  onJoin: (server: PublicServerItem) => void
  isLaunching: boolean
  isPlaying: boolean
}

function ServerGridCard({
  server,
  rank,
  isCopied,
  onCopyIp,
  onJoin,
  isLaunching,
  isPlaying
}: ServerCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isAstrix = server.id === 'astrixmc-official'
  const hasGif = Boolean(getAnimatedBanner(server))

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: Math.min(rank * 0.03, 0.25) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-[#0A0D15]/95 transition-all duration-300 hover:shadow-2xl',
        isAstrix
          ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:border-amber-400'
          : isHovered
            ? 'border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
            : 'border-white/[0.08] shadow-lg'
      )}
    >
      {/* Top Row: Rank, Avatar, Title & Edition Badges */}
      <div className="p-4 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black text-slate-300 bg-white/5 border border-white/5">
            {isAstrix ? '👑' : `#${rank}`}
          </div>

          {/* Avatar */}
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#07090E] shadow-md">
            {isAstrix ? (
              <img src={logoImg} alt="AstrixMC" className="h-full w-full object-cover" />
            ) : server.icon ? (
              <img
                src={server.icon}
                alt={server.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-600 to-blue-800 text-xs font-black text-white">
                {server.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name & Player Count */}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-white font-display truncate">
              {server.name}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {server.players.online.toLocaleString()}
              </span>
              <span>•</span>
              <span className="truncate">{server.version || '1.20+'}</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {server.isCracked && (
            <span className="rounded-lg border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[9px] font-mono font-black uppercase text-amber-300">
              Cracked
            </span>
          )}
          {!server.isCracked && (
            <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[9px] font-mono font-black uppercase text-emerald-300">
              Premium
            </span>
          )}
          {server.edition === 'crossplay' && (
            <span className="rounded-lg border border-sky-500/40 bg-sky-500/20 px-2 py-0.5 text-[9px] font-mono font-black uppercase text-sky-300">
              Bedrock+Java
            </span>
          )}
        </div>
      </div>

      {/* Middle Section: HOVER-ACTIVE BANNER (Static by default, animated GIF on hover) */}
      <div className="px-4">
        <div
          className={cn(
            'relative w-full rounded-2xl overflow-hidden bg-black/80 border flex items-center justify-center shadow-inner group/banner transition-all duration-300',
            isAstrix
              ? 'h-28 border-amber-500/30'
              : isHovered
                ? 'h-[76px] border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'h-[76px] border-white/10'
          )}
        >
          <ServerBanner
            server={server}
            isHovered={isHovered}
            isAstrix={isAstrix}
            className={cn(
              'h-full w-full transition-transform duration-300',
              isAstrix ? 'object-cover' : 'object-contain p-1',
              isHovered && 'scale-[1.02]'
            )}
          />

          {/* Micro GIF Indicator badge */}
          {hasGif && !isAstrix && (
            <div
              className={cn(
                'pointer-events-none absolute bottom-1.5 right-1.5 z-20 flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider backdrop-blur-md transition-all duration-200 border',
                isHovered
                  ? 'border-cyan-400/60 bg-cyan-500/30 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                  : 'border-white/10 bg-black/60 text-slate-400 opacity-60'
              )}
            >
              <span className={cn('h-1 w-1 rounded-full', isHovered ? 'bg-cyan-300 animate-ping' : 'bg-slate-500')} />
              <span>GIF</span>
            </div>
          )}

          {isAstrix && (
            <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent animate-pulse" />
          )}
        </div>
      </div>

      {/* Bottom Details: Description, Tags, Host & Action Buttons */}
      <div className="p-4 pt-3 flex-1 flex flex-col justify-between">
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {server.description || server.motd || 'Competitive Minecraft community network.'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {server.tags.slice(0, 4).map((tag, tIdx) => (
            <span
              key={tIdx}
              className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Host IP Pill */}
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-mono font-bold text-slate-300 mb-3">
          <span className="truncate text-amber-300/90">{server.host}</span>
          <button
            type="button"
            onClick={() => onCopyIp(server.host)}
            className="text-[11px] font-sans font-bold text-slate-400 hover:text-white transition-colors"
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onCopyIp(server.host)}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all shadow-sm active:scale-95',
              isCopied
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            )}
          >
            {isCopied ? (
              <>
                <HiCheck size={14} className="text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <HiSquare2Stack size={14} />
                <span>Copy IP</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onJoin(server)}
            disabled={isLaunching || isPlaying}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition-all shadow-md active:scale-95 disabled:opacity-50',
              isAstrix
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400'
                : 'bg-white text-black hover:bg-slate-200'
            )}
          >
            <HiPlay size={15} className="fill-current" />
            <span>Join Now</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function ServerListRow({
  server,
  rank,
  isCopied,
  onCopyIp,
  onJoin,
  isLaunching,
  isPlaying
}: ServerCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isAstrix = server.id === 'astrixmc-official'
  const hasGif = Boolean(getAnimatedBanner(server))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18, delay: Math.min(rank * 0.02, 0.2) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative flex flex-col md:flex-row items-stretch justify-between gap-4 rounded-2xl border bg-[#0A0D15]/95 p-4 transition-all duration-200 hover:shadow-xl',
        isAstrix
          ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-400'
          : isHovered
            ? 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.12)]'
            : 'border-white/[0.08] shadow-md'
      )}
    >
      {/* Left: Rank + Icon + Banner + Info */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black text-slate-400 bg-white/5 border border-white/5">
          {isAstrix ? '👑' : `#${rank}`}
        </div>

        {/* Icon */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950 flex items-center justify-center shadow-md">
          {isAstrix ? (
            <img src={logoImg} alt="AstrixMC" className="h-full w-full object-cover" />
          ) : server.icon ? (
            <img
              src={server.icon}
              alt={server.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-600 to-teal-800 text-sm font-black text-white">
              {server.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Widescreen Banner (Static by default, animated on hover) */}
        <div className="hidden lg:block relative h-12 w-48 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-inner">
          <ServerBanner
            server={server}
            isHovered={isHovered}
            isAstrix={isAstrix}
            className={cn(
              'h-full w-full transition-transform duration-300',
              isAstrix ? 'object-cover' : 'object-contain p-0.5',
              isHovered && 'scale-105'
            )}
          />

          {hasGif && !isAstrix && (
            <div
              className={cn(
                'pointer-events-none absolute bottom-1 right-1 z-20 flex items-center gap-0.5 rounded px-1 py-0.2 font-mono text-[8px] font-black uppercase tracking-wider backdrop-blur-md transition-all duration-200 border',
                isHovered
                  ? 'border-cyan-400/60 bg-cyan-500/30 text-cyan-200'
                  : 'border-white/10 bg-black/60 text-slate-400 opacity-50'
              )}
            >
              <span>GIF</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black tracking-tight text-white font-display uppercase truncate">
              {server.name}
            </h3>

            {isAstrix && (
              <span className="rounded-md border border-amber-500/40 bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-300 uppercase flex items-center gap-1 shadow-sm">
                <HiStar size={11} className="text-amber-400" /> Official
              </span>
            )}

            <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10B981]" />
              <span>{server.players.online.toLocaleString()} playing</span>
            </div>

            {server.isCracked && (
              <span className="rounded-md border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-300 uppercase">
                Cracked
              </span>
            )}
            {!server.isCracked && (
              <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-300 uppercase">
                Premium
              </span>
            )}
          </div>

          {server.description && (
            <p className="mt-1 text-xs text-slate-400 line-clamp-1">
              {server.description}
            </p>
          )}
        </div>
      </div>

      {/* Right: IP Box + Copy + Join */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
        <span className="font-mono text-xs font-bold text-amber-300/90 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl">
          {server.host}
        </span>

        <button
          type="button"
          onClick={() => onCopyIp(server.host)}
          className={cn(
            'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95',
            isCopied
              ? 'bg-emerald-500 text-black shadow-emerald-500/30'
              : 'border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500 hover:text-black'
          )}
        >
          {isCopied ? <HiCheck size={14} /> : <HiSquare2Stack size={14} />}
          <span>{isCopied ? 'Copied' : 'Copy'}</span>
        </button>

        <button
          type="button"
          onClick={() => onJoin(server)}
          disabled={isLaunching}
          className={cn(
            'flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-black transition-all shadow-md active:scale-95 disabled:opacity-50',
            isAstrix
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400'
              : 'bg-white text-black hover:bg-slate-200'
          )}
        >
          <HiPlay size={14} className="fill-current" />
          <span>{isPlaying ? 'Switch' : 'Join'}</span>
        </button>
      </div>
    </motion.div>
  )
}

export default function ServersPage() {
  const { launchGame, isPlaying, isLaunching } = useLaunch()
  const { activeInstance } = useInstances()

  const [servers, setServers] = useState<PublicServerItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [copiedIp, setCopiedIp] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Live fetch servers from browser / IPC with fallback
  const loadServers = useCallback(async (pageToLoad = 1, append = false) => {
    if (pageToLoad === 1) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }
    setErrorMsg(null)

    try {
      const data = await fetchServersWithFallback(pageToLoad, activeCategory === 'premium' ? 'all' : activeCategory, search)
      if (data && Array.isArray(data.servers)) {
        let list = data.servers

        // Handle client-side premium filtering if selected
        if (activeCategory === 'premium') {
          list = list.filter((s) => !s.isCracked && !s.tags.some((t) => t.toLowerCase().includes('cracked')))
        }

        // Always guarantee AstrixMC Official Network is pinned at #1 on page 1
        if (pageToLoad === 1) {
          const official = FALLBACK_FEATURED_SERVERS[0]
          const others = list.filter((s: PublicServerItem) => s.host.toLowerCase() !== official.host.toLowerCase())
          const searchLower = search.toLowerCase().trim()
          if (!searchLower || official.name.toLowerCase().includes(searchLower) || official.host.toLowerCase().includes(searchLower)) {
            list = [official, ...others]
          } else {
            list = others
          }
        }

        if (append) {
          setServers((prev) => {
            const seen = new Set(prev.map((s) => s.host.toLowerCase()))
            const fresh = list.filter((s: PublicServerItem) => !seen.has(s.host.toLowerCase()))
            return [...prev, ...fresh]
          })
        } else {
          setServers(list)
        }
        setCurrentPage(data.page || pageToLoad)
        setTotalPages(data.pages || 1)
        setTotalCount(data.total || data.servers.length)
      }
    } catch (err: any) {
      console.error('Failed to load servers:', err)
      setErrorMsg(err.message || 'Failed to connect to public server database')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [activeCategory, search])

  // Reload when category or search changes (debounced search)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadServers(1, false)
    }, 200)
    return () => clearTimeout(timer)
  }, [loadServers])

  const handleCopyIp = (host: string) => {
    playSound('click')
    navigator.clipboard.writeText(host)
    setCopiedIp(host)
    playSound('success')
    showToast(`Copied ${host} to clipboard!`)
    setTimeout(() => setCopiedIp(null), 2500)
  }

  const handleDirectJoin = (server: PublicServerItem) => {
    playSound('click')
    const addr = server.port && server.port !== 25565 ? `${server.host}:${server.port}` : server.host
    launchGame(activeInstance?.id, addr)
    showToast(isPlaying ? `Switching to ${server.name}...` : `Connecting to ${server.name} (${addr})...`)
  }

  return (
    <div className="relative flex min-h-full w-full max-w-full flex-col overflow-x-hidden bg-transparent select-none font-sans text-slate-100 pb-36">
      {/* ── ATMOSPHERIC GLOW AURA ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/3 h-[500px] w-[650px] rounded-full blur-[140px] opacity-40 transition-all"
          style={{ background: 'rgba(6, 182, 212, 0.12)' }}
        />
        <div
          className="absolute top-1/2 -right-28 h-[450px] w-[550px] rounded-full blur-[130px] opacity-35 transition-all"
          style={{ background: 'rgba(16, 185, 129, 0.10)' }}
        />
      </div>

      <div className="relative z-10 w-full px-5 md:px-8 pt-6 pb-4">
        {/* ── TOP HEADER & NAVIGATION SWITCHER ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight drop-shadow-sm flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <HiGlobeAlt size={22} />
                </span>
                All Public Servers
              </h1>
              <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-3 py-1 text-xs font-mono font-black text-cyan-300 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                {totalCount > 0 ? `${totalCount}+ SERVERS LIVE` : 'LIVE BROWSER'}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Explore verified Minecraft Java &amp; Bedrock servers: Premium, Cracked, Survival SMP, Bedwars, LifeSteal, and Practice PvP with live animated banners.
            </p>
          </div>

          {/* Quick Actions Deck */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-1 backdrop-blur-xl shadow-lg">
              <button
                type="button"
                onClick={() => {
                  playSound('click')
                  setViewMode('grid')
                }}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                  viewMode === 'grid' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                )}
                title="Grid view with animated banners"
              >
                <HiSquares2X2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound('click')
                  setViewMode('list')
                }}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                  viewMode === 'list' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                )}
                title="Compact list view"
              >
                <HiBars3 size={16} />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => {
                playSound('click')
                loadServers(1, false)
              }}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0B0F19]/80 hover:border-cyan-500/40 hover:bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-lg backdrop-blur-xl active:scale-95 disabled:opacity-50"
            >
              <HiArrowPath size={16} className={cn('text-cyan-400', isLoading && 'animate-spin')} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Switch to Partner Servers */}
            <NavLink
              to="/partners"
              onClick={() => playSound('click')}
              className="group flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-[#0B0F19]/80 hover:border-amber-500/60 hover:bg-amber-500/15 px-4 py-2.5 text-xs font-bold text-amber-300 hover:text-white transition-all shadow-lg backdrop-blur-xl active:scale-95"
            >
              <FaHandshake size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Partner Program</span>
              <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300 font-mono">1</span>
            </NavLink>
          </div>
        </div>

        {/* ── SEARCH & CATEGORY CHIPS BAR ── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
          {/* Category Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SERVER_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setActiveCategory(cat.id)
                    setCurrentPage(1)
                  }}
                  className={cn(
                    'whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm active:scale-95',
                    isActive
                      ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  )}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] md:w-72">
            <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, IP, or mode..."
              className="w-full rounded-xl border border-white/10 bg-[#0A0D15] py-2 pl-10 pr-9 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <HiXMark size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── LOADING SKELETON ── */}
        {isLoading && servers.length === 0 && (
          <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3')}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl border border-white/5 bg-[#0A0D15]/80 p-5 h-48 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-white/10" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 rounded bg-white/10" />
                    <div className="h-3 w-48 rounded bg-white/5" />
                  </div>
                </div>
                <div className="h-10 w-full rounded-2xl bg-white/5" />
              </div>
            ))}
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {errorMsg && (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-300 text-xs mb-6">
            <p className="font-bold">Error loading live servers: {errorMsg}</p>
            <button
              type="button"
              onClick={() => loadServers(1, false)}
              className="mt-3 rounded-xl bg-rose-500/20 px-4 py-2 font-bold text-rose-200 hover:bg-rose-500/30"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!isLoading && servers.length === 0 && !errorMsg && (
          <div className="flex h-72 flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0A0D15]/80 p-8 text-center text-slate-400 shadow-xl">
            <HiGlobeAlt size={48} className="text-cyan-400/50 mb-3" />
            <h3 className="text-base font-bold text-white">No servers found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              No active Minecraft servers match &quot;{search}&quot; in category &quot;{activeCategory}&quot;. Try clearing your search or switching categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setActiveCategory('all')
              }}
              className="mt-4 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-slate-200 shadow-md"
            >
              View All Servers
            </button>
          </div>
        )}

        {/* ── GRID VIEW (CLEAN CARDS WITH HOVER-ONLY ANIMATED GIF BANNERS) ── */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {servers.map((server, index) => (
                <ServerGridCard
                  key={`${server.host}-${index}`}
                  server={server}
                  rank={index + 1}
                  isCopied={copiedIp === server.host}
                  onCopyIp={handleCopyIp}
                  onJoin={handleDirectJoin}
                  isLaunching={isLaunching}
                  isPlaying={isPlaying}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── LIST VIEW (COMPACT STREAMLINED ROWS WITH HOVER-ONLY ANIMATED GIF BANNERS) ── */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {servers.map((server, index) => (
                <ServerListRow
                  key={`${server.host}-${index}`}
                  server={server}
                  rank={index + 1}
                  isCopied={copiedIp === server.host}
                  onCopyIp={handleCopyIp}
                  onJoin={handleDirectJoin}
                  isLaunching={isLaunching}
                  isPlaying={isPlaying}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── LOAD MORE SERVERS (PAGINATION) ── */}
        {servers.length > 0 && currentPage < totalPages && (
          <div className="pt-8 pb-4 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => {
                playSound('click')
                loadServers(currentPage + 1, true)
              }}
              disabled={isLoadingMore}
              className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold text-white hover:bg-white/10 hover:border-cyan-500/50 transition-all shadow-lg backdrop-blur-xl disabled:opacity-50 active:scale-95"
            >
              {isLoadingMore ? (
                <>
                  <HiArrowPath className="animate-spin text-cyan-400" size={16} />
                  <span>Loading more servers...</span>
                </>
              ) : (
                <>
                  <HiGlobeAlt size={16} className="text-cyan-400" />
                  <span>Load More Servers (Page {currentPage + 1} of {totalPages})</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-[#0B0F19]/95 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-xl"
          >
            <HiCheck className="text-cyan-400" size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
