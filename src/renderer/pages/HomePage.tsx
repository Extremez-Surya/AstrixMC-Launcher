import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  HiPlay,
  HiStop,
  HiArrowPath,
  HiPlus,
  HiFolderOpen,
  HiPuzzlePiece,
  HiAdjustmentsHorizontal,
  HiChevronDown,
  HiBolt,
  HiCheck,
  HiPhoto,
  HiSun,
  HiMoon,
  HiChevronUp,
  HiSquares2X2,
  HiCog6Tooth,
  HiSparkles,
  HiDocumentText,
  HiPaintBrush
} from 'react-icons/hi2'
import { FaShirt, FaDiscord } from 'react-icons/fa6'
import LoginView from '../components/auth/LoginView'
import CreateInstanceModal from '../components/instances/CreateInstanceModal'
import { MinecraftSkinViewer3D } from '../components/skins/MinecraftSkinViewer3D'
import { useAuth } from '../hooks/useAuth'
import { getAccountAvatar } from '../utils/avatar'
import { useInstances } from '../hooks/useInstances'
import { useLaunch } from '../hooks/useLaunch'
import { playSound } from '../utils/sound'
import type { GameInstance } from '../../shared/types/instance'
import bountifulImg from '../assets/mc_bountiful.jpg'

export default function HomePage() {
  const navigate = useNavigate()
  const { activeAccount } = useAuth()
  const { instances, activeInstance, setActiveInstance, openInstanceFolder, createInstance, updateInstance } = useInstances()
  const { launchGame, stopGame, isPlaying, isLaunching, progress } = useLaunch()

  const [isNewInstanceModalOpen, setIsNewInstanceModalOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false)
  const [copiedIp, setCopiedIp] = useState(false)
  const [isFullbright, setIsFullbright] = useState(false)
  const [isContentsDrawerOpen, setIsContentsDrawerOpen] = useState(false)
  const [installedModsCount, setInstalledModsCount] = useState<number>(0)
  const [skinKey, setSkinKey] = useState(0)
  const [skinZoom, setSkinZoom] = useState(1.0)
  const [skinAnimation, setSkinAnimation] = useState<'idle' | 'none'>('idle')

  const currentInstance: GameInstance | undefined = activeInstance || instances[0]

  // Check initial fullbright setting and installed mods count
  useEffect(() => {
    if (!currentInstance?.id) return

    if (window.electronAPI?.getGameOptions) {
      window.electronAPI.getGameOptions(currentInstance.id).then((opts: any) => {
        if (opts && typeof opts.gamma === 'number') {
          setIsFullbright(opts.gamma > 5.0)
        }
      }).catch(() => {})
    }

    if (window.electronAPI?.getInstalledMods) {
      window.electronAPI.getInstalledMods(currentInstance.id).then((mods: any[]) => {
        if (Array.isArray(mods)) setInstalledModsCount(mods.length)
      }).catch(() => {})
    }
  }, [currentInstance?.id])

  if (!activeAccount) return <LoginView />

  const handlePlay = (serverAddress?: string) => {
    playSound('launch')
    if (isPlaying) {
      if (serverAddress && currentInstance) {
        launchGame(currentInstance.id, serverAddress)
      } else {
        stopGame()
      }
    } else if (!isLaunching && currentInstance) {
      launchGame(currentInstance.id, serverAddress)
    }
  }

  const handleToggleFullbright = async () => {
    if (!currentInstance?.id || !window.electronAPI?.setGameOption) return
    const nextVal = !isFullbright
    setIsFullbright(nextVal)
    playSound('click')
    await window.electronAPI.setGameOption(currentInstance.id, 'gamma', nextVal ? 15.0 : 1.0)
  }

  const handleCopyIp = (ip = 'bcas.deskhost.fun:19100') => {
    playSound('click')
    navigator.clipboard.writeText(ip)
    setCopiedIp(true)
    setTimeout(() => setCopiedIp(false), 2000)
  }

  const handleCreateNew = async (data: any) => {
    const inst = await createInstance(data)
    if (inst && data.installFpsPack && window.electronAPI?.installMod) {
      window.electronAPI.installMod({ instanceId: inst.id, isFpsPack: true }).catch(console.error)
    }
  }

  const avatarUrl = getAccountAvatar(activeAccount, 36)
  const loaderName = currentInstance?.modLoader
    ? `${currentInstance.modLoader.type.charAt(0).toUpperCase() + currentInstance.modLoader.type.slice(1)}`
    : 'Vanilla'

  return (
    <div className="relative h-full w-full select-none overflow-hidden text-slate-100 flex flex-col justify-between p-6 md:p-8">
      {/* ── CINEMATIC FULLSCREEN VIBRANT MINECRAFT BACKDROP (BRIGHT SUNLIT WORLD) ── */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <img
          src={bountifulImg}
          alt="Cinematic World"
          className="h-full w-full object-cover object-center filter brightness-[0.98] contrast-[1.04] saturate-[1.1] scale-105"
        />
        {/* Soft edge-to-edge subtle ambient vignette */}
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E]/80 via-transparent to-[#07090E]/30" />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(7, 9, 14, 0.4) 85%, rgba(7, 9, 14, 0.7) 100%)'
          }}
        />
      </div>

      {/* ── TOP FLOATING TOOLBAR HUD (ROCK CLIENT + OLD ASTRIX HYBRID) ── */}
      <header className="relative z-30 flex items-center justify-between gap-4">
        {/* Left: Instance Selector Glass Pill + Astrix Engine Badge + Server Connect */}
        <div className="flex items-center gap-3">
          {/* Play | Active Instance Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-[#0A0E18]/85 px-4 py-2.5 backdrop-blur-2xl shadow-[0_12px_30px_rgba(0,0,0,0.6)] hover:border-amber-500/40 hover:bg-[#0D1220]/95 transition-all duration-200"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Play</span>
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white max-w-[200px] truncate">
                  {currentInstance ? currentInstance.name : 'Create Profile'}
                </span>
                <HiChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-white/[0.12] bg-[#090C14]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 ring-1 ring-black/50"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Select Profile
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {instances.map((inst) => (
                      <button
                        key={inst.id}
                        onClick={() => {
                          setActiveInstance(inst)
                          setIsProfileDropdownOpen(false)
                          playSound('click')
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                          inst.id === currentInstance?.id
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <div className="truncate font-medium">{inst.name}</div>
                        <span className="text-[10px] text-zinc-500 ml-2 whitespace-nowrap">MC {inst.mcVersion}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 border-t border-white/[0.08] pt-2">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false)
                        setIsNewInstanceModalOpen(true)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
                    >
                      <HiPlus className="h-4 w-4" />
                      <span>Create New Profile</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Astrix Engine V4.7 Badge (From Old Astrix UI Image 4) */}
          <div className="hidden xl:flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#0A0E18]/70 px-3 py-2 text-[11px] font-bold text-zinc-300 backdrop-blur-xl shadow-md">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400">ASTRIX ENGINE V4.7</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400">Ultra FPS Engine</span>
          </div>

          {/* BCAS Server Quick Connect Pill (From Old Astrix UI Image 4) */}
          <div className="hidden lg:flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#0A0E18]/70 px-3 py-2 text-[11px] font-medium text-zinc-300 backdrop-blur-xl shadow-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
            <span className="text-zinc-400">SMP:</span>
            <span className="font-mono font-bold text-white">bcas.deskhost.fun:19100</span>
            <button
              onClick={() => handleCopyIp()}
              title="Copy IP"
              className="rounded-lg bg-white/[0.06] hover:bg-white/[0.12] px-2 py-0.5 text-[10px] font-bold text-amber-400 transition-colors"
            >
              {copiedIp ? 'COPIED!' : 'COPY'}
            </button>
          </div>
        </div>

        {/* Right: Discord Quick Join + Account & Skins Pill */}
        <div className="flex items-center gap-3">
          {/* Discord Join Pill (From Old Astrix UI Image 4) */}
          <a
            href="https://discord.gg/FR9pxXG2Mwb"
            target="_blank"
            rel="noreferrer"
            title="Join Astrix Community Discord"
            className="hidden md:flex items-center gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-600/20 hover:bg-indigo-600/30 px-3.5 py-2 text-xs font-bold text-indigo-300 backdrop-blur-xl shadow-lg transition-all"
          >
            <FaDiscord className="h-4 w-4 text-indigo-400" />
            <span>Discord</span>
          </a>

          {/* Account & Skins Pill (Rock Client Style Image 2) */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-[#0A0E18]/85 px-3.5 py-2 backdrop-blur-2xl shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
            <div className="relative h-8 w-8 rounded-xl overflow-hidden ring-1 ring-white/10">
              <img
                src={avatarUrl}
                alt={activeAccount.username}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide">{activeAccount.username}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium capitalize">
                {activeAccount.type === 'microsoft' ? 'Microsoft Account' : 'Offline account'}
              </span>
            </div>

            <div className="h-4 w-[1px] bg-white/10 ml-1" />

            {/* Skins Button Shortcut */}
            <button
              onClick={() => navigate('/skins')}
              title="Skin Wardrobe & Capes"
              className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] hover:bg-amber-500/15 hover:text-amber-400 px-2.5 py-1 text-xs font-bold text-zinc-300 transition-colors"
            >
              <FaShirt className="h-3 w-3" />
              <span>Skins</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── CENTER STAGE: 3D CHARACTER + CAMERA CONTROL PILL (ROCK CLIENT STYLE) ── */}
      <div className="relative flex-1 flex items-center justify-center my-auto pointer-events-none">
        {/* Grounded 3D Character Hero */}
        <div className="pointer-events-auto relative flex flex-col items-center">
          {/* Floating Player Name Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-1 flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#0A0E18]/85 px-4 py-1 backdrop-blur-xl shadow-lg ring-1 ring-black/40"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
            <span className="text-xs font-black text-white tracking-wide">{activeAccount.username}</span>
          </motion.div>

          {/* 3D Skin Canvas */}
          <div
            key={skinKey}
            className="relative h-[340px] md:h-[420px] w-[260px] md:w-[320px] transition-transform duration-200"
            style={{ transform: `scale(${skinZoom})` }}
          >
            <MinecraftSkinViewer3D
              playerName={activeAccount.username}
              width={300}
              height={410}
              defaultAnimation={skinAnimation}
              enableControls={true}
              enableZoom={false}
              showControlsBar={false}
              className="drop-shadow-[0_25px_40px_rgba(0,0,0,0.85)]"
            />

            {/* Soft shadow at feet */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-6 w-44 rounded-[100%] bg-black/60 blur-md -z-10" />
          </div>

          {/* Vertical Camera Controls Bar (Right beside character, like Image 2 Rock Client) */}
          <div className="absolute right-[-48px] top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.12] bg-[#0A0E18]/85 p-1.5 backdrop-blur-2xl shadow-xl z-20">
            <button
              onClick={() => setSkinKey((k) => k + 1)}
              title="Reset Rotation"
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400 hover:bg-white/[0.12] hover:text-white transition-all text-xs"
            >
              ↺
            </button>
            <button
              onClick={() => setSkinKey((k) => k + 1)}
              title="Center Character"
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400 hover:bg-white/[0.12] hover:text-white transition-all text-xs"
            >
              ⛶
            </button>
            <button
              onClick={() => setSkinZoom((z) => Math.min(z + 0.15, 1.5))}
              title="Zoom In"
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400 hover:bg-white/[0.12] hover:text-white transition-all font-bold text-xs"
            >
              +
            </button>
            <button
              onClick={() => setSkinZoom((z) => Math.max(z - 0.15, 0.7))}
              title="Zoom Out"
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400 hover:bg-white/[0.12] hover:text-white transition-all font-bold text-xs"
            >
              −
            </button>
            <button
              onClick={() => setSkinAnimation((prev) => (prev === 'idle' ? 'none' : 'idle'))}
              title={skinAnimation === 'idle' ? 'Pause Skin Animation' : 'Resume Skin Animation'}
              className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all text-[10px] ${
                skinAnimation === 'idle'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-white/[0.04] text-zinc-500 hover:text-white'
              }`}
            >
              {skinAnimation === 'idle' ? '▶' : '⏸'}
            </button>
          </div>
        </div>

        {/* Far Right Tool Capsule (Screenshots, Folder, SMP IP, Cave Fullbright) */}
        <div className="pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2.5 rounded-3xl border border-white/[0.12] bg-[#0A0E18]/85 p-2.5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          <button
            onClick={() => navigate('/screenshots')}
            title="Minecraft Screenshots Gallery"
            className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-400 hover:bg-white/[0.1] hover:text-white transition-all"
          >
            <HiPhoto className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => currentInstance && openInstanceFolder(currentInstance.id)}
            title="Open Profile Folder (.minecraft)"
            className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-400 hover:bg-white/[0.1] hover:text-white transition-all"
          >
            <HiFolderOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => handleCopyIp()}
            title="Copy BCAS Server IP"
            className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all"
          >
            {copiedIp ? (
              <HiCheck className="h-5 w-5 text-emerald-400" />
            ) : (
              <HiBolt className="h-5 w-5 group-hover:scale-110 transition-transform" />
            )}
          </button>

          <button
            onClick={handleToggleFullbright}
            title={isFullbright ? 'Fullbright Active (15.0) - Click to restore normal lighting' : 'Enable Cave Fullbright (Gamma 15.0)'}
            className={`group flex h-10 w-10 items-center justify-center rounded-2xl transition-all ${
              isFullbright
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.1] hover:text-white'
            }`}
          >
            {isFullbright ? (
              <HiSun className="h-5 w-5" />
            ) : (
              <HiMoon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
      </div>

      {/* ── BOTTOM DOCK ROW (ANCHORED AT BOTTOM-6, EXACT ROCK CLIENT REPLICATION) ── */}
      <footer className="relative z-30 flex items-end justify-between w-full">
        {/* Bottom Left: Selected Profile Card + Quick Action Pills (Image 2 Rock Client) */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col rounded-3xl border border-white/[0.12] bg-[#0A0E18]/85 p-5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] w-[320px]">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">SELECTED PROFILE</span>
            <h2 className="mt-1 text-2xl font-black text-white tracking-tight truncate">
              {currentInstance?.name || 'Astrix 26.3'}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <span>{currentInstance?.mcVersion || '26.3'}</span>
              <span className="text-zinc-500">·</span>
              <span className="text-amber-400">{loaderName}</span>
              <span className="text-zinc-500">·</span>
              <span>{currentInstance?.memoryMax || 3} GB RAM</span>
            </div>
          </div>

          {/* Quick Action Pills Underneath Selected Profile (Image 2 Rock Client) */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.12] bg-[#0A0E18]/85 p-1.5 backdrop-blur-2xl shadow-lg w-fit">
            <button
              onClick={() => navigate('/instances')}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all"
            >
              <HiSquares2X2 className="h-3.5 w-3.5" />
              <span>Profiles</span>
            </button>
            <button
              onClick={() => navigate('/mods')}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all"
            >
              <HiPuzzlePiece className="h-3.5 w-3.5 text-purple-400" />
              <span>Modpacks</span>
            </button>
            <button
              onClick={() => setIsQuickSettingsOpen(true)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all"
            >
              <HiAdjustmentsHorizontal className="h-3.5 w-3.5 text-amber-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Bottom Center: Golden Hero Launch Capsule (Image 2 Rock Client) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 rounded-3xl border border-white/[0.15] bg-[#0A0E18]/90 p-2 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-black/40">
            <button
              onClick={() => handlePlay()}
              disabled={isLaunching}
              className={`relative flex items-center justify-center gap-3 rounded-2xl px-12 md:px-14 py-3.5 text-base md:text-lg font-black tracking-wide transition-all duration-300 ${
                isPlaying
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:brightness-110'
                  : isLaunching
                  ? 'bg-amber-500/50 text-black/70 cursor-wait'
                  : 'bg-gradient-to-r from-[#F59E0B] via-[#EAB308] to-[#D97706] text-black shadow-[0_0_35px_rgba(245,158,11,0.45)] hover:shadow-[0_0_50px_rgba(245,158,11,0.65)] hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isPlaying ? (
                <>
                  <HiStop className="h-6 w-6" />
                  <span>Stop Game</span>
                </>
              ) : isLaunching ? (
                <>
                  <HiArrowPath className="h-6 w-6 animate-spin" />
                  <span>Launching...</span>
                </>
              ) : (
                <>
                  <HiPlay className="h-6 w-6 fill-current" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsQuickSettingsOpen(true)}
              title="Launch Options & Settings"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] hover:text-white transition-all"
            >
              <HiCog6Tooth className="h-5 w-5" />
            </button>
          </div>

          {/* Real-time Launch & Download Progress Bar */}
          {isLaunching && progress && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 w-72 flex flex-col items-center"
            >
              <div className="flex w-full items-center justify-between text-[10px] text-zinc-400 font-medium px-1">
                <span className="truncate max-w-[200px]">{progress.message || 'Preparing runtime...'}</span>
                <span>{Math.round(progress.progress)}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-200"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Right: Profile Contents Drawer Toggle (Image 2 Rock Client) */}
        <button
          onClick={() => setIsContentsDrawerOpen(!isContentsDrawerOpen)}
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 backdrop-blur-2xl shadow-[0_12px_30px_rgba(0,0,0,0.6)] transition-all ${
            isContentsDrawerOpen
              ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
              : 'border-white/[0.12] bg-[#0A0E18]/85 text-zinc-300 hover:border-amber-500/40 hover:bg-[#0D1220]/90'
          }`}
        >
          <HiSquares2X2 className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold">Profile contents</span>
          {isContentsDrawerOpen ? (
            <HiChevronUp className="h-4 w-4 text-amber-400" />
          ) : (
            <HiChevronDown className="h-4 w-4 text-amber-400" />
          )}
        </button>
      </footer>

      {/* ── EXPANDABLE PROFILE CONTENTS DRAWER (ROCK CLIENT STYLE) ── */}
      <AnimatePresence>
        {isContentsDrawerOpen && currentInstance && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.section
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-5xl rounded-3xl border border-white/[0.12] bg-[#090C14]/95 p-6 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-base font-extrabold text-white tracking-wide">
                    Instance Contents & Workspace
                  </span>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                    {currentInstance.name}
                  </span>
                </div>
                <button
                  onClick={() => setIsContentsDrawerOpen(false)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.05]"
                >
                  <span>Close Drawer</span>
                  <HiChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Content Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Mods Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 hover:border-purple-500/40 hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                        <HiPuzzlePiece className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Mods</h4>
                        <p className="text-[11px] text-zinc-400">{installedModsCount} installed</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsContentsDrawerOpen(false)
                        navigate('/mods')
                      }}
                      className="flex-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 py-1.5 text-center text-xs font-bold text-purple-300 border border-purple-500/30 transition-colors"
                    >
                      + Add Mods
                    </button>
                    <button
                      onClick={() => openInstanceFolder(currentInstance.id, 'mods')}
                      className="rounded-xl bg-white/[0.06] hover:bg-white/[0.1] px-2.5 py-1.5 text-xs font-semibold text-zinc-300"
                      title="Open Mods Folder"
                    >
                      <HiFolderOpen className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Resource Packs Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 hover:border-sky-500/40 hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                        <HiPaintBrush className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Resource Packs</h4>
                        <p className="text-[11px] text-zinc-400">Textures & Audio</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => openInstanceFolder(currentInstance.id, 'resourcepacks')}
                      className="flex-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 py-1.5 text-center text-xs font-bold text-sky-300 border border-sky-500/30 transition-colors"
                    >
                      Open Folder
                    </button>
                  </div>
                </div>

                {/* Shaders Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 hover:border-emerald-500/40 hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        <HiSparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Shader Packs</h4>
                        <p className="text-[11px] text-zinc-400">Iris / OptiFine</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => openInstanceFolder(currentInstance.id, 'shaderpacks')}
                      className="flex-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 py-1.5 text-center text-xs font-bold text-emerald-300 border border-emerald-500/30 transition-colors"
                    >
                      Open Shaders
                    </button>
                  </div>
                </div>

                {/* Detail Hub View */}
                <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 hover:border-amber-500/40 hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                        <HiDocumentText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Full Instance Hub</h4>
                        <p className="text-[11px] text-zinc-400">Logs, Worlds, Backups</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsContentsDrawerOpen(false)
                        navigate(`/instances/${currentInstance.id}`)
                      }}
                      className="flex-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 py-1.5 text-center text-xs font-bold text-amber-300 border border-amber-500/30 transition-colors"
                    >
                      Open Workspace ↗
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>

      {/* ── FASTCLIENT INSTANCE CREATE MODAL ── */}
      <CreateInstanceModal
        isOpen={isNewInstanceModalOpen}
        onClose={() => setIsNewInstanceModalOpen(false)}
        onCreate={handleCreateNew}
      />

      {/* ── QUICK IN-LAUNCHER GAME OPTIONS & FULLBRIGHT MODAL ── */}
      <AnimatePresence>
        {isQuickSettingsOpen && currentInstance && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-white/[0.12] bg-[#0B0E17] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <HiAdjustmentsHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Profile Quick Tweaks</h3>
                    <p className="text-[11px] text-zinc-400">{currentInstance.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQuickSettingsOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {/* Fullbright Toggle */}
                <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <HiSun className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Cave Fullbright Mode</span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      Sets gamma to 15.0 so caves and nights are fully illuminated without torches.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleFullbright}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      isFullbright ? 'bg-amber-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                        isFullbright ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Memory Allocation */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Allocated RAM</span>
                    <span className="text-xs font-bold text-amber-400">{currentInstance.memoryMax || 6} GB</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    step="1"
                    value={Number(currentInstance.memoryMax || 6)}
                    onChange={(e) => {
                      updateInstance(currentInstance.id, {
                        memoryMax: e.target.value
                      })
                    }}
                    className="mt-3 w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
                    <span>2 GB (Minimal)</span>
                    <span>6 GB (Recommended)</span>
                    <span>16 GB (Heavy Shaders)</span>
                  </div>
                </div>

                {/* Open options.txt file */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => openInstanceFolder(currentInstance.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    <HiFolderOpen className="h-4 w-4 text-sky-400" />
                    <span>Open Instance Folder</span>
                  </button>

                  <button
                    onClick={() => setIsQuickSettingsOpen(false)}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
