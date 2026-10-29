import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  HiArrowDownTray,
  HiCheckCircle,
  HiChevronDown,
  HiExclamationCircle,
  HiMagnifyingGlass,
  HiPuzzlePiece,
  HiSparkles,
  HiPhoto,
  HiArchiveBox,
  HiCheck,
  HiXMark,
  HiFolderOpen,
  HiArrowRight,
  HiArrowsUpDown,
  HiCube
} from 'react-icons/hi2'
import { useInstances } from '../hooks/useInstances'
import { playSound } from '../utils/sound'
import { cn } from '../lib/cn'
import type { ModSearchResult } from '../../shared/types/mod'

type CategoryTab = 'mod' | 'shader' | 'resourcepack' | 'modpack'

interface QuickTag {
  label: string
  query: string
}

const QUICK_TAGS: Record<CategoryTab, QuickTag[]> = {
  mod: [
    { label: 'All Popular', query: '' },
    { label: '⚡ FPS & Optimization', query: 'sodium' },
    { label: '✨ Shaders (Iris)', query: 'iris' },
    { label: '⚔️ PvP & Combat', query: 'pvp' },
    { label: '🗺️ MiniMap & Radar', query: 'minimap' },
    { label: '🛠️ Utility & HUD', query: 'hud' },
    { label: '🎒 Inventory / QoL', query: 'inventory' },
    { label: '🌲 Biomes & World', query: 'biome' }
  ],
  shader: [
    { label: 'All Shaders', query: '' },
    { label: '🌟 Complementary', query: 'complementary' },
    { label: '🔮 BSL Shaders', query: 'bsl' },
    { label: '🚀 Potato / Low-End', query: 'potato' },
    { label: '💎 Ultra Realistic', query: 'realistic' },
    { label: '🌈 Vibrant & Fantasy', query: 'vibrant' }
  ],
  resourcepack: [
    { label: 'All Packs', query: '' },
    { label: '🗡️ PvP 16x', query: 'pvp' },
    { label: '🧱 Faithful 32x', query: 'faithful' },
    { label: '🦴 Bare Bones', query: 'bare bones' },
    { label: '🏃 Fresh Animations', query: 'fresh animations' },
    { label: '🌿 Stay True', query: 'stay true' }
  ],
  modpack: [
    { label: 'All Modpacks', query: '' },
    { label: '⚡ Fabulously Optimized', query: 'fabulously optimized' },
    { label: '🚀 Simply Optimized', query: 'simply optimized' },
    { label: '🌲 Better Minecraft', query: 'better minecraft' },
    { label: '🏰 Medieval & RPG', query: 'medieval' }
  ]
}

const GAME_VERSIONS = [
  'All Versions',
  '1.21.4',
  '1.21.1',
  '1.20.4',
  '1.20.1',
  '1.19.4',
  '1.18.2',
  '1.16.5',
  '1.12.2',
  '1.8.9'
]

const MOD_LOADERS = ['All Loaders', 'Fabric', 'Forge', 'NeoForge', 'Quilt']

export default function ModBrowserPage() {
  const { instances, activeInstance, setActiveInstance, openInstanceFolder } = useInstances()
  const navigate = useNavigate()
  const location = useLocation()

  // Initial tab from route state or default to 'mod'
  const [activeTab, setActiveTab] = useState<CategoryTab>(() => {
    const passedTab = (location.state as any)?.tab
    if (passedTab === 'shader' || passedTab === 'resourcepack' || passedTab === 'modpack') {
      return passedTab
    }
    return 'mod'
  })

  const [query, setQuery] = useState('')
  const [gameVersion, setGameVersion] = useState(GAME_VERSIONS[0])
  const [loader, setLoader] = useState(MOD_LOADERS[0])
  const [results, setResults] = useState<ModSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [installingModId, setInstallingModId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [installedModNames, setInstalledModNames] = useState<Set<string>>(new Set())

  // Refresh list of installed mods in the active target instance
  const refreshInstalledMods = useCallback(async () => {
    const targetInst = activeInstance || instances[0]
    if (!targetInst || !window.electronAPI?.getInstalledMods) return
    try {
      const list = await window.electronAPI.getInstalledMods(targetInst.id)
      if (Array.isArray(list)) {
        const names = new Set<string>()
        for (const m of list) {
          if (m.name) names.add(m.name.toLowerCase().trim())
          if (m.id) names.add(m.id.toLowerCase().trim())
          if (m.fileName) names.add(m.fileName.toLowerCase().trim())
        }
        setInstalledModNames(names)
      }
    } catch {
      // Ignore if directory not created yet
    }
  }, [activeInstance, instances])

  useEffect(() => {
    refreshInstalledMods()
  }, [refreshInstalledMods])

  // Sync game version and loader filter with active instance when mounted or changed
  useEffect(() => {
    if (activeInstance) {
      if (activeInstance.mcVersion && GAME_VERSIONS.includes(activeInstance.mcVersion)) {
        setGameVersion(activeInstance.mcVersion)
      }
      if (activeInstance.modLoader?.type) {
        const lType = activeInstance.modLoader.type.toLowerCase()
        const match = MOD_LOADERS.find((l) => l.toLowerCase() === lType)
        if (match) setLoader(match)
      }
    }
  }, [activeInstance])

  const performSearch = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!window.electronAPI?.searchMods) return
      const hits = await window.electronAPI.searchMods({
        query: query.trim(),
        version: gameVersion === 'All Versions' ? undefined : gameVersion,
        loader: loader === 'All Loaders' ? undefined : loader.toLowerCase(),
        projectType: activeTab
      })
      setResults(Array.isArray(hits) ? hits : [])
    } catch (err) {
      console.error('Failed to search mods:', err)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query, gameVersion, loader, activeTab])

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch()
    }, 280)
    return () => clearTimeout(timer)
  }, [performSearch])

  // Quick folder opening directly into instance subdirectory
  const handleOpenFolder = () => {
    const targetInst = activeInstance || instances[0]
    if (!targetInst) return
    playSound('click')
    const subfolder =
      activeTab === 'shader'
        ? 'shaderpacks'
        : activeTab === 'resourcepack'
        ? 'resourcepacks'
        : activeTab === 'modpack'
        ? ''
        : 'mods'

    openInstanceFolder(targetInst.id, subfolder)
    setNotification({
      type: 'success',
      message: `Opened "${subfolder || 'game directory'}" folder in File Explorer.`
    })
  }

  // Helper to test if a card mod is installed
  const isItemInstalled = useCallback(
    (item: ModSearchResult) => {
      const name = (item.name || '').toLowerCase().trim()
      const id = (item.id || '').toLowerCase().trim()
      if (installedModNames.has(name) || installedModNames.has(id)) return true
      for (const installed of installedModNames) {
        if (installed.includes(name) || name.includes(installed)) return true
      }
      return false
    },
    [installedModNames]
  )

  const handleInstallMod = async (mod: ModSearchResult) => {
    const targetInst = activeInstance || instances[0]
    if (!targetInst) {
      playSound('error')
      setNotification({ type: 'error', message: 'Please create or select an instance first' })
      return
    }

    const instLoader = targetInst.modLoader?.type || 'fabric'
    const instVersion = targetInst.mcVersion || '1.20.4'

    setInstallingModId(mod.id)
    playSound('click')

    try {
      // 1. Query versions matching instance loader and version
      let versions = await window.electronAPI?.getModVersions(
        mod.source,
        mod.id,
        activeTab === 'shader' || activeTab === 'resourcepack' ? undefined : instLoader,
        instVersion
      )

      // Fallback: query without strict version filter to check compatibility manually
      if (!Array.isArray(versions) || versions.length === 0) {
        const allVersions = await window.electronAPI?.getModVersions(mod.source, mod.id)
        if (Array.isArray(allVersions)) {
          versions = allVersions.filter(
            (v: any) =>
              (!v.game_versions || v.game_versions.length === 0 || v.game_versions.includes(instVersion)) &&
              (!v.loaders || v.loaders.length === 0 || v.loaders.includes(instLoader.toLowerCase()))
          )
        }
      }

      if (Array.isArray(versions) && versions.length > 0 && versions[0].files?.length > 0) {
        const matchingVer = versions[0]
        const file = matchingVer.files.find((f: any) => f.primary) || matchingVer.files[0]
        const folderType =
          activeTab === 'shader'
            ? 'shaderpacks'
            : activeTab === 'resourcepack'
            ? 'resourcepacks'
            : activeTab === 'modpack'
            ? 'modpack'
            : 'mods'

        const installRes = await (window.electronAPI as any)?.installMod({
          instanceId: targetInst.id,
          downloadUrl: file.url,
          fileName: file.filename,
          folderType,
          dependencies: matchingVer.dependencies
        })

        if (installRes?.success) {
          playSound('success')
          refreshInstalledMods()

          const locationTip =
            folderType === 'shaderpacks'
              ? 'In-game: Video Settings > Shader Packs to select.'
              : folderType === 'resourcepacks'
              ? 'In-game: Options > Resource Packs to activate.'
              : folderType === 'modpack'
              ? 'Modpack installed directly into instance.'
              : 'In-game: Click Mods button in title screen to configure.'

          setNotification({
            type: 'success',
            message: `Installed "${mod.name}" into "${targetInst.name}"! (${locationTip})`
          })
        } else {
          playSound('error')
          setNotification({
            type: 'error',
            message: installRes?.error || 'Failed to install file'
          })
        }
      } else {
        playSound('error')
        setNotification({
          type: 'error',
          message: `"${mod.name}" does not have a direct compatible file for Minecraft ${instVersion} (${instLoader}).`
        })
      }
    } catch (err) {
      playSound('error')
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error installing mod'
      })
    } finally {
      setInstallingModId(null)
    }
  }

  const handleCardClick = (mod: ModSearchResult) => {
    playSound('click')
    navigate(`/mods/${mod.source}/${mod.id}`)
  }

  const handleQuickTagClick = (tagQuery: string) => {
    playSound('click')
    setQuery(tagQuery)
  }

  return (
    <div className="relative flex min-h-full w-full max-w-full flex-col overflow-x-hidden bg-transparent select-none font-sans text-slate-100 pb-36">
      {/* ── ATMOSPHERIC GLOW AURA ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/4 h-[500px] w-[600px] rounded-full blur-[140px] opacity-35 transition-all"
          style={{ background: 'rgba(168, 85, 247, 0.12)' }}
        />
        <div
          className="absolute top-1/3 -right-28 h-[450px] w-[550px] rounded-full blur-[130px] opacity-30 transition-all"
          style={{ background: 'rgba(6, 182, 212, 0.10)' }}
        />
      </div>

      <div className="relative z-10 w-full px-5 md:px-8 pt-6 pb-4">
        {/* ── TOP HEADER & INSTANCE CONTROLS ── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight drop-shadow-sm flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <HiPuzzlePiece size={22} />
                </span>
                Mods &amp; <span className="text-purple-400">Addons</span>
              </h1>
              <span className="rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-1 text-xs font-mono font-black text-purple-300 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                1-CLICK INSTALL
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Explore thousands of verified Mods, Shaders, Resource Packs &amp; Modpacks from Modrinth.
            </p>
          </div>

          {/* Target Instance Bar & Quick Open Folder */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {/* Instance Picker Pill */}
            {instances.length > 0 && (
              <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0B0F19]/80 px-3.5 py-2 backdrop-blur-xl shadow-lg">
                <span className="text-[11px] font-mono font-bold text-slate-400">Target:</span>
                <select
                  value={activeInstance?.id || instances[0]?.id}
                  onChange={(e) => {
                    const inst = instances.find((i) => i.id === e.target.value)
                    if (inst) {
                      playSound('click')
                      setActiveInstance(inst)
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-emerald-400 outline-none cursor-pointer pr-1 font-mono"
                >
                  {instances.map((inst) => (
                    <option key={inst.id} value={inst.id} className="bg-[#0B0F19] text-white">
                      {inst.name} ({inst.mcVersion})
                    </option>
                  ))}
                </select>
                <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-purple-300 uppercase">
                  {activeInstance?.modLoader?.type || 'Fabric'}
                </span>
              </div>
            )}

            {/* Open Folder Quick Button */}
            <button
              type="button"
              onClick={handleOpenFolder}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0B0F19]/80 hover:bg-white/10 hover:border-purple-500/40 px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md active:scale-95 backdrop-blur-xl"
              title="Open folder in File Explorer"
            >
              <HiFolderOpen size={16} className="text-purple-400" />
              <span>
                Open {activeTab === 'shader' ? 'Shaders' : activeTab === 'resourcepack' ? 'Packs' : 'Mods'} Folder
              </span>
            </button>
          </div>
        </div>

        {/* ── 4-TAB NAVIGATION SWITCHER ── */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#0A0D15]/90 p-1.5 shadow-2xl backdrop-blur-xl mb-4">
          <button
            type="button"
            onClick={() => {
              playSound('click')
              setActiveTab('mod')
              setQuery('')
            }}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              activeTab === 'mod'
                ? 'bg-purple-600 text-white font-black shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <HiPuzzlePiece size={16} />
            <span>Mods</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click')
              setActiveTab('shader')
              setQuery('')
            }}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              activeTab === 'shader'
                ? 'bg-cyan-600 text-white font-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <HiSparkles size={16} />
            <span>Shaders</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click')
              setActiveTab('resourcepack')
              setQuery('')
            }}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              activeTab === 'resourcepack'
                ? 'bg-amber-600 text-white font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <HiPhoto size={16} />
            <span>Resource Packs</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click')
              setActiveTab('modpack')
              setQuery('')
            }}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              activeTab === 'modpack'
                ? 'bg-emerald-600 text-white font-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <HiArchiveBox size={16} />
            <span>Modpacks</span>
          </button>
        </div>

        {/* ── QUICK TAGS FILTER CHIPS ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {QUICK_TAGS[activeTab].map((tag, idx) => {
            const isSelected = query.toLowerCase() === tag.query.toLowerCase()
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickTagClick(tag.query)}
                className={cn(
                  'whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-bold transition-all backdrop-blur-md active:scale-95',
                  isSelected
                    ? 'border-purple-500/60 bg-purple-500/20 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'border-white/[0.08] bg-[#0A0D15]/80 text-slate-400 hover:text-white hover:border-white/20'
                )}
              >
                {tag.label}
              </button>
            )
          })}
        </div>

        {/* ── SEARCH & FILTER CONTROLS BAR ── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search Input */}
          <div className="relative min-w-[260px] flex-1">
            <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${activeTab === 'shader' ? 'Shaders (e.g. Complementary, BSL)...' : activeTab === 'resourcepack' ? 'Resource Packs (e.g. Bare Bones, Faithful)...' : activeTab === 'modpack' ? 'Modpacks (e.g. Fabulously Optimized)...' : 'Mods (e.g. Sodium, Iris, JEI, AppleSkin)...'}`}
              className="w-full rounded-2xl border border-white/10 bg-[#0A0D15]/90 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 backdrop-blur-md focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <HiXMark size={14} />
              </button>
            )}
          </div>

          {/* Minecraft Version Selector */}
          <div className="relative">
            <select
              value={gameVersion}
              onChange={(e) => {
                playSound('click')
                setGameVersion(e.target.value)
              }}
              className="appearance-none rounded-2xl border border-white/10 bg-[#0A0D15]/90 py-2.5 pl-3.5 pr-8 text-xs font-mono font-bold text-slate-200 backdrop-blur-md focus:border-purple-500 focus:outline-none shadow-md"
            >
              {GAME_VERSIONS.map((v) => (
                <option key={v} value={v} className="bg-[#0B0F19] text-white">
                  {v}
                </option>
              ))}
            </select>
            <HiChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>

          {/* Mod Loader Selector (relevant for mods and modpacks) */}
          {(activeTab === 'mod' || activeTab === 'modpack') && (
            <div className="relative">
              <select
                value={loader}
                onChange={(e) => {
                  playSound('click')
                  setLoader(e.target.value)
                }}
                className="appearance-none rounded-2xl border border-white/10 bg-[#0A0D15]/90 py-2.5 pl-3.5 pr-8 text-xs font-mono font-bold text-slate-200 backdrop-blur-md focus:border-purple-500 focus:outline-none shadow-md"
              >
                {MOD_LOADERS.map((l) => (
                  <option key={l} value={l} className="bg-[#0B0F19] text-white">
                    {l}
                  </option>
                ))}
              </select>
              <HiChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            </div>
          )}
        </div>

        {/* ── NOTIFICATION TOAST ── */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={cn(
                'mb-6 flex items-center justify-between gap-3 rounded-2xl p-4 text-xs font-bold shadow-xl backdrop-blur-md border',
                notification.type === 'success'
                  ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-300'
                  : 'border-rose-500/40 bg-rose-950/80 text-rose-300'
              )}
            >
              <div className="flex items-center gap-2.5">
                {notification.type === 'success' ? (
                  <HiCheckCircle size={18} className="text-emerald-400 shrink-0" />
                ) : (
                  <HiExclamationCircle size={18} className="text-rose-400 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-slate-400 hover:text-white"
              >
                <HiXMark size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MODRINTH CONTENT GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading && results.length === 0 ? (
            <div className="col-span-full flex h-60 items-center justify-center">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                <span>Searching Modrinth {activeTab}s...</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="col-span-full flex h-60 flex-col items-center justify-center text-center text-xs text-slate-400 rounded-3xl border border-white/10 bg-[#0A0D15]/80 p-8 shadow-xl">
              <HiMagnifyingGlass size={36} className="text-purple-400/50 mb-2" />
              <h3 className="text-sm font-bold text-white">No {activeTab}s found</h3>
              <p className="mt-1 text-slate-400 max-w-sm">
                No matching results found for &quot;{query}&quot;. Try clearing your query or switching Minecraft version.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-3 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-slate-200"
              >
                Reset Search
              </button>
            </div>
          ) : (
            results.map((item) => {
              const isInstalled = isItemInstalled(item)
              const isInstallingThis = installingModId === item.id

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleCardClick(item)}
                  className="group relative flex gap-4 rounded-3xl border border-white/[0.08] bg-[#0A0D15]/90 p-4 shadow-xl backdrop-blur-xl transition-all hover:border-purple-500/50 hover:bg-[#0E121F] cursor-pointer"
                >
                  {/* Mod Icon */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#07090E] shadow-md flex items-center justify-center">
                    {item.iconUrl ? (
                      <img
                        src={item.iconUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl bg-gradient-to-br from-purple-700 to-indigo-900 text-white font-bold">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Mod Details */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-black text-white group-hover:text-purple-300 transition-colors font-display">
                          {item.name}
                        </h3>
                        <span className="shrink-0 text-[10px] font-mono text-slate-400">
                          {item.downloads.toLocaleString()} dl
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono truncate">
                        <span>By {item.author}</span>
                        <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                          Details →
                        </span>
                      </div>

                      {/* Install / Installed State Button */}
                      <div onClick={(e) => e.stopPropagation()}>
                        {isInstalled ? (
                          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 shadow-sm">
                            <HiCheck size={14} className="text-emerald-400" />
                            <span>Installed</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isInstallingThis}
                            onClick={() => handleInstallMod(item)}
                            className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-3.5 py-1.5 text-xs font-black text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isInstallingThis ? (
                              <>
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Installing...</span>
                              </>
                            ) : (
                              <>
                                <HiArrowDownTray size={14} />
                                <span>Install</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
