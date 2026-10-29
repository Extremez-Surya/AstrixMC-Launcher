import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiPlay,
  HiPuzzlePiece,
  HiArchiveBox,
  HiEllipsisHorizontal,
  HiBolt,
  HiFolderOpen,
  HiTrash,
  HiAdjustmentsHorizontal,
  HiDocumentDuplicate,
  HiCheck,
  HiCpuChip,
  HiClock,
  HiPencilSquare
} from 'react-icons/hi2'
import {
  FabricIcon,
  ForgeIcon,
  GrassBlockIcon
} from '../common/GamingIcons'
import landscapeImg from '../../assets/landscape.jpg'
import mcCherryImg from '../../assets/mc_cherry_biome.jpg'
import mcForgeImg from '../../assets/mc_forge_cover.jpg'
import mcVillageImg from '../../assets/mc_village_sunset.jpg'
import type { GameInstance } from '../../../shared/types/instance'
import { playSound } from '../../utils/sound'
import { cn } from '../../lib/cn'

interface InstanceCardProps {
  instance: GameInstance
  isDefault?: boolean
  isLaunching: boolean
  onLaunch: (id: string) => void
  onOpenFolder: (id: string, subfolder?: string) => void
  onDelete: (id: string) => void
  onFpsBoost: (id: string) => void
  onManage?: (instance: GameInstance, initialTab?: 'mods' | 'packs' | 'saves' | 'screenshots' | 'settings' | 'export') => void
  onSetDefault?: (instance: GameInstance) => void
  onDuplicate?: (id: string) => void
  onRename?: (instance: GameInstance) => void
}

const formatRam = (val?: string, fallback = '4.0 GB'): string => {
  if (!val) return fallback
  const num = parseFloat(val)
  if (Number.isNaN(num)) return val
  if (num >= 64) return `${(num / 1024).toFixed(1)} GB`
  return `${num.toFixed(1)} GB`
}

export default function InstanceCard({
  instance,
  isDefault = false,
  isLaunching,
  onLaunch,
  onOpenFolder,
  onDelete,
  onFpsBoost,
  onManage,
  onSetDefault,
  onDuplicate,
  onRename
}: InstanceCardProps) {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuPlacement, setMenuPlacement] = useState<'top' | 'bottom'>('bottom')
  const [isBoosting, setIsBoosting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const toggleMenu = () => {
    if (!isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      // If less than 280px below, open upwards; otherwise open downwards below the card
      setMenuPlacement(spaceBelow < 280 ? 'top' : 'bottom')
    }
    setIsMenuOpen((prev) => !prev)
  }

  // Close dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  const handleBoost = async () => {
    setIsMenuOpen(false)
    setIsBoosting(true)
    try {
      await onFpsBoost(instance.id)
    } finally {
      setIsBoosting(false)
    }
  }

  const loaderType = instance.modLoader?.type?.toLowerCase() || 'vanilla'

  const loaderConfig = {
    fabric: {
      label: 'Fabric',
      color: 'text-sky-300 border-sky-400/40 bg-sky-950/80',
      icon: FabricIcon,
      cover: mcCherryImg
    },
    forge: {
      label: 'Forge',
      color: 'text-amber-300 border-amber-400/40 bg-amber-950/80',
      icon: ForgeIcon,
      cover: mcForgeImg
    },
    neoforge: {
      label: 'NeoForge',
      color: 'text-orange-300 border-orange-400/40 bg-orange-950/80',
      icon: ForgeIcon,
      cover: mcForgeImg
    },
    quilt: {
      label: 'Quilt',
      color: 'text-purple-300 border-purple-400/40 bg-purple-950/80',
      icon: FabricIcon,
      cover: mcVillageImg
    },
    vanilla: {
      label: 'Vanilla',
      color: 'text-emerald-300 border-emerald-400/40 bg-emerald-950/80',
      icon: GrassBlockIcon,
      cover: landscapeImg
    }
  }[loaderType] || {
    label: 'Minecraft',
    color: 'text-emerald-300 border-emerald-400/40 bg-emerald-950/80',
    icon: GrassBlockIcon,
    cover: landscapeImg
  }

  const bannerImage = (instance as any).bannerUrl || loaderConfig.cover
  const LoaderIcon = loaderConfig.icon
  const maxRam = formatRam(instance.memoryMax, '4.0 GB')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onClick={() => {
        playSound('click')
        if (!isDefault && onSetDefault) {
          onSetDefault(instance)
        }
        navigate(`/instances/${instance.id}`)
      }}
      className={cn(
        'group relative flex flex-col justify-between rounded-3xl border transition-all duration-300 shadow-xl backdrop-blur-2xl cursor-pointer select-none',
        isMenuOpen ? 'z-40 ring-1 ring-emerald-500/40' : 'z-10',
        isDefault
          ? 'border-emerald-500/50 bg-[#0C1018]/95 shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/30'
          : 'border-white/[0.09] bg-[#0A0D15]/90 hover:border-emerald-500/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(16,185,129,0.12)]'
      )}
    >
      {/* ── TOP BANNER AREA WITH MINECRAFT ARTWORK ── */}
      <div className="relative min-h-[125px] w-full overflow-hidden rounded-t-3xl p-4 sm:p-5 flex flex-col justify-between">
        {/* Scenic Background image */}
        <img
          src={bannerImage}
          alt={instance.name}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = landscapeImg
          }}
          className="absolute inset-0 h-full w-full object-cover object-center filter brightness-[0.72] transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-[0.82]"
        />

        {/* Cybernetical gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090E]/95 via-[#07090E]/80 to-[#07090E]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D15] via-transparent to-black/30" />

        {/* Content Row: Icon + Name + Default Badge */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          {/* Left: Icon + Titles */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Big Loader/Instance Squircle Icon */}
            <div className={cn(
              'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-black/60 shadow-xl backdrop-blur-md transition-transform duration-300 group-hover:scale-105 overflow-hidden',
              isDefault ? 'border-emerald-400/60 ring-2 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/20 group-hover:border-emerald-400/50'
            )}>
              <LoaderIcon className="h-7 w-7 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
              {isDefault && (
                <div className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-md bg-emerald-500 text-slate-950 font-black shadow-md">
                  <span className="text-[10px] leading-none">✓</span>
                </div>
              )}
            </div>

            {/* Profile Name & Subtitle */}
            <div className="min-w-0">
              <h3 className="truncate font-display text-base sm:text-lg font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-2">
                <span>{instance.name}</span>
                {isDefault && (
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
                )}
              </h3>
              <p className="truncate text-xs text-slate-300 drop-shadow mt-0.5 font-medium">
                Astrix Client + {loaderConfig.label} {instance.mcVersion}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <HiCpuChip size={13} /> {maxRam}
                </span>
                <span>•</span>
                <span className="text-slate-400">
                  {instance.lastPlayed ? 'Played recently' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Default Pill Badge */}
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {isDefault ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/20 px-3.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] backdrop-blur-md">
                <HiCheck size={13} className="stroke-[3]" /> Default
              </span>
            ) : onSetDefault ? (
              <button
                type="button"
                onClick={() => {
                  playSound('click')
                  onSetDefault(instance)
                }}
                className="flex items-center gap-1 rounded-full border border-white/15 bg-black/60 px-3 py-1 font-mono text-[10px] font-bold text-slate-300 hover:border-emerald-400/50 hover:text-white hover:bg-emerald-500/20 transition-all backdrop-blur-md shadow active:scale-95"
                title="Set as your primary default instance"
              >
                <span>Select</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ACTION BAR ── */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-t border-white/[0.08] bg-[#080B12]/95 px-4 py-3 backdrop-blur-2xl rounded-b-3xl">
        <div className="flex items-center gap-2 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
          {/* ▷ Play Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playSound('click')
              onLaunch(instance.id)
            }}
            disabled={isLaunching}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <HiPlay className="h-4 w-4 fill-current" />
            <span>Play</span>
          </motion.button>

          {/* 🧩 Mods Button */}
          <button
            type="button"
            onClick={() => {
              playSound('click')
              onManage && onManage(instance, 'mods')
            }}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] hover:border-purple-500/40 hover:text-purple-300 px-3.5 py-2 text-xs font-bold text-slate-300 transition-all shadow-sm active:scale-95"
            title="Manage installed mods and shaders"
          >
            <HiPuzzlePiece size={15} className="text-purple-400" />
            <span className="hidden sm:inline">Mods</span>
          </button>

          {/* 📦 Resource Packs Button */}
          <button
            type="button"
            onClick={() => {
              playSound('click')
              onManage && onManage(instance, 'packs')
            }}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] hover:border-amber-500/40 hover:text-amber-300 px-3.5 py-2 text-xs font-bold text-slate-300 transition-all shadow-sm active:scale-95"
            title="Manage Resource Packs and Shaders"
          >
            <HiArchiveBox size={15} className="text-amber-400" />
            <span className="hidden sm:inline">Packs</span>
          </button>

          {/* 📁 Fast Folder Button */}
          <button
            type="button"
            onClick={() => {
              playSound('click')
              onOpenFolder(instance.id)
            }}
            className="hidden md:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] hover:border-sky-500/40 hover:text-sky-300 px-3 py-2 text-xs font-bold text-slate-300 transition-all shadow-sm active:scale-95"
            title="Open Instance Folder in File Explorer"
          >
            <HiFolderOpen size={15} className="text-sky-400" />
            <span>Folder</span>
          </button>
        </div>

        {/* ••• More Actions Dropdown Menu */}
        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            ref={buttonRef}
            type="button"
            onClick={toggleMenu}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
            title="More Options"
          >
            <HiEllipsisHorizontal size={18} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: menuPlacement === 'top' ? 6 : -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: menuPlacement === 'top' ? 6 : -6 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'absolute right-0 w-52 overflow-hidden rounded-2xl border border-white/15 bg-[#0F1422]/98 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 text-left ring-1 ring-black/80',
                  menuPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                )}
              >
                {/* View Details & Files */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    playSound('click')
                    navigate(`/instances/${instance.id}`)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors"
                >
                  <HiAdjustmentsHorizontal size={15} className="text-emerald-400" />
                  <span>Overview & Files</span>
                </button>

                {/* Set as Default */}
                {!isDefault && onSetDefault && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      playSound('click')
                      onSetDefault(instance)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-emerald-300 transition-colors"
                  >
                    <HiCheck size={15} className="text-emerald-400" />
                    <span>Set as Default Profile</span>
                  </button>
                )}

                {/* Rename Profile */}
                {onRename && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      playSound('click')
                      onRename(instance)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-cyan-300 transition-colors"
                  >
                    <HiPencilSquare size={15} className="text-cyan-400" />
                    <span>Rename Profile</span>
                  </button>
                )}

                {/* Manage Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    playSound('click')
                    onManage && onManage(instance, 'settings')
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <HiAdjustmentsHorizontal size={15} className="text-sky-400" />
                  <span>Profile Settings</span>
                </button>

                {/* FPS Boost */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    handleBoost()
                  }}
                  disabled={isBoosting}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-emerald-300 transition-colors"
                >
                  <HiBolt size={15} className="text-emerald-400" />
                  <span>1-Click FPS Boost</span>
                </button>

                <div className="my-1 border-t border-white/5" />

                {/* Open Game Folder */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    playSound('click')
                    onOpenFolder(instance.id)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <HiFolderOpen size={15} className="text-amber-400" />
                  <span>Open Game Folder</span>
                </button>

                {/* Open Mods Folder */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    playSound('click')
                    onOpenFolder(instance.id, 'mods')
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <HiPuzzlePiece size={15} className="text-purple-400" />
                  <span>Open Mods Folder</span>
                </button>

                {/* Open Resource Packs Folder */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    playSound('click')
                    onOpenFolder(instance.id, 'resourcepacks')
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <HiArchiveBox size={15} className="text-amber-400" />
                  <span>Open Packs Folder</span>
                </button>

                {/* Duplicate Instance */}
                {onDuplicate && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      playSound('click')
                      onDuplicate(instance.id)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <HiDocumentDuplicate size={15} className="text-slate-400" />
                    <span>Duplicate Profile</span>
                  </button>
                )}

                <div className="my-1 border-t border-white/5" />

                {/* Delete Instance */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    playSound('click')
                    onDelete(instance.id)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-colors"
                >
                  <HiTrash size={15} className="text-rose-400" />
                  <span>Delete Profile</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
