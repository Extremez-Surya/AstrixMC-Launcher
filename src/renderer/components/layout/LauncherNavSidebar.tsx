import { NavLink } from 'react-router-dom'
import {
  HiSquares2X2,
  HiUserGroup,
  HiShoppingBag,
  HiCog6Tooth
} from 'react-icons/hi2'
import { FaHandshake } from 'react-icons/fa6'
import { IoGameController } from 'react-icons/io5'

export default function LauncherNavSidebar() {
  const navItems = [
    { to: '/', label: 'PLAY', icon: IoGameController, end: true },
    { to: '/instances', label: 'PROFILES', icon: HiSquares2X2 },
    { to: '/accounts', label: 'ACCOUNTS', icon: HiUserGroup },
    { to: '/partners', label: 'PARTNERS', icon: FaHandshake },
    { to: '/store', label: 'STORE', icon: HiShoppingBag },
    { to: '/settings', label: 'SETTINGS', icon: HiCog6Tooth }
  ]

  return (
    <aside className="relative z-30 flex h-full w-[76px] shrink-0 flex-col items-center justify-between border-r border-white/5 bg-[#090C13] py-4 select-none font-sans">
      {/* Top Flame Logo */}
      <div className="flex flex-col items-center gap-6">
        <NavLink
          to="/"
          className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all hover:scale-105 hover:border-amber-400/50"
        >
          {/* Flame Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6 text-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]"
          >
            <path d="M12.001 2c-.382 0-.749.193-.964.514C10.15 3.84 8.784 5.922 8.01 7.234 6.786 9.308 6 11.589 6 14.004c0 3.313 2.686 6 6.001 6 3.313 0 6-2.687 6-6 0-2.415-.786-4.696-2.01-6.77-.774-1.312-2.14-3.394-3.027-4.72-.215-.321-.582-.514-.963-.514zm.001 7.5c1.657 0 3 1.343 3 3 0 1.657-1.343 3-3 3-1.657 0-3-1.343-3-3 0-1.657 1.343-3 3-3z" />
          </svg>
        </NavLink>

        {/* Vertical Navigation Links */}
        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group relative flex h-14 w-14 flex-col items-center justify-center rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/10 shadow-lg shadow-black/40 ring-1 ring-white/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      className={`transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span
                      className={`mt-1 font-mono text-[9px] font-bold tracking-wider uppercase ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Active Indicator Bar */}
                    {isActive && (
                      <span className="absolute -left-[1px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-amber-500 shadow-[0_0_8px_#F59E0B]" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Bottom Version */}
      <div className="font-mono text-[9px] font-semibold text-slate-400 select-none pb-2">
        v4.0.16
      </div>
    </aside>
  )
}
