import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiCheck,
  HiSparkles,
  HiMagnifyingGlass,
  HiBolt,
  HiCube,
  HiAdjustmentsHorizontal,
  HiArrowPath,
  HiCheckCircle,
  HiXMark,
  HiSquares2X2,
  HiListBullet
} from 'react-icons/hi2'
import { useInstances } from '../../hooks/useInstances'
import { playSound } from '../../utils/sound'
import type { MinecraftVersion } from '../../../shared/types/version'

// Preset Artwork Covers
import tinyTakeoverCover from '../../assets/mc_tiny_takeover.jpg'
import trickyTrialsCover from '../../assets/mc_tricky_trials.jpg'
import bountifulCover from '../../assets/mc_bountiful.jpg'
import landscapeCover from '../../assets/landscape.jpg'
import cherryBiomeCover from '../../assets/mc_cherry_biome.jpg'
import villageCover from '../../assets/mc_village_sunset.jpg'
import forgeCover from '../../assets/mc_forge_cover.jpg'

interface CreateInstanceModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate?: (data: {
    name: string
    mcVersion: string
    icon: string
    modLoader?: { type: 'fabric' | 'forge' | 'neoforge' | 'quilt'; version: string }
    memoryMin?: string
    memoryMax?: string
    installFpsPack?: boolean
  }) => Promise<void>
}

interface VersionPreset {
  id: string
  name: string
  version: string
  subtitle: string
  tag: string
  cover: string
  loader: 'fabric' | 'forge' | 'neoforge' | 'quilt' | 'vanilla'
}

// Curated Popular Preset Versions with Artwork
const POPULAR_PRESETS: VersionPreset[] = [
  {
    id: '26.3',
    name: 'Minecraft 26.3',
    version: '26.3',
    subtitle: 'Astrix Next-Gen HUD',
    tag: 'Latest Client',
    cover: tinyTakeoverCover,
    loader: 'fabric'
  },
  {
    id: '1.21.4',
    name: 'Minecraft 1.21.4',
    version: '1.21.4',
    subtitle: 'Tricky Trials Latest',
    tag: 'Popular',
    cover: trickyTrialsCover,
    loader: 'fabric'
  },
  {
    id: '1.21.1',
    name: 'Minecraft 1.21.1',
    version: '1.21.1',
    subtitle: 'High Compatibility Mods',
    tag: 'Recommended',
    cover: cherryBiomeCover,
    loader: 'fabric'
  },
  {
    id: '1.20.4',
    name: 'Minecraft 1.20.4',
    version: '1.20.4',
    subtitle: 'Trails & Tales Stable',
    tag: 'Rock Solid',
    cover: landscapeCover,
    loader: 'fabric'
  },
  {
    id: '1.20.1',
    name: 'Minecraft 1.20.1',
    version: '1.20.1',
    subtitle: 'Huge Mod Ecosystem',
    tag: 'Modded King',
    cover: villageCover,
    loader: 'fabric'
  },
  {
    id: '1.16.5',
    name: 'Minecraft 1.16.5',
    version: '1.16.5',
    subtitle: 'Nether Update Classics',
    tag: 'Legacy Modded',
    cover: forgeCover,
    loader: 'forge'
  },
  {
    id: '1.8.9',
    name: 'Minecraft 1.8.9',
    version: '1.8.9',
    subtitle: 'PvP & Hypixel Benchmark',
    tag: 'Best for PvP',
    cover: bountifulCover,
    loader: 'forge'
  },
  {
    id: '1.7.10',
    name: 'Minecraft 1.7.10',
    version: '1.7.10',
    subtitle: 'Classic Golden Era Mods',
    tag: 'Nostalgia',
    cover: forgeCover,
    loader: 'forge'
  }
]

// Fallback all releases when offline
const FALLBACK_ALL_RELEASES = [
  '26.3', '26.2', '1.21.4', '1.21.3', '1.21.2', '1.21.1', '1.21',
  '1.20.6', '1.20.4', '1.20.3', '1.20.2', '1.20.1', '1.20',
  '1.19.4', '1.19.3', '1.19.2', '1.19.1', '1.19',
  '1.18.2', '1.18.1', '1.18', '1.17.1', '1.17',
  '1.16.5', '1.16.4', '1.16.3', '1.16.2', '1.16.1',
  '1.15.2', '1.14.4', '1.13.2', '1.12.2', '1.11.2',
  '1.10.2', '1.9.4', '1.8.9', '1.8.8', '1.7.10'
]

export default function CreateInstanceModal({
  isOpen,
  onClose,
  onCreate
}: CreateInstanceModalProps) {
  const { createInstance } = useInstances()

  // Tab mode: 'presets' (Curated Poster Cards) or 'all' (Searchable Full List)
  const [browseMode, setBrowseMode] = useState<'presets' | 'all'>('presets')

  // Selected Version Info
  const [selectedVersion, setSelectedVersion] = useState<string>(POPULAR_PRESETS[0].version)
  const [profileName, setProfileName] = useState<string>('Astrix 26.3')
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState<boolean>(false)

  // Loader & Options
  const [loaderType, setLoaderType] = useState<'fabric' | 'forge' | 'neoforge' | 'quilt' | 'vanilla'>('fabric')
  const [installFpsPack, setInstallFpsPack] = useState<boolean>(true)
  const [allocatedRamGb, setAllocatedRamGb] = useState<number>(4.0)
  const [isCreating, setIsCreating] = useState<boolean>(false)

  // Remote Mojang Versions
  const [fetchedVersions, setFetchedVersions] = useState<MinecraftVersion[]>([])
  const [versionSearch, setVersionSearch] = useState<string>('')
  const [versionTypeFilter, setVersionTypeFilter] = useState<'all' | 'release' | 'snapshot'>('release')

  // Fetch all Mojang versions dynamically on mount
  useEffect(() => {
    let active = true
    if (isOpen && window.electronAPI?.getVersions) {
      window.electronAPI
        .getVersions()
        .then((data: any) => {
          if (active && data?.versions) {
            setFetchedVersions(data.versions)
          }
        })
        .catch((err: unknown) => {
          console.warn('[CreateInstanceModal] Could not fetch remote versions:', err)
        })
    }
    return () => {
      active = false
    }
  }, [isOpen])

  // Reset or preset default on open
  useEffect(() => {
    if (isOpen) {
      setSelectedVersion(POPULAR_PRESETS[0].version)
      setProfileName('Astrix 26.3 (Fabric)')
      setIsNameManuallyEdited(false)
      setLoaderType('fabric')
      setInstallFpsPack(true)
    }
  }, [isOpen])

  // Auto-update profile name when version or loader changes unless user manually edited it
  const updateAutoProfileName = (ver: string, loader: string) => {
    if (!isNameManuallyEdited) {
      const loaderLabel = loader === 'vanilla' ? 'Vanilla' : loader.charAt(0).toUpperCase() + loader.slice(1)
      setProfileName(`Astrix ${ver} (${loaderLabel})`)
    }
  }

  // Handle Preset Selection
  const handleSelectPreset = (preset: VersionPreset) => {
    playSound('tab')
    setSelectedVersion(preset.version)
    setLoaderType(preset.loader)
    updateAutoProfileName(preset.version, preset.loader)
  }

  // Handle Custom Version Selection
  const handleSelectCustomVersion = (ver: string) => {
    playSound('tab')
    setSelectedVersion(ver)
    const isLegacy = ver === '1.8.9' || ver === '1.7.10' || ver.startsWith('1.12')
    const recommendedLoader = isLegacy ? 'forge' : 'fabric'
    setLoaderType(recommendedLoader)
    updateAutoProfileName(ver, recommendedLoader)
  }

  // Filtered versions for "All Versions" browser
  const filteredAllVersions = useMemo(() => {
    let list: Array<{ id: string; type: string; releaseTime?: string }> = []

    if (fetchedVersions.length > 0) {
      list = fetchedVersions
    } else {
      list = FALLBACK_ALL_RELEASES.map((v) => ({ id: v, type: 'release' }))
    }

    return list.filter((v) => {
      if (versionTypeFilter !== 'all' && v.type !== versionTypeFilter) {
        return false
      }
      if (versionSearch.trim()) {
        return v.id.toLowerCase().includes(versionSearch.toLowerCase().trim())
      }
      return true
    })
  }, [fetchedVersions, versionTypeFilter, versionSearch])

  // Submit Handler
  const handleCreate = async () => {
    if (isCreating) return
    playSound('click')
    setIsCreating(true)

    try {
      const finalName = profileName.trim() || `Minecraft ${selectedVersion}`
      const ramMaxStr = String(Math.max(2, Math.min(8, Math.round(allocatedRamGb))))

      const payload = {
        name: finalName,
        mcVersion: selectedVersion,
        icon: 'grass',
        modLoader: loaderType === 'vanilla' ? undefined : ({ type: loaderType, version: 'latest' } as any),
        memoryMin: '2',
        memoryMax: ramMaxStr,
        installFpsPack: installFpsPack && loaderType !== 'vanilla'
      }

      if (onCreate) {
        await onCreate(payload)
      } else {
        const newInst = await createInstance(payload)
        if (newInst && payload.installFpsPack && window.electronAPI?.installMod) {
          window.electronAPI.installMod({ instanceId: newInst.id, isFpsPack: true }).catch(console.error)
        }
      }

      playSound('success')
      onClose()
    } catch (err) {
      console.error('[CreateInstanceModal] Failed to create profile:', err)
      onClose()
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-2xl select-none font-sans overflow-y-auto">
      {/* Background Cybernetic Ambient Glows */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-amber-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-cyan-500/15 blur-[140px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F19]/95 p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
      >
        {/* Top Header Bar with Close Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-mono font-black uppercase tracking-wider text-amber-400">
              <HiBolt className="h-3 w-3 animate-pulse text-amber-400" />
              <span>Astrix Profile Initializer</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white font-display tracking-tight flex items-center gap-3">
              <span>Create Your Profile</span>
              <span className="text-xs font-mono font-normal text-slate-400 border border-white/10 rounded-md px-2 py-0.5 bg-white/5">
                v{selectedVersion}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select any official release or curated preset with pre-tuned FPS boost.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => {
                  playSound('tab')
                  setBrowseMode('presets')
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold font-mono transition-all ${
                  browseMode === 'presets'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HiSquares2X2 className="h-4 w-4" />
                <span>Featured Presets</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound('tab')
                  setBrowseMode('all')
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold font-mono transition-all ${
                  browseMode === 'all'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HiListBullet className="h-4 w-4" />
                <span>All Versions ({filteredAllVersions.length})</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                playSound('click')
                onClose()
              }}
              title="Close"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:bg-rose-600 hover:text-white hover:border-rose-500 transition-all"
            >
              <HiXMark size={18} />
            </button>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Version Chooser (7 cols) */}
          <div className="lg:col-span-7 flex flex-col min-h-[460px]">
            {browseMode === 'presets' ? (
              /* PRESETS VIEW WITH GORGEOUS ARTWORK POSTERS */
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Select Curated Preset
                  </p>
                  <span className="text-[11px] font-mono text-amber-400/90">
                    Pre-configured with High FPS
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {POPULAR_PRESETS.map((preset) => {
                    const isSelected = selectedVersion === preset.version
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${
                          isSelected
                            ? 'border-amber-500 ring-2 ring-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.4)] scale-[1.02]'
                            : 'border-white/10 opacity-75 hover:opacity-100 hover:border-white/30 hover:scale-[1.01]'
                        }`}
                      >
                        <img
                          src={preset.cover}
                          alt={preset.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10" />

                        {/* Top Pill / Badge */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-slate-300">
                            {preset.tag}
                          </span>

                          {isSelected && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md">
                              <HiCheck size={12} className="stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5">
                          <p className="font-display text-xs font-black text-white truncate">
                            {preset.name}
                          </p>
                          <p className="text-[10px] text-amber-400/90 font-mono truncate">
                            {preset.subtitle}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* ALL VERSIONS BROWSER VIEW */
              <div className="flex flex-col h-full">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
                  <div className="relative flex-1">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search any version (e.g. 1.20.4, 1.16, snapshot...)"
                      value={versionSearch}
                      onChange={(e) => setVersionSearch(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#070A11] pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                    />
                    {versionSearch && (
                      <button
                        type="button"
                        onClick={() => setVersionSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <HiXMark className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Type Filter Buttons */}
                  <div className="flex items-center rounded-xl border border-white/10 bg-[#070A11] p-1">
                    <button
                      type="button"
                      onClick={() => setVersionTypeFilter('release')}
                      className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg transition-all ${
                        versionTypeFilter === 'release'
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Releases
                    </button>
                    <button
                      type="button"
                      onClick={() => setVersionTypeFilter('snapshot')}
                      className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg transition-all ${
                        versionTypeFilter === 'snapshot'
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Snapshots
                    </button>
                    <button
                      type="button"
                      onClick={() => setVersionTypeFilter('all')}
                      className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg transition-all ${
                        versionTypeFilter === 'all'
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                  </div>
                </div>

                {/* Scrollable Versions List */}
                <div className="flex-1 max-h-[380px] overflow-y-auto rounded-2xl border border-white/10 bg-[#070A11]/80 p-2 space-y-1.5 custom-scrollbar">
                  {filteredAllVersions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                      <HiCube className="h-8 w-8 mb-2 opacity-40 text-amber-500" />
                      <p className="text-xs font-mono">No Minecraft versions found for &quot;{versionSearch}&quot;</p>
                    </div>
                  ) : (
                    filteredAllVersions.map((v) => {
                      const isSelected = selectedVersion === v.id
                      const isSnapshot = v.type === 'snapshot'
                      return (
                        <div
                          key={v.id}
                          onClick={() => handleSelectCustomVersion(v.id)}
                          className={`flex items-center justify-between rounded-xl px-4 py-2.5 cursor-pointer border transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40 text-white'
                              : 'border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/[0.05] hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-2.5 w-2.5 rounded-full ${
                                isSelected ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : isSnapshot ? 'bg-indigo-400' : 'bg-emerald-400'
                              }`}
                            />
                            <div>
                              <span className="font-mono text-xs font-black">{v.id}</span>
                              <span className="ml-2 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-slate-400">
                                {v.type}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400">
                                <HiCheckCircle className="h-4 w-4" />
                                <span>Selected</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-mono text-slate-500 hover:text-slate-300">
                                Click to pick
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Profile Configuration Suite (5 cols) */}
          <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-white/10 bg-[#080C14]/90 p-5 sm:p-6 lg:col-span-5 shadow-inner">
            <div className="space-y-4">
              {/* Box Title */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <HiAdjustmentsHorizontal className="h-3.5 w-3.5" />
                  <span>Profile Configuration</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Target: {selectedVersion}
                </span>
              </div>

              {/* Profile Name Input */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => {
                    setProfileName(e.target.value)
                    setIsNameManuallyEdited(true)
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#0B0F19] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
                />
              </div>

              {/* Mod Loader Selector */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Mod Loader
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      playSound('tab')
                      setLoaderType('fabric')
                      updateAutoProfileName(selectedVersion, 'fabric')
                    }}
                    className={`flex flex-col items-start rounded-xl border p-2 text-left transition-all ${
                      loaderType === 'fabric'
                        ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/30'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-[11px] font-bold font-mono">⚡ Fabric</span>
                    <span className="text-[9px] text-amber-400 font-mono">Recommended (Fastest)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('tab')
                      setLoaderType('forge')
                      updateAutoProfileName(selectedVersion, 'forge')
                    }}
                    className={`flex flex-col items-start rounded-xl border p-2 text-left transition-all ${
                      loaderType === 'forge'
                        ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/30'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-[11px] font-bold font-mono">🔨 Forge</span>
                    <span className="text-[9px] text-slate-400 font-mono">Classic Mods</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('tab')
                      setLoaderType('neoforge')
                      updateAutoProfileName(selectedVersion, 'neoforge')
                    }}
                    className={`flex flex-col items-start rounded-xl border p-2 text-left transition-all ${
                      loaderType === 'neoforge'
                        ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/30'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-[11px] font-bold font-mono">🔥 NeoForge</span>
                    <span className="text-[9px] text-slate-400 font-mono">Modern Forge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('tab')
                      setLoaderType('vanilla')
                      updateAutoProfileName(selectedVersion, 'vanilla')
                    }}
                    className={`flex flex-col items-start rounded-xl border p-2 text-left transition-all ${
                      loaderType === 'vanilla'
                        ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/30'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-[11px] font-bold font-mono">🎮 Vanilla</span>
                    <span className="text-[9px] text-slate-400 font-mono">No Mods</span>
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                {/* Pre-installed FPS Boost */}
                <label className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 cursor-pointer hover:bg-white/[0.04] transition-all">
                  <input
                    type="checkbox"
                    checked={installFpsPack}
                    onChange={(e) => setInstallFpsPack(e.target.checked)}
                    disabled={loaderType === 'vanilla'}
                    className="mt-0.5 h-4 w-4 rounded accent-amber-500"
                  />
                  <div className="text-[11px]">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span>⚡ Astrix High-FPS & Shaders Pack</span>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">200+ FPS</span>
                    </p>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      Auto-injects Sodium, Iris Shaders & optimization engines.
                    </p>
                  </div>
                </label>
              </div>

              {/* RAM Slider */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Allocated Memory
                  </span>
                  <span className="font-mono text-sm font-black text-amber-400">
                    {allocatedRamGb.toFixed(1)} GB
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="0.5"
                  value={allocatedRamGb}
                  onChange={(e) => setAllocatedRamGb(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none bg-white/10 accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-mono">
                  <span>2 GB</span>
                  <span className="text-amber-400/90 font-bold">3–4 GB Sweet Spot</span>
                  <span>8 GB</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              disabled={isCreating}
              onClick={handleCreate}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all disabled:opacity-50 font-display"
            >
              {isCreating ? (
                <>
                  <HiArrowPath className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Configuring Profile...</span>
                </>
              ) : (
                <>
                  <HiSparkles size={16} />
                  <span>Create {selectedVersion} Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
