import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiPlay,
  HiStop,
  HiArrowPath,
  HiFolderOpen,
  HiTrash,
  HiCheck,
  HiXMark,
  HiCog6Tooth,
  HiEllipsisVertical,
  HiChevronLeft,
  HiChevronRight,
  HiMagnifyingGlass,
  HiPlus,
  HiArchiveBox,
  HiGlobeAlt,
  HiCommandLine,
  HiShare,
  HiPuzzlePiece,
  HiArrowTopRightOnSquare,
  HiDocumentDuplicate,
  HiShieldCheck,
  HiSparkles,
  HiBolt,
  HiCheckCircle,
  HiArrowDownTray,
  HiClipboardDocument
} from 'react-icons/hi2'
import { FaFolder, FaFile, FaFileCode, FaFileZipper } from 'react-icons/fa6'
import { useInstances } from '../hooks/useInstances'
import { useLaunch } from '../hooks/useLaunch'
import { playSound } from '../utils/sound'
import { cn } from '../lib/cn'
import { FabricIcon, ForgeIcon, GrassBlockIcon } from '../components/common/GamingIcons'
import type { GameInstance } from '../../shared/types/instance'
import landscapeImg from '../assets/landscape.jpg'
import ManageInstanceModal from '../components/instances/ManageInstanceModal'

type InstanceDetailTab = 'content' | 'files' | 'worlds' | 'logs' | 'share'

interface RawFileItem {
  name: string
  isDirectory: boolean
  size: number
  itemCount?: number
  dateCreated: string
  dateModified: string
  relativePath: string
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return isoString
  }
}

export default function InstanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { instances, activeInstance, setActiveInstance, updateInstance, loadInstances, openInstanceFolder, deleteInstance, duplicateInstance } = useInstances()
  const { launchGame, stopGame, isPlaying, isLaunching } = useLaunch()

  // Find target instance
  const instance = useMemo(() => {
    return instances.find((i) => i.id === id) || (activeInstance?.id === id ? activeInstance : null)
  }, [instances, activeInstance, id])

  const [activeTab, setActiveTab] = useState<InstanceDetailTab>('content')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  // ── CONTENT TAB STATE ──
  const [contentCategory, setContentCategory] = useState<'mods' | 'resourcepacks' | 'shaderpacks'>('mods')
  const [installedMods, setInstalledMods] = useState<any[]>([])
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [contentSearch, setContentSearch] = useState('')

  // ── FILES TAB STATE ──
  const [currentPath, setCurrentPath] = useState('')
  const [filesList, setFilesList] = useState<RawFileItem[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [fileSearch, setFileSearch] = useState('')

  // ── WORLDS TAB STATE ──
  const [worldsList, setWorldsList] = useState<any[]>([])
  const [isLoadingWorlds, setIsLoadingWorlds] = useState(false)

  // ── LOGS TAB STATE ──
  const [liveLogs, setLiveLogs] = useState<string[]>([])
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all')
  const [logSearch, setLogSearch] = useState('')
  const [selectedLogSource, setSelectedLogSource] = useState<'live' | 'latest.log'>('live')
  const [autoScroll, setAutoScroll] = useState(true)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const logTerminalRef = useRef<HTMLDivElement>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Loader metadata & icons
  const loaderType = instance?.modLoader?.type?.toLowerCase() || 'vanilla'
  const LoaderIcon = {
    fabric: FabricIcon,
    forge: ForgeIcon,
    vanilla: GrassBlockIcon,
    quilt: FabricIcon
  }[loaderType] || GrassBlockIcon

  // ── 1. LOAD INSTALLED CONTENT ──
  const loadContent = useCallback(async () => {
    if (!instance || !window.electronAPI?.getInstanceFiles) return
    setIsLoadingContent(true)
    try {
      const items = await window.electronAPI.getInstanceFiles(instance.id, contentCategory)
      setInstalledMods(Array.isArray(items) ? items : [])
    } catch (err) {
      console.warn('Failed to load content:', err)
      setInstalledMods([])
    } finally {
      setIsLoadingContent(false)
    }
  }, [instance, contentCategory])

  useEffect(() => {
    if (activeTab === 'content') {
      loadContent()
    }
  }, [activeTab, loadContent])

  // ── 2. LOAD FILES ──
  const loadFiles = useCallback(async (sub = currentPath) => {
    if (!instance || !window.electronAPI?.getInstanceRawFiles) return
    setIsLoadingFiles(true)
    try {
      const items = await window.electronAPI.getInstanceRawFiles(instance.id, sub)
      setFilesList(Array.isArray(items) ? items : [])
    } catch (err) {
      console.warn('Failed to load raw files:', err)
      setFilesList([])
    } finally {
      setIsLoadingFiles(false)
    }
  }, [instance, currentPath])

  useEffect(() => {
    if (activeTab === 'files') {
      loadFiles(currentPath)
    }
  }, [activeTab, currentPath, loadFiles])

  // ── 3. LOAD WORLDS ──
  const loadWorlds = useCallback(async () => {
    if (!instance || !window.electronAPI?.getInstanceFiles) return
    setIsLoadingWorlds(true)
    try {
      const items = await window.electronAPI.getInstanceFiles(instance.id, 'saves')
      setWorldsList(Array.isArray(items) ? items : [])
    } catch (err) {
      console.warn('Failed to load worlds:', err)
      setWorldsList([])
    } finally {
      setIsLoadingWorlds(false)
    }
  }, [instance])

  useEffect(() => {
    if (activeTab === 'worlds') {
      loadWorlds()
    }
  }, [activeTab, loadWorlds])

  // ── 4. LOGS STREAMING & LATEST.LOG ──
  const fetchLogs = useCallback(async () => {
    if (!instance) return
    setIsLoadingLogs(true)
    try {
      if (selectedLogSource === 'latest.log') {
        if (window.electronAPI?.readInstanceLog) {
          const text = await window.electronAPI.readInstanceLog(instance.id, 'latest.log')
          if (text && text.trim()) {
            setLiveLogs(text.split('\n'))
          } else {
            setLiveLogs(['[AstrixMC] No latest.log found in logs/ directory.'])
          }
        }
      } else {
        // Live log source: first check active session memory buffer
        let logs: string[] = []
        if (window.electronAPI?.getCurrentLogs) {
          try {
            logs = await window.electronAPI.getCurrentLogs(instance.id)
          } catch {
            logs = []
          }
        }
        if (logs && logs.length > 0) {
          setLiveLogs(logs)
        } else if (window.electronAPI?.readInstanceLog) {
          // If no active live buffer, automatically load latest.log so the user immediately sees actual logs!
          try {
            const text = await window.electronAPI.readInstanceLog(instance.id, 'latest.log')
            if (text && text.trim()) {
              setLiveLogs(text.split('\n'))
            }
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch logs:', err)
    } finally {
      setIsLoadingLogs(false)
    }
  }, [instance, selectedLogSource])

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs()
    }
  }, [activeTab, fetchLogs])

  // Real-time log listener for streaming game output
  useEffect(() => {
    if (activeTab !== 'logs') return

    if (window.electronAPI?.onLaunchLog) {
      const unsubscribe = window.electronAPI.onLaunchLog((line: string) => {
        if (selectedLogSource === 'live') {
          setLiveLogs((prev) => [...prev.slice(-3000), line])
        }
      })
      return () => unsubscribe()
    }
  }, [activeTab, selectedLogSource])

  // Auto-scroll when new logs arrive
  useEffect(() => {
    if (autoScroll && logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight
    }
  }, [liveLogs, autoScroll])

  const handleClearLogs = async () => {
    playSound('click')
    setLiveLogs([])
    if (window.electronAPI?.clearCurrentLogs && instance) {
      await window.electronAPI.clearCurrentLogs(instance.id)
    }
    showToast('Logs cleared')
  }

  const handleCopyLogs = () => {
    playSound('click')
    const textToCopy = filteredLogs.join('\n')
    if (!textToCopy) {
      showToast('No logs to copy')
      return
    }
    navigator.clipboard.writeText(textToCopy)
    showToast(`Copied ${filteredLogs.length} log lines to clipboard`)
  }

  // Toggle file enable/disable
  const handleToggleContentFile = async (fileName: string) => {
    if (!instance || !window.electronAPI?.toggleInstanceFile) return
    playSound('toggle')
    try {
      await window.electronAPI.toggleInstanceFile(instance.id, contentCategory, fileName)
      loadContent()
    } catch {
      showToast('Failed to toggle file')
    }
  }

  // Delete content file
  const handleDeleteContentFile = async (fileName: string) => {
    if (!instance || !window.electronAPI?.deleteInstanceFile) return
    playSound('click')
    try {
      await window.electronAPI.deleteInstanceFile(instance.id, contentCategory, fileName)
      loadContent()
      showToast(`Removed ${fileName}`)
    } catch {
      showToast('Failed to remove file')
    }
  }

  // Backup World
  const handleBackupWorld = async (worldName: string) => {
    if (!instance || !window.electronAPI?.backupWorld) return
    playSound('click')
    showToast(`Creating backup of ${worldName}...`)
    try {
      const res = await window.electronAPI.backupWorld(instance.id, worldName)
      if (res && res.success) {
        playSound('success')
        showToast(`Backup saved to instance/backups/${res.archiveName}`)
      } else {
        showToast('Backup completed!')
      }
    } catch {
      showToast('Failed to create backup')
    }
  }

  // Filtered Content
  const filteredContent = useMemo(() => {
    if (!contentSearch.trim()) return installedMods
    const q = contentSearch.toLowerCase().trim()
    return installedMods.filter(
      (m) => m.name.toLowerCase().includes(q) || m.fileName.toLowerCase().includes(q)
    )
  }, [installedMods, contentSearch])

  // Filtered Files
  const filteredFiles = useMemo(() => {
    if (!fileSearch.trim()) return filesList
    const q = fileSearch.toLowerCase().trim()
    return filesList.filter((f) => f.name.toLowerCase().includes(q))
  }, [filesList, fileSearch])

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    let lines = [...liveLogs]
    if (logFilter === 'error') {
      lines = lines.filter((l) => /error|fatal|exception/i.test(l))
    } else if (logFilter === 'warn') {
      lines = lines.filter((l) => /warn/i.test(l))
    } else if (logFilter === 'info') {
      lines = lines.filter((l) => /info/i.test(l))
    }
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase().trim()
      lines = lines.filter((l) => l.toLowerCase().includes(q))
    }
    return lines
  }, [liveLogs, logFilter, logSearch])

  if (!instance) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-12 text-center text-white">
        <h2 className="text-xl font-bold">Instance Not Found</h2>
        <p className="mt-2 text-xs text-slate-400">The requested profile might have been deleted or moved.</p>
        <button
          type="button"
          onClick={() => navigate('/instances')}
          className="mt-6 rounded-2xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-black"
        >
          Return to Profiles
        </button>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen px-6 pt-5 pb-28 text-white select-none">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-8 z-50 flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-[#0B0F19]/90 px-4 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-xl"
          >
            <HiCheck className="text-emerald-400" size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl flex flex-col gap-6">

        {/* ══════════ TOP BREADCRUMBS & NAVIGATION ══════════ */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => {
              playSound('click')
              navigate('/instances')
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
            title="Back to Profiles"
          >
            <HiChevronLeft size={16} />
          </button>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
          >
            <HiChevronRight size={16} />
          </button>

          {/* Breadcrumb pill with squircle icon */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-white font-mono text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-bold">{instance.name}</span>
          </div>
        </div>

        {/* ══════════ MODRINTH INSTANCE HERO HEADER ══════════ */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0E1420]/90 p-6 backdrop-blur-2xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left: Instance Icon + Name + Meta */}
            <div className="flex items-center gap-4.5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-black/60 shadow-xl backdrop-blur-md">
                <LoaderIcon className="h-9 w-9 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2.5">
                  <h1 className="font-display text-2xl font-black text-white tracking-wide">
                    {instance.name}
                  </h1>
                  {activeInstance?.id === instance.id && (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.2 font-mono text-[9px] font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Meta details row: Fabric 26.2 • 24 minutes • Last played 3 hours ago */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono mt-1.5">
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <span className="text-emerald-400">🏷️</span>
                    <span>{instance.modLoader?.type ? `${instance.modLoader.type} ${instance.mcVersion}` : `Vanilla ${instance.mcVersion}`}</span>
                  </span>
                  <span>•</span>
                  <span>⏱️ {instance.totalPlaytime ? `${Math.round(instance.totalPlaytime / 60)} minutes` : '0 minutes'}</span>
                  <span>•</span>
                  <span>🕒 {instance.created ? `Created ${formatDate(instance.created)}` : 'Recently installed'}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions (Big Green Play Button, Gear Settings, Three Dots) */}
            <div className="flex items-center gap-3">
              {/* Play / Stop Button */}
              {isPlaying ? (
                <button
                  type="button"
                  onClick={() => stopGame()}
                  className="flex items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 px-6 py-3 font-display text-sm font-black text-white shadow-xl shadow-rose-600/30 active:scale-95 transition-all"
                >
                  <HiStop size={18} />
                  <span>STOP GAME</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setActiveInstance(instance)
                    launchGame(instance.id)
                  }}
                  disabled={isLaunching}
                  className="flex items-center gap-2.5 rounded-2xl bg-[#00AF5C] hover:bg-[#00c968] px-7 py-3 font-display text-sm font-black text-white shadow-xl shadow-[#00AF5C]/35 active:scale-95 transition-all disabled:opacity-50"
                >
                  <HiPlay size={18} className="fill-white" />
                  <span>{isLaunching ? 'LAUNCHING...' : 'PLAY'}</span>
                </button>
              )}

              {/* Gear Settings Button */}
              <button
                type="button"
                onClick={() => {
                  playSound('click')
                  setIsSettingsModalOpen(true)
                }}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
                title="Profile settings"
              >
                <HiCog6Tooth size={20} />
              </button>

              {/* Three dots dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
                  title="More actions"
                >
                  <HiEllipsisVertical size={20} />
                </button>

                <AnimatePresence>
                  {isHeaderMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      className="absolute right-0 top-13 z-50 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F19]/95 p-1.5 shadow-2xl backdrop-blur-2xl"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsHeaderMenuOpen(false)
                          openInstanceFolder(instance.id)
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <HiFolderOpen size={16} className="text-emerald-400" />
                        <span>Open Game Folder</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsHeaderMenuOpen(false)
                          duplicateInstance(instance.id)
                          showToast('Profile duplicated!')
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <HiDocumentDuplicate size={16} className="text-sky-400" />
                        <span>Duplicate Profile</span>
                      </button>

                      <div className="my-1 border-t border-white/5" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsHeaderMenuOpen(false)
                          if (confirm(`Are you sure you want to delete "${instance.name}"?`)) {
                            deleteInstance(instance.id)
                            navigate('/')
                          }
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        <HiTrash size={16} />
                        <span>Delete Profile</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>
        </div>

        {/* ══════════ SUB-NAV TABS (MODRINTH STYLE) ══════════ */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'content' as const, label: 'Content', icon: HiPuzzlePiece },
            { id: 'files' as const, label: 'Files', icon: HiFolderOpen },
            { id: 'worlds' as const, label: 'Worlds', icon: HiGlobeAlt },
            { id: 'logs' as const, label: 'Logs', icon: HiCommandLine },
            { id: 'share' as const, label: 'Share', icon: HiShare }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playSound('tab')
                  setActiveTab(tab.id)
                }}
                className={cn(
                  'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all shadow-md',
                  isActive
                    ? 'border border-emerald-500/60 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'border border-white/[0.08] bg-[#0A0D15]/80 text-slate-400 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon size={16} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ══════════════════════════════════════════════════════
            TAB 1: CONTENT (MODS, PACKS, SHADERS)
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'content' && (
          <div className="flex flex-col gap-4">
            
            {/* Sub-Category Pills & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0A0E18]/80 p-3 backdrop-blur-xl">
              <div className="flex items-center gap-1.5">
                {(['mods', 'resourcepacks', 'shaderpacks'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      playSound('tab')
                      setContentCategory(cat)
                    }}
                    className={cn(
                      'rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition-all',
                      contentCategory === cat
                        ? 'bg-emerald-500 text-black shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    )}
                  >
                    {cat === 'mods' ? 'Mods' : cat === 'resourcepacks' ? 'Resource Packs' : 'Shaders'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    placeholder="Search installed content..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/mods')}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-black transition-all shrink-0"
                >
                  <HiPlus size={15} />
                  <span>Add Content</span>
                </button>
              </div>
            </div>

            {/* Content List or Modrinth Empty State */}
            {isLoadingContent ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="h-8 w-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-3" />
                <p className="text-xs">Loading installed projects...</p>
              </div>
            ) : filteredContent.length > 0 ? (
              <div className="flex flex-col gap-2">
                {filteredContent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0E131F]/90 p-3.5 hover:border-white/20 transition-all shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        <HiPuzzlePiece size={20} />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="font-bold text-sm text-white truncate">
                          {item.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 truncate">
                          {item.fileName} • {formatBytes(item.size)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleContentFile(item.fileName)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition-all',
                          item.enabled
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-white/5 text-slate-500 border border-white/10'
                        )}
                      >
                        {item.enabled ? 'Enabled' : 'Disabled'}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteContentFile(item.fileName)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove mod"
                      >
                        <HiTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Modrinth Exact Empty State */
              <div className="flex flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-[#0A0D15]/80 p-16 text-center shadow-xl">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-500 mb-4">
                  <HiArchiveBox size={32} />
                </div>
                <h3 className="font-display text-lg font-bold text-white">No content installed</h3>
                <p className="mt-1 text-xs text-slate-400 max-w-sm">
                  Browse or upload projects to get started with mods, resource packs, and shaders.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openInstanceFolder(instance.id, contentCategory)}
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
                  >
                    <HiFolderOpen size={16} />
                    <span>Upload files</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/mods')}
                    className="flex items-center gap-2 rounded-2xl bg-[#00AF5C] hover:bg-[#00c968] px-5 py-2.5 text-xs font-bold text-white transition-all shadow-lg shadow-[#00AF5C]/25 active:scale-95"
                  >
                    <HiGlobeAlt size={16} />
                    <span>Browse content</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 2: FILES (MODRINTH FILE MANAGER BROWSER)
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'files' && (
          <div className="flex flex-col gap-4">
            
            {/* Top Files Control Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0A0E18]/80 p-3 backdrop-blur-xl">
              
              {/* Breadcrumbs Path */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setCurrentPath('')}
                  className="flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 px-2.5 py-1 text-emerald-400 font-bold transition-colors"
                >
                  <span>🏠</span>
                  <span>{instance.name}</span>
                </button>
                {currentPath && (
                  <>
                    <span className="text-slate-500">/</span>
                    <span className="text-white font-bold">{currentPath}</span>
                  </>
                )}
              </div>

              {/* Search & Actions */}
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={fileSearch}
                    onChange={(e) => setFileSearch(e.target.value)}
                    placeholder="Search files..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => loadFiles(currentPath)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
                >
                  <HiArrowPath size={14} className={cn(isLoadingFiles && 'animate-spin')} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={() => openInstanceFolder(instance.id, currentPath)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-black transition-all shadow-md active:scale-95"
                >
                  <HiFolderOpen size={15} />
                  <span>Open Folder</span>
                </button>
              </div>
            </div>

            {/* Files Table (Modrinth Exact Columns) */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E131F]/90 shadow-xl backdrop-blur-2xl">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4 hidden md:table-cell">Created</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Modified</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoadingFiles ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="h-6 w-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto mb-2" />
                        <span>Reading directory...</span>
                      </td>
                    </tr>
                  ) : filteredFiles.length > 0 ? (
                    filteredFiles.map((file) => (
                      <tr
                        key={file.name}
                        onClick={() => {
                          if (file.isDirectory) {
                            playSound('click')
                            setCurrentPath(file.relativePath)
                          }
                        }}
                        className={cn(
                          'group transition-colors',
                          file.isDirectory ? 'hover:bg-emerald-500/5 cursor-pointer' : 'hover:bg-white/[0.02]'
                        )}
                      >
                        {/* Name Column */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {file.isDirectory ? (
                              <FaFolder className="text-amber-400 shrink-0" size={16} />
                            ) : file.name.endsWith('.jar') || file.name.endsWith('.zip') ? (
                              <FaFileZipper className="text-purple-400 shrink-0" size={15} />
                            ) : file.name.endsWith('.json') || file.name.endsWith('.toml') ? (
                              <FaFileCode className="text-sky-400 shrink-0" size={15} />
                            ) : (
                              <FaFile className="text-slate-400 shrink-0" size={14} />
                            )}
                            <span className={cn('font-mono font-semibold truncate', file.isDirectory ? 'text-white group-hover:text-emerald-300' : 'text-slate-300')}>
                              {file.name}
                            </span>
                          </div>
                        </td>

                        {/* Size Column */}
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {file.isDirectory ? `${file.itemCount ?? 0} items` : formatBytes(file.size)}
                        </td>

                        {/* Created Column */}
                        <td className="py-3 px-4 font-mono text-slate-400 hidden md:table-cell">
                          {formatDate(file.dateCreated)}
                        </td>

                        {/* Modified Column */}
                        <td className="py-3 px-4 font-mono text-slate-400 hidden sm:table-cell">
                          {formatDate(file.dateModified)}
                        </td>

                        {/* Actions Column */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              openInstanceFolder(instance.id, file.relativePath)
                            }}
                            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Reveal in Explorer"
                          >
                            <HiArrowTopRightOnSquare size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <span>Directory is empty</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 3: WORLDS (SAVES)
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'worlds' && (
          <div className="flex flex-col gap-4">
            
            <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0A0E18]/80 p-3.5 backdrop-blur-xl">
              <div>
                <h3 className="font-bold text-sm text-white">Singleplayer World Saves</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage and backup your Minecraft worlds</p>
              </div>

              <button
                type="button"
                onClick={() => openInstanceFolder(instance.id, 'saves')}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold text-white transition-all shadow-md active:scale-95"
              >
                <HiFolderOpen size={16} className="text-emerald-400" />
                <span>Open Saves Directory</span>
              </button>
            </div>

            {isLoadingWorlds ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="h-8 w-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-3" />
                <p className="text-xs">Scanning worlds...</p>
              </div>
            ) : worldsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {worldsList.map((w) => (
                  <div
                    key={w.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0E131F]/90 p-4 shadow-lg hover:border-emerald-500/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        <HiGlobeAlt size={24} />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="font-bold text-sm text-white truncate">{w.name}</span>
                        <span className="font-mono text-[10px] text-slate-400 mt-0.5">
                          Modified: {formatDate(w.dateModified)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="font-mono text-[10px] text-slate-400">Singleplayer World</span>
                      <button
                        type="button"
                        onClick={() => handleBackupWorld(w.name)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 transition-all active:scale-95"
                      >
                        <HiArrowDownTray size={13} />
                        <span>Backup World</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-[#0A0D15]/80 p-16 text-center">
                <HiGlobeAlt size={36} className="text-slate-500 mb-3" />
                <h4 className="font-bold text-white text-base">No worlds found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Launch the instance and create a new world to see it listed here with one-click backups.
                </p>
              </div>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 4: LOGS (MODRINTH ASCII SHEEP & LIVE STREAM)
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'logs' && (
          <div className="flex flex-col gap-4">
            
            {/* Logs Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0A0E18]/80 p-3 backdrop-blur-xl">
              
              {/* Search Logs */}
              <div className="relative flex-1 max-w-sm">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Log Level Filters */}
              <div className="flex items-center gap-1.5">
                {(['all', 'error', 'warn', 'info'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setLogFilter(filter)}
                    className={cn(
                      'rounded-xl px-3 py-1 text-xs font-mono font-bold capitalize transition-all',
                      logFilter === filter
                        ? filter === 'error'
                          ? 'bg-rose-500 text-white'
                          : filter === 'warn'
                          ? 'bg-amber-500 text-black'
                          : 'bg-emerald-500 text-black'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Source Dropdown & Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedLogSource}
                  onChange={(e) => {
                    playSound('click')
                    setSelectedLogSource(e.target.value as any)
                  }}
                  className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-mono font-bold text-slate-300 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="live">Live Log</option>
                  <option value="latest.log">latest.log</option>
                </select>

                {/* Auto-scroll checkbox */}
                <label className="flex items-center gap-1.5 px-2 py-1 text-xs font-mono font-bold text-slate-300 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span>Auto-scroll</span>
                </label>

                {/* Refresh */}
                <button
                  type="button"
                  onClick={fetchLogs}
                  className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-95"
                  title="Reload logs"
                >
                  <HiArrowPath size={14} className={cn(isLoadingLogs && 'animate-spin')} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {/* Copy */}
                <button
                  type="button"
                  onClick={handleCopyLogs}
                  className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-95"
                  title="Copy logs to clipboard"
                >
                  <HiClipboardDocument size={14} className="text-emerald-400" />
                  <span className="hidden sm:inline">Copy</span>
                </button>

                {/* Clear */}
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-rose-400 transition-all active:scale-95"
                  title="Clear log console"
                >
                  <HiTrash size={14} />
                  <span className="hidden sm:inline">Clear</span>
                </button>

                {/* Open Folder */}
                <button
                  type="button"
                  onClick={() => openInstanceFolder(instance.id, 'logs')}
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Open Logs Folder
                </button>
              </div>

            </div>

            {/* Terminal Container */}
            <div
              ref={logTerminalRef}
              className="relative h-[480px] w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#070A0F]/95 p-4 font-mono text-xs text-slate-300 shadow-2xl scrollbar-thin select-text"
            >
              {liveLogs.length === 0 ? (
                /* Modrinth Exact ASCII Art Sheep / Cow Empty State */
                <div className="flex h-full flex-col items-center justify-center text-center text-emerald-400 select-none">
                  <pre className="font-mono text-xs leading-tight">
{` / Start your instance in the top right to start  \\
| receiving live logs!                           |
 \\                                                /
        --
      (o)--(o)
     /.______.\\
     \\________/
    ./        \\.
   ( .        , )
    \\ \\_\\\\//_/ /
     ~~      ~~`}
                  </pre>
                  <p className="mt-4 text-[11px] font-sans text-slate-400">
                    No logs recorded for this instance yet. Click <strong className="text-emerald-400">PLAY</strong> in the top right to launch and view real-time logs here!
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredLogs.map((line, idx) => {
                    const isError = /error|fatal|exception/i.test(line)
                    const isWarn = /warn/i.test(line)
                    const isInfo = /info/i.test(line)
                    const isAstrix = line.startsWith('[AstrixMC')
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'leading-relaxed font-mono whitespace-pre-wrap break-all py-0.5 px-1.5 rounded transition-colors',
                          isError ? 'text-rose-400 bg-rose-500/10' : isWarn ? 'text-amber-300 bg-amber-500/5' : isAstrix ? 'text-emerald-400 font-bold' : isInfo ? 'text-slate-200' : 'text-slate-300 hover:bg-white/[0.03]'
                        )}
                      >
                        <span className="text-slate-600 select-none mr-2.5 text-[10px] inline-block w-8 text-right font-mono">{idx + 1}</span>
                        {line}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 5: SHARE (MODRINTH INVITE & EXPORT)
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'share' && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-[#0A0D15]/80 p-16 text-center shadow-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-500 mb-4">
              <HiShare size={32} />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Share Profile with Friends</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              Export this Minecraft profile as a lightweight zip archive or share it with your squad.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  playSound('click')
                  if (window.electronAPI?.exportInstance) {
                    showToast('Exporting instance zip...')
                    const res = await window.electronAPI.exportInstance(instance.id)
                    if (res && res.success) {
                      playSound('success')
                      showToast(`Exported to ${res.archivePath || 'file'}`)
                    }
                  }
                }}
                className="flex items-center gap-2 rounded-2xl bg-[#00AF5C] hover:bg-[#00c968] px-6 py-2.5 text-xs font-bold text-white transition-all shadow-lg shadow-[#00AF5C]/25 active:scale-95"
              >
                <HiArrowDownTray size={16} />
                <span>Export Profile (.zip)</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Settings Modal Component when gear icon clicked */}
      <ManageInstanceModal
        isOpen={isSettingsModalOpen}
        instance={instance}
        initialTab="settings"
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdateInstance={updateInstance}
        onRefreshInstances={loadInstances}
      />

    </div>
  )
}
