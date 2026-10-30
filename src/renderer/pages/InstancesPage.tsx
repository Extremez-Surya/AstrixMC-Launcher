import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiPlus,
  HiMagnifyingGlass,
  HiXMark,
  HiArrowDownTray,
  HiPuzzlePiece,
  HiCheckCircle,
  HiExclamationCircle,
  HiChevronUpDown,
  HiSquares2X2,
  HiTrash,
  HiPencilSquare,
  HiCheck,
  HiBolt,
  HiArrowRight,
  HiSparkles,
  HiCpuChip
} from 'react-icons/hi2'
import {
  FabricIcon,
  ForgeIcon,
  GrassBlockIcon
} from '../components/common/GamingIcons'
import CreateInstanceModal from '../components/instances/CreateInstanceModal'
import ManageInstanceModal from '../components/instances/ManageInstanceModal'
import InstanceCard from '../components/instances/InstanceCard'
import { useInstances } from '../hooks/useInstances'
import { useLaunch } from '../hooks/useLaunch'
import type { GameInstance } from '../../shared/types/instance'
import { playSound } from '../utils/sound'
import { cn } from '../lib/cn'
import mcVillageImg from '../assets/mc_village_sunset.jpg'

type SortOption = 'name-asc' | 'name-desc' | 'last-played' | 'version'
type LoaderFilter = 'all' | 'fabric' | 'forge' | 'neoforge' | 'vanilla'

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
  const [selectedLoader, setSelectedLoader] = useState<LoaderFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const [activeNotification, setActiveNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Modloader Distribution Counts
  const fabricCount = useMemo(() => instances.filter((i) => i.modLoader?.type?.toLowerCase() === 'fabric').length, [instances])
  const forgeCount = useMemo(() => instances.filter((i) => i.modLoader?.type?.toLowerCase() === 'forge').length, [instances])
  const neoforgeCount = useMemo(() => instances.filter((i) => i.modLoader?.type?.toLowerCase() === 'neoforge').length, [instances])
  const vanillaCount = useMemo(() => instances.filter((i) => !i.modLoader || i.modLoader?.type?.toLowerCase() === 'vanilla').length, [instances])

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

  // Filter & Sort instances
  const processedInstances = useMemo(() => {
    let result = instances.filter((inst) => {
      const matchesSearch =
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.mcVersion.toLowerCase().includes(searchQuery.toLowerCase())

      const type = inst.modLoader?.type?.toLowerCase() || 'vanilla'
      const matchesLoader =
        selectedLoader === 'all'
          ? true
          : selectedLoader === 'vanilla'
          ? !inst.modLoader || type === 'vanilla'
          : type === selectedLoader

      return matchesSearch && matchesLoader
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
      if (sortBy === 'last-played') {
        const timeA = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0
        const timeB = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0
        return timeB - timeA
      }
      return 0
    })

    return result
  }, [instances, searchQuery, selectedLoader, sortBy])

  const sortLabels: Record<SortOption, string> = {
    'name-asc': '↑ Name (A-Z)',
    'name-desc': '↓ Name (Z-A)',
    'last-played': '🕒 Last Played',
    'version': '⚡ MC Version'
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 py-7 pb-32 bg-transparent min-h-full font-sans select-none">
      {/* ── TOP HEADER WITH LIVE STATS BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
              Your Profiles
            </h1>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-0.5 font-mono text-[11px] font-black uppercase text-emerald-400">
              {instances.length} {instances.length === 1 ? 'Profile' : 'Profiles'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Manage your client instances, switch modloaders, and launch with instant zero-lag optimization.
          </p>
        </div>

        {/* Quick summary stats bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeInstance && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-[#0C101A]/90 px-3.5 py-2 shadow-inner backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
              <span className="text-[11px] font-medium text-slate-400">Active:</span>
              <span className="text-xs font-black text-emerald-300 font-display truncate max-w-[130px]">
                {activeInstance.name}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0C101A]/80 px-3 py-2 text-xs font-medium text-slate-400 backdrop-blur-xl shadow-inner">
            <FabricIcon className="h-4 w-4 text-sky-400" />
            <span className="text-slate-300 font-bold">{fabricCount}</span>
            <span className="text-[10px] text-slate-500">Fabric</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0C101A]/80 px-3 py-2 text-xs font-medium text-slate-400 backdrop-blur-xl shadow-inner">
            <ForgeIcon className="h-4 w-4 text-amber-400" />
            <span className="text-slate-300 font-bold">{forgeCount + neoforgeCount}</span>
            <span className="text-[10px] text-slate-500">Forge</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0C101A]/80 px-3 py-2 text-xs font-medium text-slate-400 backdrop-blur-xl shadow-inner">
            <GrassBlockIcon className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-300 font-bold">{vanillaCount}</span>
            <span className="text-[10px] text-slate-500">Vanilla</span>
          </div>
        </div>
      </motion.div>

      {/* ── TOOLBAR: SEARCH + SORT + MODPACKS + CREATE ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="mb-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
      >
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search profiles by name or MC version..."
            className="w-full rounded-2xl border border-white/10 bg-[#0C101A]/90 pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all backdrop-blur-xl shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <HiXMark size={14} />
            </button>
          )}
        </div>

        {/* Action Controls: Sort + Browse Modpacks + Create Profile */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Sort Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                playSound('click')
                setIsSortDropdownOpen((prev) => !prev)
              }}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0C101A]/90 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:border-white/20 hover:text-white transition-all backdrop-blur-xl shadow-sm"
            >
              <span>{sortLabels[sortBy]}</span>
              <HiChevronUpDown size={15} className="text-slate-400" />
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
                    className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-white/12 bg-[#0E1320]/95 p-1.5 shadow-2xl backdrop-blur-2xl z-50 text-left"
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
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{sortLabels[opt]}</span>
                        {sortBy === opt && <span className="text-emerald-400 text-xs">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Browse Modpacks Button */}
          <button
            type="button"
            onClick={() => {
              playSound('click')
              navigate('/mods')
            }}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0C101A]/90 px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white transition-all backdrop-blur-xl shadow-sm whitespace-nowrap active:scale-95"
            title="Explore Modrinth & CurseForge modpacks"
          >
            <HiPuzzlePiece size={16} className="text-purple-400" />
            <span>Browse Modpacks</span>
          </button>

          {/* Import Zip Button */}
          <button
            type="button"
            onClick={handleImport}
            className="hidden lg:flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0C101A]/90 px-3 py-2.5 text-xs font-bold text-slate-300 hover:border-white/20 hover:text-white transition-all backdrop-blur-xl shadow-sm active:scale-95"
            title="Import an existing instance from .zip"
          >
            <HiArrowDownTray size={15} className="text-slate-400" />
            <span>Import</span>
          </button>

          {/* + Create Profile Primary Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              playSound('click')
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
          >
            <HiPlus className="h-4 w-4 stroke-[3]" />
            <span>Create Profile</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ── CATEGORY FILTER TABS WITH LIVE COUNTS ── */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `All Profiles (${instances.length})` },
          { id: 'fabric', label: `Fabric (${fabricCount})` },
          { id: 'forge', label: `Forge (${forgeCount})` },
          { id: 'neoforge', label: `NeoForge (${neoforgeCount})` },
          { id: 'vanilla', label: `Vanilla (${vanillaCount})` }
        ].map((cat) => {
          const isActive = selectedLoader === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => {
                playSound('click')
                setSelectedLoader(cat.id as LoaderFilter)
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/25'
                  : 'border border-white/10 bg-[#0A0D15]/80 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

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
              <span className="font-bold text-emerald-400">{progress.progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/40 border border-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
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

      {/* ── PROFILES GRID ── */}
      {instances.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#0B0E16]/80 backdrop-blur-xl px-8 py-20 text-center shadow-2xl"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20">
            <HiSquares2X2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-white font-display">No Profiles Installed</h2>
          <p className="mt-1 max-w-sm text-xs text-slate-400 leading-relaxed">
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
            className="mt-6 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <HiPlus className="h-4 w-4 stroke-[3]" />
            <span>Create Your First Profile</span>
          </motion.button>
        </motion.div>
      ) : processedInstances.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0B0E16]/70 p-12 text-center backdrop-blur-xl">
          <p className="text-sm font-semibold text-slate-300">No profiles match &ldquo;{searchQuery}&rdquo;</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedLoader('all')
            }}
            className="mt-3 text-xs font-bold text-emerald-400 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {processedInstances.map((instance) => (
            <InstanceCard
              key={instance.id}
              instance={instance}
              isDefault={activeInstance?.id === instance.id}
              isLaunching={isLaunching}
              onLaunch={(id) => launchGame(id)}
              onOpenFolder={(id, sub) => openInstanceFolder(id, sub)}
              onDelete={handleDelete}
              onFpsBoost={handleFpsBoost}
              onSetDefault={(inst) => {
                playSound('success')
                setActiveInstance(inst)
              }}
              onDuplicate={(id) => duplicateInstance(id)}
              onRename={openRenameModal}
              onManage={(inst, tab) => {
                setManagingInstance(inst)
                if (tab) setManageTab(tab)
              }}
            />
          ))}

          {/* ── "+ CREATE PROFILE" CARD ── */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              playSound('click')
              setIsModalOpen(true)
            }}
            className="group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#090C14]/70 hover:border-emerald-500/50 hover:bg-[#0C101A]/90 hover:shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(16,185,129,0.15)] backdrop-blur-xl p-8 text-center transition-all duration-300 min-h-[190px] overflow-hidden"
          >
            {/* Subtle Minecraft landscape glow on hover */}
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
              <img
                src={mcVillageImg}
                alt="Create Profile Backdrop"
                className="h-full w-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090C14] via-[#090C14]/80 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 group-hover:border-emerald-400/50 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300">
                <HiPlus size={26} />
              </div>
              <span className="mt-3.5 text-sm font-black font-display uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
                Create Profile
              </span>
              <span className="mt-1 text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors">
                Deploy Fabric, Forge, or Vanilla with 1-click optimization
              </span>
            </div>
          </motion.div>
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
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#0C101B]/98 p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.95)] backdrop-blur-3xl ring-1 ring-emerald-500/20"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                    <HiPencilSquare size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white font-display tracking-tight">
                        Rename Profile
                      </h3>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                        {instanceToRename.modLoader?.type?.toUpperCase() || 'VANILLA'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
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
                  className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <HiXMark size={20} />
                </button>
              </div>

              {/* Transformation Stage: Current -> New Profile Name */}
              <div className="mb-5 rounded-2xl border border-white/10 bg-black/50 p-4 shadow-inner">
                <div className="flex items-center justify-between gap-3">
                  {/* Before */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 shrink-0">
                      {instanceToRename.modLoader?.type === 'fabric' ? (
                        <FabricIcon className="h-5 w-5 text-sky-400" />
                      ) : instanceToRename.modLoader?.type === 'forge' ? (
                        <ForgeIcon className="h-5 w-5 text-amber-400" />
                      ) : (
                        <GrassBlockIcon className="h-5 w-5 text-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Current</span>
                      <p className="text-xs font-black text-slate-300 truncate font-display">
                        {instanceToRename.name}
                      </p>
                    </div>
                  </div>

                  {/* Transition Arrow */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                    <HiArrowRight size={16} />
                  </div>

                  {/* After (New Preview) */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end text-right">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">New Preview</span>
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
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Profile Name
                  </label>
                  <span className={cn(
                    'text-[10px] font-mono font-bold',
                    newProfileName.trim().length >= 2 && newProfileName.trim().length <= 32
                      ? 'text-emerald-400'
                      : 'text-slate-500'
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
                    className="w-full rounded-2xl border border-emerald-500/30 bg-black/60 pl-4 pr-10 py-3 text-sm font-mono text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                    autoFocus
                  />
                  {newProfileName && (
                    <button
                      type="button"
                      onClick={() => setNewProfileName('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      <HiXMark size={15} />
                    </button>
                  )}
                </div>

                {/* Quick Suffix Presets */}
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">Add Tag:</span>
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
                      className="rounded-lg border border-white/10 bg-white/5 hover:border-emerald-400/40 hover:bg-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-300 hover:text-white transition-all shrink-0"
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
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newProfileName.trim() || newProfileName.trim() === instanceToRename.name}
                  onClick={handleSaveRename}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
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
                  <p className="text-xs text-slate-400">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
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
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
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
