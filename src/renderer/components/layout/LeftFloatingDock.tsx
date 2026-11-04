import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiSquares2X2,
  HiPlay,
  HiPuzzlePiece,
  HiNewspaper,
  HiCog6Tooth,
  HiGlobeAlt,
  HiUserCircle,
  HiSparkles,
  HiPhoto
} from 'react-icons/hi2'
import { FaShirt } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'
import { getAccountAvatar } from '../../utils/avatar'
import { playSound } from '../../utils/sound'

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

export default function LeftFloatingDock({}: LeftFloatingDockProps) {
  const { activeAccount } = useAuth()
  const location = useLocation()

  const navItems: NavItem[] = [
    { to: '/', label: 'Play', icon: HiPlay, end: true },
    { to: '/instances', label: 'Library', icon: HiSquares2X2 },
    { to: '/mods', label: 'Discover', icon: HiPuzzlePiece },
    { to: '/skins', label: 'Skins', icon: FaShirt },
    { to: '/capes', label: 'Capes', icon: HiSparkles, badge: 'NEW' },
    { to: '/servers', label: 'Servers', icon: HiGlobeAlt },
    { to: '/news', label: 'News', icon: HiNewspaper, badge: 'v1.0.3' },
    { to: '/screenshots', label: 'Gallery', icon: HiPhoto }
  ]

  const avatarUrl = activeAccount ? getAccountAvatar(activeAccount, 36) : null

  return (
    <motion.nav
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center justify-between h-[calc(100vh-4.2rem)] max-h-[840px] w-[84px] rounded-[30px] border border-white/[0.14] bg-[#070913]/92 py-3 px-2 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-black/70 shrink-0 select-none z-30"
    >
      {/* ── TOP: ASTRAL RUNIC CREST ── */}
      <div className="flex flex-col items-center gap-1.5">
        <NavLink
          to="/"
          onClick={() => playSound('click')}
          className="group relative flex flex-col items-center justify-center p-1 rounded-2xl hover:bg-white/5 transition-all"
          title="AstrixMC Obsidian Astral Core"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/30 via-purple-600/20 to-cyan-500/20 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.35)] group-hover:scale-105 group-hover:border-amber-400/80 transition-all">
            <HiSparkles className="h-5 w-5 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
            <div className="absolute inset-0 rounded-2xl bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="mt-1 text-[8.5px] font-black tracking-widest text-amber-400 uppercase">ASTRIX</span>
        </NavLink>

        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent my-0.5" />
      </div>

      {/* ── MIDDLE: ICONIC DOCK ITEMS ── */}
      <div className="flex flex-col items-center gap-1 w-full my-auto">
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
              onClick={() => playSound('click')}
              className={`group relative flex flex-col items-center justify-center w-full py-1.5 px-1 rounded-2xl border transition-all duration-200 ${
                isActive
                  ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/25 via-amber-500/10 to-transparent text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'group-hover:scale-110'
                }`}
              />
              <span
                className={`mt-0.5 text-[9.5px] font-bold tracking-tight transition-colors ${
                  isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                }`}
              >
                {item.label}
              </span>

              {/* Active Neon Left Indicator Beam */}
              {isActive && (
                <motion.div
                  layoutId="activeDockIndicator"
                  className="absolute -left-2 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-to-b from-amber-300 to-orange-500 shadow-[0_0_12px_#F59E0B]"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}

              {/* Badge Indicator */}
              {item.badge && !isActive && (
                <span className="absolute top-1 right-2 px-1 py-0.2 rounded-full text-[7.5px] font-mono font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </div>

      {/* ── BOTTOM: SETTINGS & ACCOUNT DOCK ── */}
      <div className="flex flex-col items-center gap-1.5 w-full pt-1">
        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Settings Tab */}
        <NavLink
          to="/settings"
          onClick={() => playSound('click')}
          className={({ isActive }) =>
            `group relative flex flex-col items-center justify-center w-full py-1.5 rounded-2xl border transition-all duration-200 ${
              isActive
                ? 'border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-lg'
                : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
            }`
          }
          title="Settings"
        >
          <HiCog6Tooth className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
          <span className="mt-0.5 text-[9px] font-bold tracking-tight">Settings</span>
        </NavLink>

        {/* Account Pill with Online Status Dot */}
        <NavLink
          to="/accounts"
          onClick={() => playSound('click')}
          className="group relative flex h-10 w-10 items-center justify-center rounded-2xl p-0.5 border border-white/15 bg-white/[0.04] hover:border-amber-500/60 hover:scale-105 transition-all shadow-md"
          title={activeAccount ? `Account: ${activeAccount.username}` : 'Manage Accounts'}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Player Avatar"
              className="h-full w-full rounded-[13px] object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <HiUserCircle className="h-6 w-6 text-slate-400 group-hover:text-amber-400 transition-colors" />
          )}

          {activeAccount && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#070913] shadow-[0_0_8px_#34D399]" />
          )}
        </NavLink>
      </div>
    </motion.nav>
  )
}
