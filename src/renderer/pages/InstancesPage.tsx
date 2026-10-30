import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiPlay,
  HiPlus,
  HiMagnifyingGlass,
  HiXMark,
  HiArrowDownTray,
  HiPuzzlePiece,
  HiCheckCircle,
  HiExclamationCircle,
  HiChevronUpDown,
  HiSquares2X2,
  HiListBullet,
  HiClock,
  HiTrash,
  HiPencilSquare,
  HiCheck,
  HiBolt,
  HiArrowRight,
  HiSparkles,
  HiAdjustmentsHorizontal,
  HiEllipsisHorizontal,
  HiFolderOpen,
  HiDocumentDuplicate,
  HiBookmark,
  HiChevronDown
} from 'react-icons/hi2'
import {
  FabricIcon,
  ForgeIcon,
  NeoForgeIcon,
  GrassBlockIcon,
  SnapshotIcon,
  VanillaCubeIcon
} from '../components/common/GamingIcons'
import CreateInstanceModal from '../components/instances/CreateInstanceModal'
import ManageInstanceModal from '../components/instances/ManageInstanceModal'
import { useInstances } from '../hooks/useInstances'
import { useLaunch } from '../hooks/useLaunch'
import type { GameInstance } from '../../shared/types/instance'
import { playSound } from '../utils/sound'
import { cn } from '../lib/cn'

// Panoramic & Cover Landscape Banners
import mcVillageImg from '../assets/mc_village_sunset.jpg'
import mcCherryImg from '../assets/mc_cherry_biome.jpg'
import mcTrialsImg from '../assets/mc_tricky_trials.jpg'
import mcForgeImg from '../assets/mc_forge_cover.jpg'
import mcBountifulImg from '../assets/mc_bountiful.jpg'
import mcTinyImg from '../assets/mc_tiny_takeover.jpg'
import mcLandscapeImg from '../assets/landscape.jpg'

type SortOption = 'recently-opened' | 'name-asc' | 'name-desc' | 'version'
type ActiveTab = 'all' | 'pinned'
type ViewMode = 'grid' | 'list'

/**
 * Returns a high-res, aesthetic Minecraft landscape banner image for an instance
 */
function getInstanceBanner(instance: GameInstance): string {
  if (instance.bannerUrl) return instance.bannerUrl
  const loader = instance.modLoader?.type?.toLowerCase() || 'vanilla'

  if (loader === 'fabric') {
    return instance.name.length % 2 === 0 ? mcCherryImg : mcTrialsImg
  }
  if (loader === 'forge') {
    return mcForgeImg
  }
  if (loader === 'neoforge') {
    return mcTinyImg
  }
  // Vanilla / snapshots
  const vanillaPool = [mcVillageImg, mcBountifulImg, mcLandscapeImg]
  const charCodeSum = instance.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return vanillaPool[Math.abs(charCodeSum) % vanillaPool.length]
}

export default function InstancesPage() {
  const navigate = useNavigate()
  const {
    instances,
    activeInstance,
    setActiveInstance,
    createInstance,
    updateInstance,
    deleteInstance,
    loadInstances,
    openInstanceFolder,
    importInstance,
    duplicateInstance
  } = useInstances()

  const { launchGame, isLaunching, progress, error: launchError } = useLaunch()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [managingInstance, setManagingInstance] = useState<GameInstance | null>(null)
  const [manageTab, setManageTab] = useState<'mods' | 'packs' | 'saves' | 'screenshots' | 'settings' | 'export'>('mods')
  const [instanceToDelete, setInstanceToDelete] = useState<{ id: string; name: string } | null>(null)
  const [instanceToRename, setInstanceToRename] = useState<GameInstance | null>(null)
  const [newProfileName, setNewProfileName] = useState('')
  const [renameError, setRenameError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ActiveTab>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('recently-opened')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const [openMenuInstanceId, setOpenMenuInstanceId] = useState<string | null>(null)
  const [activeNotification, setActiveNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Pinned instance IDs in localStorage
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('astrix_pinned_profiles') || '[]')
    } catch {
      return []
    }
  })

  const togglePin = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    playSound('click')
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      try {
        localStorage.setItem('astrix_pinned_profiles', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  useEffect(() => {
    if (
      activeNotification &&
      !activeNotification.message.toLowerCase().includes('downloading') &&
      !activeNotification.message.toLowerCase().includes('installing')
    ) {
      const timer = setTimeout(() => {
        setActiveNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [activeNotification])

  // Close card menus on outside click
  useEffect(() => {
    const handleGlobalClick = () => setOpenMenuInstanceId(null)
    window.addEventListener('click', handleGlobalClick)
    return () => window.removeEventListener('click', handleGlobalClick)
  }, [])

  const handleCreateInstance = async (data: any) => {
    const newInst = await createInstance(data)
    if (newInst && data.installFpsPack) {
      playSound('success')
      setActiveNotification({
        type: 'success',
        message: 'Profile created! Installing Ultra FPS Boost pack in background...'
      })
      if (window.electronAPI?.installMod) {
        window.electronAPI
          .installMod({ instanceId: newInst.id, isFpsPack: true })
          .then((res: any) => {
            if (res.success) {
              setActiveNotification({
                type: 'success',
                message: `FPS Boost pack installed! (Added ${res.installed.join(', ')})`
              })
            }
          })
          .catch(console.error)
      }
    }
  }

  const handleFpsBoost = async (instanceId: string) => {
    if (!window.electronAPI?.installMod) return
    playSound('click')
    setActiveNotification({
      type: 'success',
      message: 'Downloading Sodium, Lithium & FPS mods from Modrinth...'
    })
    try {
      const res = await window.electronAPI.installMod({ instanceId, isFpsPack: true })
      if (res.success) {
        playSound('success')
        setActiveNotification({
          type: 'success',
          message: `FPS Boost active! Installed ${res.installed.join(', ')}`
        })
      } else {
        playSound('error')
        setActiveNotification({
          type: 'error',
          message: res.errors?.[0] || 'Could not install FPS mods for this version'
        })
      }
    } catch {
      playSound('error')
      setActiveNotification({
        type: 'error',
        message: 'Failed to install FPS pack'
      })
    }
  }

  const handleDelete = (id: string) => {
    playSound('click')
    const inst = instances.find((i) => i.id === id)
    if (inst) {
      setInstanceToDelete({ id: inst.id, name: inst.name })
    }
  }

  const confirmDelete = async () => {
    if (!instanceToDelete) return
    const wasLast = instances.length <= 1
    try {
      await deleteInstance(instanceToDelete.id)
      playSound('success')
      setActiveNotification({
        type: 'success',
        message: `Deleted "${instanceToDelete.name}" successfully.`
      })
      if (wasLast) {
        navigate('/')
      }
    } catch {
      playSound('error')
      setActiveNotification({
        type: 'error',
        message: `Failed to delete "${instanceToDelete.name}".`
      })
    } finally {
      setInstanceToDelete(null)
    }
  }

  const openRenameModal = (inst: GameInstance) => {
    playSound('click')
    setInstanceToRename(inst)
    setNewProfileName(inst.name)
    setRenameError('')
  }

  const handleSaveRename = async () => {
    if (!instanceToRename) return
    const trimmed = newProfileName.trim()
    if (!trimmed) {
      setRenameError('Profile name cannot be empty')
      playSound('error')
      return
    }
    if (trimmed.length < 2 || trimmed.length > 32) {
      setRenameError('Profile name must be between 2 and 32 characters')
      playSound('error')
      return
    }
    try {
      await updateInstance(instanceToRename.id, { name: trimmed })
      playSound('success')
      setActiveNotification({
        type: 'success',
        message: `Profile renamed to "${trimmed}".`
      })
      setInstanceToRename(null)
    } catch {
      playSound('error')
      setRenameError('Failed to rename profile')
    }
  }

  const handleImport = async () => {
    try {
      playSound('click')
      setActiveNotification({
        type: 'success',
        message: 'Select an instance archive (.zip) to import...'
      })
      const imported = await importInstance()
      if (imported) {
        playSound('success')
        setActiveNotification({
          type: 'success',
          message: `Imported "${imported.name}" successfully!`
        })
      }
    } catch {
      playSound('error')
      setActiveNotification({
        type: 'error',
        message: 'Failed to import instance archive'
      })
    }
  }

  // Active / featured instance for the top Panorama Banner
  const featuredInstance = activeInstance || instances[0]

  // Filter & Sort instances
  const processedInstances = useMemo(() => {
    let result = instances.filter((inst) => {
      const matchesSearch =
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.mcVersion.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTab = activeTab === 'all' ? true : pinnedIds.includes(inst.id)
      return matchesSearch && matchesTab
    })

    result.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' })
      }
      if (sortBy === 'version') {
        return b.mcVersion.localeCompare(a.mcVersion, undefined, { numeric: true })
      }
      if (sortBy === 'recently-opened') {
        const timeA = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0
        const timeB = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0
        return timeB - timeA
      }
      return 0
    })

    return result
  }, [instances, searchQuery, activeTab, pinnedIds, sortBy])

  const sortLabels: Record<SortOption, string> = {
    'recently-opened': 'Recently opened',
    'name-asc': 'Name (A-Z)',
    'name-desc': 'Name (Z-A)',
    'version': 'Version'
  }

  // Real Official Modloader & Vanilla Icons
  const renderInstanceItemGraphic = (instance: GameInstance, size: 'sm' | 'md' | 'lg' = 'md') => {
    const isFabric = instance.modLoader?.type?.toLowerCase() === 'fabric'
    const isForge = instance.modLoader?.type?.toLowerCase() === 'forge'
    const isNeoForge = instance.modLoader?.type?.toLowerCase() === 'neoforge'

    const containerCls = cn(
      'flex items-center justify-center rounded-2xl bg-[#0B0F19]/90 border border-white/15 shadow-xl backdrop-blur-md transition-all',
      size === 'lg' ? 'h-20 w-20 p-3' : size === 'md' ? 'h-13 w-13 p-2' : 'h-8 w-8 rounded-xl p-1'
    )
    const imgCls = size === 'lg' ? 'h-14 w-14' : size === 'md' ? 'h-9 w-9' : 'h-6 w-6'

    if (isFabric) {
      return (
        <div className={containerCls}>
          <FabricIcon className={imgCls} />
        </div>
      )
    }

    if (isNeoForge) {
      return (
        <div className={containerCls}>
          <NeoForgeIcon className={imgCls} />
        </div>
      )
    }

    if (isForge) {
      return (
        <div className={containerCls}>
          <ForgeIcon className={imgCls} />
        </div>
      )
    }

    return (
      <div className={containerCls}>
        <GrassBlockIcon className={imgCls} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 py-7 pb-36 bg-transparent min-h-full font-sans select-none">
      {/* ── TOP HEADER (TITLE: "Library" + "+ Create profile" BUTTON) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-display">
            Library
          </h1>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-mono font-bold text-amber-400">
            {instances.length} {instances.length === 1 ? 'profile' : 'profiles'}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => {
            playSound('click')
            setIsModalOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs sm:text-sm font-black text-black shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
        >
          <HiPlus className="h-4 w-4 stroke-[3]" />
          <span>Create profile</span>
        </motion.button>
      </motion.div>

      {/* ── HERO PANORAMA: SELECTED PROFILE BANNER WITH RICH MINECRAFT WALLPAPER ── */}
      {featuredInstance && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="relative mb-7 overflow-hidden rounded-3xl border border-white/15 bg-[#090D17]/95 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl group"
        >
          {/* Panoramic Minecraft landscape art with vivid saturation */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={getInstanceBanner(featuredInstance)}
              alt="Selected Profile Banner"
              className="h-full w-full object-cover object-center opacity-60 group-hover:scale-103 transition-transform duration-1000"
            />
            {/* Dark vignette & side gradients for deep contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070A12] via-[#070A12]/80 to-[#070A12]/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] via-transparent to-black/20" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8">
            {/* Left Content */}
            <div className="flex flex-col gap-1 max-w-xl">
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-pulse" />
                <span>SELECTED PROFILE</span>
              </div>

              <h2 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight truncate font-display drop-shadow-md">
                {featuredInstance.name}
              </h2>

              <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-300">
                <span>Minecraft {featuredInstance.mcVersion}</span>
                <span className="text-zinc-500">·</span>
                <span className="capitalize text-amber-300 font-bold">
                  {featuredInstance.modLoader?.type || 'Vanilla'}{' '}
                  {featuredInstance.modLoader?.version || ''}
                </span>
                <span className="text-zinc-500">·</span>
                <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                  Ultra FPS Optimized
                </span>
              </div>

              {/* Action Buttons Row */}
              <div className="mt-4 sm:mt-5 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => launchGame(featuredInstance.id)}
                  disabled={isLaunching}
                  className="flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2.5 text-xs sm:text-sm font-black text-black shadow-lg shadow-amber-500/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  <HiPlay className="h-4 w-4 fill-current stroke-current" />
                  <span>Launch Game</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setManagingInstance(featuredInstance)
                    setManageTab('mods')
                  }}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] hover:bg-white/[0.15] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm active:scale-95 transition-all backdrop-blur-md"
                >
                  <HiAdjustmentsHorizontal className="h-4 w-4 text-zinc-300" />
                  <span>Manage profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    openInstanceFolder(featuredInstance.id)
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 hover:bg-white/10 px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition-all backdrop-blur-md"
                  title="Open Game Folder"
                >
                  <HiFolderOpen size={16} />
                  <span className="hidden sm:inline">Folder</span>
                </button>
              </div>
            </div>

            {/* Right Large Squircle Item Badge */}
            <div className="hidden sm:flex items-center justify-center h-28 w-28 rounded-3xl bg-[#091522]/90 border border-white/15 p-4 shadow-2xl backdrop-blur-xl shrink-0 group-hover:scale-105 transition-transform duration-300">
              {renderInstanceItemGraphic(featuredInstance, 'lg')}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── NOTIFICATIONS ── */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mb-5 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold backdrop-blur ${
              activeNotification.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {activeNotification.type === 'success' ? (
                <HiCheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              ) : (
                <HiExclamationCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
              )}
              <span>{activeNotification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveNotification(null)}
              className="rounded-lg p-1 text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              <HiXMark className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LAUNCH PROGRESS ── */}
      <AnimatePresence>
        {isLaunching && progress && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="mb-5 rounded-2xl border border-white/12 bg-[#0F1622]/90 p-4 shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between text-xs mb-2 font-mono">
              <span className="font-semibold text-white">{progress.message}</span>
              <span className="font-bold text-amber-400">{progress.progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/40 border border-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                style={{ width: `${progress.progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launch Error */}
      {launchError && (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 backdrop-blur-md">
          <HiExclamationCircle className="mr-2 inline h-5 w-5 text-rose-400" />
          {launchError}
        </div>
      )}

      {/* ── TABS & FILTER BAR (ALL PROFILES / PINNED + SEARCH + SORT + VIEW SWITCHER) ── */}
      <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-3">
        {/* Left Tabs: All Profiles (count) | Pinned (count) */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => {
              playSound('click')
              setActiveTab('all')
            }}
            className={cn(
              'relative pb-3 text-xs sm:text-sm font-extrabold transition-colors flex items-center gap-2',
              activeTab === 'all' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <span>All profiles</span>
            <span className="text-[11px] font-mono text-zinc-500">{instances.length}</span>
            {activeTab === 'all' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click')
              setActiveTab('pinned')
            }}
            className={cn(
              'relative pb-3 text-xs sm:text-sm font-extrabold transition-colors flex items-center gap-1.5',
              activeTab === 'pinned' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <HiBookmark className="h-3.5 w-3.5 text-zinc-400" />
            <span>Pinned</span>
            <span className="text-[11px] font-mono text-zinc-500">{pinnedIds.length}</span>
            {activeTab === 'pinned' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"
              />
            )}
          </button>
        </div>

        {/* Right Controls: Search + Sort Dropdown + View Modes */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search profiles"
              className="w-full rounded-xl border border-white/10 bg-[#0C111D]/80 pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <HiXMark size={14} />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                playSound('click')
                setIsSortDropdownOpen((prev) => !prev)
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0C111D]/80 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-white/20 hover:text-white transition-all shadow-sm whitespace-nowrap"
            >
              <span className="text-zinc-500">Sort by</span>
              <span className="font-bold text-white">{sortLabels[sortBy]}</span>
              <HiChevronDown size={14} className="text-zinc-400" />
            </button>

            <AnimatePresence>
              {isSortDropdownOpen && (
                <>
                  <div
                    onClick={() => setIsSortDropdownOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-white/12 bg-[#0E1320]/95 p-1.5 shadow-2xl backdrop-blur-2xl z-50 text-left"
                  >
                    {(Object.keys(sortLabels) as SortOption[]).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          playSound('click')
                          setSortBy(opt)
                          setIsSortDropdownOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                          sortBy === opt
                            ? 'bg-amber-400/20 text-amber-300'
                            : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{sortLabels[opt]}</span>
                        {sortBy === opt && <span className="text-amber-400 text-xs">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#0C111D]/80 p-1">
            <button
              type="button"
              onClick={() => {
                playSound('click')
                setViewMode('list')
              }}
              title="List View"
              className={cn(
                'rounded-lg p-1.5 transition-colors',
                viewMode === 'list'
                  ? 'bg-amber-400/20 text-amber-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <HiListBullet size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('click')
                setViewMode('grid')
              }}
              title="Grid View"
              className={cn(
                'rounded-lg p-1.5 transition-colors',
                viewMode === 'grid'
                  ? 'bg-amber-400/20 text-amber-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <HiSquares2X2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── PROFILES CONTENT (GRID OR LIST) ── */}
      {instances.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#0B0E16]/80 backdrop-blur-xl px-8 py-20 text-center shadow-2xl"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-400 mb-4 shadow-lg shadow-amber-500/20">
            <HiSquares2X2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-white font-display">No Profiles Installed</h2>
          <p className="mt-1 max-w-sm text-xs text-zinc-400 leading-relaxed">
            Create your first Minecraft profile to install Fabric, Forge, or Vanilla with zero-lag optimization.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => {
              playSound('click')
              setIsModalOpen(true)
            }}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 px-6 py-3 text-xs font-black uppercase tracking-wider text-black shadow-xl shadow-amber-500/30 active:scale-95 transition-all"
          >
            <HiPlus className="h-4 w-4 stroke-[3]" />
            <span>Create Profile</span>
          </motion.button>
        </motion.div>
      ) : processedInstances.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0B0E16]/70 p-12 text-center backdrop-blur-xl">
          <p className="text-sm font-semibold text-zinc-300">
            {activeTab === 'pinned'
              ? 'No pinned profiles yet. Pin your favorite profiles by clicking the bookmark icon.'
              : `No profiles match "${searchQuery}"`}
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setActiveTab('all')
            }}
            className="mt-3 text-xs font-bold text-amber-400 hover:underline"
          >
            Show All Profiles
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── SQUIRCLE CARD GRID WITH TOP COVER BANNERS (AESTHETIC & UNIQUE) ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {processedInstances.map((instance) => {
            const isSelected = activeInstance?.id === instance.id
            const isPinned = pinnedIds.includes(instance.id)
            const bannerSrc = getInstanceBanner(instance)

            return (
              <motion.div
                key={instance.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  playSound('click')
                  setActiveInstance(instance)
                }}
                className={cn(
                  'group relative flex flex-col justify-between rounded-3xl border overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer backdrop-blur-xl',
                  isSelected
                    ? 'border-amber-400/60 bg-[#0B0F1C] shadow-[0_16px_40px_rgba(245,158,11,0.18)] ring-1 ring-amber-400/30'
                    : 'border-white/10 bg-[#090C16]/90 hover:border-white/25 hover:bg-[#0D1222]'
                )}
              >
                {/* ── CARD TOP COVER BANNER (MINECRAFT SCENIC LANDSCAPE) ── */}
                <div className="relative h-28 w-full overflow-hidden bg-black/60">
                  <img
                    src={bannerSrc}
                    alt={instance.name}
                    className="h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-700"
                  />
                  {/* Atmospheric gradient overlay & soft bottom fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1C] via-[#0B0F1C]/40 to-black/40" />

                  {/* Top Bar on Banner: Selected Tag + Pin Bookmark */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                    {isSelected ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-black text-[10px] tracking-wide shadow-lg">
                        <HiCheck className="h-3 w-3 stroke-[3]" />
                        <span>SELECTED</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg bg-black/60 border border-white/15 text-[9px] font-mono font-bold text-zinc-300 backdrop-blur-md uppercase">
                        {instance.modLoader?.type || 'Vanilla'}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => togglePin(instance.id, e)}
                      title={isPinned ? 'Unpin profile' : 'Pin profile'}
                      className={cn(
                        'p-1.5 rounded-xl border backdrop-blur-md transition-all',
                        isPinned
                          ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                          : 'bg-black/50 border-white/15 text-zinc-400 hover:text-white hover:bg-black/80'
                      )}
                    >
                      <HiBookmark size={13} className={isPinned ? 'fill-current' : ''} />
                    </button>
                  </div>

                  {/* Overlapping 3D Modloader Badge */}
                  <div className="absolute -bottom-4 left-4 z-20">
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-[#090D17] border-2 border-white/15 p-1 shadow-2xl group-hover:scale-105 group-hover:border-amber-400/50 transition-all">
                      {renderInstanceItemGraphic(instance, 'sm')}
                    </div>
                  </div>
                </div>

                {/* ── CARD BODY ── */}
                <div className="flex flex-col justify-between flex-1 p-4 pt-6 gap-3">
                  <div>
                    <h3
                      className="text-sm font-black text-white truncate font-display group-hover:text-amber-300 transition-colors"
                      title={instance.name}
                    >
                      {instance.name}
                    </h3>

                    {/* Version & Modloader Badges Row */}
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className="rounded-md bg-white/[0.06] border border-white/5 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-300">
                        {instance.mcVersion}
                      </span>
                      <span className="rounded-md bg-white/[0.06] border border-white/5 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-400 capitalize">
                        {instance.modLoader?.type || 'Vanilla'}{' '}
                        {instance.modLoader?.version
                          ? `v${instance.modLoader.version.split('.').slice(0, 2).join('.')}`
                          : ''}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar: PLAY + Settings Gear + Ellipsis Menu */}
                  <div
                    className="flex items-center gap-1.5 pt-2 border-t border-white/[0.08]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={isLaunching}
                      onClick={() => launchGame(instance.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black py-2 px-3 text-xs font-black transition-all active:scale-95 shadow-md shadow-amber-500/20 disabled:opacity-40"
                    >
                      <HiPlay className="h-3.5 w-3.5 fill-current" />
                      <span>PLAY</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSound('click')
                        setManagingInstance(instance)
                        setManageTab('mods')
                      }}
                      title="Manage Profile Settings"
                      className="rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.14] p-2 text-zinc-400 hover:text-white transition-colors"
                    >
                      <HiAdjustmentsHorizontal size={15} />
                    </button>

                    {/* Ellipsis Menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          playSound('click')
                          setOpenMenuInstanceId(openMenuInstanceId === instance.id ? null : instance.id)
                        }}
                        title="More options"
                        className="rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.14] p-2 text-zinc-400 hover:text-white transition-colors"
                      >
                        <HiEllipsisHorizontal size={15} />
                      </button>

                      <AnimatePresence>
                        {openMenuInstanceId === instance.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 bottom-full mb-2 w-48 overflow-hidden rounded-2xl border border-white/12 bg-[#0E1320]/95 p-1.5 shadow-2xl backdrop-blur-2xl z-50 text-left"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                playSound('click')
                                openInstanceFolder(instance.id)
                                setOpenMenuInstanceId(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <HiFolderOpen size={14} className="text-zinc-400" />
                              <span>Open Game Folder</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleFpsBoost(instance.id)
                                setOpenMenuInstanceId(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-400/10 transition-colors"
                            >
                              <HiBolt size={14} className="text-amber-400" />
                              <span>1-Click FPS Boost</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                openRenameModal(instance)
                                setOpenMenuInstanceId(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <HiPencilSquare size={14} className="text-zinc-400" />
                              <span>Rename Profile</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                playSound('click')
                                duplicateInstance(instance.id)
                                setOpenMenuInstanceId(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <HiDocumentDuplicate size={14} className="text-zinc-400" />
                              <span>Duplicate</span>
                            </button>

                            <div className="my-1 h-[1px] bg-white/10" />

                            <button
                              type="button"
                              onClick={() => {
                                handleDelete(instance.id)
                                setOpenMenuInstanceId(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/15 transition-colors"
                            >
                              <HiTrash size={14} />
                              <span>Delete Profile</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* ── "+ CREATE PROFILE" SQUIRCLE CARD ── */}
          <motion.div
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playSound('click')
              setIsModalOpen(true)
            }}
            className="group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-[#090C16]/60 hover:border-amber-400/60 hover:bg-[#0D1222]/90 hover:shadow-[0_16px_40px_rgba(245,158,11,0.15)] backdrop-blur-xl p-6 text-center transition-all duration-300 min-h-[240px] overflow-hidden"
          >
            {/* Background subtle glow */}
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
              <img
                src={mcCherryImg}
                alt="Create Profile Cover"
                className="h-full w-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090C16] via-[#090C16]/80 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-400 group-hover:border-amber-400/50 group-hover:bg-amber-400/20 group-hover:text-amber-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300">
                <HiPlus size={28} className="stroke-[2.5]" />
              </div>
              <span className="mt-3.5 text-sm font-black font-display uppercase tracking-widest text-zinc-200 group-hover:text-white transition-colors">
                Create Profile
              </span>
              <span className="mt-1 text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors max-w-[200px]">
                Deploy Fabric, Forge, or Vanilla with 1-click optimization
              </span>
            </div>
          </motion.div>
        </div>
      ) : (
        /* ── LIST VIEW MODE ── */
        <div className="flex flex-col gap-2">
          {processedInstances.map((instance) => {
            const isSelected = activeInstance?.id === instance.id
            const isPinned = pinnedIds.includes(instance.id)

            return (
              <div
                key={instance.id}
                onClick={() => {
                  playSound('click')
                  setActiveInstance(instance)
                }}
                className={cn(
                  'flex items-center justify-between rounded-2xl border px-4 py-3 transition-all cursor-pointer backdrop-blur-xl',
                  isSelected
                    ? 'border-amber-400/50 bg-[#0E1320]/90 shadow-[0_4px_20px_rgba(245,158,11,0.12)]'
                    : 'border-white/10 bg-[#0A0D15]/80 hover:border-white/20 hover:bg-[#0E1320]/90'
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {renderInstanceItemGraphic(instance, 'sm')}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white truncate font-display">
                        {instance.name}
                      </h3>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-amber-400">✓ Selected</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span>MC {instance.mcVersion}</span>
                      <span>·</span>
                      <span className="capitalize">{instance.modLoader?.type || 'Vanilla'}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => togglePin(instance.id, e)}
                    className="p-1.5 text-zinc-500 hover:text-white"
                  >
                    <HiBookmark size={15} className={isPinned ? 'fill-amber-400 text-amber-400' : ''} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('click')
                      setManagingInstance(instance)
                    }}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-zinc-400 hover:text-white"
                  >
                    <HiAdjustmentsHorizontal size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => launchGame(instance.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-4 py-2 text-xs shadow-md shadow-amber-500/20"
                  >
                    <HiPlay size={14} className="fill-current" />
                    <span>PLAY</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── RENAME PROFILE MODAL ── */}
      <AnimatePresence>
        {instanceToRename && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 pb-24 sm:pb-4 backdrop-blur-2xl select-none font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 14 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/30 bg-[#0C101B]/98 p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.95)] backdrop-blur-3xl ring-1 ring-amber-500/20"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                    <HiPencilSquare size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white font-display tracking-tight">
                        Rename Profile
                      </h3>
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                        {instanceToRename.modLoader?.type?.toUpperCase() || 'VANILLA'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Update your local instance profile name &amp; label.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setInstanceToRename(null)
                  }}
                  className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <HiXMark size={20} />
                </button>
              </div>

              {/* Transformation Stage: Current -> New Profile Name */}
              <div className="mb-5 rounded-2xl border border-white/10 bg-black/50 p-4 shadow-inner">
                <div className="flex items-center justify-between gap-3">
                  {/* Before */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Current</span>
                      <p className="text-xs font-black text-zinc-300 truncate font-display">
                        {instanceToRename.name}
                      </p>
                    </div>
                  </div>

                  {/* Transition Arrow */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                    <HiArrowRight size={16} />
                  </div>

                  {/* After (New Preview) */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end text-right">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">New Preview</span>
                      <p className="text-xs font-black text-white truncate font-display">
                        {newProfileName.trim() || 'My Minecraft Profile'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Profile Name
                  </label>
                  <span className={cn(
                    'text-[10px] font-mono font-bold',
                    newProfileName.trim().length >= 2 && newProfileName.trim().length <= 32
                      ? 'text-amber-400'
                      : 'text-zinc-500'
                  )}>
                    {newProfileName.trim().length} / 32 chars
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={32}
                    value={newProfileName}
                    onChange={(e) => {
                      setNewProfileName(e.target.value)
                      setRenameError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename()
                      if (e.key === 'Escape') setInstanceToRename(null)
                    }}
                    placeholder="Enter profile name..."
                    className="w-full rounded-2xl border border-amber-500/30 bg-black/60 pl-4 pr-10 py-3 text-sm font-mono text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all shadow-inner"
                    autoFocus
                  />
                  {newProfileName && (
                    <button
                      type="button"
                      onClick={() => setNewProfileName('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                    >
                      <HiXMark size={15} />
                    </button>
                  )}
                </div>

                {/* Quick Suffix Presets */}
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">Add Tag:</span>
                  {['[PvP]', '[Survival]', '[Modded]', '[1.21]'].map((suffix) => (
                    <button
                      key={suffix}
                      type="button"
                      onClick={() => {
                        playSound('click')
                        const base = newProfileName.replace(/(\s*\[(PvP|Survival|Modded|1\.21)\])+$/, '')
                        const combined = `${base} ${suffix}`.trim().slice(0, 32)
                        setNewProfileName(combined)
                      }}
                      className="rounded-lg border border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-300 hover:text-white transition-all shrink-0"
                    >
                      {suffix}
                    </button>
                  ))}
                </div>

                {/* Error message */}
                {renameError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs text-rose-400 pt-1 font-medium"
                  >
                    <HiExclamationCircle size={15} />
                    <span>{renameError}</span>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setInstanceToRename(null)
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newProfileName.trim() || newProfileName.trim() === instanceToRename.name}
                  onClick={handleSaveRename}
                  className="flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/30 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  <HiCheck size={15} className="stroke-[3]" />
                  <span>Save &amp; Apply</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CREATE INSTANCE MODAL ── */}
      <CreateInstanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateInstance}
      />

      {/* ── MANAGE INSTANCE MODAL ── */}
      <ManageInstanceModal
        isOpen={Boolean(managingInstance)}
        instance={managingInstance}
        initialTab={manageTab}
        onClose={() => setManagingInstance(null)}
        onUpdateInstance={updateInstance}
        onRefreshInstances={loadInstances}
      />

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {instanceToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-[#10141E] p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-400 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/30">
                  <HiTrash size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Delete Profile?</h3>
                  <p className="text-xs text-zinc-400">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Are you sure you want to permanently delete profile{' '}
                <strong className="text-white">&ldquo;{instanceToDelete.name}&rdquo;</strong>? All associated mods, saves, and configs will be deleted.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setInstanceToDelete(null)
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="rounded-xl bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/30 transition-all"
                >
                  Delete Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
