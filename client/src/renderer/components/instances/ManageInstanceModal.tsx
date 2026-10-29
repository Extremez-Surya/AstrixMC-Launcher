// Astrix Content Manager Component
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiXMark,
  HiPuzzlePiece,
  HiSparkles,
  HiGlobeAlt,
  HiCamera,
  HiCog6Tooth,
  HiFolderOpen,
  HiArrowDownTray,
  HiTrash,
  HiArrowPath,
  HiMagnifyingGlass,
  HiCheckCircle,
  HiExclamationCircle,
  HiPlay,
  HiArchiveBoxArrowDown,
  HiBolt,
  HiCircleStack,
  HiCheck,
  HiCpuChip
} from 'react-icons/hi2'
import type { GameInstance } from '../../../shared/types/instance'
import { useLaunch } from '../../hooks/useLaunch'
import { useNavigate } from 'react-router-dom'
import {
  FabricIcon,
  ForgeIcon,
  GrassBlockIcon
} from '../common/GamingIcons'

interface ManageInstanceModalProps {
  isOpen: boolean
  instance: GameInstance | null
  onClose: () => void
  onUpdateInstance: (id: string, patch: Partial<GameInstance>) => Promise<any>
  onRefreshInstances: () => Promise<void>
  initialTab?: TabType
}

type TabType = 'mods' | 'packs' | 'saves' | 'screenshots' | 'settings' | 'export'

const JVM_PRESETS = [
  {
    name: "Aikar's Flags (High FPS / Low Stutter)",
    description: 'Optimized G1GC flags for maximum framerate and zero freeze lag.',
    args: '-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1'
  },
  {
    name: 'Low RAM (2GB - 4GB PCs)',
    description: 'Minimal garbage collection overhead for budget systems.',
    args: '-XX:+UseG1GC -XX:MaxGCPauseMillis=150 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:G1NewSizePercent=20 -XX:G1MaxNewSizePercent=30 -XX:G1ReservePercent=15'
  },
  {
    name: 'Generational ZGC (Java 21+ Extreme Smoothness)',
    description: 'Ultra-low pause time collector with sub-millisecond pauses.',
    args: '-XX:+UseZGC -XX:+ZGenerational'
  }
]

export default function ManageInstanceModal({
  isOpen,
  instance,
  onClose,
  onUpdateInstance,
  onRefreshInstances,
  initialTab = 'mods'
}: ManageInstanceModalProps) {
  const { launchGame, isLaunching } = useLaunch()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<TabType>(initialTab)

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab, isOpen])
  const [packCategory, setPackCategory] = useState<'resourcepacks' | 'shaderpacks'>('resourcepacks')

  // Content state
  const [files, setFiles] = useState<any[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Settings tab form state
  const [editName, setEditName] = useState('')
  const [editMcVersion, setEditMcVersion] = useState('')
  const [editLoaderType, setEditLoaderType] = useState<'vanilla' | 'fabric' | 'forge' | 'quilt'>('fabric')
  const [editMemMin, setEditMemMin] = useState('2')
  const [editMemMax, setEditMemMax] = useState('6')
  const [editJavaPath, setEditJavaPath] = useState('')
  const [editJvmArgs, setEditJvmArgs] = useState('')
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Updates state
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false)
  const [modUpdates, setModUpdates] = useState<any[]>([])

  // Selected screenshot for lightbox
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null)

  useEffect(() => {
    if (instance) {
      setEditName(instance.name)
      setEditMcVersion(instance.mcVersion)
      setEditLoaderType((instance.modLoader?.type as any) || 'vanilla')
      setEditMemMin(instance.memoryMin || '2')
      setEditMemMax(instance.memoryMax || '6')
      setEditJavaPath(instance.javaPath || '')
      setEditJvmArgs(instance.jvmArgs || '')
    }
  }, [instance])

  const loadFiles = useCallback(async () => {
    if (!instance || !window.electronAPI?.getInstanceFiles) return
    setIsLoadingFiles(true)
    try {
      const cat = activeTab === 'mods' ? 'mods' :
        activeTab === 'packs' ? packCategory :
        activeTab === 'saves' ? 'saves' :
        activeTab === 'screenshots' ? 'screenshots' : null

      if (cat) {
        const result = await window.electronAPI.getInstanceFiles(instance.id, cat)
        setFiles(result || [])
      }
    } catch {
      setFiles([])
    } finally {
      setIsLoadingFiles(false)
    }
  }, [instance, activeTab, packCategory])

  useEffect(() => {
    if (isOpen && instance) {
      loadFiles()
    }
  }, [isOpen, instance, activeTab, packCategory, loadFiles])

  if (!isOpen || !instance) return null

  const handleToggleFile = async (fileName: string) => {
    const cat = activeTab === 'mods' ? 'mods' : packCategory
    try {
      const res = await window.electronAPI.toggleInstanceFile(instance.id, cat, fileName)
      if (res?.success) {
        loadFiles()
      } else {
        setNotification({ type: 'error', message: res?.error || 'Failed to toggle item' })
      }
    } catch {
      setNotification({ type: 'error', message: 'Failed to toggle file' })
    }
  }

  const handleDeleteFile = async (fileName: string) => {
    const cat = activeTab === 'mods' ? 'mods' :
      activeTab === 'packs' ? packCategory :
      activeTab === 'saves' ? 'saves' : 'screenshots'

    try {
      const res = await window.electronAPI.deleteInstanceFile(instance.id, cat, fileName)
      if (res) {
        setNotification({ type: 'success', message: `Deleted ${fileName}` })
        loadFiles()
      }
    } catch {
      setNotification({ type: 'error', message: 'Failed to delete' })
    }
  }

  const handleBackupWorld = async (worldName: string) => {
    try {
      setNotification({ type: 'success', message: `Creating backup of "${worldName}"...` })
      const res = await window.electronAPI.backupWorld(instance.id, worldName)
      if (res?.success) {
        setNotification({ type: 'success', message: `World backed up successfully!` })
      } else {
        setNotification({ type: 'error', message: res?.error || 'Backup failed' })
      }
    } catch {
      setNotification({ type: 'error', message: 'Error backing up world' })
    }
  }

  const handleExportInstance = async () => {
    try {
      setNotification({ type: 'success', message: 'Zipping and exporting instance...' })
      const res = await window.electronAPI.exportInstance(instance.id)
      if (res?.success) {
        setNotification({ type: 'success', message: `Instance exported to ${res.filePath}!` })
      } else if (res?.error && res.error !== 'Export cancelled') {
        setNotification({ type: 'error', message: res.error })
      }
    } catch {
      setNotification({ type: 'error', message: 'Failed to export instance' })
    }
  }

  const handleCheckModUpdates = async () => {
    setIsCheckingUpdates(true)
    try {
      const updates = await window.electronAPI.checkModUpdates(instance.id)
      setModUpdates(updates || [])
      const avail = (updates || []).filter((u: any) => u.updateAvailable)
      if (avail.length > 0) {
        setNotification({ type: 'success', message: `Found ${avail.length} mod update(s) available!` })
      } else {
        setNotification({ type: 'success', message: 'All installed mods are up to date!' })
      }
    } catch {
      setNotification({ type: 'error', message: 'Could not check updates' })
    } finally {
      setIsCheckingUpdates(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    try {
      const patch: Partial<GameInstance> = {
        name: editName.trim() || instance.name,
        mcVersion: editMcVersion.trim() || instance.mcVersion,
        modLoader: editLoaderType === 'vanilla' ? undefined : {
          type: editLoaderType,
          version: 'latest'
        },
        memoryMin: editMemMin,
        memoryMax: editMemMax,
        javaPath: editJavaPath.trim() || undefined,
        jvmArgs: editJvmArgs.trim() || undefined
      }

      await onUpdateInstance(instance.id, patch)
      await onRefreshInstances()
      setNotification({ type: 'success', message: 'Instance settings saved successfully!' })
    } catch {
      setNotification({ type: 'error', message: 'Failed to save settings' })
    } finally {
      setIsSavingSettings(false)
    }
  }

  const filteredFiles = files.filter(f =>
    f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const enabledModsCount = files.filter(f => f.enabled).length
  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0)
  const totalSizeMb = (totalBytes / 1024 / 1024).toFixed(1)

  const loaderTypeLower = (instance.modLoader?.type || 'vanilla').toLowerCase()
  const isFabric = loaderTypeLower === 'fabric' || loaderTypeLower === 'quilt'
  const isForge = loaderTypeLower === 'forge' || loaderTypeLower === 'neoforge'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#080B11]/95 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
        >
          {/* Ambient Glow Backlight */}
          <div className="pointer-events-none absolute -top-24 left-1/4 h-56 w-96 rounded-full bg-emerald-500/10 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-96 rounded-full bg-teal-500/10 blur-[90px]" />

          {/* ── TOP HEADER ── */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-black/60 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3.5">
              {/* Loader Emblem */}
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border backdrop-blur-md shadow-lg ${
                  isFabric
                    ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-cyan-500/20'
                    : isForge
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-amber-500/20'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-emerald-500/20'
                }`}
              >
                {isFabric ? (
                  <FabricIcon className="h-6 w-6" />
                ) : isForge ? (
                  <ForgeIcon className="h-6 w-6" />
                ) : (
                  <GrassBlockIcon className="h-6 w-6" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-black tracking-tight text-white font-display">
                    {instance.name}
                  </h2>
                  <span className="rounded-lg border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-300">
                    v{instance.mcVersion}
                  </span>
                  <span
                    className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                      isFabric
                        ? 'border-cyan-500/30 bg-cyan-500/15 text-cyan-300'
                        : isForge
                        ? 'border-amber-500/30 bg-amber-500/15 text-amber-300'
                        : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    {instance.modLoader?.type || 'VANILLA'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                  <span>Astrix Content Engine</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400/90">Isolated Sandbox</span>
                </p>
              </div>
            </div>

            {/* Quick Actions & Close */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.electronAPI.openInstanceFolder(instance.id)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition-all shadow-sm active:scale-95"
                title="Open Instance Folder in File Explorer"
              >
                <HiFolderOpen size={15} className="text-emerald-400" />
                <span className="hidden sm:inline">Folder</span>
              </button>

              <button
                type="button"
                disabled={isLaunching}
                onClick={() => {
                  onClose()
                  launchGame(instance.id)
                }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 px-5 py-2 text-xs font-bold text-slate-950 shadow-[0_2px_14px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.5)] active:scale-95 transition-all disabled:opacity-50"
              >
                <HiPlay size={15} className="fill-current text-slate-950" />
                <span>Play</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all ml-1"
                title="Close"
              >
                <HiXMark size={20} />
              </button>
            </div>
          </div>

          {/* ── NOTIFICATION BANNER ── */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`relative z-10 flex items-center justify-between px-6 py-2.5 text-xs font-bold ${
                  notification.type === 'success'
                    ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-500/30'
                    : 'bg-rose-950/80 text-rose-300 border-b border-rose-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {notification.type === 'success' ? (
                    <HiCheckCircle size={16} className="text-emerald-400" />
                  ) : (
                    <HiExclamationCircle size={16} className="text-rose-400" />
                  )}
                  <span>{notification.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotification(null)}
                  className="text-zinc-400 hover:text-white font-mono"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── TABS NAVIGATION ── */}
          <div className="relative z-10 flex items-center gap-1.5 border-b border-white/10 bg-black/50 px-6 py-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'mods', label: 'Mods', icon: HiPuzzlePiece },
              { id: 'packs', label: 'Resource & Shaders', icon: HiSparkles },
              { id: 'saves', label: 'Worlds / Saves', icon: HiGlobeAlt },
              { id: 'screenshots', label: 'Screenshots', icon: HiCamera },
              { id: 'settings', label: 'Version & JVM', icon: HiCog6Tooth },
              { id: 'export', label: 'Export Zip', icon: HiArchiveBoxArrowDown }
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* ── TAB CONTENT ── */}
          <div className="relative z-10 flex-1 overflow-y-auto p-6">
            {/* ── TAB 1: MODS MANAGER ── */}
            {activeTab === 'mods' && (
              <div className="space-y-4">
                {/* Action & Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative min-w-[280px] flex-1">
                    <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      placeholder="Filter installed mods..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0B0F19]/90 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isCheckingUpdates}
                      onClick={handleCheckModUpdates}
                      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all disabled:opacity-50 shadow-sm active:scale-95"
                    >
                      <HiArrowPath size={14} className={isCheckingUpdates ? 'animate-spin text-emerald-400' : 'text-slate-400'} />
                      <span>{isCheckingUpdates ? 'Checking...' : 'Check Updates'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.electronAPI?.openInstanceFolder(instance.id, 'mods')}
                      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
                      title="Open mods folder in Windows Explorer"
                    >
                      <HiFolderOpen size={14} className="text-emerald-400" />
                      <span>Open Mods Folder</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        navigate('/mods')
                      }}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-4 py-2 text-xs font-bold text-white shadow-[0_2px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_18px_rgba(16,185,129,0.45)] active:scale-95 transition-all"
                    >
                      <HiArrowDownTray size={15} className="text-emerald-200" />
                      <span>Get More Mods</span>
                    </button>
                  </div>
                </div>

                {/* Mod Inventory Telemetry Strip */}
                {files.length > 0 && (
                  <div className="flex items-center justify-between px-2 text-[11px] font-mono text-slate-400 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-3">
                      <span>Total: <strong className="text-white">{files.length}</strong> mods</span>
                      <span className="text-slate-700">•</span>
                      <span>Active: <strong className="text-emerald-400">{enabledModsCount}</strong></span>
                      <span className="text-slate-700">•</span>
                      <span>Footprint: <strong className="text-slate-300">{totalSizeMb} MB</strong></span>
                    </div>
                    {searchQuery && (
                      <span className="text-amber-400">Filtered: {filteredFiles.length} result(s)</span>
                    )}
                  </div>
                )}

                {/* Mod List */}
                {isLoadingFiles ? (
                  <div className="flex h-56 flex-col items-center justify-center text-xs font-bold text-slate-400 gap-2">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                    <span>Scanning mod repository...</span>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0B0F19]/40 p-6 text-center text-slate-400">
                    <HiPuzzlePiece size={40} className="mb-2 opacity-40 text-emerald-400" />
                    <p className="text-sm font-bold text-white">No mods installed in this instance.</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Enhance your gameplay with performance optimizations, shaders, minimaps, and content addons.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        navigate('/mods')
                      }}
                      className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all shadow-md"
                    >
                      <HiArrowDownTray size={14} />
                      <span>Browse Modrinth Catalog</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFiles.map(file => {
                      const updateInfo = modUpdates.find(u => u.fileName === file.fileName)
                      return (
                        <div
                          key={file.fileName}
                          className={`group flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-200 ${
                            file.enabled
                              ? 'border-white/10 bg-[#0B0F1A]/90 hover:border-emerald-500/40 hover:bg-[#0F1626] shadow-sm'
                              : 'border-white/5 bg-[#06080E]/60 opacity-60 hover:opacity-85'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Sleek Emerald Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleFile(file.fileName)}
                              title={file.enabled ? 'Click to disable mod' : 'Click to enable mod'}
                              className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-200 focus:outline-none ${
                                file.enabled
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                                  : 'bg-white/10 border border-white/10 hover:bg-white/15'
                              }`}
                            >
                              <span
                                className={`block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                                  file.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>

                            {/* Mod Info */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                                  {file.name}
                                </p>
                                {updateInfo?.updateAvailable && (
                                  <span className="rounded-md border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-amber-300">
                                    Update (v{updateInfo.latestVersion})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.2 text-[9px] font-mono font-bold text-emerald-400/80">
                                  .JAR
                                </span>
                                <p className="font-mono text-[10px] text-slate-400 truncate max-w-md">
                                  {file.fileName}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="rounded-lg border border-white/5 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-bold text-slate-300">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteFile(file.fileName)}
                              className="rounded-xl p-2 text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 border border-transparent transition-all"
                              title="Delete Mod"
                            >
                              <HiTrash size={16} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: RESOURCE & SHADERS ── */}
            {activeTab === 'packs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPackCategory('resourcepacks')}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                        packCategory === 'resourcepacks'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                          : 'text-slate-400 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      Resource Packs
                    </button>
                    <button
                      type="button"
                      onClick={() => setPackCategory('shaderpacks')}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                        packCategory === 'shaderpacks'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                          : 'text-slate-400 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      Shader Packs
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.electronAPI?.openInstanceFolder(instance.id, packCategory)}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-md"
                    title={`Open ${packCategory} directory in Windows Explorer`}
                  >
                    <HiFolderOpen size={15} className="text-emerald-400" />
                    <span>Open {packCategory === 'resourcepacks' ? 'Resource Packs' : 'Shaders'} Folder</span>
                  </button>
                </div>

                {filteredFiles.length === 0 ? (
                  <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0B0F19]/40 p-6 text-center text-slate-400">
                    <HiSparkles size={40} className="mb-2 opacity-40 text-indigo-400" />
                    <p className="text-xs font-bold text-white">No {packCategory === 'resourcepacks' ? 'resource packs' : 'shader packs'} installed yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Drag & drop your downloaded .zip files into the folder to activate.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFiles.map(file => (
                      <div
                        key={file.fileName}
                        className={`group flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-200 ${
                          file.enabled
                            ? 'border-white/10 bg-[#0B0F1A]/90 hover:border-emerald-500/40 hover:bg-[#0F1626]'
                            : 'border-white/5 bg-[#06080E]/60 opacity-60 hover:opacity-85'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleFile(file.fileName)}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-200 focus:outline-none ${
                              file.enabled
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                                : 'bg-white/10 border border-white/10 hover:bg-white/15'
                            }`}
                          >
                            <span
                              className={`block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                                file.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <div>
                            <p className="text-xs font-bold text-white">{file.name}</p>
                            <p className="font-mono text-[10px] text-slate-400">{file.fileName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="rounded-lg border border-white/5 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-bold text-slate-300">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.fileName)}
                            className="rounded-xl p-2 text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 border border-transparent transition-all"
                            title="Delete Pack"
                          >
                            <HiTrash size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: WORLDS / SAVES ── */}
            {activeTab === 'saves' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-400">
                    Manage worlds and backup your saves with 1-click zip compression.
                  </p>
                  <button
                    type="button"
                    onClick={() => window.electronAPI?.openInstanceFolder(instance.id, 'saves')}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all shadow-md"
                    title="Open worlds / saves directory in Windows Explorer"
                  >
                    <HiFolderOpen size={15} className="text-emerald-400" />
                    <span>Open Saves Folder</span>
                  </button>
                </div>

                {filteredFiles.length === 0 ? (
                  <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0B0F19]/40 p-6 text-center text-slate-400">
                    <HiGlobeAlt size={40} className="mb-2 opacity-40 text-emerald-400" />
                    <p className="text-xs font-bold text-white">No saved worlds found in this instance.</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      Launch Minecraft and create a Singleplayer world, or open the saves folder to paste existing worlds.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredFiles.map(world => (
                      <div
                        key={world.fileName}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B0F1A]/90 p-4 hover:border-emerald-500/30 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/10">
                            <HiGlobeAlt size={22} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white">{world.name}</h4>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                              Last modified: {new Date(world.dateModified).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleBackupWorld(world.name)}
                            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-sm"
                          >
                            <HiArchiveBoxArrowDown size={14} />
                            <span>Backup World</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(world.fileName)}
                            className="rounded-xl p-2 text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 border border-transparent transition-all"
                            title="Delete World"
                          >
                            <HiTrash size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 4: SCREENSHOTS GALLERY ── */}
            {activeTab === 'screenshots' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    In-game F2 captures saved for this installation. Click any image to view full resolution.
                  </p>
                  <button
                    type="button"
                    onClick={() => window.electronAPI?.openInstanceFolder(instance.id, 'screenshots')}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
                    title="Open screenshots directory in Windows Explorer"
                  >
                    <HiFolderOpen size={15} className="text-emerald-400" />
                    <span>Open Screenshots Folder</span>
                  </button>
                </div>

                {files.length === 0 ? (
                  <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0B0F19]/40 p-6 text-center text-slate-400">
                    <HiCamera size={40} className="mb-2 opacity-40 text-purple-400" />
                    <p className="text-xs font-bold text-white">No screenshots found.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Press F2 in Minecraft to capture moments!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                    {files.map(shot => {
                      const fullPath = shot.extra?.fullPath || ''
                      const cleanPath = fullPath.replace(/\\/g, '/')
                      const encodedUri = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath
                      const fileSrc = shot.extra?.dataUrl || (fullPath ? encodeURI(`file://${encodedUri}`) : '')
                      return (
                        <div
                          key={shot.fileName}
                          className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-lg hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-300"
                          onClick={() => fileSrc && setPreviewScreenshot(fileSrc)}
                        >
                          {fileSrc ? (
                            <img
                              src={fileSrc}
                              alt={shot.name || shot.fileName}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-500">
                              <HiCamera size={32} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                            <p className="truncate text-xs font-bold text-white">{shot.fileName}</p>
                            <p className="text-[10px] font-mono text-emerald-400/90 mt-0.5">
                              {new Date(shot.dateModified).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 5: VERSION & JVM SETTINGS ── */}
            {activeTab === 'settings' && (
              <div className="space-y-5 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Instance Profile Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0B0F19]/90 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Minecraft Version</label>
                    <input
                      type="text"
                      value={editMcVersion}
                      onChange={(e) => setEditMcVersion(e.target.value)}
                      placeholder="e.g. 1.20.4"
                      className="w-full rounded-xl border border-white/10 bg-[#0B0F19]/90 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Mod Loader</label>
                    <select
                      value={editLoaderType}
                      onChange={(e) => setEditLoaderType(e.target.value as any)}
                      className="w-full rounded-xl border border-white/10 bg-[#0B0F19]/90 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                    >
                      <option value="fabric" className="bg-slate-900">Fabric</option>
                      <option value="forge" className="bg-slate-900">Forge</option>
                      <option value="quilt" className="bg-slate-900">Quilt</option>
                      <option value="vanilla" className="bg-slate-900">Vanilla (No Mods)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Min Allocated RAM (GB)</label>
                    <input
                      type="number"
                      min="1"
                      max="32"
                      value={editMemMin}
                      onChange={(e) => setEditMemMin(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0B0F19]/90 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Max Allocated RAM (GB)</label>
                    <input
                      type="number"
                      min="2"
                      max="64"
                      value={editMemMax}
                      onChange={(e) => setEditMemMax(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0B0F19]/90 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 font-mono"
                    />
                  </div>
                </div>

                {/* 1-Click JVM Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">1-Click JVM Tuning Presets</label>
                  <div className="space-y-2">
                    {JVM_PRESETS.map(preset => (
                      <div
                        key={preset.name}
                        onClick={() => setEditJvmArgs(preset.args)}
                        className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                          editJvmArgs === preset.args
                            ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'border-white/10 bg-[#0B0F19]/60 hover:bg-[#0F1626]/80 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-white">{preset.name}</p>
                          <span className="text-[10px] font-bold text-emerald-400">Apply Preset</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{preset.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Custom JVM Launch Arguments</label>
                  <textarea
                    rows={3}
                    value={editJvmArgs}
                    onChange={(e) => setEditJvmArgs(e.target.value)}
                    placeholder="-XX:+UseG1GC ..."
                    className="w-full rounded-xl border border-white/10 bg-[#0B0F19]/90 p-3 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isSavingSettings}
                    onClick={handleSaveSettings}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSavingSettings ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </div>
            )}

            {/* ── TAB 6: EXPORT ZIP ── */}
            {activeTab === 'export' && (
              <div className="max-w-xl space-y-4">
                <div className="rounded-3xl border border-white/10 bg-[#0B0F19]/70 p-8 text-center backdrop-blur-xl">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-400/30 mb-3.5 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <HiArchiveBoxArrowDown size={28} />
                  </div>
                  <h3 className="text-base font-black text-white font-display">Export Portable Instance</h3>
                  <p className="mt-1.5 text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Export your mods, resource packs, shaders, and configuration into a clean `.zip` archive to backup or distribute to other players.
                  </p>

                  <button
                    type="button"
                    onClick={handleExportInstance}
                    className="mt-6 flex items-center gap-2 mx-auto rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                  >
                    <HiArchiveBoxArrowDown size={16} />
                    <span>Export to .ZIP</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Screenshot Lightbox */}
      {previewScreenshot && (
        <div
          onClick={() => setPreviewScreenshot(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-pointer"
        >
          <div
            className="relative max-h-[88vh] max-w-[92vw] overflow-hidden rounded-2xl border border-white/15 bg-black/95 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewScreenshot}
              alt="Screenshot Preview"
              className="max-h-[85vh] max-w-[90vw] object-contain select-none"
            />
            <button
              type="button"
              onClick={() => setPreviewScreenshot(null)}
              className="absolute top-3 right-3 rounded-xl bg-black/70 border border-white/10 p-2 text-slate-300 hover:text-white hover:bg-black/90 transition-all backdrop-blur-md"
              title="Close Preview"
            >
              <HiXMark size={18} />
            </button>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
