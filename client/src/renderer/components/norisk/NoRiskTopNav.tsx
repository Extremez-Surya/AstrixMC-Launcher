import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  VscChromeClose,
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeRestore
} from 'react-icons/vsc'
import {
  HiCommandLine,
  HiChevronDown,
  HiBolt,
  HiPuzzlePiece,
  HiSparkles,
  HiTv,
  HiGlobeAlt,
  HiCog6Tooth,
  HiShieldCheck
} from 'react-icons/hi2'
import { getElectronAPI } from '../../lib/electron-api'
import { useAuth } from '../../hooks/useAuth'
import { getAccountAvatar } from '../../utils/avatar'
import { playSound } from '../../utils/sound'

const CONTROL_BASE =
  'no-drag flex h-full w-[42px] items-center justify-center text-[#94A3B8] hover:bg-white/10 hover:text-white transition-colors duration-150 focus-visible:outline-none'

interface NoRiskTopNavProps {
  onOpenLogs?: () => void
  onOpenSearch?: () => void
}

export default function NoRiskTopNav({ onOpenLogs, onOpenSearch }: NoRiskTopNavProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { activeAccount } = useAuth()

  useEffect(() => {
    const api = getElectronAPI()
    if (!api) return
    let active = true

    Promise.resolve(api.isMaximized())
      .then((val) => {
        if (active) setIsMaximized(Boolean(val))
      })
      .catch(() => {})

    const unsub = api.onMaximizeChange((val) => setIsMaximized(Boolean(val)))
    return () => {
      active = false
      if (typeof unsub === 'function') unsub()
    }
  }, [])

  const handleMinimize = () => getElectronAPI()?.minimize()
  const handleMaximize = () => {
    setIsMaximized((c) => !c)
    getElectronAPI()?.maximize()
  }
  const handleClose = () => getElectronAPI()?.close()

  const navLinks = [
    { to: '/', label: 'PLAY', icon: HiBolt, exact: true },
    { to: '/mods', label: 'MODS', icon: HiPuzzlePiece },
    { to: '/skins', label: 'COSMETICS', icon: HiSparkles },
    { to: '/client-hud', label: 'HUD STUDIO', icon: HiTv },
    { to: '/servers', label: 'SERVERS', icon: HiGlobeAlt },
    { to: '/settings', label: 'SETTINGS', icon: HiCog6Tooth }
  ]

  return (
    <header className="drag-region relative z-50 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#0A0D14]/90 px-4 backdrop-blur-xl select-none font-sans shadow-lg">
      {/* ── LEFT: Astrix Client Brand & Version Badge ── */}
      <div className="drag-region flex items-center gap-3">
        <div
          onClick={() => {
            playSound('click')
            navigate('/')
          }}
          className="no-drag flex items-center gap-2.5 cursor-pointer group"
        >
          {/* Glowing Flame Emblem */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_22px_rgba(6,182,212,0.7)] transition-all">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0A0D14]">
              <HiBolt className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-black tracking-wider uppercase text-white">
                ASTRIX<span className="text-cyan-400">CLIENT</span>
              </span>
              <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.2 font-mono text-[9px] font-bold text-cyan-300">
                PRO
              </span>
            </div>
            <span className="font-mono text-[9px] font-semibold text-slate-400 tracking-wider">
              1.21.4 • ULTRA FPS
            </span>
          </div>
        </div>
      </div>

      {/* ── CENTER: NoRisk-style Segmented Nav Pills ── */}
      <nav className="no-drag flex items-center gap-1 rounded-2xl bg-black/40 border border-white/[0.06] p-1 shadow-inner backdrop-blur-md">
        {navLinks.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => playSound('tab')}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="norisk-nav-active"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/25 via-cyan-400/20 to-emerald-500/20 border border-cyan-400/40 shadow-[0_0_16px_rgba(6,182,212,0.3)]"
                />
              )}
              <Icon
                className={`relative z-10 h-3.5 w-3.5 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400'
                }`}
              />
              <span className="relative z-10">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* ── RIGHT: User Account Pill + Console + Window Controls ── */}
      <div className="no-drag flex items-center gap-2">
        {/* Account Switcher Pill */}
        {activeAccount && (
          <button
            type="button"
            onClick={() => {
              playSound('click')
              navigate('/accounts')
            }}
            title="Switch Minecraft Account"
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 hover:bg-white/[0.08] hover:border-cyan-500/40 transition-all shadow-sm group"
          >
            <div className="h-6 w-6 rounded-lg overflow-hidden bg-black/40 border border-white/15 shrink-0 group-hover:border-cyan-400/50 transition-colors">
              <img
                src={getAccountAvatar(activeAccount, 28)}
                alt={activeAccount.username}
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLElement).style.display = 'none'
                }}
              />
            </div>
            <div className="flex flex-col text-left leading-none">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {activeAccount.username}
                </span>
                <HiShieldCheck className="text-emerald-400" size={13} />
              </div>
              <span className="font-mono text-[9px] text-slate-400">Online</span>
            </div>
            <HiChevronDown size={13} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
          </button>
        )}

        {/* Console Logs trigger */}
        {onOpenLogs && (
          <button
            type="button"
            onClick={() => {
              playSound('click')
              onOpenLogs()
            }}
            title="Client Logs & Console"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-cyan-300 hover:bg-white/[0.08] hover:border-cyan-500/30 transition-all"
          >
            <HiCommandLine size={17} />
          </button>
        )}

        {/* Window Controls */}
        <div className="flex items-center h-full ml-1 border-l border-white/10 pl-1">
          <button
            type="button"
            onClick={handleMinimize}
            aria-label="Minimize"
            className={CONTROL_BASE}
          >
            <VscChromeMinimize size={14} />
          </button>
          <button
            type="button"
            onClick={handleMaximize}
            aria-label="Maximize"
            className={CONTROL_BASE}
          >
            {isMaximized ? <VscChromeRestore size={14} /> : <VscChromeMaximize size={14} />}
          </button>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="no-drag flex h-full w-[44px] items-center justify-center text-[#94A3B8] hover:bg-rose-600 hover:text-white transition-colors duration-150 focus-visible:outline-none"
          >
            <VscChromeClose size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
