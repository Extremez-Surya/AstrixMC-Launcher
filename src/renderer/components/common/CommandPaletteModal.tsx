import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  HiMagnifyingGlass,
  HiPlay,
  HiPuzzlePiece,
  HiGlobeAlt,
  HiCog6Tooth,
  HiSparkles,
  HiShieldCheck,
  HiBolt,
  HiPaintBrush,
  HiVideoCamera,
  HiPhoto,
  HiShoppingBag,
  HiXMark
} from 'react-icons/hi2'
import { useInstances } from '../../hooks/useInstances'
import { useLaunch } from '../../hooks/useLaunch'

interface CommandPaletteModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CommandItem {
  id: string
  title: string
  subtitle: string
  category: 'Actions' | 'Instances' | 'Navigation' | 'Settings'
  icon: any
  action: () => void
}

export default function CommandPaletteModal({ isOpen, onClose }: CommandPaletteModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const { instances, activeInstance } = useInstances()
  const { launchGame } = useLaunch()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          setQuery('')
          setSelectedIndex(0)
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      {
        id: 'play-active',
        title: `Launch ${activeInstance?.name || 'Minecraft'}`,
        subtitle: `Start Minecraft ${activeInstance?.mcVersion || '1.21.4'} with Astrix Engine`,
        category: 'Actions',
        icon: HiPlay,
        action: () => {
          launchGame(activeInstance?.id)
          onClose()
        }
      },
      {
        id: 'nav-instances',
        title: 'Open Instance Manager',
        subtitle: 'Manage versions, loaders, components & RAM allocation',
        category: 'Navigation',
        icon: HiPlay,
        action: () => {
          navigate('/instances')
          onClose()
        }
      },
      {
        id: 'nav-mods',
        title: 'Browse Mods & Shaders',
        subtitle: 'Search 100,000+ Fabric, Forge, and NeoForge mods',
        category: 'Navigation',
        icon: HiPuzzlePiece,
        action: () => {
          navigate('/mods')
          onClose()
        }
      },
      {
        id: 'nav-hud',
        title: 'Customize In-Game Client HUD',
        subtitle: 'Edit Keystrokes, CPS, Armor Status, FPS modules & layout',
        category: 'Navigation',
        icon: HiBolt,
        action: () => {
          navigate('/client-hud')
          onClose()
        }
      },
      {
        id: 'nav-skins',
        title: 'Skin Selector & Catalog',
        subtitle: 'Browse 70+ skins, 3D WebGL viewer & wardrobe',
        category: 'Navigation',
        icon: HiPaintBrush,
        action: () => {
          navigate('/skins')
          onClose()
        }
      },
      {
        id: 'nav-screenshots',
        title: 'Screenshots & Gallery',
        subtitle: 'Browse in-game F2 captures across all instances',
        category: 'Navigation',
        icon: HiPhoto,
        action: () => {
          navigate('/screenshots')
          onClose()
        }
      },
      {
        id: 'nav-servers',
        title: 'Server Discovery',
        subtitle: 'Browse Hypixel, Minemen, Wynncraft & community servers',
        category: 'Navigation',
        icon: HiGlobeAlt,
        action: () => {
          navigate('/servers')
          onClose()
        }
      },
      {
        id: 'nav-performance',
        title: 'Performance Center',
        subtitle: 'System telemetry, FPS tuner & Aikar JVM flags',
        category: 'Navigation',
        icon: HiShieldCheck,
        action: () => {
          navigate('/performance')
          onClose()
        }
      },
      {
        id: 'nav-ai',
        title: 'Astrix AI Assistant',
        subtitle: 'Crash log diagnostics & automatic mod conflict resolution',
        category: 'Navigation',
        icon: HiSparkles,
        action: () => {
          navigate('/ai')
          onClose()
        }
      },
      {
        id: 'nav-studio',
        title: 'Astrix Studio & Replay Viewer',
        subtitle: 'Manage replays, cinematic camera paths & screenshots',
        category: 'Navigation',
        icon: HiVideoCamera,
        action: () => {
          navigate('/studio')
          onClose()
        }
      },
      {
        id: 'nav-store',
        title: 'Astrix Store & Gem Vault',
        subtitle: 'Claim daily rewards and browse exclusive cosmetics',
        category: 'Navigation',
        icon: HiShoppingBag,
        action: () => {
          navigate('/store')
          onClose()
        }
      },
      {
        id: 'nav-settings',
        title: 'Client & Java Settings',
        subtitle: 'Configure memory limits, Java runtime & graphics',
        category: 'Settings',
        icon: HiCog6Tooth,
        action: () => {
          navigate('/settings')
          onClose()
        }
      }
    ]

    // Add instances as commands
    instances.forEach((inst) => {
      list.push({
        id: `instance-${inst.id}`,
        title: `Launch ${inst.name}`,
        subtitle: `${inst.mcVersion} • ${inst.loader || 'Vanilla'} • ${inst.memoryMax || 4096}MB RAM`,
        category: 'Instances',
        icon: HiPlay,
        action: () => {
          launchGame(inst.id)
          onClose()
        }
      })
    })

    return list
  }, [instances, activeInstance, navigate, launchGame, onClose])

  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    )
  }, [commands, query])

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action()
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#07080C]/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-[#252B38] bg-[#0B0E14] shadow-2xl shadow-black/90"
            onKeyDown={handleKeyDownList}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 border-b border-[#252B38] px-4 py-3.5 bg-[#10141D]/90">
              <HiMagnifyingGlass className="text-[#FF3154]" size={20} />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                placeholder="Search commands, instances, mods, servers, or settings (Ctrl + K)..."
                className="w-full bg-transparent text-sm text-[#F5F7FA] placeholder-[#6E7788] outline-none font-medium"
              />
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-[#6E7788] hover:bg-[#1B2130] hover:text-[#F5F7FA] transition-colors"
              >
                <HiXMark size={18} />
              </button>
            </div>

            {/* Command Results List */}
            <div className="max-h-96 overflow-y-auto p-2 scrollbar-thin">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-semibold text-[#A3ACBC]">No matching commands found</p>
                  <p className="text-xs text-[#6E7788] mt-1">Try typing "play", "mods", "hud", or "settings"</p>
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = item.icon
                  const isSelected = idx === selectedIndex
                  return (
                    <div
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 transition-all ${
                        isSelected
                          ? 'bg-[#151A24] border border-[#FF3154]/40 shadow-sm'
                          : 'hover:bg-[#10141D] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                            isSelected
                              ? 'border-[#FF3154]/50 bg-[#FF3154]/15 text-[#FF3154]'
                              : 'border-[#252B38] bg-[#07080C] text-[#A3ACBC]'
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-[#F5F7FA]' : 'text-[#A3ACBC]'}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-[#6E7788] truncate">{item.subtitle}</p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-md border border-[#252B38] bg-[#07080C] px-2 py-0.5 text-[10px] font-mono text-[#6E7788]">
                        {item.category}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer with Keyboard Hints */}
            <div className="flex items-center justify-between border-t border-[#252B38] bg-[#07080C]/80 px-4 py-2.5 text-[11px] text-[#6E7788]">
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="rounded border border-[#252B38] bg-[#10141D] px-1.5 py-0.5 font-mono text-[10px] text-[#A3ACBC]">↑↓</kbd> Navigate
                </span>
                <span>
                  <kbd className="rounded border border-[#252B38] bg-[#10141D] px-1.5 py-0.5 font-mono text-[10px] text-[#A3ACBC]">↵</kbd> Select
                </span>
                <span>
                  <kbd className="rounded border border-[#252B38] bg-[#10141D] px-1.5 py-0.5 font-mono text-[10px] text-[#A3ACBC]">Esc</kbd> Close
                </span>
              </div>
              <span className="font-semibold text-[#FF3154]">ASTRIX COMMAND OS</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
