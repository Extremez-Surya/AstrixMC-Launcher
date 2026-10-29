import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiSparkles,
  HiShoppingBag,
  HiGlobeAlt,
  HiCamera,
  HiUsers,
  HiChatBubbleLeftRight,
  HiPuzzlePiece,
  HiMagnifyingGlass,
  HiMoon,
  HiSun,
  HiGift,
  HiCheck,
  HiChevronLeft,
  HiChevronRight,
  HiArrowRight,
  HiPlay,
  HiShieldCheck,
  HiBolt
} from 'react-icons/hi2'
import { FaFire, FaGem, FaCrosshairs, FaCrown } from 'react-icons/fa6'
import { playSound } from '../utils/sound'
import landscapeImg from '../assets/landscape.jpg'
import bannerImg from '../assets/astrix_server_banner.jpg'
import { MinecraftSkinViewer3D } from '../components/skins/MinecraftSkinViewer3D'
import { useAuth } from '../hooks/useAuth'

type FeatureTab =
  | 'hud'
  | 'cosmetics'
  | 'hosted_worlds'
  | 'mcreal'
  | 'friends'
  | 'chats'
  | 'minigames'

interface CosmeticItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  hasGift?: boolean
  type: string
  category: string
  tag?: string
  image: string
  color: string
}

const COSMETIC_ITEMS: CosmeticItem[] = [
  {
    id: 'manta',
    name: 'Manta',
    price: 1350,
    originalPrice: 1500,
    hasGift: true,
    type: 'Mount & Hat',
    category: 'featured',
    tag: 'SALE -10%',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80',
    color: 'from-blue-600/30 to-cyan-600/30 border-cyan-500/40'
  },
  {
    id: 'mizu_no_yaiba',
    name: 'Mizu no Yaiba',
    price: 1800,
    originalPrice: 2000,
    hasGift: true,
    type: 'Katana Slash Effect',
    category: 'featured',
    tag: 'LEGENDARY',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    color: 'from-cyan-600/30 to-sky-600/30 border-sky-400/50'
  },
  {
    id: 'splash_aura',
    name: 'Splash Aura',
    price: 1500,
    type: 'Hydro Particle Trail',
    category: 'featured',
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80',
    color: 'from-teal-600/30 to-emerald-600/30 border-teal-400/40'
  },
  {
    id: 'obsidian_shield',
    name: 'Obsidian Shield',
    price: 1200,
    type: 'Animated 3D Back Shield',
    category: 'cosmetics',
    tag: 'POPULAR',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    color: 'from-purple-600/30 to-indigo-600/30 border-purple-500/40'
  },
  {
    id: 'enchanting_glint',
    name: 'Enchanting Glint',
    price: 900,
    type: 'Arm Armor Shimmer',
    category: 'cosmetics',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80',
    color: 'from-fuchsia-600/30 to-pink-600/30 border-fuchsia-500/40'
  },
  {
    id: 'red_panda',
    name: 'Red Panda Companion',
    price: 1600,
    originalPrice: 2200,
    hasGift: true,
    type: 'Shoulder Pet',
    category: 'cosmetics',
    tag: 'CUTE',
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=400&q=80',
    color: 'from-amber-600/30 to-rose-600/30 border-amber-500/40'
  }
]

export default function ClientFeaturesPage() {
  const { activeAccount } = useAuth()
  const [activeTab, setActiveTab] = useState<FeatureTab>('hud')
  const [cosmeticCategory, setCosmeticCategory] = useState<string>('FEATURED')
  const [searchQuery, setSearchQuery] = useState('')
  const [equippedPreview, setEquippedPreview] = useState<string[]>([
    'ENCHANTINGGLINT',
    'OBSIDIAN SHIELD',
    'CUSTOM CAPE',
    'MINIME HAND',
    'RED PANDA'
  ])

  // Hosted World mock status
  const [hostedWorldName, setHostedWorldName] = useState('My Survival Realm')
  const [isHosting, setIsHosting] = useState(false)
  const [hostCode, setHostCode] = useState('ASTRIX-9284')

  const tabs = [
    { id: 'hud', label: 'HUD Editor' },
    { id: 'cosmetics', label: 'Cosmetics' },
    { id: 'hosted_worlds', label: 'Hosted Worlds' },
    { id: 'mcreal', label: 'McReal' },
    { id: 'friends', label: 'Friends' },
    { id: 'chats', label: 'Chats' },
    { id: 'minigames', label: 'Minigames' }
  ] as const

  return (
    <div className="flex h-full w-full flex-col bg-[#050A14] text-white select-none overflow-y-auto">
      
      {/* ── TOP NAV TABS (EXACT NORISK STYLE) ── */}
      <div className="sticky top-0 z-40 flex flex-col items-center border-b border-white/[0.06] bg-[#050A14]/90 backdrop-blur-md pt-5 pb-2">
        <div className="flex items-center gap-6 sm:gap-8 md:gap-10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playSound('tab')
                  setActiveTab(tab.id)
                }}
                className={`relative pb-3 text-sm md:text-base font-semibold transition-colors duration-150 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeFeatureTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* ── DYNAMIC SUBTITLE PER TAB ── */}
        <div className="mt-4 max-w-2xl px-6 text-center">
          {activeTab === 'hud' && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm md:text-[15px] leading-relaxed text-slate-300 font-normal"
            >
              Over 20 HUD modules, built into the client. Keep an eye on
              everything that matters, placed and styled exactly the way you like.
            </motion.p>
          )}

          {activeTab === 'cosmetics' && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm md:text-[15px] leading-relaxed text-slate-300 font-normal"
            >
              Over 300 cosmetics and free custom capes.
              <br />
              <span className="text-cyan-400 font-medium">Everyone with Astrix Client sees them.</span>
            </motion.p>
          )}

          {activeTab === 'hosted_worlds' && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm md:text-[15px] leading-relaxed text-slate-300 font-normal"
            >
              Play with friends in seconds without configuring servers or port forwarding. High-speed peer-to-peer hosting.
            </motion.p>
          )}

          {activeTab === 'mcreal' && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm md:text-[15px] leading-relaxed text-slate-300 font-normal"
            >
              Daily random snapshot challenge. Capture your Minecraft adventure at the exact same moment as your friends.
            </motion.p>
          )}

          {activeTab === 'friends' && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm md:text-[15px] leading-relaxed text-slate-300 font-normal"
            >
              Connect with players across all servers. See what they are playing and join their instance instantly.
            </motion.p>
          )}

          {activeTab === 'chats' && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm md:text-[15px] leading-relaxed text-slate-300 font-normal"
            >
              Cross-server in-game chat and DMs. Never lose touch with your squad while switching lobbies or servers.
            </motion.p>
          )}

          {activeTab === 'minigames' && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm md:text-[15px] leading-relaxed text-slate-300 font-normal"
            >
              Instant warmup modes built right into Astrix Client. Train CPS, Aim, and Fast Bridging before jumping into PvP.
            </motion.p>
          )}
        </div>
      </div>

      {/* ── TAB CONTENT DISPLAY AREA ── */}
      <div className="flex-1 p-6 flex flex-col items-center justify-start">
        <AnimatePresence mode="wait">
          
          {/* ════════════════ TAB 1: HUD EDITOR ════════════════ */}
          {activeTab === 'hud' && (
            <motion.div
              key="tab-hud"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-5xl rounded-3xl border border-white/[0.1] bg-[#070E1E] overflow-hidden shadow-2xl"
            >
              {/* In-game terrain preview */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                <img
                  src={landscapeImg}
                  alt="In-game HUD Preview"
                  className="h-full w-full object-cover object-center"
                />

                {/* Top Minecraft Status Color Bar (matches screenshot) */}
                <div className="absolute top-0 left-0 right-0 h-2 flex">
                  <div className="h-full w-1/4 bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <div className="h-full w-1/4 bg-green-400/80" />
                  <div className="h-full w-1/4 bg-fuchsia-400/80 shadow-[0_0_8px_rgba(232,121,249,0.8)]" />
                  <div className="h-full w-1/4 bg-lime-400/80" />
                </div>

                {/* Overlay HUD Module: Coordinates & Biome */}
                <div className="absolute top-4 left-4 z-20 rounded bg-black/60 px-3 py-2 font-mono text-[11px] leading-tight text-white backdrop-blur-sm border border-white/10 select-text">
                  <div className="flex justify-between gap-4">
                    <span>X: 1909</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Y: 72</span>
                    <span className="text-slate-400">S</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Z: 963</span>
                    <span className="text-slate-400">+</span>
                  </div>
                  <div className="mt-1 text-slate-300">
                    Biome: <span className="text-emerald-400">Sunflower Plains</span>
                  </div>
                </div>

                {/* Center Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="font-pixel text-xl text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] select-none">
                    +
                  </span>
                </div>

                {/* Bottom-right first-person enchanted arm glow */}
                <div className="absolute -bottom-6 -right-6 h-36 w-36 rounded-full bg-fuchsia-500/20 blur-2xl pointer-events-none" />

                {/* Bottom Interactive HUD Action Bar */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between rounded-xl bg-black/75 px-5 py-3 backdrop-blur-md border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-pixel text-xs text-white">HUD EDITOR ACTIVE (RIGHT SHIFT IN-GAME)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/10 px-2 py-1 text-[11px] text-slate-300 font-mono">CPS Counter</span>
                    <span className="rounded bg-white/10 px-2 py-1 text-[11px] text-slate-300 font-mono">Keystrokes</span>
                    <span className="rounded bg-white/10 px-2 py-1 text-[11px] text-slate-300 font-mono">Armor HUD</span>
                    <span className="rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 text-[11px] font-bold">24 Active</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════ TAB 2: COSMETICS (EXACT NORISK STORE) ════════════════ */}
          {activeTab === 'cosmetics' && (
            <motion.div
              key="tab-cosmetics"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-5xl rounded-3xl border border-white/[0.12] bg-[#081022] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Top Search & Filter Bar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0A1428] px-6 py-3.5">
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Type to search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-md bg-[#132038] border border-white/10 px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {/* Dropdown filter */}
                  <div className="rounded-md bg-[#132038] border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer hover:border-slate-400">
                    <span>ALL</span>
                    <span className="text-[10px]">▼</span>
                  </div>
                </div>

                {/* Right controls: Code, Tokens, Cart */}
                <div className="flex items-center gap-4">
                  <button type="button" className="text-slate-400 hover:text-white" title="Toggle Theme">
                    <HiMoon size={16} />
                  </button>

                  <div className="rounded bg-[#132038] border border-white/10 px-3 py-1 text-xs font-mono text-slate-200">
                    CODE: <span className="font-bold text-cyan-400">ASTRIX</span>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 px-3 py-1 text-xs font-bold text-cyan-300">
                    <span>8,742</span>
                    <span className="text-cyan-400">✦</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => playSound('click')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#132038] text-slate-300 hover:bg-cyan-600 hover:text-white transition-colors"
                  >
                    <HiShoppingBag size={16} />
                  </button>
                </div>
              </div>

              {/* Main Store Layout (Left Submenu + Center Products + Right 3D Character) */}
              <div className="flex flex-1 flex-col lg:flex-row min-h-[460px]">
                
                {/* ── Left Category Menu ── */}
                <div className="w-full lg:w-44 shrink-0 border-r border-white/[0.08] bg-[#070D1B] py-4 px-3 flex flex-row lg:flex-col gap-1 overflow-x-auto">
                  {['FEATURED', 'COSMETICS', 'BUNDLES', 'OUTFITS', 'EMOTES', 'SKINS', 'ASTRIX+'].map((cat) => {
                    const isSelected = cosmeticCategory === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          playSound('click')
                          setCosmeticCategory(cat)
                        }}
                        className={`relative flex items-center justify-start rounded-lg px-3 py-2 text-left font-pixel text-xs font-bold tracking-wider transition-all ${
                          isSelected
                            ? 'text-cyan-400 bg-cyan-500/10 border-l-2 border-cyan-400'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>

                {/* ── Center Content: Hero Banner + Product Cards ── */}
                <div className="flex-1 p-5 overflow-y-auto">
                  
                  {/* Hero Banner: Splash Collection */}
                  <div className="relative mb-5 h-44 w-full rounded-2xl overflow-hidden border border-cyan-500/30 shadow-lg group">
                    <img
                      src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80"
                      alt="Splash Collection Banner"
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 via-transparent to-transparent flex flex-col justify-end p-5">
                      <span className="font-pixel text-2xl font-black text-cyan-300 drop-shadow-[0_2px_10px_rgba(6,182,212,0.8)] italic">
                        Splash Collection
                      </span>
                      <p className="text-xs text-slate-200 mt-1 max-w-sm">
                        Dive into limited summer oceanic cosmetics, hydro katanas, and turtle companions.
                      </p>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {COSMETIC_ITEMS.map((item) => (
                      <div
                        key={item.id}
                        className="group relative flex flex-col rounded-xl border border-white/[0.08] bg-[#0A1325] p-3 hover:border-cyan-400/60 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                      >
                        {/* Image preview */}
                        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-900 mb-2.5">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {item.tag && (
                            <span className="absolute top-2 left-2 rounded bg-cyan-500/90 px-1.5 py-0.5 font-pixel text-[9px] font-bold text-white shadow">
                              {item.tag}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex items-center justify-between">
                          <span className="font-pixel text-xs font-bold text-white">{item.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5">{item.type}</span>

                        {/* Price & Gift Button */}
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/[0.06]">
                          <div className="flex items-center gap-1.5">
                            {item.originalPrice && (
                              <span className="text-[11px] text-slate-500 line-through">
                                {item.originalPrice}✦
                              </span>
                            )}
                            <span className="font-pixel text-xs font-bold text-cyan-300">
                              {item.price}✦
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => playSound('click')}
                            className="flex items-center gap-1 rounded bg-[#172554] px-2 py-1 text-[10px] font-bold text-cyan-300 hover:bg-cyan-600 hover:text-white transition-colors border border-cyan-500/30"
                          >
                            {item.hasGift ? <HiGift size={12} /> : null}
                            <span>GET</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Right Column: 3D Character Preview + Equipped Tags ── */}
                <div className="w-full lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.08] bg-[#070D1C] p-4 flex flex-col items-center justify-between">
                  
                  {/* Equipped Items List (matches right side in screenshot) */}
                  <div className="w-full flex flex-col items-end gap-1.5 select-none font-mono text-[10px] font-bold tracking-wider text-slate-300">
                    {equippedPreview.map((tag) => (
                      <span key={tag} className="hover:text-cyan-400 cursor-pointer transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 3D Character Model with Cosmetics */}
                  <div className="relative my-2 h-[240px] w-full flex items-center justify-center">
                    <MinecraftSkinViewer3D
                      playerName={activeAccount?.username || 'BCAS_'}
                      width={220}
                      height={240}
                      animation="wave"
                      enableControls={true}
                      enableZoom={false}
                      showControlsBar={false}
                    />
                  </div>

                  {/* Carousel Controls */}
                  <div className="flex items-center justify-between w-full px-4 text-slate-400">
                    <button type="button" className="hover:text-white p-1">
                      <HiChevronLeft size={20} />
                    </button>
                    <span className="font-pixel text-[10px] text-slate-400">1 / 5</span>
                    <button type="button" className="hover:text-white p-1">
                      <HiChevronRight size={20} />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ════════════════ TAB 3: HOSTED WORLDS ════════════════ */}
          {activeTab === 'hosted_worlds' && (
            <motion.div
              key="tab-hosted"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-4xl rounded-3xl border border-white/[0.1] bg-[#081022] p-8 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <HiGlobeAlt size={28} />
                </div>
                <div>
                  <h3 className="font-pixel text-lg font-bold text-white">Astrix Peer-to-Peer Host</h3>
                  <p className="text-xs text-slate-400">Share any singleplayer world with friends in 1 click without port forwarding.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4 rounded-2xl bg-[#0C172E] p-5 border border-white/[0.08]">
                  <span className="font-pixel text-xs text-cyan-400 font-bold uppercase tracking-wider">Host Singleplayer World</span>
                  
                  <input
                    type="text"
                    value={hostedWorldName}
                    onChange={(e) => setHostedWorldName(e.target.value)}
                    className="rounded-lg bg-[#132342] border border-white/10 px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="World name..."
                  />

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Privacy:</span>
                    <span className="text-cyan-400 font-semibold">Friends Only</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('click')
                      setIsHosting(!isHosting)
                    }}
                    className={`mt-2 flex items-center justify-center gap-2 rounded-xl py-3 font-pixel text-xs font-bold tracking-wider transition-all ${
                      isHosting
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                    }`}
                  >
                    {isHosting ? 'STOP HOSTING' : 'START HOSTING NOW'}
                  </button>
                </div>

                <div className="flex flex-col justify-between rounded-2xl bg-[#0C172E] p-5 border border-white/[0.08]">
                  <div>
                    <span className="font-pixel text-xs text-slate-400 font-bold uppercase tracking-wider">Direct Invite Code</span>
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-[#132342] border border-white/10 px-4 py-3">
                      <span className="font-mono text-base font-bold text-white tracking-widest">{hostCode}</span>
                      <button
                        type="button"
                        onClick={() => playSound('click')}
                        className="rounded bg-cyan-500/20 text-cyan-300 px-3 py-1 text-xs font-bold hover:bg-cyan-500/40"
                      >
                        COPY
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                    Friends with Astrix Client can enter this code in Multiplayer &gt; Direct Connect to instantly join your game.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════ TAB 4: MCREAL ════════════════ */}
          {activeTab === 'mcreal' && (
            <motion.div
              key="tab-mcreal"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-4xl rounded-3xl border border-white/[0.1] bg-[#081022] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                    <HiCamera size={22} />
                  </div>
                  <div>
                    <h3 className="font-pixel text-base font-bold text-white">Astrix McReal Daily</h3>
                    <p className="text-xs text-slate-400">Today's challenge: Sunset from highest peak</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playSound('click')}
                  className="rounded-xl bg-cyan-500 px-4 py-2 font-pixel text-xs font-bold text-black hover:bg-cyan-400 shadow-md"
                >
                  TAKE MCREAL (F12)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { user: 'BCAS_', time: '2m ago', img: landscapeImg },
                  { user: 'KittenGirl', time: '14m ago', img: bannerImg },
                  { user: 'ShadowPvP', time: '1h ago', img: landscapeImg }
                ].map((item, idx) => (
                  <div key={idx} className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0C172E] group">
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <img src={item.img} alt={item.user} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="font-pixel text-xs font-bold text-white">{item.user}</span>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ════════════════ TAB 5: FRIENDS ════════════════ */}
          {activeTab === 'friends' && (
            <motion.div
              key="tab-friends"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-3xl rounded-3xl border border-white/[0.1] bg-[#081022] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-3">
                  <HiUsers className="text-cyan-400" size={24} />
                  <span className="font-pixel text-base font-bold text-white">Astrix Friends Network</span>
                </div>
                <button
                  type="button"
                  onClick={() => playSound('click')}
                  className="rounded-lg bg-cyan-600 px-3 py-1.5 font-pixel text-xs text-white hover:bg-cyan-500"
                >
                  + ADD FRIEND
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { name: 'KittenGirl', server: 'Hypixel Bedwars', status: 'In Game', ping: '18ms' },
                  { name: 'Vortex_99', server: 'Minemen Club 1v1', status: 'In Lobby', ping: '24ms' },
                  { name: 'AlexTheGod', server: 'Astrix SMP', status: 'Online', ping: '12ms' },
                  { name: 'Notch_Fan', server: 'Offline', status: 'Last seen 2h ago', ping: '-' }
                ].map((f) => (
                  <div key={f.name} className="flex items-center justify-between rounded-xl bg-[#0C172E] px-4 py-3 border border-white/[0.06] hover:border-cyan-500/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 font-pixel text-sm text-cyan-400">
                        {f.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-pixel text-xs font-bold text-white">{f.name}</span>
                        <div className="text-[11px] text-slate-400">{f.server}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold ${f.status === 'In Game' ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {f.status}
                      </span>
                      {f.status !== 'Offline' && (
                        <button type="button" className="rounded bg-cyan-500/20 text-cyan-300 px-2.5 py-1 text-[10px] font-bold hover:bg-cyan-500/40">
                          JOIN
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ════════════════ TAB 6: CHATS ════════════════ */}
          {activeTab === 'chats' && (
            <motion.div
              key="tab-chats"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-3xl rounded-3xl border border-white/[0.1] bg-[#081022] p-6 shadow-2xl flex flex-col h-[420px]"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
                <HiChatBubbleLeftRight className="text-cyan-400" size={22} />
                <span className="font-pixel text-sm font-bold text-white"># Astrix Global Lounge</span>
              </div>

              <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="font-pixel text-xs font-bold text-cyan-400">KittenGirl:</span>
                  <span className="text-xs text-slate-200">Anyone ready for Bedwars 4v4? Need 2 more!</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-pixel text-xs font-bold text-emerald-400">Vortex_99:</span>
                  <span className="text-xs text-slate-200">Inv me! Just testing the new wave emote animation lol it looks sick</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-pixel text-xs font-bold text-amber-400">AstrixBot:</span>
                  <span className="text-xs text-cyan-300">Party invite sent to Vortex_99.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-white/[0.08]">
                <input
                  type="text"
                  placeholder="Send message to Astrix Client network..."
                  className="flex-1 rounded-xl bg-[#0D1A33] border border-white/10 px-4 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
                <button type="button" className="rounded-xl bg-cyan-500 px-4 py-2.5 font-pixel text-xs font-bold text-black hover:bg-cyan-400">
                  SEND
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════════════ TAB 7: MINIGAMES ════════════════ */}
          {activeTab === 'minigames' && (
            <motion.div
              key="tab-minigames"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-4xl rounded-3xl border border-white/[0.1] bg-[#081022] p-8 shadow-2xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {[
                  { title: 'Aim Trainer', desc: 'Click rapid 3D targets to calibrate mouse sensitivity', icon: FaCrosshairs, color: 'text-cyan-400 border-cyan-500/30' },
                  { title: 'CPS Clicker', desc: 'Test jitter, butterfly, and drag click speeds', icon: FaFire, color: 'text-rose-400 border-rose-500/30' },
                  { title: 'Fast Bridging', desc: 'Godbridge and ninja bridge practice simulator', icon: FaGem, color: 'text-amber-400 border-amber-500/30' }
                ].map((game) => {
                  const Icon = game.icon
                  return (
                    <div
                      key={game.title}
                      className={`flex flex-col justify-between rounded-2xl bg-[#0C172E] p-6 border ${game.color} hover:scale-105 transition-transform duration-200`}
                    >
                      <div>
                        <Icon size={28} className="mb-3" />
                        <h4 className="font-pixel text-sm font-bold text-white">{game.title}</h4>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{game.desc}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => playSound('click')}
                        className="mt-5 rounded-xl bg-white/10 py-2.5 font-pixel text-xs font-bold text-white hover:bg-cyan-500 hover:text-black transition-colors"
                      >
                        PLAY NOW
                      </button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  )
}

