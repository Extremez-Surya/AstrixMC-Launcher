import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiBolt,
  HiPlay,
  HiIdentification,
  HiSquares2X2,
  HiFaceSmile,
  HiBuildingStorefront,
  HiCog6Tooth
} from 'react-icons/hi2'
import { playSound } from '../../utils/sound'

export default function NoRiskSidebar() {
  const location = useLocation()

  const navItems = [
    { to: '/', label: 'PLAY', icon: HiPlay, exact: true },
    { to: '/instances', label: 'PROFILES', icon: HiIdentification },
    { to: '/mods', label: 'MODS', icon: HiSquares2X2 },
    { to: '/skins', label: 'SKINS', icon: HiFaceSmile },
    { to: '/features', label: 'CAPES', icon: HiBuildingStorefront }
  ]

  return (
    <aside className="relative z-30 flex h-full w-[76px] shrink-0 flex-col items-center justify-between border-r border-[#1B2B4A]/50 bg-[#060C18] py-4 select-none">
      
      {/* ── TOP LOGO BADGE ── */}
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-500 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#070D1C]">
            <HiBolt className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          </div>
        </div>

        {/* ── VERTICAL NAV ICONS & LABELS ── */}
        <nav className="flex flex-col items-center gap-3 w-full px-2">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => playSound('tab')}
                className={`group relative flex h-14 w-full flex-col items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'border border-[#2563EB] bg-[#172554]/60 text-white shadow-[0_0_20px_rgba(37,99,235,0.35)]'
                    : 'border border-transparent text-[#64748B] hover:bg-white/[0.04] hover:text-[#CBD5E1]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="norisk-sidebar-active"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#2563EB]/25 to-cyan-500/10 pointer-events-none"
                  />
                )}
                <Icon
                  size={20}
                  className={`transition-colors ${
                    isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'group-hover:text-slate-200'
                  }`}
                />
                <span
                  className={`mt-1 font-pixel text-[9px] font-bold tracking-wider uppercase transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* ── BOTTOM SETTINGS GEAR ── */}
      <div className="w-full px-2 flex justify-center">
        <NavLink
          to="/settings"
          onClick={() => playSound('tab')}
          className={`flex h-12 w-full flex-col items-center justify-center rounded-xl transition-all duration-200 ${
            location.pathname === '/settings'
              ? 'border border-[#2563EB] bg-[#172554]/60 text-cyan-400 shadow-[0_0_15px_rgba(37,99,235,0.35)]'
              : 'border border-transparent text-[#64748B] hover:bg-white/[0.04] hover:text-[#CBD5E1]'
          }`}
          title="Client Settings"
        >
          <HiCog6Tooth size={20} />
        </NavLink>
      </div>

    </aside>
  )
}

