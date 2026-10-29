import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiSquares2X2,
  HiPlay,
  HiStop,
  HiPuzzlePiece,
  HiBolt,
  HiNewspaper,
  HiArrowDownTray,
  HiCog6Tooth,
  HiArrowRightOnRectangle,
  HiCheck,
  HiPlus,
  HiFolderOpen,
  HiGlobeAlt
} from 'react-icons/hi2'
import { useAuth } from '../../hooks/useAuth'
import { useInstances } from '../../hooks/useInstances'
import { useLaunch } from '../../hooks/useLaunch'
import logoImg from '../../assets/logo.jpg'

interface SidebarProps {
  onNewInstance?: () => void
  onOpenAccounts?: () => void
}

export default function Sidebar({ onNewInstance, onOpenAccounts }: SidebarProps) {
  const navigate = useNavigate()
  const { activeAccount, logout } = useAuth()
  const {
    instances,
    activeInstance,
    setActiveInstance,
    openInstanceFolder
  } = useInstances()
  const { launchGame, stopGame, isPlaying, isLaunching } = useLaunch()

  const handlePlayClick = () => {
    if (isPlaying || isLaunching) {
      stopGame()
    } else {
      launchGame(activeInstance?.id)
    }
  }

  const navSections = [
    {
      label: 'CORE',
      color: 'text-[#FF3154]',
      items: [
        { to: '/', label: 'HOME', icon: HiSquares2X2, end: true, iconColor: 'text-[#FF3154]' },
        { to: '/instances', label: 'PLAY & INSTANCES', icon: HiPlay, iconColor: 'text-[#FF6B45]' },
        { to: '/mods', label: 'MODS & SHADERS', icon: HiPuzzlePiece, iconColor: 'text-[#A855F7]' },
        { to: '/servers', label: 'SERVER FINDER', icon: HiGlobeAlt, iconColor: 'text-[#2DE2A6]' }
      ]
    },
    {
      label: 'SYSTEM',
      color: 'text-[#2DE2A6]',
      items: [
        { to: '/news', label: 'WHAT’S NEW', icon: HiNewspaper, iconColor: 'text-[#45B7FF]' },
        { to: '/settings', label: 'SETTINGS', icon: HiCog6Tooth, iconColor: 'text-[#A3ACBC]' }
      ]
    }
  ]

  return (
    <aside className="relative z-20 flex h-full w-[260px] shrink-0 flex-col justify-between border-r border-[#252B38] bg-[#07080C] select-none font-sans shadow-2xl">
      {/* Top Branding Section */}
      <div className="flex items-center gap-3 border-b border-[#252B38] p-3.5 bg-gradient-to-r from-[#0B0E14] to-[#10141D]">
        <div className="relative">
          <img
            src={logoImg}
            alt="Astrix Logo"
            className="h-9 w-9 rounded-xl object-cover border border-[#FF3154]/40 shadow-lg shadow-[#FF3154]/20"
          />
          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#07080C]">
            <span className="h-2 w-2 rounded-full bg-[#2DE2A6] animate-pulse shadow-[0_0_8px_#2DE2A6]" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-display">
            <span className="text-sm font-black uppercase tracking-wider text-[#F5F7FA]">
              ASTRIX<span className="text-[#FF3154]">MC</span>
            </span>
            <span className="rounded bg-gradient-to-r from-[#FF3154] to-[#FF6B45] px-1.5 py-0.2 text-[8px] font-mono font-black text-white shadow-sm">
              PRO
            </span>
          </div>
          <p className="flex items-center gap-1 text-[10px] font-semibold text-[#A3ACBC]">
            <HiBolt className="text-[#FF3154]" size={11} />
            <span className="text-zinc-300">Astrix Engine v2.4</span>
          </p>
        </div>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin">
        {navSections.map((sec) => (
          <div key={sec.label} className="space-y-1">
            <div className="flex items-center gap-1.5 px-2.5">
              <span className={`h-1 w-1 rounded-full ${sec.color.replace('text-', 'bg-')}`} />
              <span className="text-[9px] font-mono font-bold text-[#6E7788] uppercase tracking-wider">
                {sec.label}
              </span>
            </div>
            <div className="space-y-0.5 mt-1">
              {sec.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#151A24] text-[#F5F7FA] border border-[#FF3154]/40 shadow-sm'
                          : 'text-[#A3ACBC] hover:bg-[#10141D] hover:text-[#F5F7FA] border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`h-4 w-4 shrink-0 transition-colors ${
                              isActive ? 'text-[#FF3154]' : item.iconColor
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF3154] shadow-[0_0_6px_#FF3154]" />
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}

        {/* Quick Instances Switcher Bar */}
        <div className="pt-2 border-t border-[#252B38]/80">
          <div className="flex items-center justify-between px-2.5 mb-1.5">
            <span className="text-[9px] font-mono font-bold text-[#6E7788] uppercase tracking-wider">
              PROFILES ({instances.length})
            </span>
            <button
              onClick={onNewInstance}
              className="text-[#FF3154] hover:text-white transition-colors"
              title="Create Instance"
            >
              <HiPlus size={14} />
            </button>
          </div>

          <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-none">
            {instances.slice(0, 4).map((inst) => {
              const isSelected = activeInstance?.id === inst.id
              return (
                <div
                  key={inst.id}
                  onClick={() => setActiveInstance(inst)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] transition-all ${
                    isSelected
                      ? 'bg-[#151A24] text-white border border-[#FF3154]/40 font-semibold shadow-sm'
                      : 'text-[#6E7788] hover:bg-[#10141D] hover:text-[#A3ACBC] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isSelected ? 'bg-[#FF3154] shadow-[0_0_6px_#FF3154]' : 'bg-[#6E7788]'}`} />
                    <span className="truncate">{inst.name}</span>
                  </div>
                  <span className="font-mono text-[9px] text-[#A3ACBC] bg-[#07080C] px-1.5 py-0.5 rounded border border-[#252B38]">
                    {inst.mcVersion}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* User Profile & Launch Station */}
      <div className="border-t border-[#252B38] bg-[#0B0E14] p-3 space-y-2.5">
        {/* User Mini Bar */}
        <div
          onClick={onOpenAccounts}
          className="flex cursor-pointer items-center justify-between rounded-xl border border-[#252B38] bg-[#10141D] p-2 hover:border-[#FF3154]/40 hover:bg-[#151A24] transition-all"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative">
              <img
                src={`https://minotar.net/avatar/${activeAccount?.username || 'Steve'}/32.png`}
                alt="skin"
                className="h-7 w-7 rounded-lg bg-[#07080C] border border-white/10 object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#10141D] bg-[#2DE2A6]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[#F5F7FA]">
                {activeAccount?.username || 'Guest Player'}
              </p>
              <span className="text-[9px] font-mono text-[#2DE2A6]">Online • Level 24</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              logout()
            }}
            title="Log out"
            className="rounded p-1 text-[#6E7788] hover:bg-[#1B2130] hover:text-white"
          >
            <HiArrowRightOnRectangle size={14} />
          </button>
        </div>

        {/* Primary PLAY NOW / STOP Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handlePlayClick}
          className={`group flex w-full flex-col items-center justify-center rounded-xl py-3 shadow-lg transition-all ${
            isPlaying || isLaunching
              ? 'border border-[#FF4D67]/40 bg-[#FF4D67]/20 text-white'
              : 'bg-[#FF3154] text-white hover:bg-[#ff1e45] shadow-[#FF3154]/25'
          }`}
        >
          <div className="flex items-center gap-2">
            {isPlaying || isLaunching ? (
              <HiStop className="h-4 w-4 animate-pulse" />
            ) : (
              <HiPlay className="h-4 w-4 transition-transform group-hover:scale-110" />
            )}
            <span className="text-sm font-black uppercase tracking-wider font-display">
              {isPlaying ? 'STOP CLIENT' : isLaunching ? 'PREPARING...' : 'PLAY NOW'}
            </span>
          </div>

          <span className="mt-0.5 text-[10px] font-mono opacity-90 truncate max-w-[200px]">
            {isPlaying
              ? 'Game is running'
              : `${activeInstance?.name || 'Minecraft'} (${activeInstance?.mcVersion || '1.21.4'})`}
          </span>
        </motion.button>
      </div>
    </aside>
  )
}
