import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  HiBolt,
  HiRocketLaunch,
  HiArrowPath,
  HiStop,
  HiChevronDown,
  HiSparkles,
  HiTv,
  HiShieldCheck,
  HiCpuChip,
  HiCheck,
  HiSignal,
  HiGlobeAlt
} from 'react-icons/hi2'
import { FaFire, FaGem, FaCrosshairs } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'
import { useInstances } from '../../hooks/useInstances'
import { useLaunch } from '../../hooks/useLaunch'
import { playSound } from '../../utils/sound'
import { getAccountBody, getAccountAvatar } from '../../utils/avatar'
import { MinecraftSkinViewer3D } from '../../components/skins/MinecraftSkinViewer3D'
import LoginView from '../../components/auth/LoginView'
import type { GameInstance } from '../../../shared/types/instance'

interface PopularServer {
  id: string
  name: string
  ip: string
  icon: string
  ping: number
  tag: string
  color: string
}

const POPULAR_SERVERS: PopularServer[] = [
  {
    id: 'hypixel',
    name: 'Hypixel Network',
    ip: 'mc.hypixel.net',
    icon: '⚡',
    ping: 28,
    tag: 'Bedwars • Skyblock',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30'
  },
  {
    id: 'minemen',
    name: 'Minemen Club',
    ip: 'na.minemen.club',
    icon: '⚔️',
    ping: 32,
    tag: 'Ranked 1v1 PvP',
    color: 'from-rose-500/20 to-red-500/20 border-rose-500/30'
  },
  {
    id: 'pvplegacy',
    name: 'PvP Legacy',
    ip: 'play.pvplegacy.net',
    icon: '🛡️',
    ping: 24,
    tag: '1.21 Sword & Shield',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30'
  },
  {
    id: 'bcas',
    name: 'BCAS Community SMP',
    ip: 'bcas.deskhost.fun:19100',
    icon: '💎',
    ping: 18,
    tag: 'Official Community SMP',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30'
  }
]

export default function NoRiskHomePage() {
  const navigate = useNavigate()
  const { activeAccount } = useAuth()
  const { instances, activeInstance, setActiveInstance, loadInstances } = useInstances()
  const { launchGame, stopGame, isPlaying, isLaunching } = useLaunch()

  const [presets, setPresets] = useState<any[]>([])
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [copiedServer, setCopiedServer] = useState<string | null>(null)

  // Quick mod toggles on home screen
  const [quickMods, setQuickMods] = useState({
    sodium: true,
    keystrokes: true,
    armorHud: true,
    waveyCapes: true,
    zoomify: true,
    discordRpc: true
  })

  useEffect(() => {
    loadPresets()
  }, [instances])

  const loadPresets = async () => {
    try {
      if (window.electronAPI?.getPresets) {
        const list = await window.electronAPI.getPresets()
        setPresets(list || [])
      }
    } catch {}
  }

  if (!activeAccount) return <LoginView />

  const currentInstance: GameInstance | undefined = activeInstance || instances[0]

  const handleLaunch = async (serverAddress?: string) => {
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

  const handleSelectPreset = async (presetItem: any) => {
    playSound('click')
    setIsPresetDropdownOpen(false)

    if (presetItem.installedInstance) {
      setActiveInstance(presetItem.installedInstance)
    } else {
      setIsSyncing(true)
      try {
        const inst = await window.electronAPI.ensureDefaultPreset()
        if (inst) {
          await loadInstances()
          setActiveInstance(inst)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsSyncing(false)
      }
    }
  }

  const handleCopyIp = (ip: string, id: string) => {
    playSound('click')
    navigator.clipboard.writeText(ip)
    setCopiedServer(id)
    setTimeout(() => setCopiedServer(null), 2000)
  }

  const toggleMod = (key: keyof typeof quickMods) => {
    playSound('click')
    setQuickMods((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="relative min-h-full w-full select-none font-sans text-slate-100 overflow-y-auto px-6 py-6 pb-20">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">

        {/* ── TOP HERO BANNER: 2-COLUMN NO-RISK STYLE DASHBOARD ── */}
        <div className="grid grid-cols-12 gap-6 items-stretch">
          
          {/* ── LEFT: 3D CHARACTER STAGE WITH CYBER PEDESTAL ── */}
          <div className="col-span-12 lg:col-span-4 relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0A0E18]/80 p-6 shadow-2xl backdrop-blur-2xl">
            {/* Ambient radiant background lighting */}
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/15 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-[80px] pointer-events-none" />

            {/* Stage Header */}
            <div className="relative z-10 flex w-full items-center justify-between">
              <div className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-bold text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>3D WARDROBE</span>
              </div>
              <span className="font-mono text-xs text-slate-400">Drag to rotate</span>
            </div>

            {/* 3D Skin Viewer on Glowing Holographic Pedestal */}
            <div className="relative z-10 flex flex-col items-center justify-center my-3 w-full">
              {/* Floating Username Pill */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                className="z-20 mb-2 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-0.5 text-xs font-bold text-white shadow-lg backdrop-blur-md"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{activeAccount.username}</span>
                <HiShieldCheck className="text-emerald-400" size={14} />
              </motion.div>

              {/* 3D Skin Canvas */}
              <div className="relative h-[280px] w-full flex items-center justify-center">
                <MinecraftSkinViewer3D
                  playerName={activeAccount.username}
                  width={240}
                  height={280}
                  defaultAnimation="idle"
                  enableControls={true}
                  enableZoom={false}
                  showControlsBar={false}
                />
              </div>

              {/* Glowing Cyber Holographic Pedestal Disc */}
              <div className="relative -mt-6 flex flex-col items-center">
                <div className="h-3 w-48 rounded-[100%] bg-gradient-to-r from-cyan-500/60 via-emerald-400/80 to-cyan-500/60 blur-xs shadow-[0_0_30px_rgba(6,182,212,0.6)]" />
                <div className="h-1.5 w-36 rounded-[100%] bg-white/80 blur-2xs mt-[-2px]" />
              </div>
            </div>

            {/* Stage Quick Actions */}
            <div className="relative z-10 flex w-full items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  playSound('click')
                  navigate('/skins')
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-bold text-white hover:bg-white/[0.08] hover:border-cyan-400/50 transition-all shadow-sm"
              >
                <HiSparkles className="text-cyan-400" size={15} />
                <span>Change Cape / Skin</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound('click')
                  navigate('/client-hud')
                }}
                className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-cyan-400/50 transition-all"
                title="Open HUD Studio"
              >
                <HiTv size={17} />
              </button>
            </div>
          </div>

          {/* ── RIGHT: PRIMARY LAUNCH HUB & VERSION PICKER ── */}
          <div className="col-span-12 lg:col-span-8 flex flex-col justify-between gap-5">
            
            {/* Top Action Box: Big Launch Control */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0A0E18]/85 p-6 shadow-2xl backdrop-blur-2xl">
              
              {/* Header Badges: Preset Selector & Telemetry */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                
                {/* Preset Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click')
                      setIsPresetDropdownOpen(!isPresetDropdownOpen)
                    }}
                    className="flex items-center gap-2.5 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                  >
                    <HiBolt className="text-cyan-400" size={16} />
                    <div className="flex flex-col text-left leading-tight">
                      <span className="font-mono text-[9px] text-cyan-300 uppercase">ACTIVE CLIENT PROFILE</span>
                      <span className="text-xs font-black tracking-wide">
                        {currentInstance?.name || 'Astrix Client 1.21.4'}
                      </span>
                    </div>
                    <HiChevronDown className="text-cyan-400 ml-1" size={15} />
                  </button>

                  {/* Preset Dropdown Menu */}
                  <AnimatePresence>
                    {isPresetDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-white/15 bg-[#0C101C]/95 p-2 shadow-2xl backdrop-blur-2xl"
                      >
                        <div className="p-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Select Client Profile
                        </div>
                        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                          {presets.length > 0 ? (
                            presets.map((item) => (
                              <button
                                key={item.preset.id}
                                type="button"
                                onClick={() => handleSelectPreset(item)}
                                className={`flex items-center justify-between rounded-xl p-2.5 text-left text-xs transition-all ${
                                  currentInstance?.name === item.preset.name
                                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-white'
                                    : 'hover:bg-white/[0.06] text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-bold">
                                    ⚡
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-white">{item.preset.name}</span>
                                    <span className="text-[10px] text-slate-400">{item.preset.tagline}</span>
                                  </div>
                                </div>
                                {currentInstance?.name === item.preset.name && (
                                  <HiCheck className="text-cyan-400" size={16} />
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-center text-xs text-slate-400">
                              Astrix Client 1.21.4 (Default)
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Telemetry Pills */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-slate-300">
                    <HiCpuChip className="text-emerald-400" size={14} />
                    <span>RAM: 4.0 GB / 8.0 GB</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>OptiEngine v4.6</span>
                  </div>
                </div>
              </div>

              {/* ── GIANT GLOWING NO-RISK STYLE LAUNCH BUTTON ── */}
              <div className="relative my-2">
                <motion.div
                  whileHover={{ scale: 1.012 }}
                  whileTap={{ scale: 0.988 }}
                  onClick={() => handleLaunch()}
                  className={`group flex h-20 w-full items-center justify-center gap-4 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden shadow-2xl ${
                    isPlaying
                      ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 shadow-[0_0_40px_rgba(225,29,72,0.5)]'
                      : isLaunching || isSyncing
                      ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 animate-pulse shadow-[0_0_40px_rgba(6,182,212,0.5)]'
                      : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 shadow-[0_0_45px_rgba(6,182,212,0.45)] hover:shadow-[0_0_65px_rgba(6,182,212,0.75)]'
                  }`}
                >
                  {isPlaying ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shrink-0 shadow-md">
                      <div className="h-3 w-3 bg-red-600 rounded-xs" />
                    </div>
                  ) : isLaunching || isSyncing ? (
                    <HiArrowPath className="h-8 w-8 animate-spin text-white shrink-0" />
                  ) : (
                    <HiRocketLaunch className="h-8 w-8 text-white shrink-0 drop-shadow group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  )}

                  <div className="flex flex-col text-left">
                    <span className="font-display text-2xl font-black uppercase tracking-wider text-white drop-shadow">
                      {isPlaying
                        ? 'STOP MINECRAFT'
                        : isLaunching
                        ? 'LAUNCHING CLIENT...'
                        : isSyncing
                        ? 'SYNCING MODPACK...'
                        : 'LAUNCH ASTRIX CLIENT'}
                    </span>
                    <span className="font-mono text-xs text-white/80 font-medium tracking-wide">
                      {isPlaying
                        ? 'Game is running • Click to terminate instance'
                        : 'Sodium • Iris Shaders • WaveyCapes • Keystrokes • 500+ FPS'}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Sub-bar: In-Game Mods Quick Toggles */}
              <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Client Modules:
                </span>
                
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: 'sodium', label: 'Sodium FPS' },
                    { key: 'keystrokes', label: 'Keystrokes' },
                    { key: 'armorHud', label: 'Armor HUD' },
                    { key: 'waveyCapes', label: '3D Capes' },
                    { key: 'zoomify', label: 'Smooth Zoom' }
                  ].map((m) => {
                    const active = quickMods[m.key as keyof typeof quickMods]
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => toggleMod(m.key as keyof typeof quickMods)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold transition-all ${
                          active
                            ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                            : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            active ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,1)]' : 'bg-slate-500'
                          }`}
                        />
                        <span>{m.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── 1-CLICK POPULAR SERVER CONNECT BAR (NORISK STYLE) ── */}
            <div className="relative flex flex-col gap-3 rounded-3xl border border-white/[0.08] bg-[#0A0E18]/80 p-5 shadow-xl backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiGlobeAlt className="text-cyan-400" size={17} />
                  <span className="font-display text-sm font-bold tracking-wider uppercase text-white">
                    QUICK PLAY SERVERS
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/servers')}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  View Server Browser →
                </button>
              </div>

              {/* Server Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {POPULAR_SERVERS.map((server) => (
                  <div
                    key={server.id}
                    className={`relative flex flex-col justify-between rounded-2xl border p-3.5 bg-gradient-to-b ${server.color} transition-all hover:scale-[1.02] shadow-md group`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-lg">{server.icon}</span>
                        <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400">
                          <HiSignal size={12} />
                          <span>{server.ping}ms</span>
                        </div>
                      </div>

                      <h4 className="font-display text-sm font-bold text-white leading-tight">
                        {server.name}
                      </h4>
                      <p className="font-mono text-[10px] text-slate-400 truncate mb-2">
                        {server.tag}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => handleLaunch(server.ip)}
                        className="flex-1 rounded-xl bg-white/10 hover:bg-white/20 py-1.5 text-xs font-bold text-white transition-all text-center"
                      >
                        Join Server
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyIp(server.ip, server.id)}
                        className="rounded-xl bg-white/5 hover:bg-white/15 px-2 py-1.5 text-[10px] font-mono text-slate-300 transition-all"
                        title="Copy IP"
                      >
                        {copiedServer === server.id ? '✓' : 'IP'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
