import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiCheck,
  HiShieldCheck,
  HiEllipsisHorizontal,
  HiTrash,
  HiClipboardDocument,
  HiSparkles,
  HiPencilSquare,
  HiBolt,
  HiUser
} from 'react-icons/hi2'
import type { MinecraftAccount } from '../../../shared/types/auth'
import { getAccountAvatar } from '../../utils/avatar'
import { playSound } from '../../utils/sound'
import { cn } from '../../lib/cn'
import landscapeImg from '../../assets/landscape.jpg'
import mcCherryImg from '../../assets/mc_cherry_biome.jpg'

interface AccountCardProps {
  account: MinecraftAccount
  isActive: boolean
  onSetActive: (id: string) => void
  onRemove: (id: string) => void
  onOpenSkins: (account: MinecraftAccount) => void
  onRename?: (account: MinecraftAccount) => void
}

export default function AccountCard({
  account,
  isActive,
  onSetActive,
  onRemove,
  onOpenSkins,
  onRename
}: AccountCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuPlacement, setMenuPlacement] = useState<'top' | 'bottom'>('bottom')
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    playSound('click')
    if (!isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setMenuPlacement(spaceBelow < 240 ? 'top' : 'bottom')
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

  const handleCopyUuid = (e: React.MouseEvent) => {
    e.stopPropagation()
    playSound('click')
    navigator.clipboard.writeText(account.uuid)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setIsMenuOpen(false)
  }

  const isMicrosoft = account.type === 'microsoft'
  const bannerImage = isMicrosoft ? mcCherryImg : landscapeImg
  const avatarUrl = getAccountAvatar(account, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onClick={() => {
        if (!isActive) {
          playSound('click')
          onSetActive(account.id)
        }
      }}
      className={cn(
        'group relative flex flex-col justify-between rounded-3xl border transition-all duration-300 shadow-xl backdrop-blur-2xl cursor-pointer select-none overflow-visible',
        isMenuOpen ? 'z-40 ring-1 ring-emerald-500/40' : 'z-10',
        isActive
          ? 'border-emerald-500/50 bg-[#0C1018]/95 shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/30'
          : 'border-white/[0.08] bg-[#0A0D15]/90 hover:border-emerald-500/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(16,185,129,0.12)]'
      )}
    >
      {/* ── TOP SECTION WITH MINECRAFT SCENERY BACKDROP ── */}
      <div className="relative min-h-[120px] w-full overflow-hidden rounded-t-3xl p-5 flex flex-col justify-between">
        {/* Scenic Background Image */}
        <img
          src={bannerImage}
          alt={account.username}
          className="absolute inset-0 h-full w-full object-cover object-center filter brightness-[0.65] contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-[0.75]"
        />

        {/* Dark cyber gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090E]/95 via-[#07090E]/80 to-[#07090E]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D15] via-transparent to-black/20" />

        {/* Content Row: Avatar + Username + Active Status */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          {/* Left: Avatar + Details */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* 3D Skin Face Avatar */}
            <div className={cn(
              'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-black/60 shadow-xl backdrop-blur-md transition-all duration-300 group-hover:scale-105 overflow-hidden',
              isActive ? 'border-emerald-400/60 ring-2 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/20 group-hover:border-emerald-400/40'
            )}>
              <img
                src={avatarUrl}
                alt={account.username}
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve/100'
                }}
                className="h-full w-full object-cover"
              />
              {isActive && (
                <div className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-md bg-emerald-500 text-slate-950 font-black shadow-md">
                  <span className="text-[10px] leading-none">✓</span>
                </div>
              )}
            </div>

            {/* Account Username & Type */}
            <div className="min-w-0">
              <h3 className="truncate font-display text-base sm:text-lg font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-2">
                <span>{account.username}</span>
                {isActive && (
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
                )}
              </h3>
              <p className="truncate text-xs text-slate-300 drop-shadow mt-0.5 font-medium">
                {isMicrosoft ? 'Microsoft • Online Auth' : 'Local Profile • Offline'}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span className="truncate max-w-[140px]">
                  UUID: {account.uuid.slice(0, 8)}...
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">
                  {isActive ? 'Active Now' : account.lastUsed ? 'Used recently' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Active Indicator / Switch Button */}
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {isActive ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/20 px-3.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] backdrop-blur-md">
                <HiCheck size={13} className="stroke-[3]" /> Active
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  playSound('click')
                  onSetActive(account.id)
                }}
                className="flex items-center gap-1 rounded-full border border-white/15 bg-black/60 px-3 py-1 font-mono text-[10px] font-bold text-slate-300 hover:border-emerald-400/50 hover:text-white hover:bg-emerald-500/20 transition-all backdrop-blur-md shadow active:scale-95"
                title="Switch to this account"
              >
                <span>Select</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ACTION BAR ── */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-t border-white/[0.08] bg-[#080B12]/95 px-4 py-3 backdrop-blur-2xl rounded-b-3xl">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Status Badge Pill */}
          {isMicrosoft ? (
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs font-bold text-emerald-300 shadow-sm truncate">
              <HiShieldCheck size={15} className="text-emerald-400 shrink-0" />
              <span className="truncate">Microsoft Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 font-mono text-xs font-bold text-cyan-300 shadow-sm truncate">
              <HiBolt size={14} className="text-cyan-400 shrink-0" />
              <span className="truncate">Offline Player</span>
            </div>
          )}

          {/* 👔 Skins Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              playSound('click')
              onOpenSkins(account)
            }}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] hover:border-amber-500/40 hover:text-amber-300 px-3 py-1.5 text-xs font-bold text-slate-300 transition-all shadow-sm active:scale-95"
            title="Preview and customize player skin"
          >
            <HiSparkles size={14} className="text-amber-400" />
            <span>Skins</span>
          </button>
        </div>

        {/* ••• More Actions Menu */}
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
                {/* Set as Active */}
                {!isActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      playSound('click')
                      onSetActive(account.id)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-emerald-300 transition-colors"
                  >
                    <HiCheck size={15} className="text-emerald-400" />
                    <span>Set as Active Account</span>
                  </button>
                )}

                {/* View / Change Skin */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    playSound('click')
                    onOpenSkins(account)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <HiSparkles size={15} className="text-amber-400" />
                  <span>Customize Skin</span>
                </button>

                {/* Rename (for local accounts) */}
                {!isMicrosoft && onRename && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      playSound('click')
                      onRename(account)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-cyan-300 transition-colors"
                  >
                    <HiPencilSquare size={15} className="text-cyan-400" />
                    <span>Rename Profile</span>
                  </button>
                )}

                {/* Copy UUID */}
                <button
                  type="button"
                  onClick={handleCopyUuid}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <HiClipboardDocument size={15} className="text-slate-400" />
                  <span>{copied ? 'Copied UUID!' : 'Copy UUID'}</span>
                </button>

                <div className="my-1 border-t border-white/5" />

                {/* Remove Account */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    playSound('click')
                    onRemove(account.id)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-colors"
                >
                  <HiTrash size={15} className="text-rose-400" />
                  <span>Remove Account</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
