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
  HiSparkles
} from 'react-icons/hi2'
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
  accentColor: string
  badge?: string
}

export default function LeftFloatingDock({ onNewInstance }: LeftFloatingDockProps) {
  const { activeAccount } = useAuth()
  const location = useLocation()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const navItems: NavItem[] = [
    { to: '/', label: 'Play (Home)', icon: HiPlay, end: true, accentColor: '#F59E0B' },
    { to: '/instances', label: 'Profiles & Library', icon: HiSquares2X2, accentColor: '#F97316' },
    { to: '/mods', label: 'Discover Mods & Shaders', icon: HiPuzzlePiece, accentColor: '#A855F7' },
    { to: '/servers', label: 'Server Network', icon: HiGlobeAlt, accentColor: '#06B6D4' },
    { to: '/news', label: "What's New (v1.0.2)", icon: HiNewspaper, accentColor: '#38BDF8', badge: 'v1.0.2' }
  ]

  const avatarUrl = activeAccount ? getAccountAvatar(activeAccount, 36) : null

  return (
    <motion.nav
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center justify-between h-[calc(100vh-4rem)] max-h-[740px] w-[74px] rounded-3xl border border-white/[0.12] bg-[#0A0D14]/85 py-4 px-2 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-black/50 shrink-0"
    >
        {/* ── TOP: BRAND LOGO / CREATE INSTANCE ── */}
        <div className="flex flex-col items-center gap-3">
          <NavLink
            to="/"
            className="group relative flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/5 transition-all"
            title="AstrixMC Home"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.25)] group-hover:scale-105 group-hover:border-amber-400/50 transition-all">
              <HiSparkles className="h-6 w-6 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="mt-1 text-[9px] font-extrabold tracking-widest text-amber-400/80 uppercase">Astrix</span>
          </NavLink>

          {/* Quick Create Instance Plus Button */}
          {onNewInstance && (
            <button
              type="button"
              onClick={onNewInstance}
              title="Create New Profile"
              className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.03] text-zinc-400 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400 transition-all"
            >
              <HiPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </button>
          )}

          <div className="w-8 h-[1px] bg-white/[0.08] my-1" />
        </div>

        {/* ── MIDDLE: MAIN NAVIGATION TABS ── */}
        <div className="flex flex-col items-center gap-2">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isHovered = hoveredIndex === index
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)

            return (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Right Tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -6, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-xl border border-white/10 bg-[#080B12]/95 px-3 py-1.5 text-xs font-bold text-white shadow-2xl backdrop-blur-md z-50 flex items-center gap-2"
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-[#080B12]" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <NavLink
                  to={item.to}
                  end={item.end}
                  className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200 ${
                    isActive
                      ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/25 to-amber-500/5 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                      : 'border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />

                  {/* Active Indicator Bar on Left */}
                  {isActive && (
                    <motion.div
                      layoutId="activeLeftIndicator"
                      className="absolute -left-2 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-amber-400 shadow-[0_0_10px_#F59E0B]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Notification Dot */}
                  {item.badge && !isActive && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-[#0A0D14]" />
                  )}
                </NavLink>
              </div>
            )
          })}
        </div>

        {/* ── BOTTOM: SETTINGS & ACCOUNT ── */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-[1px] bg-white/[0.08]" />

          {/* Settings Nav */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200 ${
                isActive
                  ? 'border-white/20 bg-white/15 text-white shadow-lg'
                  : 'border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
              }`
            }
            title="Settings"
          >
            <HiCog6Tooth className="h-5 w-5 group-hover:rotate-45 transition-transform duration-300" />
          </NavLink>

          {/* Account Pill */}
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

            {/* Online Green Indicator Dot */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0A0D14]" />
          </NavLink>
        </div>
      </motion.nav>
  )
}

