import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import {
  HiArrowLeft,
  HiArrowDownTray,
  HiCheckCircle,
  HiExclamationCircle,
  HiPhoto,
  HiCalendar,
  HiUser,
  HiChevronDown,
  HiChevronUp,
  HiClock,
  HiDocumentText,
  HiCodeBracket,
  HiFlag,
  HiXMark,
  HiArrowTopRightOnSquare,
  HiChevronLeft,
  HiChevronRight,
  HiServerStack,
  HiSparkles,
  HiShieldCheck,
  HiHeart,
  HiFolderOpen,
  HiCheck,
  HiCube
} from 'react-icons/hi2'
import { useInstances } from '../hooks/useInstances'
import { playSound } from '../utils/sound'
import { cn } from '../lib/cn'
import type { GameInstance } from '../../shared/types/instance'

interface GalleryImage {
  url: string
  title?: string
  description?: string
  featured?: boolean
}

interface ModVersion {
  id: string
  name: string
  versionNumber: string
  gameVersions: string[]
  loaders: string[]
  datePublished: string
  downloads: number
  type: 'release' | 'beta' | 'alpha'
  dependencies?: any[]
  files: Array<{
    url: string
    filename: string
    primary: boolean
    size: number
  }>
}

interface ModProject {
  id: string
  name: string
  author: string
  description: string
  body: string
  iconUrl?: string
  downloads: number
  followers: number
  categories: string[]
  dateCreated: string
  dateModified: string
  sourceUrl?: string
  issuesUrl?: string
  wikiUrl?: string
  discordUrl?: string
  source: 'modrinth' | 'curseforge'
  slug: string
  gallery: GalleryImage[]
  license?: string
  clientSide?: string
  serverSide?: string
  versions: ModVersion[]
  gameVersions: string[]
  loaders: string[]
  projectType: string
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  mod: 'Mod',
  shader: 'Shader Pack',
  resourcepack: 'Resource Pack',
  modpack: 'Modpack',
  plugin: 'Plugin',
  datapack: 'Datapack'
}

const VERSION_TYPE_STYLES: Record<string, string> = {
  release: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  beta: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  alpha: 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatNumber(num: number): string {
  if (!num) return '0'
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString()
}

function formatBytes(bytes: number): string {
  if (!bytes) return ''
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

function formatLicense(license?: string): string {
  if (!license) return 'Open Source / Terms'
  if (license.includes('LicenseRef-')) return 'Custom License'
  if (license.length > 24) return `${license.slice(0, 22)}...`
  return license
}

export default function ModDetailPage() {
  const { source, id } = useParams<{ source: string; id: string }>()
  const navigate = useNavigate()
  const { instances, activeInstance, setActiveInstance, openInstanceFolder } = useInstances()

  const [project, setProject] = useState<ModProject | null>(null)
  const [versions, setVersions] = useState<ModVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingVersions, setIsLoadingVersions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [installingVersionId, setInstallingVersionId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Target instance selection
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>(activeInstance?.id || (instances[0]?.id ?? ''))
  const [installedModFiles, setInstalledModFiles] = useState<string[]>([])
  const [showAllVersionsSidebar, setShowAllVersionsSidebar] = useState(false)

  // Tabs & Views
  const [activeTab, setActiveTab] = useState<'description' | 'versions' | 'gallery'>('description')
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  // Version filtering
  const [versionFilter, setVersionFilter] = useState({ gameVersion: 'All', loader: 'All', search: '' })
  const [showAllVersions, setShowAllVersions] = useState(false)

  const projectSource = (source as 'modrinth' | 'curseforge') || 'modrinth'

  // Update selectedInstanceId if activeInstance changes
  useEffect(() => {
    if (activeInstance && !selectedInstanceId) {
      setSelectedInstanceId(activeInstance.id)
    }
  }, [activeInstance, selectedInstanceId])

  // Load installed mods for selected instance to detect if already installed
  const loadInstalledMods = useCallback(async (instId: string) => {
    if (!instId || !window.electronAPI?.getInstalledMods) return
    try {
      const mods = await window.electronAPI.getInstalledMods(instId)
      if (Array.isArray(mods)) {
        setInstalledModFiles(mods.map((m: any) => (m.fileName || m.name || '').toLowerCase()))
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (selectedInstanceId) {
      loadInstalledMods(selectedInstanceId)
    }
  }, [selectedInstanceId, loadInstalledMods])

  const fetchProjectDetails = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const details = await window.electronAPI?.getModDetails(projectSource, id)
      if (!details) {
        throw new Error('Project details could not be retrieved.')
      }

      if (projectSource === 'modrinth') {
        const modProject: ModProject = {
          id: details.id || id,
          name: details.title || 'Unknown',
          author: details.author || details.organization || 'Community',
          description: details.description || '',
          body: details.body || '',
          iconUrl: details.icon_url,
          downloads: details.downloads || 0,
          followers: details.followers || 0,
          categories: details.categories || [],
          dateCreated: details.published || '',
          dateModified: details.updated || '',
          sourceUrl: details.source_url,
          issuesUrl: details.issues_url,
          wikiUrl: details.wiki_url,
          discordUrl: details.discord_url,
          source: 'modrinth',
          slug: details.slug || id,
          gallery: (details.gallery || []).map((img: any) => ({
            url: img.url,
            title: img.title || '',
            description: img.description || '',
            featured: img.featured
          })),
          license: details.license?.name || details.license?.id || 'Open Source',
          clientSide: details.client_side || 'optional',
          serverSide: details.server_side || 'optional',
          versions: [],
          gameVersions: details.game_versions || [],
          loaders: details.loaders || [],
          projectType: details.project_type || 'mod'
        }
        setProject(modProject)
      } else {
        const modProject: ModProject = {
          id: String(details.data?.id || id),
          name: details.data?.name || 'Unknown',
          author: details.data?.authors?.[0]?.name || 'Unknown',
          description: details.data?.summary || '',
          body: details.data?.description || '',
          iconUrl: details.data?.logo?.url,
          downloads: details.data?.downloadCount || 0,
          followers: 0,
          categories: (details.data?.categories || []).map((c: any) => c.name),
          dateCreated: details.data?.dateCreated || '',
          dateModified: details.data?.dateModified || '',
          sourceUrl: details.data?.links?.websiteUrl,
          issuesUrl: details.data?.links?.issuesUrl,
          source: 'curseforge',
          slug: details.data?.slug || id,
          gallery: (details.data?.screenshots || []).map((img: any) => ({
            url: img.url,
            title: img.title,
            description: img.description
          })),
          license: details.data?.license?.name || 'Unknown',
          clientSide: 'optional',
          serverSide: 'optional',
          versions: [],
          gameVersions: [],
          loaders: [],
          projectType: 'mod'
        }
        setProject(modProject)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project details')
    } finally {
      setIsLoading(false)
    }
  }, [id, projectSource])

  const fetchVersions = useCallback(async () => {
    if (!id) return
    setIsLoadingVersions(true)
    try {
      const versionData = await window.electronAPI?.getModVersions(projectSource, id)
      if (projectSource === 'modrinth') {
        const modVersions: ModVersion[] = (versionData || []).map((v: any) => ({
          id: v.id,
          name: v.name || v.version_number,
          versionNumber: v.version_number,
          gameVersions: v.game_versions || [],
          loaders: v.loaders || [],
          datePublished: v.date_published,
          downloads: v.downloads || 0,
          type: (v.version_type || 'release') as 'release' | 'beta' | 'alpha',
          dependencies: v.dependencies || [],
          files: (v.files || []).map((f: any) => ({
            url: f.url,
            filename: f.filename,
            primary: f.primary ?? true,
            size: f.size || 0
          }))
        }))
        setVersions(modVersions)
      } else {
        const modVersions: ModVersion[] = (versionData || []).map((v: any) => ({
          id: String(v.id),
          name: v.displayName || v.fileName,
          versionNumber: v.displayName || v.fileName,
          gameVersions: v.gameVersions || [],
          loaders: (v.modLoaders || []).map((l: any) => l.name || l),
          datePublished: v.fileDate,
          downloads: 0,
          type: v.releaseType === 1 ? 'release' : v.releaseType === 2 ? 'beta' : 'alpha',
          dependencies: [],
          files: [{
            url: v.downloadUrl,
            filename: v.fileName,
            primary: true,
            size: v.fileLength || 0
          }]
        }))
        setVersions(modVersions)
      }
    } catch (err) {
      console.error('Failed to fetch versions:', err)
    } finally {
      setIsLoadingVersions(false)
    }
  }, [id, projectSource])

  useEffect(() => {
    fetchProjectDetails()
    fetchVersions()
  }, [fetchProjectDetails, fetchVersions])

  // Determine current target instance object
  const currentTarget = instances.find(i => i.id === selectedInstanceId) || activeInstance || instances[0]

  // Check if this project is already installed in the current target instance
  const isInstalled = project ? installedModFiles.some(f => {
    const slug = (project.slug || project.id).toLowerCase()
    const name = project.name.toLowerCase().replace(/\s+/g, '')
    const cleanF = f.replace(/[^a-z0-9]/g, '')
    return cleanF.includes(slug.replace(/[^a-z0-9]/g, '')) || cleanF.includes(name)
  }) : false

  // Check compatibility with selected target instance
  const isCompatibleWithCurrentTarget = useMemo(() => {
    if (!currentTarget?.mcVersion || versions.length === 0) return true
    const loaderType = currentTarget?.modLoader?.type?.toLowerCase() || 'fabric'
    const mcVer = currentTarget.mcVersion

    if (project?.projectType === 'shader' || project?.projectType === 'resourcepack') {
      return true
    }

    return versions.some(
      v => v.gameVersions.includes(mcVer) &&
           (v.loaders.length === 0 || v.loaders.map(l => l.toLowerCase()).includes(loaderType))
    )
  }, [currentTarget, versions, project])

  const handleOpenFolder = () => {
    if (!currentTarget) return
    playSound('click')
    const folderType =
      project?.projectType === 'shader' ? 'shaderpacks' :
        project?.projectType === 'resourcepack' ? 'resourcepacks' :
        project?.projectType === 'modpack' ? '' : 'mods'

    openInstanceFolder(currentTarget.id, folderType)
    setNotification({
      type: 'success',
      message: `Opened "${folderType || 'game directory'}" folder in File Explorer.`
    })
  }

  const handleInstallVersion = async (version: ModVersion) => {
    if (!currentTarget) {
      playSound('error')
      setNotification({ type: 'error', message: 'Please create an instance first' })
      return
    }

    const primaryFile = version.files.find(f => f.primary) || version.files[0]
    if (!primaryFile || !primaryFile.url) {
      playSound('error')
      setNotification({ type: 'error', message: 'No downloadable file found for this version' })
      return
    }

    setInstallingVersionId(version.id)
    playSound('click')
    try {
      const folderType =
        project?.projectType === 'shader' ? 'shaderpacks' :
          project?.projectType === 'resourcepack' ? 'resourcepacks' :
          project?.projectType === 'modpack' ? 'modpack' : 'mods'

      const result = await window.electronAPI?.installMod({
        instanceId: currentTarget.id,
        downloadUrl: primaryFile.url,
        fileName: primaryFile.filename,
        folderType,
        dependencies: version.dependencies
      })

      if (result?.success) {
        playSound('success')
        const locationTip =
          folderType === 'shaderpacks'
            ? 'In-game: Video Settings > Shader Packs to select it.'
            : folderType === 'resourcepacks'
            ? 'In-game: Options > Resource Packs to activate it.'
            : folderType === 'modpack'
            ? 'All modpack files & configs installed.'
            : 'In-game: Click "Mods" button to configure.'

        setNotification({
          type: 'success',
          message: `Installed "${project?.name}" into "${currentTarget.name}"! (${locationTip})`
        })
        loadInstalledMods(currentTarget.id)
      } else {
        playSound('error')
        setNotification({ type: 'error', message: result?.error || 'Installation failed' })
      }
    } catch (err) {
      playSound('error')
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error installing package'
      })
    } finally {
      setInstallingVersionId(null)
    }
  }

  const handleInstallLatest = () => {
    let bestVersion: ModVersion | undefined
    const loaderType = currentTarget?.modLoader?.type?.toLowerCase() || 'fabric'
    const mcVer = currentTarget?.mcVersion

    if (mcVer) {
      bestVersion = versions.find(
        v => v.gameVersions.includes(mcVer) &&
             (v.loaders.length === 0 || v.loaders.map(l => l.toLowerCase()).includes(loaderType)) &&
             v.type === 'release'
      ) || versions.find(
        v => v.gameVersions.includes(mcVer) &&
             (v.loaders.length === 0 || v.loaders.map(l => l.toLowerCase()).includes(loaderType))
      )
    }

    if (!bestVersion && (project?.projectType === 'shader' || project?.projectType === 'resourcepack')) {
      bestVersion = versions.find(v => v.type === 'release') || versions[0]
    }

    if (bestVersion) {
      handleInstallVersion(bestVersion)
    } else {
      playSound('error')
      setNotification({
        type: 'error',
        message: `No version of "${project?.name}" matches Minecraft ${mcVer} (${loaderType}). Please select a compatible version from the Versions tab below.`
      })
    }
  }

  // Filter versions
  const allGameVersions = Array.from(new Set(versions.flatMap(v => v.gameVersions))).sort().reverse()
  const allLoaders = Array.from(new Set(versions.flatMap(v => v.loaders)))

  const filteredVersions = versions.filter(v => {
    if (versionFilter.gameVersion !== 'All' && !v.gameVersions.includes(versionFilter.gameVersion)) return false
    if (versionFilter.loader !== 'All' && !v.loaders.some(l => l.toLowerCase() === versionFilter.loader.toLowerCase())) return false
    if (versionFilter.search.trim()) {
      const q = versionFilter.search.toLowerCase()
      const matchName = v.name.toLowerCase().includes(q)
      const matchNum = v.versionNumber.toLowerCase().includes(q)
      if (!matchName && !matchNum) return false
    }
    return true
  })

  const displayedVersions = showAllVersions ? filteredVersions : filteredVersions.slice(0, 15)

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-3 border-purple-500 border-t-transparent shadow-[0_0_25px_rgba(168,85,247,0.4)]" />
        <p className="text-sm font-bold text-slate-300">Fetching project details from Modrinth...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <HiExclamationCircle size={36} />
        </div>
        <h2 className="text-xl font-bold text-white font-display">Project Not Found</h2>
        <p className="max-w-md text-xs text-slate-400">{error || 'Could not load details for this project.'}</p>
        <button
          type="button"
          onClick={() => {
            playSound('click')
            navigate('/mods')
          }}
          className="mt-2 flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-purple-500 transition-all active:scale-95"
        >
          <HiArrowLeft size={16} />
          <span>Back to Browse</span>
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-full w-full max-w-full flex-col overflow-x-hidden bg-transparent select-none font-sans text-slate-100 pb-36">
      {/* ── ATMOSPHERIC GLOW AURA ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/3 h-[500px] w-[650px] rounded-full blur-[140px] opacity-35 transition-all"
          style={{ background: 'rgba(168, 85, 247, 0.12)' }}
        />
        <div
          className="absolute top-1/2 -right-28 h-[450px] w-[550px] rounded-full blur-[130px] opacity-30 transition-all"
          style={{ background: 'rgba(6, 182, 212, 0.10)' }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 md:px-8 pt-6 pb-6">
        {/* ── TOP NAV BAR & CONTROLS ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              playSound('click')
              navigate('/mods')
            }}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0B0F19]/80 px-4 py-2 text-xs font-bold text-slate-200 hover:text-white hover:border-purple-500/40 hover:bg-white/10 transition-all shadow-md backdrop-blur-xl active:scale-95"
          >
            <HiArrowLeft size={16} />
            <span>Back to Browse</span>
          </button>

          {/* Target Instance Picker & Open Folder Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {currentTarget && (
              <button
                type="button"
                onClick={handleOpenFolder}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0B0F19]/80 hover:bg-white/10 hover:border-purple-500/40 px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md backdrop-blur-xl active:scale-95"
                title="Open folder in File Explorer"
              >
                <HiFolderOpen size={16} className="text-purple-400" />
                <span>
                  Open {project.projectType === 'shader' ? 'Shaders' : project.projectType === 'resourcepack' ? 'Packs' : 'Mods'} Folder
                </span>
              </button>
            )}

            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-[#0B0F19]/90 px-3.5 py-2 backdrop-blur-xl shadow-lg font-mono">
              <HiServerStack className="text-emerald-400" size={16} />
              <span className="text-[11px] font-bold text-slate-400">Target:</span>
              {instances.length > 0 ? (
                <select
                  value={selectedInstanceId}
                  onChange={(e) => {
                    playSound('click')
                    setSelectedInstanceId(e.target.value)
                    const inst = instances.find(i => i.id === e.target.value)
                    if (inst) setActiveInstance(inst)
                  }}
                  className="bg-transparent text-xs font-bold text-emerald-300 focus:outline-none cursor-pointer pr-1"
                >
                  {instances.map((inst) => (
                    <option key={inst.id} value={inst.id} className="bg-[#0B0F19] text-white">
                      {inst.name} ({inst.mcVersion})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs font-bold text-rose-400">No Instances Created</span>
              )}
            </div>
          </div>
        </div>

        {/* ── HERO BANNER & HEADER CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0A0D15]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
        >
          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-5">
              {/* Icon */}
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-3xl border border-white/15 bg-[#07090E] shadow-2xl flex items-center justify-center">
                {project.iconUrl ? (
                  <img src={project.iconUrl} alt={project.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl bg-gradient-to-br from-purple-700 to-indigo-900 text-white font-bold">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Title & Info */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl font-display">
                    {project.name}
                  </h1>
                  <span className="rounded-xl border border-purple-500/30 bg-purple-500/15 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-purple-300">
                    {PROJECT_TYPE_LABELS[project.projectType] || 'Mod'}
                  </span>
                  {isInstalled && (
                    <span className="flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                      <HiCheckCircle size={14} />
                      Installed
                    </span>
                  )}
                </div>

                <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <HiUser size={13} className="text-slate-500" />
                  <span>By</span>
                  <span className="font-bold text-purple-300">{project.author}</span>
                  <span className="text-slate-600">•</span>
                  <span>{formatLicense(project.license)}</span>
                </p>

                <p className="mt-2 line-clamp-2 max-w-2xl text-xs leading-relaxed text-slate-300">
                  {project.description}
                </p>

                {/* Compatibility Alert Pill */}
                <div className="mt-3 flex items-center gap-2">
                  {isCompatibleWithCurrentTarget ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                      <HiCheck size={13} />
                      Compatible with {currentTarget?.name || 'Active Instance'} ({currentTarget?.mcVersion || '1.20+'})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                      <HiExclamationCircle size={13} />
                      Version Mismatch: Instance is {currentTarget?.mcVersion} ({currentTarget?.modLoader?.type || 'Fabric'})
                    </span>
                  )}
                </div>

                {/* Stats Bar */}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1">
                    <HiArrowDownTray size={14} className="text-purple-400" />
                    <strong className="text-white">{formatNumber(project.downloads)}</strong>
                    <span className="text-slate-400">downloads</span>
                  </div>

                  {project.followers > 0 && (
                    <div className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1">
                      <HiHeart size={14} className="text-rose-400" />
                      <strong className="text-white">{formatNumber(project.followers)}</strong>
                      <span className="text-slate-400">followers</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1">
                    <HiCalendar size={14} className="text-slate-500" />
                    <span>Updated {formatDate(project.dateModified)}</span>
                  </div>

                  {/* Categories */}
                  {project.categories.slice(0, 3).map(cat => (
                    <span
                      key={cat}
                      className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-0.5 text-[10px] text-slate-400 capitalize"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex shrink-0 flex-row md:flex-col md:items-end gap-2.5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                disabled={installingVersionId !== null || versions.length === 0}
                onClick={handleInstallLatest}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(168,85,247,0.35)] transition-all disabled:opacity-50 active:scale-95"
              >
                {installingVersionId ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <HiArrowDownTray size={16} />
                    <span>{isInstalled ? 'Reinstall Latest' : 'Install to Target'}</span>
                  </>
                )}
              </motion.button>

              {project.sourceUrl && (
                <a
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playSound('click')}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                >
                  <HiCodeBracket size={14} className="text-purple-400" />
                  <span>Source</span>
                  <HiArrowTopRightOnSquare size={11} className="text-slate-500" />
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── NOTIFICATION TOAST ── */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'mb-6 flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs font-bold shadow-2xl backdrop-blur-xl',
                notification.type === 'success'
                  ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200'
                  : 'border-rose-500/40 bg-rose-950/80 text-rose-200'
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
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <HiXMark size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 3-TAB MODRINTH NAVIGATION ── */}
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0A0D15]/90 p-1.5 backdrop-blur-xl shadow-xl">
          <button
            type="button"
            onClick={() => {
              playSound('click')
              setActiveTab('description')
            }}
            className={cn(
              'flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all',
              activeTab === 'description'
                ? 'bg-purple-600 text-white shadow-[0_0_18px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <HiDocumentText size={16} />
            <span>Description</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click')
              setActiveTab('versions')
            }}
            className={cn(
              'flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all',
              activeTab === 'versions'
                ? 'bg-purple-600 text-white shadow-[0_0_18px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <HiClock size={16} />
            <span>Versions</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black">
              {versions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click')
              setActiveTab('gallery')
            }}
            className={cn(
              'flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all',
              activeTab === 'gallery'
                ? 'bg-purple-600 text-white shadow-[0_0_18px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <HiPhoto size={16} />
            <span>Gallery</span>
            {project.gallery.length > 0 && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black">
                {project.gallery.length}
              </span>
            )}
          </button>
        </div>

        {/* ── TAB 1: DESCRIPTION & OVERVIEW ── */}
        {activeTab === 'description' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Description column */}
            <div className="space-y-6 lg:col-span-2 min-w-0">
              <div className="rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-7 shadow-2xl backdrop-blur-xl overflow-hidden">
                <h2 className="mb-5 flex items-center gap-2 text-base font-extrabold text-white font-display">
                  <HiDocumentText className="text-purple-400" size={18} />
                  About this Project
                </h2>

                {/* Rendered Markdown Body */}
                <div className="prose prose-invert prose-slate max-w-none text-slate-300 text-xs leading-relaxed [&_a]:text-purple-400 [&_a]:underline [&_img]:rounded-xl [&_img]:max-w-full [&_img]:inline-block [&_img]:my-2 [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-white [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-white [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-1 [&_code]:text-purple-300 [&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-black/60 [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-2xl [&_pre]:p-4 [&_li]:text-slate-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_hr]:border-white/10 [&_blockquote]:border-l-4 [&_blockquote]:border-purple-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-white/10 [&_th]:bg-white/5 [&_th]:p-2 [&_td]:border [&_td]:border-white/10 [&_td]:p-2">
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      iframe: ({ node, ...props }) => (
                        <div className="my-4 aspect-video w-full max-w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black">
                          <iframe
                            {...props}
                            className="h-full w-full border-0"
                            style={{ maxWidth: '100%', width: '100%' }}
                          />
                        </div>
                      ),
                      video: ({ node, ...props }) => (
                        <div className="my-4 aspect-video w-full max-w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black">
                          <video
                            {...props}
                            className="h-full w-full"
                            controls
                          />
                        </div>
                      )
                    }}
                  >
                    {project.body || project.description || 'No description provided.'}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Gallery teaser inside description */}
              {project.gallery.length > 0 && (
                <div className="rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-6 shadow-2xl backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-extrabold text-white font-display">
                      <HiPhoto className="text-purple-400" size={16} />
                      Screenshot Preview
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click')
                        setActiveTab('gallery')
                      }}
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View all {project.gallery.length} images →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {project.gallery.slice(0, 6).map((img, idx) => (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        key={idx}
                        onClick={() => {
                          playSound('click')
                          setSelectedImageIndex(idx)
                          setActiveTab('gallery')
                        }}
                        className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-md"
                      >
                        <img
                          src={img.url}
                          alt={img.title || `Screenshot ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Information Column */}
            <div className="space-y-4">
              {/* Project Details Box */}
              <div className="rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-5 shadow-2xl backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                  Technical Details
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5 gap-2">
                    <span className="text-slate-400 shrink-0">License</span>
                    <span className="font-bold text-white text-right truncate max-w-[170px]" title={project.license}>
                      {formatLicense(project.license)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5 gap-2">
                    <span className="text-slate-400 shrink-0">Client Side</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono',
                      project.clientSide?.toLowerCase() === 'required' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25' :
                      project.clientSide?.toLowerCase() === 'optional' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' :
                      'bg-slate-800 text-slate-400 border border-white/5'
                    )}>
                      {project.clientSide || 'Supported'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5 gap-2">
                    <span className="text-slate-400 shrink-0">Server Side</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono',
                      project.serverSide?.toLowerCase() === 'required' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25' :
                      project.serverSide?.toLowerCase() === 'optional' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' :
                      'bg-slate-800/80 text-slate-400 border border-white/5'
                    )}>
                      {project.serverSide || 'Unsupported'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="text-slate-400">Published</span>
                    <span className="font-bold text-white font-mono">{formatDate(project.dateCreated)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Updated</span>
                    <span className="font-bold text-white font-mono">{formatDate(project.dateModified)}</span>
                  </div>
                </div>
              </div>

              {/* Loaders Supported */}
              {(() => {
                const displayLoaders = project.loaders.filter(l => l.toLowerCase() !== 'minecraft' && l.toLowerCase() !== 'canvas')
                if (displayLoaders.length === 0) return null
                return (
                  <div className="rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-5 shadow-2xl backdrop-blur-xl">
                    <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                      Supported Loaders
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {displayLoaders.map(loader => (
                        <span
                          key={loader}
                          className="rounded-lg border border-purple-500/25 bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-300 capitalize font-mono"
                        >
                          {loader}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Compatible Game Versions */}
              {project.gameVersions.length > 0 && (
                <div className="rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-5 shadow-2xl backdrop-blur-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                      Minecraft Versions
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">{project.gameVersions.length} versions</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 font-mono">
                    {(showAllVersionsSidebar ? project.gameVersions : project.gameVersions.slice(0, 10)).map(v => (
                      <span
                        key={v}
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-300"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                  {project.gameVersions.length > 10 && (
                    <button
                      type="button"
                      onClick={() => setShowAllVersionsSidebar(!showAllVersionsSidebar)}
                      className="mt-3 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {showAllVersionsSidebar ? 'Show Less' : `+${project.gameVersions.length - 10} more versions...`}
                    </button>
                  )}
                </div>
              )}

              {/* External Links */}
              <div className="rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-5 shadow-2xl backdrop-blur-xl">
                <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                  Official Links
                </h3>
                <div className="space-y-2 text-xs">
                  {project.sourceUrl && (
                    <a
                      href={project.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playSound('click')}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5 font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                    >
                      <span className="flex items-center gap-2">
                        <HiCodeBracket size={14} className="text-purple-400" />
                        Source Code
                      </span>
                      <HiArrowTopRightOnSquare size={12} className="text-slate-500" />
                    </a>
                  )}

                  {project.issuesUrl && (
                    <a
                      href={project.issuesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playSound('click')}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5 font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                    >
                      <span className="flex items-center gap-2">
                        <HiFlag size={14} className="text-rose-400" />
                        Issue Tracker
                      </span>
                      <HiArrowTopRightOnSquare size={12} className="text-slate-500" />
                    </a>
                  )}

                  {project.wikiUrl && (
                    <a
                      href={project.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playSound('click')}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5 font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                    >
                      <span className="flex items-center gap-2">
                        <HiDocumentText size={14} className="text-emerald-400" />
                        Documentation / Wiki
                      </span>
                      <HiArrowTopRightOnSquare size={12} className="text-slate-500" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: VERSIONS DIRECTORY ── */}
        {activeTab === 'versions' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0A0D15]/90 p-4 backdrop-blur-xl shadow-xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-400">Filters:</span>

                {/* Game Version Filter */}
                <select
                  value={versionFilter.gameVersion}
                  onChange={(e) => setVersionFilter(f => ({ ...f, gameVersion: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-purple-500 font-mono shadow-inner"
                >
                  <option value="All">All Game Versions</option>
                  {allGameVersions.map(v => (
                    <option key={v} value={v} className="bg-[#0B0F19] text-white">
                      {v}
                    </option>
                  ))}
                </select>

                {/* Loader Filter */}
                <select
                  value={versionFilter.loader}
                  onChange={(e) => setVersionFilter(f => ({ ...f, loader: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-purple-500 font-mono shadow-inner"
                >
                  <option value="All">All Loaders</option>
                  {allLoaders.map(l => (
                    <option key={l} value={l} className="bg-[#0B0F19] text-white capitalize">
                      {l}
                    </option>
                  ))}
                </select>

                {/* Version Search */}
                <input
                  type="text"
                  placeholder="Search versions..."
                  value={versionFilter.search}
                  onChange={(e) => setVersionFilter(f => ({ ...f, search: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>

              <div className="text-xs font-bold text-slate-400 font-mono">
                Showing {displayedVersions.length} of {filteredVersions.length} files
              </div>
            </div>

            {/* Versions Table / Cards */}
            {isLoadingVersions ? (
              <div className="flex h-48 items-center justify-center">
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                  <span>Loading version history...</span>
                </div>
              </div>
            ) : filteredVersions.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0A0D15]/80 p-6 text-slate-500">
                <HiExclamationCircle size={32} className="mb-2 text-slate-500" />
                <p className="text-xs font-bold text-slate-400">No versions match the selected filters.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {displayedVersions.map((v) => {
                  const primaryFile = v.files.find(f => f.primary) || v.files[0]
                  const isCompatibleWithTarget = currentTarget?.mcVersion
                    ? v.gameVersions.includes(currentTarget.mcVersion)
                    : true

                  return (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#0A0D15]/90 p-4 shadow-xl backdrop-blur-xl transition-all hover:border-purple-500/40 hover:bg-[#0E121F] sm:flex-row sm:items-center"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Type Badge */}
                        <span className={cn(
                          'shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider font-mono',
                          VERSION_TYPE_STYLES[v.type] || VERSION_TYPE_STYLES.release
                        )}>
                          {v.type}
                        </span>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="truncate text-xs font-extrabold text-white">
                              {v.name}
                            </h4>
                            <span className="font-mono text-[10px] text-slate-400 font-semibold">
                              {v.versionNumber}
                            </span>
                          </div>

                          {/* Badges for loaders and game versions */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono">
                            {v.loaders.map(loader => (
                              <span
                                key={loader}
                                className="rounded-md border border-white/5 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-bold text-purple-300 capitalize"
                              >
                                {loader}
                              </span>
                            ))}
                            <span className="text-[10px] text-slate-600">•</span>
                            <span className="text-[10px] font-medium text-slate-400">
                              MC: {v.gameVersions.slice(0, 4).join(', ')}
                              {v.gameVersions.length > 4 && ` +${v.gameVersions.length - 4}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metadata & Install Action */}
                      <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                        <div className="flex flex-col items-end text-[10px] font-mono font-medium text-slate-400">
                          <span>{formatDate(v.datePublished)}</span>
                          {primaryFile && primaryFile.size > 0 && (
                            <span className="text-slate-500">{formatBytes(primaryFile.size)}</span>
                          )}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          disabled={installingVersionId === v.id}
                          onClick={() => handleInstallVersion(v)}
                          className={cn(
                            'flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 active:scale-95',
                            isCompatibleWithTarget
                              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                              : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                          )}
                        >
                          {installingVersionId === v.id ? (
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
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                })}

                {/* Show All / Show Less button */}
                {filteredVersions.length > 15 && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllVersions(!showAllVersions)}
                      className="rounded-xl border border-white/10 bg-[#0A0D15]/80 px-5 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-lg active:scale-95"
                    >
                      {showAllVersions ? 'Show Less' : `Show All ${filteredVersions.length} Versions`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: GALLERY & SCREENSHOTS ── */}
        {activeTab === 'gallery' && (
          <div>
            {project.gallery.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0A0D15]/80 p-8 text-slate-500">
                <HiPhoto size={48} className="mb-3 opacity-40 text-purple-400" />
                <p className="text-xs font-bold text-slate-400">No screenshots available for this project.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {project.gallery.map((img, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      playSound('click')
                      setSelectedImageIndex(idx)
                    }}
                    className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#07090E] shadow-xl"
                  >
                    <img
                      src={img.url}
                      alt={img.title || `Screenshot ${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {img.featured && (
                      <span className="absolute top-2.5 right-2.5 rounded-lg border border-purple-500/40 bg-purple-500/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-300 backdrop-blur-md">
                        Featured
                      </span>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="truncate text-xs font-bold text-white font-display">{img.title || `Image #${idx + 1}`}</p>
                      {img.description && (
                        <p className="line-clamp-1 text-[10px] text-slate-300">{img.description}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LIGHTBOX MODAL ── */}
        <AnimatePresence>
          {selectedImageIndex !== null && project.gallery[selectedImageIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImageIndex(null)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-5 right-5 z-10 rounded-2xl bg-white/10 p-2.5 text-white hover:bg-white/20 transition-all shadow-lg active:scale-95"
              >
                <HiXMark size={20} />
              </button>

              {/* Prev Button */}
              {selectedImageIndex > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    playSound('click')
                    setSelectedImageIndex(selectedImageIndex - 1)
                  }}
                  className="absolute left-5 top-1/2 -translate-y-1/2 rounded-2xl bg-white/10 p-3 text-white hover:bg-white/20 transition-all shadow-lg active:scale-95"
                >
                  <HiChevronLeft size={24} />
                </button>
              )}

              {/* Next Button */}
              {selectedImageIndex < project.gallery.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    playSound('click')
                    setSelectedImageIndex(selectedImageIndex + 1)
                  }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 rounded-2xl bg-white/10 p-3 text-white hover:bg-white/20 transition-all shadow-lg active:scale-95"
                >
                  <HiChevronRight size={24} />
                </button>
              )}

              {/* Main Image */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-3xl border border-white/15 bg-black shadow-2xl"
              >
                <img
                  src={project.gallery[selectedImageIndex].url}
                  alt={project.gallery[selectedImageIndex].title || 'Screenshot'}
                  className="max-h-[80vh] w-auto object-contain"
                />
                {(project.gallery[selectedImageIndex].title || project.gallery[selectedImageIndex].description) && (
                  <div className="bg-[#07090E]/95 p-4 border-t border-white/10 text-center">
                    <h4 className="text-sm font-bold text-white font-display">
                      {project.gallery[selectedImageIndex].title}
                    </h4>
                    {project.gallery[selectedImageIndex].description && (
                      <p className="mt-1 text-xs text-slate-400">
                        {project.gallery[selectedImageIndex].description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}