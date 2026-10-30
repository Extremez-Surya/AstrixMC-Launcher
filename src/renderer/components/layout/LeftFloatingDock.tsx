import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiSquares2X2,
  HiPlay,
  HiPuzzlePiece,
  HiNewspaper,
  HiCog6Tooth,
  HiPlus,
  HiGlobeAlt,
  HiUserCircle,
  HiSparkles,
  HiPhoto
} from 'react-icons/hi2'
import { FaShirt } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'
import { getAccountAvatar } from '../../utils/avatar'

interface LeftFloatingDockProps {
  onNewInstance?: () => void
}

interface NavItem {
  to: string
  label: string
  icon: any
  end?: boolean
  badge?: string
}

export default function LeftFloatingDock({ onNewInstance }: LeftFloatingDockProps) {
  const { activeAccount } = useAuth()
  const location = useLocation()

  const navItems: NavItem[] = [
    { to: '/', label: 'Play', icon: HiPlay, end: true },
    { to: '/instances', label: 'Library', icon: HiSquares2X2 },
    { to: '/mods', label: 'Discover', icon: HiPuzzlePiece },
    { to: '/skins', label: 'Skins', icon: FaShirt },
    { to: '/servers', label: 'Servers', icon: HiGlobeAlt },
    { to: '/news', label: 'News', icon: HiNewspaper, badge: 'v1.0.2' },
    { to: '/screenshots', label: 'Gallery', icon: HiPhoto }
  ]

  const avatarUrl = activeAccount ? getAccountAvatar(activeAccount, 36) : null

  return (
    <motion.nav
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center justify-between h-[calc(100vh-4.5rem)] max-h-[820px] w-[82px] rounded-[32px] border border-white/[0.12] bg-[#0A0D15]/90 py-3.5 px-2 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-black/60 shrink-0"
    >
      {/* ── TOP: BRAND LOGO / CREATE INSTANCE ── */}
      <div className="flex flex-col items-center gap-2">
        <NavLink
          to="/"
          className="group relative flex flex-col items-center justify-center p-1.5 rounded-2xl hover:bg-white/5 transition-all"
          title="AstrixMC Home"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-transparent border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-105 group-hover:border-amber-400/60 transition-all">
            <HiSparkles className="h-5 w-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <span className="mt-1 text-[9px] font-black tracking-widest text-amber-400 uppercase">ASTRIX</span>
        </NavLink>

        <div className="w-8 h-[1px] bg-white/[0.08] my-0.5" />
      </div>

      {/* ── MIDDLE: MAIN NAVIGATION TABS (ROCK-CLIENT STYLE ICON + LABEL) ── */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={`group relative flex flex-col items-center justify-center w-full py-2 px-1 rounded-2xl border transition-all duration-200 ${
                isActive
                  ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/20 to-amber-500/5 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  : 'border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className={`mt-0.5 text-[10px] font-bold tracking-tight transition-colors ${isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-white'}`}>
                {item.label}
              </span>

              {/* Active Golden Left Indicator Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeLeftIndicator"
                  className="absolute -left-2 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-amber-400 shadow-[0_0_10px_#F59E0B]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Notification Badge */}
              {item.badge && !isActive && (
                <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-amber-400 ring-2 ring-[#0A0D15]" />
              )}
            </NavLink>
          )
        })}
      </div>

      {/* ── BOTTOM: SETTINGS & ACCOUNT ── */}
      <div className="flex flex-col items-center gap-2 w-full pt-1">
        <div className="w-8 h-[1px] bg-white/[0.08]" />

        {/* Settings Nav with Icon + Label */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `group relative flex flex-col items-center justify-center w-full py-1.5 rounded-2xl border transition-all duration-200 ${
              isActive
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-400 shadow-lg'
                : 'border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.05] hover:text-white'
            }`
          }
          title="Settings"
        >
          <HiCog6Tooth className="h-5 w-5 group-hover:rotate-45 transition-transform duration-300" />
          <span className="mt-0.5 text-[9px] font-bold tracking-tight">Settings</span>
        </NavLink>

        {/* Account Pill with Online Dot */}
        <NavLink
          to="/accounts"
          className="group relative flex h-11 w-11 items-center justify-center rounded-2xl p-0.5 border border-white/10 bg-white/[0.03] hover:border-amber-500/40 hover:scale-105 transition-all"
          title={activeAccount ? `Account: ${activeAccount.username}` : 'Manage Accounts'}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Player Avatar"
              className="h-full w-full rounded-[14px] object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <HiUserCircle className="h-7 w-7 text-zinc-400 group-hover:text-amber-400 transition-colors" />
          )}

          {/* Online Green Indicator Dot when logged in */}
          {activeAccount && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0A0D15]" />
          )}
        </NavLink>
      </div>
    </motion.nav>
  )
}

