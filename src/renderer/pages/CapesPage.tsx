import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiSparkles,
  HiCheck,
  HiTrash,
  HiArrowUpTray,
  HiBolt,
  HiShieldCheck,
  HiUser,
  HiMagnifyingGlass
} from 'react-icons/hi2'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../stores/auth-store'
import { playSound } from '../utils/sound'
import { cn } from '../lib/cn'
import { MinecraftSkinViewer3D } from '../components/skins/MinecraftSkinViewer3D'
import {
  KNOWN_PLAYER_CAPES,
  generatePersonalizedPlayerCape
} from '../utils/capes-library'

/**
 * 2.5D Steve-with-Cape back view canvas component.
 */
function SteveBackCapeCanvas({ textureUrl }: { textureUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !textureUrl) return
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
    img.src = textureUrl
  }, [textureUrl])

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

export default function CapesPage() {
  const { activeAccount } = useAuth()
  const { updateAccount } = useAuthStore()

  // Only 2 options: 'by-player' and 'upload'
  const [activeTab, setActiveTab] = useState<'by-player' | 'upload'>('by-player')

  const [selectedCapeId, setSelectedCapeId] = useState<string | null>(activeAccount?.capeId || null)
  const [previewCapeUrl, setPreviewCapeUrl] = useState<string | null>(activeAccount?.capeUrl || null)
  const [isEquipping, setIsEquipping] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // By Player state
  const [playerInput, setPlayerInput] = useState('')
  const [isSearchingPlayer, setIsSearchingPlayer] = useState(false)
  const [playerResult, setPlayerResult] = useState<{ url: string; source: string; name: string } | null>(null)

  // Upload state
  const [customCapeDataUri, setCustomCapeDataUri] = useState<string | null>(null)
  const [customCapeName, setCustomCapeName] = useState<string>('Custom Cape')

  // Initialize preview with active account cape
  useEffect(() => {
    if (activeAccount?.capeUrl) {
      setPreviewCapeUrl(activeAccount.capeUrl)
      setSelectedCapeId(activeAccount.capeId || 'equipped')
    }
  }, [activeAccount?.id, activeAccount?.capeUrl])

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3500)
  }

  // Lookup player cape
  const handleLookupPlayerCape = async (overrideName?: string) => {
    const rawName = (overrideName || playerInput).trim()
    if (!rawName) return

    setPlayerInput(rawName)
    setIsSearchingPlayer(true)
    playSound('click')

    const lower = rawName.toLowerCase()

    // 1. Check known player dictionary (e.g. Notch, Jeb_, Dinnerbone)
    if (KNOWN_PLAYER_CAPES[lower]) {
      const known = KNOWN_PLAYER_CAPES[lower]
      setPlayerResult(known)
      setPreviewCapeUrl(known.url)
      setSelectedCapeId(`player-${lower}`)
      showToast(`Found ${known.name}!`)
      setIsSearchingPlayer(false)
      return
    }

    try {
      let foundUrl: string | null = null
      let foundSource = 'Official Minecraft Network'

      // 2. Fetch Mojang profile & session
      try {
        const profileRes = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(rawName)}`)
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
                  foundUrl = decoded.textures.CAPE.url
                  foundSource = 'Official Mojang Cape'
                }
              }
            }
          }
        }
      } catch {
        // network issue
      }

      // 3. Fallback: Generate dedicated player cape
      if (!foundUrl) {
        foundUrl = generatePersonalizedPlayerCape(rawName)
        foundSource = 'Personalized Player Cape'
      }

      const result = {
        url: foundUrl,
        source: foundSource,
        name: `${rawName}'s Cape`
      }
      setPlayerResult(result)
      setPreviewCapeUrl(foundUrl)
      setSelectedCapeId(`player-${lower}`)
      showToast(`Cape ready for "${rawName}"!`)
    } catch {
      const fallbackUrl = generatePersonalizedPlayerCape(rawName)
      const result = {
        url: fallbackUrl,
        source: 'Player Cape Studio',
        name: `${rawName}'s Cape`
      }
      setPlayerResult(result)
      setPreviewCapeUrl(fallbackUrl)
      setSelectedCapeId(`player-${lower}`)
      showToast(`Cape ready for "${rawName}"!`)
    } finally {
      setIsSearchingPlayer(false)
    }
  }

  // Upload Custom File
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
      }
      img.src = dataUri
    }
    reader.readAsDataURL(file)
  }

  // Equip Cape
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

  // Unequip Cape
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
            Equip custom capes or import from player usernames with realistic waving cloth physics simulation.
          </p>
        </div>

        {/* Cloth Physics Status Pill */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs shadow-inner">
          <HiBolt className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="font-semibold text-[11px]">Cloth Physics: ACTIVE</span>
        </div>
      </div>

      {/* Main Content Split: Left 3D Stage | Right Controls */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: 3D Stage (Camera starts in Back View so cape is visible) */}
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
            ) : previewCapeUrl ? (
              <span className="text-[11px] text-amber-400 font-medium">Cape Selected</span>
            ) : (
              <span className="text-[11px] text-slate-500 font-medium">No Cape</span>
            )}
          </div>

          {/* 3D Skin & Cape Stage */}
          <div className="relative my-auto flex flex-col items-center justify-center">
            {/* Natural soft ground shadow */}
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
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed'
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
              * Click the 3D flip button below player to view front or back side.
            </p>
          </div>
        </div>

        {/* Right Side: ONLY 2 Options - By Player & Upload */}
        <div className="flex-1 p-8 flex flex-col overflow-y-auto">
          {/* Top 2 Option Tab Toggle */}
          <div className="flex items-center justify-center pb-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-lg">
              <button
                type="button"
                onClick={() => {
                  playSound('click')
                  setActiveTab('by-player')
                }}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider',
                  activeTab === 'by-player'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                )}
              >
                <HiUser className="h-4 w-4" />
                By Player
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('click')
                  setActiveTab('upload')
                }}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider',
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                )}
              >
                <HiArrowUpTray className="h-4 w-4" />
                Upload Cape (.PNG)
              </button>
            </div>
          </div>

          {/* Option 1: By Player Username */}
          {activeTab === 'by-player' && (
            <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full py-6">
              <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl w-full flex flex-col items-center text-center shadow-2xl">
                <div className="h-16 w-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                  <HiUser className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">
                  Fetch Cape by Minecraft Username
                </h3>
                <p className="text-xs text-slate-400 mb-6 max-w-md leading-relaxed">
                  Enter any player username to retrieve their official Mojang cape or player cloak.
                </p>

                {/* Search Bar Input */}
                <div className="flex gap-2.5 w-full max-w-md">
                  <div className="relative flex-1">
                    <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={playerInput}
                      onChange={(e) => setPlayerInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLookupPlayerCape()}
                      placeholder="Enter username (e.g. Notch, Dream)..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLookupPlayerCape()}
                    disabled={isSearchingPlayer || !playerInput.trim()}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20"
                  >
                    {isSearchingPlayer ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {/* Popular Quick-Select Suggestions */}
                <div className="flex items-center flex-wrap justify-center gap-2 mt-4">
                  <span className="text-[11px] text-slate-500 font-medium">Quick search:</span>
                  {['Notch', 'Jeb_', 'Dinnerbone', 'Dream', 'Technoblade'].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleLookupPlayerCape(name)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/10 text-[11px] text-slate-300 font-mono transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>

                {/* Search Result Card */}
                {playerResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex items-center justify-between w-full p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 shadow-xl"
                  >
                    <div className="flex items-center gap-4">
                      <SteveBackCapeCanvas textureUrl={playerResult.url} />
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white">{playerResult.name}</h4>
                        <span className="text-[11px] text-cyan-400 font-semibold">{playerResult.source}</span>
                        <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                          <HiCheck className="h-3 w-3" /> Ready to Preview & Equip
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewCapeUrl(playerResult.url)
                        setSelectedCapeId(`player-${playerResult.name}`)
                        playSound('click')
                        showToast(`Selected ${playerResult.name}!`)
                      }}
                      className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                    >
                      Select Cape
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Option 2: Upload Custom Cape */}
          {activeTab === 'upload' && (
            <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full py-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".png"
                onChange={handleCustomFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-12 rounded-3xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/10 hover:bg-purple-950/20 transition-all cursor-pointer flex flex-col items-center text-center group shadow-2xl"
              >
                <div className="h-16 w-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform mb-4 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                  <HiArrowUpTray className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">
                  Click to select or drag & drop a Cape PNG
                </h3>
                <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
                  Upload any standard Minecraft cape file. It will render in 3D and wave smoothly with dynamic cloth physics in-game.
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-purple-300 font-mono">
                    Standard: 64x32 .PNG
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-purple-300 font-mono">
                    HD: 128x64 .PNG
                  </span>
                </div>
              </div>

              {/* Uploaded Cape Card Preview */}
              {customCapeDataUri && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center justify-between w-full p-4 rounded-2xl bg-white/[0.04] border border-white/10 shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <SteveBackCapeCanvas textureUrl={customCapeDataUri} />
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-white">{customCapeName}</h4>
                      <p className="text-xs text-emerald-400 font-semibold">Custom Cape Imported</p>
                      <span className="text-[10px] text-slate-400">Ready to equip to your account</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewCapeUrl(customCapeDataUri)
                      setSelectedCapeId('custom')
                      playSound('click')
                      showToast(`Selected "${customCapeName}"!`)
                    }}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Select Cape
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
