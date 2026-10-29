import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  HiMagnifyingGlass,
  HiTv,
  HiAdjustmentsHorizontal,
  HiBolt,
  HiSparkles,
  HiShieldCheck,
  HiCheck
} from 'react-icons/hi2'
import { playSound } from '../../utils/sound'

interface ClientMod {
  id: string
  name: string
  category: 'performance' | 'pvp' | 'hud' | 'visuals' | 'utility'
  description: string
  enabled: boolean
  icon: string
  version: string
  author: string
}

const INITIAL_CLIENT_MODS: ClientMod[] = [
  {
    id: 'sodium',
    name: 'Sodium Ultra FPS',
    category: 'performance',
    description: 'Modern rendering engine providing massive 300-500% FPS boost and frame stability.',
    enabled: true,
    icon: '⚡',
    version: '0.6.14',
    author: 'CaffeineMC'
  },
  {
    id: 'lithium',
    name: 'Lithium Game Physics',
    category: 'performance',
    description: 'General-purpose optimization for physics, chunk loading, and entity ticking.',
    enabled: true,
    icon: '🔋',
    version: '0.14.7',
    author: 'CaffeineMC'
  },
  {
    id: 'iris',
    name: 'Iris Shaders Engine',
    category: 'visuals',
    description: 'Next-generation shader pack loader compatible with modern Sodium pipeline.',
    enabled: true,
    icon: '✨',
    version: '1.8.8',
    author: 'Iris Team'
  },
  {
    id: 'keystrokes',
    name: 'Keystrokes & CPS',
    category: 'pvp',
    description: 'Displays WASD, Spacebar, Sprint, and Left/Right Click CPS with customizable chroma RGB.',
    enabled: true,
    icon: '⌨️',
    version: '2.4.0',
    author: 'Astrix PvP'
  },
  {
    id: 'armor_hud',
    name: 'Armor & Weapon Status',
    category: 'hud',
    description: 'Real-time durability and item display for armor pieces, offhand shield, and held weapon.',
    enabled: true,
    icon: '🛡️',
    version: '1.5.2',
    author: 'Astrix HUD'
  },
  {
    id: 'zoomify',
    name: 'Smooth Cinematic Zoom',
    category: 'utility',
    description: 'Mouse wheel scrollable zoom with smooth transitions and customizable FOV zoom levels.',
    enabled: true,
    icon: '🔍',
    version: '2.15.2',
    author: 'Isxander'
  },
  {
    id: 'wavey_capes',
    name: 'Wavey Capes 3D',
    category: 'visuals',
    description: 'Splits cape into multiple simulated 3D physics segments for realistic fluid movement.',
    enabled: true,
    icon: '🎽',
    version: '1.4.9',
    author: 'tr7zw'
  },
  {
    id: '3d_skin_layers',
    name: '3D Skin Layers',
    category: 'visuals',
    description: 'Transforms the flat 2D secondary layer of Minecraft player skins into full 3D meshes.',
    enabled: true,
    icon: '👤',
    version: '1.7.0',
    author: 'tr7zw'
  },
  {
    id: 'simple_hud',
    name: 'Simple HUD Enhanced',
    category: 'hud',
    description: 'Compact on-screen telemetry showing FPS, Coordinates (XYZ), Biome, Ping, and Speed.',
    enabled: true,
    icon: '📊',
    version: '1.2.0',
    author: 'Astrix Core'
  },
  {
    id: 'entity_culling',
    name: 'Entity Culling',
    category: 'performance',
    description: 'Skips rendering entities and tile-entities that are behind blocks and not visible.',
    enabled: true,
    icon: '🧱',
    version: '1.7.3',
    author: 'tr7zw'
  },
  {
    id: 'fullbright',
    name: 'Fullbright Night Vision',
    category: 'utility',
    description: 'Increases ambient lighting to max gamma so caves, ravines, and night are clearly visible.',
    enabled: true,
    icon: '💡',
    version: '1.0.0',
    author: 'Astrix Client'
  },
  {
    id: 'hit_color',
    name: 'Custom Hit Damage Color',
    category: 'pvp',
    description: 'Change the red damage flashing overlay color when hitting players (Chroma RGB, Violet, Cyan).',
    enabled: false,
    icon: '🎯',
    version: '1.1.0',
    author: 'Astrix PvP'
  }
]

export default function NoRiskModsPage() {
  const navigate = useNavigate()
  const [mods, setMods] = useState<ClientMod[]>(INITIAL_CLIENT_MODS)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSettingsMod, setActiveSettingsMod] = useState<ClientMod | null>(null)

  const categories = [
    { id: 'all', label: 'All Mods' },
    { id: 'pvp', label: 'PvP & Combat' },
    { id: 'performance', label: 'FPS Boost' },
    { id: 'hud', label: 'HUD & Info' },
    { id: 'visuals', label: 'Visuals & Capes' },
    { id: 'utility', label: 'Utilities' }
  ]

  const toggleMod = (id: string) => {
    playSound('click')
    setMods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    )
  }

  const filteredMods = mods.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="relative min-h-full w-full select-none font-sans text-slate-100 overflow-y-auto px-6 py-6 pb-20">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">

        {/* ── TOP HEADER & CONTROLS ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-3xl border border-white/[0.08] bg-[#0A0E18]/85 p-6 backdrop-blur-2xl shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display text-xl font-black uppercase tracking-wider text-white">
                CLIENT MODS & MODULES
              </span>
              <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                {mods.filter((m) => m.enabled).length} ACTIVE
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400">
              Customize FPS performance mods, PvP enhancements, and HUD overlays.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mods..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-4 py-2 text-xs font-medium text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none transition-all"
              />
            </div>

            {/* Launch In-Game HUD Studio Button */}
            <button
              type="button"
              onClick={() => {
                playSound('click')
                navigate('/client-hud')
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.55)] transition-all shrink-0"
            >
              <HiTv size={15} />
              <span>HUD Studio</span>
            </button>
          </div>
        </div>

        {/* ── CATEGORY TABS ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  playSound('tab')
                  setSelectedCategory(cat.id)
                }}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* ── MODS GRID (NORISK STYLE) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMods.map((mod) => (
            <div
              key={mod.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-xl transition-all duration-200 group ${
                mod.enabled
                  ? 'border-cyan-500/30 bg-[#0B101D]/90 shadow-[0_8px_25px_rgba(0,0,0,0.5)]'
                  : 'border-white/[0.06] bg-[#0A0D15]/60 opacity-70'
              }`}
            >
              {/* Header: Icon + Toggle */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 text-xl shadow-inner">
                      {mod.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                        {mod.category}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400">
                        v{mod.version}
                      </span>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleMod(mod.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      mod.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        mod.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Mod Title & Description */}
                <h3 className="font-display text-base font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors">
                  {mod.name}
                </h3>
                <p className="mt-1 font-sans text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {mod.description}
                </p>
              </div>

              {/* Footer: Status badge & Configure */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-500">
                  By {mod.author}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setActiveSettingsMod(mod)
                  }}
                  className="flex items-center gap-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white transition-all"
                >
                  <HiAdjustmentsHorizontal size={13} />
                  <span>Config</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── MOD CONFIG MODAL ── */}
        {activeSettingsMod && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0C101C] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{activeSettingsMod.icon}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">
                      {activeSettingsMod.name}
                    </h3>
                    <span className="font-mono text-xs text-cyan-400">Settings & Customization</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSettingsMod(null)}
                  className="rounded-xl bg-white/5 hover:bg-white/10 px-3 py-1 text-xs text-slate-300"
                >
                  Close
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-bold">Enabled in Client</span>
                  <button
                    type="button"
                    onClick={() => toggleMod(activeSettingsMod.id)}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      activeSettingsMod.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {activeSettingsMod.enabled ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Render Scale / Size</span>
                    <span className="font-mono text-cyan-400">100%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    defaultValue="100"
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Background Opacity</span>
                    <span className="font-mono text-cyan-400">75%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="75"
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-300 font-bold">Chroma RGB Mode</span>
                  <input type="checkbox" defaultChecked className="accent-cyan-400 h-4 w-4 rounded" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSettingsMod(null)}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-2.5 text-xs font-bold text-white shadow-lg"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
