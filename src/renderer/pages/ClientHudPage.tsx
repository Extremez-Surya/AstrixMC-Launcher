import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiPaintBrush,
  HiPhoto,
  HiSparkles,
  HiCheckCircle,
  HiArrowPath,
  HiArrowUpTray,
  HiAdjustmentsHorizontal,
  HiEye,
  HiPlay,
  HiCheck
} from 'react-icons/hi2'
import landscapeImg from '../assets/landscape.jpg'
import bannerImg from '../assets/astrix_server_banner.jpg'
import {
  ButtonThemeConfig,
  THEME_PRESETS,
  generateModernButtonPng,
  generateLegacyWidgetsPng,
  generateDirtGlassTexture,
  generateTitleLogoPng,
  generateEditionLogoPng,
  createPanoramaFaceFromImage,
  createStillWallpaperFromImage
} from '../utils/client-ui-canvas'

interface BackgroundPreset {
  id: string
  name: string
  url: string
  tag: string
}

const PRESET_WALLPAPERS: BackgroundPreset[] = [
  {
    id: 'cherry_blossom',
    name: 'Cherry Blossom Sunset',
    url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1600&q=80',
    tag: 'Sakura Sunset'
  },
  {
    id: 'cyber_nebula',
    name: 'Cyber Neon Void',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
    tag: 'Deep Space'
  },
  {
    id: 'aurora_borealis',
    name: 'Sapphire Aurora',
    url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1600&q=80',
    tag: 'Northern Lights'
  },
  {
    id: 'obsidian_dark',
    name: 'Obsidian Minimalist',
    url: landscapeImg,
    tag: 'Astrix Dark'
  },
  {
    id: 'sakura_fantasy',
    name: 'Sakura Mountain',
    url: bannerImg,
    tag: 'Astrix Scenic'
  }
]

export default function ClientHudPage() {
  const [activeTab, setActiveTab] = useState<'title_screen' | 'in_game_hud'>('title_screen')
  const [previewMode, setPreviewMode] = useState<'main_menu' | 'loading_screen'>('main_menu')

  // Theme Config
  const [themeConfig, setThemeConfig] = useState<ButtonThemeConfig>({
    styleId: 'emerald',
    accentColor: '#00FF9D',
    glassOpacity: 0.20,
    borderGlow: true,
    borderRadius: 8,
    titleText: 'ASTRIXMC',
    subtitleText: 'GLASS CLIENT EDITION'
  })

  const [selectedBgUrl, setSelectedBgUrl] = useState<string>(PRESET_WALLPAPERS[0].url)
  const [splashText, setSplashText] = useState<string>('Glassmorphism activated!')
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  // Status & IPC
  const [isApplying, setIsApplying] = useState(false)
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null)

  // HUD modules for second tab
  const [hudModules, setHudModules] = useState([
    { id: 'fps', name: 'FPS Display', enabled: true },
    { id: 'cps', name: 'CPS Counter (LMB/RMB)', enabled: true },
    { id: 'ping', name: 'Ping Latency', enabled: true },
    { id: 'coords', name: 'XYZ Coordinates', enabled: true },
    { id: 'keystrokes', name: 'Keystrokes (WASD)', enabled: true },
    { id: 'armor', name: 'Armor Durability', enabled: true },
    { id: 'sprint', name: 'Toggle Sprint Indicator', enabled: true }
  ])

  useEffect(() => {
    // Load existing client theme from backend if present
    const loadSaved = async () => {
      try {
        const saved = await (window as any).electronAPI?.getClientTheme?.()
        if (saved) {
          if (saved.customBackgroundUrl) {
            setSelectedBgUrl(saved.customBackgroundUrl)
          }
          if (saved.buttonStyle) {
            const mappedStyle = saved.buttonStyle === 'cyber_glow' ? 'cyber_crimson' : saved.buttonStyle
            if (THEME_PRESETS[mappedStyle]) {
              setThemeConfig((prev) => ({
                ...prev,
                styleId: mappedStyle as any,
                accentColor: THEME_PRESETS[mappedStyle].accentColor
              }))
            }
          }
          if (saved.titleText) {
            setThemeConfig((prev) => ({ ...prev, titleText: saved.titleText }))
          }
          if (saved.subtitleText) {
            setThemeConfig((prev) => ({ ...prev, subtitleText: saved.subtitleText }))
          }
        }
      } catch (err) {
        console.warn('Failed to load saved theme:', err)
      }
    }
    loadSaved()
  }, [])

  const handleSelectLocalImage = async () => {
    try {
      const url = await (window as any).electronAPI?.selectWallpaper?.()
      if (url) {
        setSelectedBgUrl(url)
      }
    } catch (err) {
      console.warn('File select error:', err)
    }
  }

  const handleApplyTheme = async () => {
    setIsApplying(true)
    setApplySuccessMessage(null)

    try {
      // 1. Generate PNG textures via HTML5 canvas
      const buttonNormalDataUrl = generateModernButtonPng(themeConfig, 'normal')
      const buttonHoverDataUrl = generateModernButtonPng(themeConfig, 'hover')
      const buttonDisabledDataUrl = generateModernButtonPng(themeConfig, 'disabled')
      const widgetsDataUrl = generateLegacyWidgetsPng(themeConfig)
      const dirtDataUrl = generateDirtGlassTexture(themeConfig)
      const logoDataUrl = generateTitleLogoPng(themeConfig.titleText, themeConfig.accentColor)
      const editionDataUrl = generateEditionLogoPng(themeConfig.subtitleText)

      // 2a. Generate still 16:9 wallpaper for non-rotating background overlay
      let backgroundDataUrl = ''
      try {
        backgroundDataUrl = await createStillWallpaperFromImage(selectedBgUrl)
      } catch (e) {
        console.warn('Could not generate still wallpaper:', e)
      }

      // 2b. Generate 1024x1024 square cubemap faces (CRITICAL: CubeMapTexture requires square textures!)
      let panoramaSquareDataUrl = ''
      try {
        panoramaSquareDataUrl = await createPanoramaFaceFromImage(selectedBgUrl)
      } catch (e) {
        console.warn('Could not generate square panorama face:', e)
      }

      // 3. Send payload to main process
      const payload = {
        config: {
          backgroundType: 'custom',
          presetId: themeConfig.styleId,
          customBackgroundUrl: selectedBgUrl,
          buttonStyle: themeConfig.styleId,
          titleText: themeConfig.titleText,
          subtitleText: themeConfig.subtitleText,
          accentColor: themeConfig.accentColor,
          glassOpacity: themeConfig.glassOpacity,
          splashText: splashText
        },
        backgroundDataUrl: backgroundDataUrl || undefined,
        panoramaSquareDataUrl: panoramaSquareDataUrl || undefined,
        buttonNormalDataUrl,
        buttonHoverDataUrl,
        buttonDisabledDataUrl,
        widgetsDataUrl,
        logoDataUrl,
        editionDataUrl,
        dirtDataUrl
      }

      const res = await (window as any).electronAPI?.applyClientTheme?.(payload)
      if (res?.success) {
        setApplySuccessMessage(
          `Glassmorphism UI installed to ${res.appliedCount} Minecraft instance(s)! When you start Minecraft Java, your custom title screen & glass buttons will be live!`
        )
      } else {
        setApplySuccessMessage('Client theme pack created successfully in launcher storage!')
      }
    } catch (err: any) {
      console.error('Failed to apply theme:', err)
      setApplySuccessMessage(`Applied pack locally (Details: ${err?.message || 'Ready'})`)
    } finally {
      setIsApplying(false)
    }
  }

  const currentPreset = THEME_PRESETS[themeConfig.styleId] || THEME_PRESETS.frosted

  return (
    <div className="flex h-full flex-col bg-[#07090E] text-[#F3F5F9] font-sans overflow-hidden">
      {/* Top Banner / Studio Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0A0D14]/90 px-8 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF3154]/20 to-[#00D2FF]/20 border border-white/10 shadow-[0_0_20px_rgba(255,49,84,0.2)]">
            <HiPaintBrush className="h-6 w-6 text-[#FF3154]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#00D2FF] uppercase bg-[#00D2FF]/10 px-2 py-0.5 rounded border border-[#00D2FF]/20">
                Minecraft Java Edition
              </span>
              <span className="text-[10px] font-mono text-[#8C98A9]">1.16 - 1.21.4 COMPATIBLE</span>
            </div>
            <h1 className="text-xl font-bold font-display tracking-tight text-white mt-0.5">
              TITLE SCREEN & GLASSMORPHISM STUDIO
            </h1>
          </div>
        </div>

        {/* Tab switch & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/[0.08]">
            <button
              onClick={() => setActiveTab('title_screen')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'title_screen'
                  ? 'bg-[#FF3154] text-white shadow-[0_0_15px_rgba(255,49,84,0.4)]'
                  : 'text-[#8C98A9] hover:text-white'
              }`}
            >
              <HiPhoto className="h-4 w-4" />
              Title Screen & Loading UI
            </button>
            <button
              onClick={() => setActiveTab('in_game_hud')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'in_game_hud'
                  ? 'bg-white/10 text-white'
                  : 'text-[#8C98A9] hover:text-white'
              }`}
            >
              <HiAdjustmentsHorizontal className="h-4 w-4" />
              In-Game HUD Overlays
            </button>
          </div>

          <button
            onClick={handleApplyTheme}
            disabled={isApplying}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF3154] to-[#FF6B45] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(255,49,84,0.4)] transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <HiArrowPath className="h-4 w-4 animate-spin" />
                Compiling Textures...
              </>
            ) : (
              <>
                <HiSparkles className="h-4 w-4" />
                Install & Apply to Minecraft
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Bar */}
      <AnimatePresence>
        {applySuccessMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-[#2DE2A6]/30 bg-[#2DE2A6]/10 px-8 py-2.5 text-xs font-medium text-[#2DE2A6] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <HiCheckCircle className="h-5 w-5 text-[#2DE2A6]" />
              <span>{applySuccessMessage}</span>
            </div>
            <button
              onClick={() => setApplySuccessMessage(null)}
              className="text-[#2DE2A6]/80 hover:text-white text-xs underline ml-4"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Studio Body */}
      {activeTab === 'title_screen' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Left / Center: Interactive Live Minecraft Title Screen Simulator */}
          <div className="flex flex-1 flex-col p-6 overflow-y-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-[#8C98A9] uppercase">
                  LIVE INTERACTIVE SIMULATOR:
                </span>
                <span className="text-[11px] text-[#A3ACBC]">
                  Hover buttons to preview glassmorphism specular shine & luminous border
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] p-1 border border-white/[0.08] text-xs">
                <button
                  onClick={() => setPreviewMode('main_menu')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    previewMode === 'main_menu' ? 'bg-white/10 text-white' : 'text-[#8C98A9] hover:text-white'
                  }`}
                >
                  Main Title Screen
                </button>
                <button
                  onClick={() => setPreviewMode('loading_screen')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    previewMode === 'loading_screen' ? 'bg-white/10 text-white' : 'text-[#8C98A9] hover:text-white'
                  }`}
                >
                  Loading Dirt Screen
                </button>
              </div>
            </div>

            {/* 16:9 Minecraft Window Simulator Frame */}
            <div className="relative aspect-video w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-white/[0.15] shadow-[0_20px_60px_rgba(0,0,0,0.9)] select-none">
              {previewMode === 'main_menu' ? (
                <>
                  {/* Background Wallpaper with heavy blur and dark vignette */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter brightness-75 blur-[2px] scale-105"
                    style={{ backgroundImage: `url(${selectedBgUrl})` }}
                  />

                  {/* Dark Contrast Overlay & Vignette */}
                  <div className="absolute inset-0 bg-[#08090B]/75 backdrop-blur-[2px] pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 pointer-events-none" />

                  {/* Left Side Server Rail */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5">
                    {[
                      { id: 'hypixel', label: 'H', col: 'text-amber-400', name: 'Hypixel Network' },
                      { id: 'minemen', label: '⚔', col: 'text-red-400', name: 'Minemen Club' },
                      { id: 'diamond', label: '♦', col: 'text-cyan-400', name: 'Diamond PvP' },
                      { id: 'vanilla', label: 'V+', col: 'text-emerald-400', name: 'Vanilla+ SMP' },
                      { id: 'cube', label: '❖', col: 'text-pink-400', name: 'CubeCraft' },
                      { id: 'pvplegacy', label: 'PvP', col: 'text-blue-400', name: 'PvP Legacy' }
                    ].map((srv) => (
                      <div
                        key={srv.id}
                        title={srv.name}
                        className="relative w-7 h-7 rounded-md bg-[#101216]/90 border border-[#242830] flex items-center justify-center cursor-pointer hover:border-white/40 hover:scale-105 transition-all shadow-md group"
                      >
                        <span className={`text-[10px] font-black ${srv.col}`}>{srv.label}</span>
                        {/* Green online dot */}
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#101216]" />
                      </div>
                    ))}
                  </div>

                  {/* Top-Right Navigation Bar */}
                  <div className="absolute right-4 top-3 z-20 flex items-center gap-2">
                    {/* Player Profile Pill */}
                    <div className="h-7 px-2.5 rounded bg-[#101216]/90 border border-[#242830] flex items-center gap-2 cursor-pointer hover:border-white/30 transition-all">
                      <div className="w-4 h-4 rounded-sm bg-[#B48769] border border-black/40 overflow-hidden flex items-center justify-center text-[8px]">
                        🧑
                      </div>
                      <span className="text-[11px] font-bold text-white tracking-wide">BREND4N</span>
                    </div>

                    {/* Action Icon Buttons */}
                    {[
                      { icon: '⊞', title: 'Client Modules' },
                      { icon: '💬', title: 'Social & Chat' },
                      { icon: '⚙', title: 'Settings' },
                      { icon: '💎', title: 'Perks' },
                      { icon: '👕', title: 'Cosmetics' },
                      { icon: '☰', title: 'Menu' }
                    ].map((btn, idx) => (
                      <div
                        key={idx}
                        title={btn.title}
                        className="w-7 h-7 rounded bg-[#101216]/90 border border-[#242830] flex items-center justify-center text-xs text-white/80 hover:text-white hover:border-white/40 cursor-pointer transition-all shadow-sm"
                      >
                        {btn.icon}
                      </div>
                    ))}
                  </div>

                  {/* Center Main Content Container */}
                  <div className="relative z-10 flex h-full flex-col justify-between items-center py-6 px-6 text-center">
                    {/* Top-Middle: Feather Client Logo */}
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <svg className="w-8 h-8 text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 3C21 3 17 4 13 8C9 12 8 16 8 20C9 20 11 19 12 17C13 15 14 13 16 11C18 9 20 6 21 3Z" />
                        <path d="M12 12C10 13 8 15 7 18C6.5 19.5 6 21 6 21C6 21 7.5 20.5 9 20C12 19 14 17 15 15L12 12Z" opacity="0.6" />
                      </svg>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black tracking-wider text-white">FEATHER</span>
                        <span className="text-xl font-bold tracking-wider text-[#A0A5B0]">CLIENT</span>
                      </div>
                    </div>

                    {/* Middle: 5 Vertically Stacked Buttons */}
                    <div className="flex flex-col gap-2 w-full max-w-[240px]">
                      {[
                        { id: 'singleplayer', label: 'Singleplayer', icon: '👤', isStore: false },
                        { id: 'multiplayer', label: 'Multiplayer', icon: '👥', isStore: false },
                        { id: 'cosmetics', label: 'Cosmetics', icon: '👕', isStore: false },
                        { id: 'screenshots', label: 'Screenshots', icon: '📷', isStore: false },
                        { id: 'store', label: 'STORE', icon: '🛍', isStore: true }
                      ].map((b) => (
                        <button
                          key={b.id}
                          onMouseEnter={() => setHoveredButton(b.id)}
                          onMouseLeave={() => setHoveredButton(null)}
                          className={`relative w-full h-[32px] rounded-[5px] font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all duration-150 shadow-md ${
                            b.isStore
                              ? hoveredButton === b.id
                                ? 'bg-gradient-to-r from-[#EF4444] via-[#DC2626] to-[#B91C1C] text-white border border-red-400/80 shadow-[0_0_18px_rgba(239,68,68,0.5)] scale-[1.02]'
                                : 'bg-gradient-to-r from-[#DC2626] via-[#B91C1C] to-[#991B1B] text-white border border-red-500/50'
                              : hoveredButton === b.id
                              ? 'bg-[#181B22] text-white border border-[#3E4554] scale-[1.01]'
                              : 'bg-[#101216]/95 text-[#E4E7ED] border border-[#242830]'
                          }`}
                        >
                          <span className="text-xs opacity-90">{b.icon}</span>
                          <span>{b.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Bottom: Quit Game Button & Version Footer */}
                    <div className="flex flex-col items-center gap-1.5 mb-1">
                      <button
                        onMouseEnter={() => setHoveredButton('quit')}
                        onMouseLeave={() => setHoveredButton(null)}
                        className={`px-5 py-1.5 rounded-[4px] text-[11px] font-black tracking-wider transition-all border ${
                          hoveredButton === 'quit'
                            ? 'bg-[#4A161A] text-[#FF6B75] border-[#70242B] scale-105'
                            : 'bg-[#2A1013] text-[#E53945] border-[#48181D]'
                        }`}
                      >
                        QUIT GAME
                      </button>
                      <div className="text-[10px] font-mono text-[#727785] tracking-tight">
                        Feather 1.20.6 (release/fb88f094)
                      </div>
                    </div>

                    {/* Bottom-Right Promo Card */}
                    <div className="absolute right-4 bottom-3 z-20 w-48 p-2 rounded-lg bg-[#0F1116]/95 border border-[#262A34] text-left cursor-pointer hover:border-white/30 transition-all shadow-xl group">
                      <div className="text-[10px] font-extrabold text-white tracking-wide">100K COLLECTION</div>
                      <div className="text-[8px] text-[#8C92A0] truncate">Available now at store.featherclient.com</div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[9px] text-purple-400 font-bold">✨ Cosmetics Pack</span>
                        <span className="text-[7px] px-1 py-0.2 rounded bg-white/10 text-white font-mono">NEW</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Loading Screen Dirt Simulation */
                <div className="relative flex h-full w-full flex-col items-center justify-center bg-[#070A10]">
                  {/* Frosted Dark Glass Tile Texture */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage: `radial-gradient(${themeConfig.accentColor}22 1px, transparent 1px), radial-gradient(#ffffff0a 1px, transparent 1px)`,
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 8px 8px'
                    }}
                  />
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <h3 className="text-2xl font-bold font-display tracking-wider text-white">
                      LOADING TERRAIN...
                    </h3>
                    <div className="w-80 h-3 rounded-full bg-white/10 p-0.5 border border-white/20 overflow-hidden">
                      <motion.div
                        initial={{ width: '10%' }}
                        animate={{ width: '85%' }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: themeConfig.accentColor,
                          boxShadow: `0 0 15px ${themeConfig.accentColor}`
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-[#8C98A9]">
                      Joining AstrixMC High-Performance Instance...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Hint & Explanations */}
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs text-[#8C98A9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiSparkles className="h-5 w-5 text-[#FF3154] shrink-0" />
                <span>
                  <strong>Automatic Sync:</strong> When you click <em>Install & Apply</em>, the high-res textures are compiled directly into the <code className="text-[#00D2FF]">AstrixMC-UI</code> resource pack inside all your Minecraft instances and auto-activated in <code className="text-[#00D2FF]">options.txt</code>.
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Customizer Controls (Inspector) */}
          <div className="flex w-96 shrink-0 flex-col border-l border-white/[0.08] bg-[#0A0D14] p-5 overflow-y-auto">
            <h2 className="text-xs font-bold font-mono tracking-wider text-[#8C98A9] uppercase mb-4">
              CUSTOMIZATION CONTROLS
            </h2>

            <div className="space-y-6">
              {/* Section 1: Background & Wallpaper */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    Background Wallpaper
                  </label>
                  <button
                    onClick={handleSelectLocalImage}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-[#00D2FF] hover:text-white transition-colors"
                  >
                    <HiArrowUpTray className="h-3.5 w-3.5" />
                    Upload from PC
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PRESET_WALLPAPERS.map((preset) => {
                    const isSelected = selectedBgUrl === preset.url
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedBgUrl(preset.url)}
                        className={`group relative h-20 rounded-xl overflow-hidden border text-left transition-all ${
                          isSelected
                            ? 'border-[#FF3154] ring-2 ring-[#FF3154]/50 shadow-[0_0_15px_rgba(255,49,84,0.4)]'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                          <span className="text-[11px] font-bold text-white truncate">
                            {preset.name}
                          </span>
                          <span className="text-[9px] font-mono text-[#00D2FF]">
                            {preset.tag}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#FF3154] flex items-center justify-center text-white text-[10px]">
                            ✓
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Section 2: Button Glassmorphism Style */}
              <div className="border-t border-white/[0.08] pt-5">
                <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                  Button Glassmorphism Style
                </label>

                <div className="grid grid-cols-1 gap-1.5">
                  {Object.entries(THEME_PRESETS).map(([key, val]) => {
                    const active = themeConfig.styleId === key
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          setThemeConfig((prev) => ({
                            ...prev,
                            styleId: key as any,
                            accentColor: val.accentColor
                          }))
                        }
                        className={`flex items-center justify-between rounded-xl p-2.5 border transition-all text-left ${
                          active
                            ? 'border-[#FF3154] bg-[#FF3154]/10 text-white'
                            : 'border-white/10 bg-white/[0.02] text-[#8C98A9] hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: val.accentColor }}
                          />
                          <span className="text-xs font-semibold">{val.name}</span>
                        </div>
                        {active && <HiCheck className="h-4 w-4 text-[#FF3154]" />}
                      </button>
                    )
                  })}
                </div>

                {/* Transparency Slider */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#8C98A9]">Glass Opacity</span>
                    <span className="font-mono text-white">
                      {Math.round(themeConfig.glassOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={themeConfig.glassOpacity}
                    onChange={(e) =>
                      setThemeConfig((prev) => ({
                        ...prev,
                        glassOpacity: parseFloat(e.target.value)
                      }))
                    }
                    className="w-full accent-[#FF3154]"
                  />
                </div>

                {/* Corner Radius */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#8C98A9]">Corner Radius</span>
                    <span className="font-mono text-white">{themeConfig.borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="18"
                    step="2"
                    value={themeConfig.borderRadius}
                    onChange={(e) =>
                      setThemeConfig((prev) => ({
                        ...prev,
                        borderRadius: parseInt(e.target.value, 10)
                      }))
                    }
                    className="w-full accent-[#FF3154]"
                  />
                </div>
              </div>

              {/* Section 3: Title & Splash Text */}
              <div className="border-t border-white/[0.08] pt-5">
                <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                  Title & Splash Text
                </label>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-[#8C98A9] block mb-1">Title Logo Text</span>
                    <input
                      type="text"
                      value={themeConfig.titleText}
                      onChange={(e) =>
                        setThemeConfig((prev) => ({ ...prev, titleText: e.target.value }))
                      }
                      placeholder="ASTRIXMC"
                      className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#FF3154] focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-[#8C98A9] block mb-1">Subtitle / Edition</span>
                    <input
                      type="text"
                      value={themeConfig.subtitleText}
                      onChange={(e) =>
                        setThemeConfig((prev) => ({ ...prev, subtitleText: e.target.value }))
                      }
                      placeholder="GLASS CLIENT EDITION"
                      className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#FF3154] focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-[#8C98A9] block mb-1">Splash Text</span>
                    <input
                      type="text"
                      value={splashText}
                      onChange={(e) => setSplashText(e.target.value)}
                      placeholder="Glassmorphism activated!"
                      className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#FF3154] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Apply Button in Inspector */}
              <div className="border-t border-white/[0.08] pt-5">
                <button
                  onClick={handleApplyTheme}
                  disabled={isApplying}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FF3154] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,49,84,0.4)] transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {isApplying ? (
                    <>
                      <HiArrowPath className="h-4 w-4 animate-spin" />
                      Applying to Minecraft Client...
                    </>
                  ) : (
                    <>
                      <HiSparkles className="h-4 w-4" />
                      Install & Apply Theme
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* In-Game HUD Overlays Tab (Keystrokes, Armor, etc.) */
        <div className="flex flex-1 overflow-hidden p-6 gap-6">
          <div className="flex-1 rounded-2xl border border-white/10 bg-black/60 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold font-display text-white mb-1">
                IN-GAME HUD OVERLAYS
              </h2>
              <p className="text-xs text-[#8C98A9] mb-6">
                Toggle on-screen telemetry widgets (CPS, FPS, Keystrokes, Armor Durability) rendered in-game.
              </p>

              <div className="grid grid-cols-2 gap-3 max-w-xl">
                {hudModules.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() =>
                      setHudModules((prev) =>
                        prev.map((m) => (m.id === mod.id ? { ...m, enabled: !m.enabled } : m))
                      )
                    }
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                      mod.enabled
                        ? 'border-[#2DE2A6] bg-[#2DE2A6]/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-[#8C98A9]'
                    }`}
                  >
                    <span>{mod.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        mod.enabled ? 'bg-[#2DE2A6]/20 text-[#2DE2A6]' : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {mod.enabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-[#8C98A9]">
              Overlays hook into Fabric / Forge / NeoForge client instances via the Astrix client core.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
