import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiSparkles,
  HiCheck,
  HiTrash,
  HiArrowUpTray,
  HiBolt,
  HiShieldCheck,
  HiHeart,
  HiChevronLeft,
  HiChevronRight,
  HiMagnifyingGlass,
  HiUser,
  HiFire,
  HiArrowPath
} from 'react-icons/hi2'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../stores/auth-store'
import { playSound } from '../utils/sound'
import { cn } from '../lib/cn'
import { MinecraftSkinViewer3D } from '../components/skins/MinecraftSkinViewer3D'
import { WORLDWIDE_CAPES, CapeItem, generatePersonalizedPlayerCape } from '../utils/capes-library'

/**
 * High-fidelity 2.5D Steve-with-Cape back view canvas component.
 * Supports live dynamic multi-frame animation for animated capes.
 */
function SteveBackCapeCanvas({ cape, frame = 0 }: { cape: CapeItem; frame?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Steve Head from behind (centered at x: 36, y: 12)
      ctx.fillStyle = '#2B1A0E'
      ctx.fillRect(36, 12, 28, 28)
      ctx.fillStyle = '#3E2715'
      ctx.fillRect(40, 12, 20, 8)
      ctx.fillRect(36, 20, 6, 12)
      ctx.fillRect(58, 20, 6, 12)

      // Arms on side
      ctx.fillStyle = '#008B8B'
      ctx.fillRect(22, 40, 14, 28)
      ctx.fillRect(64, 40, 14, 28)
      ctx.fillStyle = '#B47A57'
      ctx.fillRect(22, 68, 14, 12)
      ctx.fillRect(64, 68, 14, 12)

      // Legs / Pants
      ctx.fillStyle = '#28256B'
      ctx.fillRect(36, 80, 13, 34)
      ctx.fillRect(51, 80, 13, 34)
      ctx.fillStyle = '#4A4A4A'
      ctx.fillRect(36, 114, 13, 10)
      ctx.fillRect(51, 114, 13, 10)

      // Cape Ambient Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
      ctx.fillRect(29, 39, 42, 65)

      // Cape texture back face (sx: 12, sy: 1, sw: 10, sh: 16)
      let sx = 12
      let sy = 1
      let sw = 10
      let sh = 16

      if (img.width >= 128) {
        const s = img.width / 64
        sx = Math.round(12 * s)
        sy = Math.round(1 * s)
        sw = Math.round(10 * s)
        sh = Math.round(16 * s)
      }

      try {
        ctx.drawImage(img, sx, sy, sw, sh, 31, 38, 38, 62)
      } catch {
        ctx.drawImage(img, 31, 38, 38, 62)
      }

      // Cape collar clip
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(34, 37, 32, 3)
    }
    img.src = cape.getTexture(frame)
  }, [cape, frame])

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={130}
      className="w-[84px] h-[110px] select-none pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

const ITEMS_PER_PAGE = 8

export default function CapesPage() {
  const { activeAccount } = useAuth()
  const { updateAccount } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'all' | 'animated' | 'official' | 'trending' | 'community' | 'nickname' | 'custom'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [globalFrame, setGlobalFrame] = useState(0)
  const [sortBy, setSortBy] = useState<'featured' | 'popular' | 'random'>('featured')
  const [randomSeed, setRandomSeed] = useState(0)

  const [selectedCapeId, setSelectedCapeId] = useState<string | null>(activeAccount?.capeId || WORLDWIDE_CAPES[0].id)
  const [previewCapeUrl, setPreviewCapeUrl] = useState<string | null>(activeAccount?.capeUrl || null)
  const [customCapeDataUri, setCustomCapeDataUri] = useState<string | null>(null)
  const [customCapeName, setCustomCapeName] = useState<string>('Custom Cape')
  const [isEquipping, setIsEquipping] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Nickname Live Search State
  const [nicknameInput, setNicknameInput] = useState('')
  const [isSearchingNickname, setIsSearchingNickname] = useState(false)
  const [nicknameResult, setNicknameResult] = useState<{ url: string; source: string; name: string } | null>(null)

  // Global Animation Ticker for Animated Capes
  useEffect(() => {
    const timer = setInterval(() => {
      setGlobalFrame((f) => (f + 1) % 24)
    }, 140)
    return () => clearInterval(timer)
  }, [])

  // Initialize preview with active account cape or first cape
  useEffect(() => {
    if (activeAccount?.capeUrl) {
      setPreviewCapeUrl(activeAccount.capeUrl)
      setSelectedCapeId(activeAccount.capeId || 'custom')
    } else {
      const defaultCape = WORLDWIDE_CAPES[0]
      if (defaultCape) {
        setSelectedCapeId(defaultCape.id)
        setPreviewCapeUrl(defaultCape.getTexture(0))
      }
    }
  }, [activeAccount?.id])

  // If the currently selected cape is animated, update preview on each tick
  const currentCapeItem = useMemo(() => {
    return WORLDWIDE_CAPES.find((c) => c.id === selectedCapeId)
  }, [selectedCapeId])

  useEffect(() => {
    if (currentCapeItem?.isAnimated) {
      setPreviewCapeUrl(currentCapeItem.getTexture(globalFrame))
    }
  }, [globalFrame, currentCapeItem])

  // Filtered and sorted capes
  const filteredCapes = useMemo(() => {
    let list = WORLDWIDE_CAPES
    if (activeTab === 'animated') {
      list = WORLDWIDE_CAPES.filter((c) => c.isAnimated)
    } else if (activeTab !== 'all') {
      list = WORLDWIDE_CAPES.filter((c) => c.category === activeTab)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || (c.badge && c.badge.toLowerCase().includes(q)))
    }

    if (sortBy === 'popular') {
      list = [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0))
    } else if (sortBy === 'random') {
      list = [...list].sort((a, b) => {
        const hashA = (a.id + randomSeed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
        const hashB = (b.id + randomSeed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
        return (hashA % 100) - (hashB % 100)
      })
    }

    return list
  }, [activeTab, searchQuery, sortBy, randomSeed])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCapes.length / ITEMS_PER_PAGE))
  const paginatedCapes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredCapes.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredCapes, currentPage])

  // Reset page on tab/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery])

  const handleSelectCuratedCape = (cape: CapeItem) => {
    playSound('click')
    setSelectedCapeId(cape.id)
    setPreviewCapeUrl(cape.getTexture(globalFrame))
  }

  // Live Player Cape Lookup with Guaranteed Fallback
  const handleLookupNicknameCape = async () => {
    if (!nicknameInput.trim()) return
    const name = nicknameInput.trim()
    setIsSearchingNickname(true)
    playSound('click')

    try {
      let capeUrl: string | null = null
      let sourceName = 'Worldwide Cape Network'

      // Special case: Notch (Notch's classic Crimson Mojang cape)
      if (name.toLowerCase() === 'notch') {
        const notchCape = WORLDWIDE_CAPES.find((c) => c.id === 'trend-optifine-crimson')?.getTexture(0) || generatePersonalizedPlayerCape('Notch')
        setNicknameResult({ url: notchCape, source: 'Mojang Creator Network', name: "Notch's Classic Cape" })
        setPreviewCapeUrl(notchCape)
        setSelectedCapeId(`player-notch`)
        showToast("Found Notch's Classic Cape!")
        setIsSearchingNickname(false)
        return
      }

      // Try Mojang Session API
      try {
        const profileRes = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(name)}`)
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData?.id) {
            const sessionRes = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${profileData.id}`)
            if (sessionRes.ok) {
              const sessionData = await sessionRes.json()
              const prop = sessionData.properties?.find((p: any) => p.name === 'textures')
              if (prop?.value) {
                const decoded = JSON.parse(atob(prop.value))
                if (decoded.textures?.CAPE?.url) {
                  capeUrl = decoded.textures.CAPE.url
                  sourceName = 'Official Mojang Network'
                }
              }
            }
          }
        }
      } catch {
        // network issue fallback
      }

      // If player doesn't have an official session cape, generate an authentic personalized player cape
      if (!capeUrl) {
        capeUrl = generatePersonalizedPlayerCape(name)
        sourceName = 'Personalized Player Cape'
      }

      setNicknameResult({ url: capeUrl, source: sourceName, name: `${name}'s Exclusive Cape` })
      setPreviewCapeUrl(capeUrl)
      setSelectedCapeId(`player-${name}`)
      showToast(`Cape ready for "${name}"!`)
    } catch {
      const fallbackUrl = generatePersonalizedPlayerCape(name)
      setNicknameResult({ url: fallbackUrl, source: 'Player Cape Studio', name: `${name}'s Cape` })
      setPreviewCapeUrl(fallbackUrl)
      setSelectedCapeId(`player-${name}`)
      showToast(`Cape ready for "${name}"!`)
    } finally {
      setIsSearchingNickname(false)
    }
  }

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.png')) {
      showToast('Please upload a valid .png cape texture.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUri = event.target?.result as string
      if (!dataUri) return

      const img = new Image()
      img.onload = () => {
        const ratio = img.width / img.height
        if (Math.abs(ratio - 2.0) > 0.1) {
          showToast(`Cape aspect ratio should be 2:1 (e.g. 64x32). Loaded: ${img.width}x${img.height}`)
        } else {
          showToast(`Cape imported: ${img.width}x${img.height}px`)
        }
        setCustomCapeDataUri(dataUri)
        setCustomCapeName(file.name.replace(/\.[^/.]+$/, ''))
        setSelectedCapeId('custom')
        setPreviewCapeUrl(dataUri)
        setActiveTab('custom')
      }
      img.src = dataUri
    }
    reader.readAsDataURL(file)
  }

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3500)
  }

  const handleEquipCape = async () => {
    if (!activeAccount) {
      showToast('Please sign in or select an account first!')
      return
    }

    if (!previewCapeUrl) {
      showToast('Select or upload a cape first!')
      return
    }

    setIsEquipping(true)
    playSound('launch')

    try {
      await updateAccount(activeAccount.id, {
        capeId: selectedCapeId || 'custom',
        capeUrl: previewCapeUrl,
        capeEnabled: true
      })
      showToast('Cape equipped successfully! Dynamic Wavey Cloth Physics Active.')
    } catch (err) {
      console.error(err)
      showToast('Failed to save cape to account.')
    } finally {
      setIsEquipping(false)
    }
  }

  const handleUnequipCape = async () => {
    if (!activeAccount) return
    setIsEquipping(true)
    playSound('click')

    try {
      await updateAccount(activeAccount.id, {
        capeId: undefined,
        capeUrl: undefined,
        capeEnabled: false
      })
      setPreviewCapeUrl(null)
      setSelectedCapeId(null)
      showToast('Cape unequipped.')
    } catch (err) {
      console.error(err)
    } finally {
      setIsEquipping(false)
    }
  }

  const isCurrentEquipped =
    Boolean(activeAccount?.capeUrl) &&
    ((selectedCapeId === activeAccount?.capeId) ||
      (previewCapeUrl && previewCapeUrl === activeAccount?.capeUrl))

  return (
    <div className="flex-1 flex flex-col h-full bg-[#06080F] text-slate-100 overflow-hidden relative">
      {/* Background Astral Nebula glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-purple-500/40 text-purple-200 text-xs font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <HiSparkles className="h-4 w-4 text-purple-400 shrink-0 animate-pulse" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="px-8 pt-6 pb-4 flex items-center justify-between border-b border-white/[0.06] bg-black/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Cape Studio & Physics</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                WAVEY CLOTH ENGINE
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official Mojang CDN, animated multi-frame cloaks, and community capes with waving cloth physics simulation.
          </p>
        </div>

        {/* Cloth Physics Status Pill */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs shadow-inner">
          <HiBolt className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="font-semibold text-[11px]">Cloth Physics: ACTIVE</span>
        </div>
      </div>

      {/* Main Content: Split 3D Stage & Cape Catalog */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: 3D Stage (Camera starts in Back View so cape is immediately visible) */}
        <div className="w-[340px] lg:w-[380px] p-6 flex flex-col items-center justify-between border-r border-white/[0.06] bg-[#070A14]/70 relative shrink-0">
          {/* Active Account Identity Pill */}
          <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs text-slate-300 font-medium">
                {activeAccount ? activeAccount.username : 'Offline Player'}
              </span>
            </div>
            {isCurrentEquipped ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <HiShieldCheck className="h-3.5 w-3.5" /> Equipped In-Game
              </span>
            ) : (
              <span className="text-[11px] text-amber-400 font-medium">Cape Selected</span>
            )}
          </div>

          {/* 3D Skin & Cape Stage */}
          <div className="relative my-auto flex flex-col items-center justify-center">
            {/* Natural soft ground shadow (No artificial borders) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-5 w-40 rounded-[100%] bg-black/50 blur-md pointer-events-none -z-10" />

            <MinecraftSkinViewer3D
              width={290}
              height={370}
              skinUrl={activeAccount?.skinUrl}
              capeUrl={previewCapeUrl || undefined}
              playerName={activeAccount?.skinPlayerName || activeAccount?.username || 'Steve'}
              model={activeAccount?.customSkinModel || 'classic'}
              defaultAnimation="walk"
              defaultBackView={true}
              showControlsBar={true}
              className="drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] z-10"
            />
          </div>

          {/* Bottom Action Controls */}
          <div className="w-full flex flex-col gap-2.5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleEquipCape}
                disabled={isEquipping || !previewCapeUrl || isCurrentEquipped}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg',
                  isCurrentEquipped
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]'
                )}
              >
                {isCurrentEquipped ? (
                  <>
                    <HiCheck className="h-4 w-4" /> Equipped In-Game
                  </>
                ) : (
                  <>
                    <HiSparkles className="h-4 w-4" /> Equip Selected Cape
                  </>
                )}
              </button>

              {activeAccount?.capeUrl && (
                <button
                  type="button"
                  onClick={handleUnequipCape}
                  disabled={isEquipping}
                  className="px-3 py-2.5 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-400 transition-colors"
                  title="Unequip cape"
                >
                  <HiTrash className="h-4 w-4" />
                </button>
              )}
            </div>

            <p className="text-[10px] text-center text-slate-400">
              * Click the flip button in 3D bar to view front or back side.
            </p>
          </div>
        </div>

        {/* Right Side: Cape Catalog, Filters, Search & Nickname Live Lookup */}
        <div className="flex-1 p-6 flex flex-col overflow-y-auto">
          {/* Top Category Tabs & Search HUD */}
          <div className="flex flex-col gap-3 pb-4 border-b border-white/[0.06]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Category Filters with Clear Separation of Animated & Official */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] overflow-x-auto max-w-full">
                {[
                  { id: 'all', label: `All Capes (${WORLDWIDE_CAPES.length})` },
                  { id: 'animated', label: `Live Animated (${WORLDWIDE_CAPES.filter((c) => c.isAnimated).length})` },
                  { id: 'official', label: `Official Mojang (${WORLDWIDE_CAPES.filter((c) => c.category === 'official').length})` },
                  { id: 'trending', label: `Trending & PvP (${WORLDWIDE_CAPES.filter((c) => c.category === 'trending').length})` },
                  { id: 'community', label: `Anime & Gaming (${WORLDWIDE_CAPES.filter((c) => c.category === 'community').length})` },
                  { id: 'nickname', label: 'By Player' },
                  { id: 'custom', label: 'Custom Upload' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      playSound('click')
                      setActiveTab(tab.id as any)
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Discovery Modes & Search Bar */}
              {activeTab !== 'nickname' && activeTab !== 'custom' && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/10 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click')
                        setSortBy('popular')
                      }}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all',
                        sortBy === 'popular'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      )}
                      title="Sort by worldwide popularity"
                    >
                      <HiFire className="h-3.5 w-3.5 text-amber-400" />
                      Popular
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click')
                        setSortBy('random')
                        setRandomSeed((s) => s + 1)
                      }}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all',
                        sortBy === 'random'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      )}
                      title="Discover random worldwide capes"
                    >
                      <HiArrowPath className="h-3.5 w-3.5 text-purple-400" />
                      Random
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <HiMagnifyingGlass className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search cape name..."
                      className="w-44 pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pagination HUD */}
            {activeTab !== 'nickname' && activeTab !== 'custom' && totalPages > 1 && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 text-[11px]">
                  Showing {paginatedCapes.length} of {filteredCapes.length} capes
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click')
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center h-7 w-7 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
                  >
                    <HiChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-[11px] font-mono text-purple-300 font-bold border border-white/10">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('click')
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center h-7 w-7 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
                  >
                    <HiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TAB 1: By Player Live Lookup (Guaranteed Cape Result for ANY Player) */}
          {activeTab === 'nickname' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-xl mx-auto w-full">
              <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl w-full flex flex-col items-center text-center shadow-2xl">
                <div className="h-14 w-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/30">
                  <HiUser className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  Fetch Capes by Player Username
                </h3>
                <p className="text-xs text-slate-400 mb-6 max-w-sm">
                  Enter any Minecraft username (e.g. Notch, Dream, surya, Alex). The network will retrieve or generate their exclusive cape.
                </p>

                <div className="flex gap-2 w-full max-w-md">
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLookupNicknameCape()}
                    placeholder="e.g. Notch, Dream, surya..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleLookupNicknameCape}
                    disabled={isSearchingNickname || !nicknameInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {isSearchingNickname ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {nicknameResult && (
                  <div className="mt-6 flex items-center justify-between w-full p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
                    <div className="flex items-center gap-3">
                      <SteveBackCapeCanvas
                        cape={{
                          id: 'nickname-preview',
                          name: nicknameResult.name,
                          description: nicknameResult.source,
                          category: 'official',
                          getTexture: () => nicknameResult.url
                        }}
                      />
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white">{nicknameResult.name}</h4>
                        <span className="text-[11px] text-cyan-400 font-semibold">{nicknameResult.source}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewCapeUrl(nicknameResult.url)
                        setSelectedCapeId(`player-${nicknameResult.name}`)
                        playSound('click')
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                    >
                      Select In Studio
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Custom Upload Tab */}
          {activeTab === 'custom' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <input
                ref={fileInputRef}
                type="file"
                accept=".png"
                onChange={handleCustomFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-lg p-10 rounded-3xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/10 hover:bg-purple-950/20 transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="h-16 w-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform mb-4 border border-purple-500/30">
                  <HiArrowUpTray className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  Click to select or drag & drop a Cape PNG
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Standard Minecraft 64x32 cape textures are supported. Will render with dynamic waving cloth physics in-game.
                </p>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-purple-300 font-mono">
                  Supported: 64x32, 128x64 HD
                </span>
              </div>

              {customCapeDataUri && (
                <div className="mt-6 flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                  <SteveBackCapeCanvas
                    cape={{
                      id: 'custom-preview',
                      name: customCapeName,
                      description: 'Custom Cape',
                      category: 'community',
                      getTexture: () => customCapeDataUri
                    }}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{customCapeName}</h4>
                    <p className="text-xs text-emerald-400 font-semibold">Custom Cape Ready to Equip</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewCapeUrl(customCapeDataUri)
                      setSelectedCapeId('custom')
                      playSound('click')
                    }}
                    className="ml-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                  >
                    Select In Studio
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Main Worldwide Cape Cards Grid */}
          {activeTab !== 'nickname' && activeTab !== 'custom' && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
              {paginatedCapes.map((cape) => {
                const isSelected = selectedCapeId === cape.id
                const isEquipped = activeAccount?.capeId === cape.id

                return (
                  <motion.div
                    key={cape.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectCuratedCape(cape)}
                    className={cn(
                      'group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden bg-[#0A0D18]/80',
                      isSelected
                        ? 'border-purple-400/80 bg-gradient-to-b from-purple-950/30 to-[#0A0D18] shadow-[0_0_25px_rgba(168,85,247,0.25)]'
                        : 'border-white/[0.07] hover:border-white/20 hover:bg-[#0E1322]'
                    )}
                  >
                    {/* Top Row: Badge & Status */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        'text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                        cape.isAnimated
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : cape.category === 'official'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/10 text-slate-300'
                      )}>
                        {cape.badge || (cape.isAnimated ? 'ANIMATED' : 'CLASSIC')}
                      </span>
                      {isEquipped && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <HiCheck className="h-3 w-3" /> Equipped
                        </span>
                      )}
                    </div>

                    {/* Visual Card: Steve from the BACK wearing the cape (Cycles frames if animated!) */}
                    <div className="h-36 w-full rounded-xl flex items-center justify-center bg-black/40 border border-white/[0.06] mb-2.5 relative overflow-hidden group-hover:border-white/15 transition-all">
                      <SteveBackCapeCanvas
                        cape={cape}
                        frame={cape.isAnimated ? globalFrame : 0}
                      />

                      {cape.isAnimated && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-purple-500/30 border border-purple-400/40 text-[8.5px] font-mono text-purple-200 animate-pulse">
                          LIVE ANIMATED
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {cape.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {cape.description}
                      </p>
                    </div>

                    {/* Footer Row: Heart / Likes count */}
                    <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-rose-400 transition-colors">
                        <HiHeart className="h-3.5 w-3.5 text-rose-500/80" />
                        <span className="font-mono text-[10px] font-semibold">
                          {cape.likes ? cape.likes.toLocaleString() : '10,000+'}
                        </span>
                      </div>

                      <span className={cn('text-[10px] font-bold', isSelected ? 'text-purple-400' : 'text-slate-500')}>
                        {isSelected ? 'Selected' : 'Try On'}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
