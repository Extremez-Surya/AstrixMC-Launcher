import { useState } from 'react'
import { NavLink } from 'react-router-dom'
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
  HiPhoto
} from 'react-icons/hi2'
import { FaHandshake, FaShirt } from 'react-icons/fa6'
import StoreComingSoonModal from '../common/StoreComingSoonModal'
import { useAuth } from '../../hooks/useAuth'
import { getAccountAvatar } from '../../utils/avatar'

interface FloatingDockProps {
  onNewInstance?: () => void
}

interface DockItem {
  to: string
  label: string
  icon: any
  end?: boolean
  accentColor: string
  isModal?: boolean
}

export default function FloatingDock({ onNewInstance }: FloatingDockProps) {
  const { activeAccount } = useAuth()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false)

  const items: DockItem[] = [
    { to: '/', label: 'Home Deck', icon: HiSquares2X2, end: true, accentColor: '#F59E0B' },
    { to: '/instances', label: 'Play & Profiles', icon: HiPlay, accentColor: '#F97316' },
    {
      to: '/accounts',
      label: activeAccount?.username ? `Profile (${activeAccount.username})` : 'Profile & Accounts',
      icon: HiUserCircle,
      accentColor: '#10B981'
    },
    { to: '/skins', label: 'Skin Selector', icon: FaShirt, accentColor: '#10B981' },
    { to: '/screenshots', label: 'Screenshots', icon: HiPhoto, accentColor: '#10B981' },
    { to: '/mods', label: 'Mods & Shaders', icon: HiPuzzlePiece, accentColor: '#A855F7' },
    { to: '/servers', label: 'All Servers', icon: HiGlobeAlt, accentColor: '#06B6D4' },
    { to: '/partners', label: 'Partners', icon: FaHandshake, accentColor: '#10B981' },
    { to: '/news', label: "What's New", icon: HiNewspaper, accentColor: '#38BDF8' },
    { to: '/settings', label: 'Settings', icon: HiCog6Tooth, accentColor: '#94A3B8' }
  ]

  return (
    <>
      <div className="pointer-events-none fixed bottom-5 inset-x-0 z-50 flex justify-center px-4">
        <motion.nav
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto relative flex items-center gap-1.5 rounded-2xl border border-white/[0.12] bg-[#0A0D14]/85 px-3 py-2 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-black/40"
        >
          {items.map((item, index) => {
            const Icon = item.icon
            const isHovered = hoveredIndex === index

            return (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip Label */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.9 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap rounded-lg border border-white/10 bg-[#07090E]/95 px-2.5 py-1 text-[10px] font-bold text-white shadow-xl backdrop-blur-md"
                    >
                      {item.label}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#07090E]" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Modal Button or Nav Link */}
                {item.isModal ? (
                  <button
                    type="button"
                    onClick={() => setIsStoreModalOpen(true)}
                    className="relative flex h-11 w-11 items-center justify-center rounded-xl text-[#94A3B8] hover:bg-white/[0.08] hover:text-[#EC4899] border border-transparent transition-all duration-200"
                  >
                    <motion.div
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.92 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <Icon size={20} className="transition-colors" />
                    </motion.div>
                  </button>
                ) : (
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-b from-white/15 to-white/5 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)] border border-amber-500/40'
                          : 'text-[#94A3B8] hover:bg-white/[0.08] hover:text-white border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <motion.div
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.92 }}
                        className="flex flex-col items-center justify-center"
                      >
                        {item.to === '/accounts' && activeAccount?.username ? (
                          <div
                            className={`relative flex h-5 w-5 items-center justify-center rounded-md overflow-hidden border transition-all ${
                              isActive
                                ? 'border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                : 'border-white/20'
                            }`}
                          >
                            <img
                              src={getAccountAvatar(activeAccount, 24)}
                              alt={activeAccount.username}
                              onError={(e) => {
                                ;(e.currentTarget as HTMLElement).style.display = 'none'
                              }}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <Icon
                            size={20}
                            style={{ color: isActive ? item.accentColor : undefined }}
                            className="transition-colors"
                          />
                        )}

                        {/* Active glow dot */}
                        {isActive && (
                          <motion.span
                            layoutId="activeDockDot"
                            className="absolute bottom-1 h-1 w-1 rounded-full shadow-[0_0_8px_#F59E0B]"
                            style={{ backgroundColor: item.accentColor }}
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          />
                        )}
                      </motion.div>
                    )}
                  </NavLink>
                )}
              </div>
            )
          })}

          {/* Vertical divider */}
          <div className="mx-1 h-6 w-px bg-white/15" />

          {/* Quick New Profile Button */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.12, y: -2 }}
              whileTap={{ scale: 0.92 }}
              onClick={onNewInstance}
              title="Create New Instance"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-black hover:border-amber-400 transition-all shadow-md shadow-amber-500/20"
            >
              <HiPlus size={20} />
            </motion.button>
          </div>
        </motion.nav>
      </div>

      {/* Store Coming Soon Modal */}
      <StoreComingSoonModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
      />
    </>
  )
}
