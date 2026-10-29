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
  HiShieldCheck,
  HiCheck,
  HiUser,
  HiRocketLaunch,
  HiShoppingBag,
  HiSparkles
} from 'react-icons/hi2'
import { FaDiscord } from 'react-icons/fa6'
import LoginView from '../components/auth/LoginView'
import CreateInstanceModal from '../components/instances/CreateInstanceModal'
import { useAuth } from '../hooks/useAuth'
import { getAccountAvatar, getAccountBody } from '../utils/avatar'
import { useInstances } from '../hooks/useInstances'
import { useLaunch } from '../hooks/useLaunch'
import { playSound } from '../utils/sound'
import { GrassBlockIcon } from '../components/common/GamingIcons'
import type { GameInstance } from '../../shared/types/instance'
import landscapeImg from '../assets/landscape.jpg'
import featuredNewsImg from '../assets/featured_news.jpg'
import aloneSkinPreview from '../assets/alone_skin_preview.png'

export default function HomePage() {
  const navigate = useNavigate()
  const { activeAccount } = useAuth()
  const { instances, activeInstance, setActiveInstance, openInstanceFolder, createInstance } = useInstances()
  const { launchGame, stopGame, isPlaying, isLaunching } = useLaunch()

  const [isNewInstanceModalOpen, setIsNewInstanceModalOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [copiedIp, setCopiedIp] = useState(false)
  const [skinSrc, setSkinSrc] = useState<string>(() => (activeAccount ? getAccountBody(activeAccount, 280) : aloneSkinPreview))

  useEffect(() => {
    if (activeAccount) {
      setSkinSrc(getAccountBody(activeAccount, 280))
    }
  }, [activeAccount])

  if (!activeAccount) return <LoginView />

  const currentInstance: GameInstance | undefined = activeInstance || instances[0]

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

  return (
    <div className="relative min-h-full w-full select-none font-sans text-slate-100 overflow-y-auto bg-transparent">
      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 p-5 md:p-7 pb-28">

        {/* ── TOP SECTION: HERO CARD (LEFT) + INFO CARDS (RIGHT) ── */}
        <div className="grid grid-cols-12 gap-5 items-stretch">
          
          {/* ── LEFT HERO BANNER CONTAINER (Matching User Screenshot Exactly) ── */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0A0E18]/85 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
            {/* Cinematic dark mountain backdrop */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img
                src={landscapeImg}
                alt="Minecraft World"
                className="h-full w-full object-cover opacity-25 filter contrast-125 transition-transform duration-1000 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#07090E]/95 via-[#080B14]/80 to-[#07090E]/95" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-transparent" />
            </div>

            {/* Inner Content */}
            <div className="relative z-10 flex flex-col gap-6">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 font-mono text-[11px] font-bold text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>ASTRIX ENGINE V4.6</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/10 px-3 py-1 font-mono text-[11px] font-semibold text-amber-300 backdrop-blur-md">
                    <HiBolt className="text-amber-400" size={13} />
                    <span>Ultra FPS Engine</span>
                  </div>
                </div>

                {/* Right Profile Pill inside Card */}
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                  <div className="h-4 w-4 rounded-full overflow-hidden bg-black/40">
                    <img
                      src={getAccountAvatar(activeAccount, 20)}
                      alt={activeAccount.username}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span>{activeAccount.username}</span>
                  <HiShieldCheck className="text-emerald-400" size={15} />
                </div>
              </div>

              {/* Middle Section: Animated 3D Skin Preview (Left) + Active Instance Launch (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-1">
                
                {/* 3D Animated Skin Showcase on Golden Glowing Pedestal */}
                <div
                  onClick={() => {
                    playSound('click')
                    navigate('/skins')
                  }}
                  className="md:col-span-5 flex flex-col items-center justify-center relative min-h-[230px] cursor-pointer group/skin"
                  title="Click to open Skin Selector & Wardrobe Studio"
                >
                  {/* Floating username pill above skin */}
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                    className="z-20 mb-2 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-0.5 text-xs font-bold text-white shadow-lg backdrop-blur-md group-hover/skin:border-emerald-500/50 group-hover/skin:bg-emerald-500/20 transition-all"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{activeAccount.username}</span>
                    <span className="text-[10px] text-emerald-400 font-mono opacity-0 group-hover/skin:opacity-100 transition-opacity ml-1">
                      ✎ Edit Skin
                    </span>
                  </motion.div>

                  {/* 3D Skin Character with Smooth Floating Animation */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                    className="relative z-10 flex items-center justify-center select-none group-hover/skin:scale-105 transition-transform duration-300"
                  >
                    <img
                      src={skinSrc}
                      alt="Minecraft Skin"
                      onError={() => setSkinSrc(aloneSkinPreview)}
                      className="h-44 w-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] filter brightness-105 pointer-events-none"
                    />
                  </motion.div>

                  {/* Warm Glowing Pedestal with Ambient Pulse */}
                  <motion.div
                    animate={{ opacity: [0.65, 0.95, 0.65], scale: [0.95, 1.05, 0.95] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                    className="absolute bottom-1 h-16 w-48 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.5) 0%, rgba(245, 158, 11, 0.18) 45%, transparent 72%)'
                    }}
                  />
                  {/* Extra bottom soft reflection glow */}
                  <div className="absolute -bottom-1 h-3 w-32 rounded-full bg-amber-500/25 blur-md pointer-events-none" />
                </div>

                {/* Active Instance Info & Big Launch Button */}
                <div className="md:col-span-7 flex flex-col gap-3">
                  
                  {/* Instance Details Row */}
                  <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-md transition-all hover:border-white/15">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          ACTIVE INSTANCE
                        </span>
                      </div>
                      <span className="rounded-md border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                        {currentInstance?.modLoader?.type?.toUpperCase() || 'FABRIC'}{' '}
                        {currentInstance?.mcVersion || '26.2'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                          <GrassBlockIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-display text-xl font-black text-white leading-tight">
                            {currentInstance?.name || 'Astrix 26.2'}
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            RAM: 3 GB allocated • Ready
                          </span>
                        </div>
                      </div>

                      {/* Folder, Mods, Settings Icons */}
                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          type="button"
                          onClick={() => currentInstance && openInstanceFolder(currentInstance.id)}
                          title="Open Instance Folder"
                          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <HiFolderOpen size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/mods')}
                          title="Manage Mods"
                          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <HiPuzzlePiece size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/instances')}
                          title="Instance Settings"
                          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <HiAdjustmentsHorizontal size={17} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── BIG GLOWING LAUNCH BUTTON WITH SHEEN & PULSE (Matching Screenshot) ── */}
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      className={`glow-sheen group flex h-16 w-full items-stretch rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden shadow-2xl ${
                        isPlaying
                          ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 shadow-[0_0_35px_rgba(245,158,11,0.5)]'
                          : isLaunching
                          ? 'bg-gradient-to-r from-amber-600 to-orange-700 animate-pulse shadow-[0_0_35px_rgba(245,158,11,0.5)]'
                          : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:shadow-[0_0_55px_rgba(245,158,11,0.75)]'
                      }`}
                    >
                      {/* Main Play Action */}
                      <button
                        type="button"
                        onClick={() => handlePlay()}
                        disabled={isLaunching}
                        className="flex flex-1 items-center justify-center gap-3.5 px-6 text-left"
                      >
                        {isPlaying ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-white shrink-0 shadow-sm">
                            <div className="h-2.5 w-2.5 bg-orange-600 rounded-xs" />
                          </div>
                        ) : isLaunching ? (
                          <HiArrowPath className="h-6 w-6 animate-spin text-white shrink-0" />
                        ) : (
                          <HiRocketLaunch className="h-6 w-6 text-white shrink-0 drop-shadow" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-display text-lg font-black uppercase tracking-wider text-white leading-tight drop-shadow-sm">
                            {isPlaying
                              ? 'STOP GAME'
                              : isLaunching
                              ? 'LAUNCHING...'
                              : `PLAY ${currentInstance?.name?.toUpperCase() || 'ASTRIX 26.2'}`}
                          </span>
                          <span className="font-mono text-[11px] text-white/85 leading-none">
                            {currentInstance?.name || 'Astrix 26.2'} •{' '}
                            {currentInstance?.modLoader?.type?.toLowerCase() || 'fabric'}{' '}
                            {currentInstance?.mcVersion || '26.2'}
                          </span>
                        </div>
                      </button>

                      {/* Dropdown Chevron Partition */}
                      <div className="w-px bg-white/20 self-stretch my-2.5" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsProfileDropdownOpen((prev) => !prev)
                        }}
                        title="Select Profile"
                        className="flex w-14 items-center justify-center text-white hover:bg-black/10 transition-colors"
                      >
                        <HiChevronDown size={20} />
                      </button>
                    </motion.div>

                    {/* Profile Dropdown Menu */}
                    <AnimatePresence>
                      {isProfileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-white/10 bg-[#0C101B]/95 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-black/50"
                        >
                          <div className="px-2 py-1 font-mono text-[10px] font-bold text-slate-400 uppercase">
                            Switch Profile
                          </div>
                          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                            {instances.map((inst) => (
                              <button
                                key={inst.id}
                                type="button"
                                onClick={() => {
                                  playSound('click')
                                  setActiveInstance(inst)
                                  setIsProfileDropdownOpen(false)
                                }}
                                className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-bold transition-all ${
                                  inst.id === currentInstance?.id
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                <GrassBlockIcon className="h-4 w-4 shrink-0" />
                                <span className="truncate">{inst.name}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sub row: + New Profile & Profiles Switcher Pills */}
                  <div className="flex items-center gap-2.5 flex-wrap mt-1">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => setIsNewInstanceModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all shadow-sm"
                    >
                      <HiPlus size={13} />
                      <span>New Profile</span>
                    </motion.button>

                    {instances.slice(0, 3).map((inst) => {
                      const isSel = inst.id === currentInstance?.id
                      return (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          key={inst.id}
                          type="button"
                          onClick={() => {
                            playSound('click')
                            setActiveInstance(inst)
                          }}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                            isSel
                              ? 'border-amber-500/50 bg-black/60 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                              : 'border-white/10 bg-black/30 text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/20'
                          }`}
                        >
                          <GrassBlockIcon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate max-w-[120px]">{inst.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{inst.mcVersion}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── BOTTOM ROW INSIDE HERO CARD: ASTRIX OFFICIAL NETWORK BAR ── */}
            <div className="relative z-10 mt-6 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  ASTRIX OFFICIAL NETWORK:
                </span>
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-md shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                  bcas.deskhost.fun:19100
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyIp()}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
                >
                  {copiedIp ? 'Copied!' : 'Copy IP'}
                </button>
              </div>

              {/* Glowing Emerald Connect Directly Pill Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => handlePlay('bcas.deskhost.fun:19100')}
                disabled={isLaunching}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 font-display text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all shrink-0"
              >
                <HiPlay size={14} className="fill-slate-950 text-slate-950" />
                <span>Connect Directly</span>
              </motion.button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: DISCORD + STORE + PARTNER SERVERS CARDS ── */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
            
            {/* 1. Discord Card with Hover Lift */}
            <div className="card-hover-lift flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0A0E18]/85 p-4 shadow-lg backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/25">
                  <FaDiscord size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-sm font-bold text-white">Discord</span>
                  <span className="font-mono text-xs text-slate-400">discord.gg/FR9pXG2Mwb</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  playSound('click')
                  window.electronAPI?.openExternal?.('https://discord.gg/FR9pXG2Mwb')
                }}
                className="rounded-xl bg-[#5865F2] px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-[#4752C4] shadow-md shadow-[#5865F2]/30 transition-all"
              >
                JOIN
              </motion.button>
            </div>

            {/* 2. What's New Card */}
            <div
              onClick={() => {
                playSound('click')
                navigate('/news')
              }}
              className="card-hover-lift flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0A0E18]/85 p-4 shadow-lg backdrop-blur-xl cursor-pointer hover:border-amber-500/30 transition-all"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-md">
                <HiSparkles size={22} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-sm font-bold text-white">What's New</span>
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                    TODAY
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400">v1.0.0 Release (Oct 29)</span>
              </div>
            </div>

            {/* 3. Partner Servers Card */}
            <div className="card-hover-lift flex flex-1 flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0A0E18]/85 p-4 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-slate-400 uppercase tracking-wider">PARTNER SERVERS</span>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>

              {/* Server Item */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePlay('bcas.deskhost.fun:19100')}
                className="mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5 hover:bg-white/[0.05] hover:border-amber-500/30 transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M12.001 2c-.382 0-.749.193-.964.514C10.15 3.84 8.784 5.922 8.01 7.234 6.786 9.308 6 11.589 6 14.004c0 3.313 2.686 6 6.001 6 3.313 0 6-2.687 6-6 0-2.415-.786-4.696-2.01-6.77-.774-1.312-2.14-3.394-3.027-4.72-.215-.321-.582-.514-.963-.514zm.001 7.5c1.657 0 3 1.343 3 3 0 1.657-1.343 3-3 3-1.657 0-3-1.343-3-3 0-1.657 1.343-3 3-3z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display text-sm font-bold text-white">Astrix SMP</span>
                    <span className="font-mono text-[11px] text-slate-400">bcas.deskhost.fun:19100</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>1</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM SECTION: LATEST NEWS (LEFT) + FRIENDS (RIGHT) ── */}
        <div className="grid grid-cols-12 gap-5 items-stretch">
          
          {/* LATEST NEWS DECK (2 Cards) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-slate-200 uppercase tracking-wider">LATEST NEWS</span>
              <button
                type="button"
                onClick={() => navigate('/news')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                View all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: What's New */}
              <div
                onClick={() => navigate('/news')}
                className="group relative flex h-48 flex-col justify-end overflow-hidden rounded-2xl border border-white/[0.08] p-5 shadow-xl transition-all hover:border-amber-500/40 cursor-pointer"
              >
                <img
                  src={landscapeImg}
                  alt="What's New"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                
                <span className="absolute top-3.5 left-3.5 rounded-full bg-amber-500/90 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-black shadow-md">
                  UPDATES
                </span>

                <div className="relative z-10 flex flex-col">
                  <h4 className="font-display text-base font-black uppercase text-white tracking-wide group-hover:text-amber-400 transition-colors">
                    WHAT'S NEW
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    v1.0.0 Stable — Auto-Updater, Zero-Drop Downloads & Crash Fixes
                  </p>
                </div>
              </div>

              {/* Card 2: Giveaways */}
              <div
                onClick={() => window.electronAPI?.openExternal?.('https://discord.gg/FR9pXG2Mwb')}
                className="group relative flex h-48 flex-col justify-end overflow-hidden rounded-2xl border border-white/[0.08] p-5 shadow-xl transition-all hover:border-purple-500/40 cursor-pointer"
              >
                <img
                  src={featuredNewsImg}
                  alt="Giveaways"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <span className="absolute top-3.5 left-3.5 rounded-full bg-purple-500/80 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-white shadow-md">
                  COMMUNITY
                </span>

                <div className="relative z-10 flex flex-col">
                  <h4 className="font-display text-base font-black uppercase text-white tracking-wide group-hover:text-purple-400 transition-colors">
                    GIVEAWAYS
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Join Discord to win ranks, cosmetics & gift cards
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DISCORD COMMUNITY CARD */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-slate-200 uppercase tracking-wider">COMMUNITY</span>
              <span className="flex items-center gap-1.5 text-indigo-400 font-mono text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE VC
              </span>
            </div>

            <div className="relative overflow-hidden flex flex-1 flex-col items-center justify-center rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-[#5865F2]/10 via-[#0A0E18]/90 to-[#0A0E18] p-6 text-center shadow-lg backdrop-blur-xl min-h-[190px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-[#5865F2]/20 text-[#5865F2] mb-3 shadow-[0_0_20px_rgba(88,101,242,0.25)]">
                <FaDiscord size={24} />
              </div>
              <h4 className="font-display text-sm font-bold text-white">Join Astrix Discord</h4>
              <span className="mt-1 text-xs text-slate-400 max-w-[220px]">
                Join our Discord for voice chat, squad matchmaking, giveaways & events!
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  playSound('click')
                  window.electronAPI?.openExternal?.('https://discord.gg/FR9pXG2Mwb')
                }}
                className="mt-4 flex items-center gap-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] px-5 py-2 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(88,101,242,0.35)]"
              >
                <FaDiscord size={15} />
                <span>Join Discord Server</span>
              </motion.button>
            </div>
          </div>
        </div>

      </div>

      {/* Untouched FastClient CreateInstanceModal */}
      <CreateInstanceModal
        isOpen={isNewInstanceModalOpen}
        onClose={() => setIsNewInstanceModalOpen(false)}
        onCreate={handleCreateNew}
      />
    </div>
  )
}
