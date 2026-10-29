import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiPhoto,
  HiArrowPath,
  HiFolderOpen,
  HiMagnifyingGlass,
  HiTrash,
  HiClipboardDocument,
  HiCheck,
  HiXMark,
  HiChevronLeft,
  HiChevronRight,
  HiArrowsPointingOut,
  HiArrowDownTray,
  HiPlay,
  HiCalendar,
  HiSquare3Stack3D
} from 'react-icons/hi2'
import { useInstances } from '../hooks/useInstances'
import { playSound } from '../utils/sound'
import { cn } from '../lib/cn'
import type { GameInstance } from '../../shared/types/instance'

interface ScreenshotItem {
  id: string
  name: string
  fileName: string
  size: number
  dateModified: string
  dataUrl?: string
  fullPath?: string
  instanceId: string
  instanceName: string
  instanceIcon?: string
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return isoString
  }
}

export default function ScreenshotsPage() {
  const { instances, activeInstance } = useInstances()
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('all')
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'size'>('newest')
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Load screenshots from all instances or active instance
  const loadAllScreenshots = useCallback(async () => {
    if (!window.electronAPI?.getInstanceFiles) {
      setLoading(false)
      return
    }

    setLoading(true)
    const items: ScreenshotItem[] = []

    try {
      for (const inst of instances) {
        try {
          const files = await window.electronAPI.getInstanceFiles(inst.id, 'screenshots')
          if (Array.isArray(files)) {
            for (const f of files) {
              items.push({
                id: `${inst.id}-${f.fileName}`,
                name: f.name || f.fileName,
                fileName: f.fileName,
                size: f.size || 0,
                dateModified: f.dateModified || new Date().toISOString(),
                dataUrl: f.extra?.dataUrl,
                fullPath: f.extra?.fullPath,
                instanceId: inst.id,
                instanceName: inst.name,
                instanceIcon: inst.icon
              })
            }
          }
        } catch (err) {
          console.warn(`[Screenshots] Failed loading for instance ${inst.id}:`, err)
        }
      }
      setScreenshots(items)
    } finally {
      setLoading(false)
    }
  }, [instances])

  useEffect(() => {
    loadAllScreenshots()
  }, [loadAllScreenshots])

  // Filter & Sort screenshots
  const filteredScreenshots = useMemo(() => {
    let result = [...screenshots]

    // Filter by instance
    if (selectedInstanceId !== 'all') {
      result = result.filter((s) => s.instanceId === selectedInstanceId)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (s) =>
          s.fileName.toLowerCase().includes(q) ||
          s.instanceName.toLowerCase().includes(q) ||
          formatDate(s.dateModified).toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
      } else if (sortBy === 'oldest') {
        return new Date(a.dateModified).getTime() - new Date(b.dateModified).getTime()
      } else {
        return b.size - a.size
      }
    })

    return result
  }, [screenshots, selectedInstanceId, searchQuery, sortBy])

  // Current previewed screenshot
  const currentPreview = previewIndex !== null ? filteredScreenshots[previewIndex] : null

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (previewIndex === null) return

      if (e.key === 'Escape') {
        setPreviewIndex(null)
      } else if (e.key === 'ArrowRight') {
        setPreviewIndex((prev) => (prev !== null && prev < filteredScreenshots.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowLeft') {
        setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredScreenshots.length - 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previewIndex, filteredScreenshots.length])

  // Copy screenshot image to clipboard
  const handleCopyScreenshot = async (item: ScreenshotItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    playSound('click')

    if (!item.dataUrl) {
      showToast('Image data unavailable to copy')
      return
    }

    try {
      const res = await fetch(item.dataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 2000)
      showToast('Screenshot copied to clipboard!')
    } catch {
      // Fallback: copy file path
      if (item.fullPath) {
        await navigator.clipboard.writeText(item.fullPath)
        showToast('Screenshot path copied to clipboard!')
      }
    }
  }

  // Open screenshot folder
  const handleOpenFolder = (instanceId?: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    playSound('click')
    const targetId = instanceId || (selectedInstanceId !== 'all' ? selectedInstanceId : activeInstance?.id || instances[0]?.id)
    if (targetId && window.electronAPI?.openInstanceFolder) {
      window.electronAPI.openInstanceFolder(targetId, 'screenshots')
      showToast('Opened screenshots directory')
    }
  }

  // Delete screenshot
  const handleDeleteScreenshot = async (item: ScreenshotItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    playSound('click')

    if (!window.electronAPI?.deleteInstanceFile) return
    setDeletingId(item.id)

    try {
      await window.electronAPI.deleteInstanceFile(item.instanceId, 'screenshots', item.fileName)
      setScreenshots((prev) => prev.filter((s) => s.id !== item.id))
      showToast(`Deleted ${item.fileName}`)
      if (previewIndex !== null) {
        setPreviewIndex(null)
      }
    } catch (err) {
      console.error('Failed to delete screenshot:', err)
      showToast('Failed to delete screenshot')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="relative min-h-screen px-6 pt-6 pb-28 text-white select-none">
      
      {/* Toast Notification */}
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

        {/* ══════════ TOP HEADER ══════════ */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <HiPhoto size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-black text-white tracking-wide">
                  Screenshots
                </h1>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-mono font-bold text-emerald-300">
                  {filteredScreenshots.length} {filteredScreenshots.length === 1 ? 'Shot' : 'Shots'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                In-game Minecraft screenshots captured with <span className="text-slate-200 font-mono font-bold">F2</span> across your profiles.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                playSound('click')
                loadAllScreenshots()
              }}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
              title="Refresh screenshots"
            >
              <HiArrowPath size={15} className={cn(loading && 'animate-spin')} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenFolder()}
              className="flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:text-white transition-all shadow-lg active:scale-95"
            >
              <HiFolderOpen size={16} />
              <span>Open Folder</span>
            </button>
          </div>
        </div>

        {/* ══════════ FILTERS & CONTROLS TOOLBAR ══════════ */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-3xl border border-white/[0.08] bg-[#0A0E18]/80 p-3.5 backdrop-blur-xl shadow-xl">
          
          {/* Instance Filter Tabs / Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                playSound('tab')
                setSelectedInstanceId('all')
              }}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0',
                selectedInstanceId === 'all'
                  ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              )}
            >
              <HiSquare3Stack3D size={14} />
              <span>All Profiles</span>
              <span className={cn('text-[10px] font-mono px-1.5 py-0.2 rounded', selectedInstanceId === 'all' ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-400')}>
                {screenshots.length}
              </span>
            </button>

            {instances.map((inst) => {
              const count = screenshots.filter((s) => s.instanceId === inst.id).length
              const isSelected = selectedInstanceId === inst.id

              return (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => {
                    playSound('tab')
                    setSelectedInstanceId(inst.id)
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0',
                    isSelected
                      ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  <span className="truncate max-w-[120px]">{inst.name}</span>
                  <span className={cn('text-[10px] font-mono px-1.5 py-0.2 rounded', isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-400')}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shots..."
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <HiXMark size={14} />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => {
                playSound('click')
                setSortBy(e.target.value as any)
              }}
              className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-300 focus:border-emerald-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="size">Largest Size</option>
            </select>
          </div>
        </div>

        {/* ══════════ MAIN SCREENSHOTS GRID / EMPTY STATE ══════════ */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="h-10 w-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-4" />
            <p className="text-sm font-bold text-white">Scanning instance directories...</p>
            <p className="text-xs text-slate-500 mt-1">Collecting in-game screenshot captures</p>
          </div>
        ) : filteredScreenshots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredScreenshots.map((item, index) => {
              const isCopied = copiedId === item.id
              const isDeleting = deletingId === item.id

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    playSound('click')
                    setPreviewIndex(index)
                  }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E131F]/90 shadow-lg hover:border-emerald-500/40 hover:shadow-[0_8px_25px_rgba(16,185,129,0.15)] transition-all cursor-pointer"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/60 flex items-center justify-center">
                    {item.dataUrl ? (
                      <img
                        src={item.dataUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <HiPhoto size={36} />
                        <span className="text-[10px] mt-1 font-mono">Image preview</span>
                      </div>
                    )}

                    {/* Hover Overlay with Action Buttons */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                      {/* Top Action Bar */}
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-black/60 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-bold backdrop-blur-md">
                          {item.instanceName}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Copy to Clipboard */}
                          <button
                            type="button"
                            onClick={(e) => handleCopyScreenshot(item, e)}
                            title="Copy image to clipboard"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-slate-300 hover:text-white hover:bg-emerald-500/30 transition-colors backdrop-blur-md"
                          >
                            {isCopied ? <HiCheck className="text-emerald-400" size={14} /> : <HiClipboardDocument size={14} />}
                          </button>

                          {/* Reveal in Explorer */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenFolder(item.instanceId, e)}
                            title="Show in file explorer"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-slate-300 hover:text-white hover:bg-white/20 transition-colors backdrop-blur-md"
                          >
                            <HiFolderOpen size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteScreenshot(item, e)}
                            title="Delete screenshot"
                            disabled={isDeleting}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors backdrop-blur-md"
                          >
                            <HiTrash size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Expand Button Center */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/90 text-black px-3 py-1 text-xs font-bold shadow-lg scale-90 group-hover:scale-100 transition-transform">
                          <HiArrowsPointingOut size={13} />
                          <span>View Fullscreen</span>
                        </div>
                      </div>

                      {/* Bottom Info */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                        <span>{formatBytes(item.size)}</span>
                        <span>{formatDate(item.dateModified)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="flex items-center justify-between p-3 border-t border-white/5 bg-[#0A0D15]">
                    <div className="flex flex-col truncate pr-2">
                      <span className="font-mono text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {formatDate(item.dateModified)}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                      {formatBytes(item.size)}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          /* ══════════ MODRINTH-STYLE EMPTY STATE ══════════ */
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0E131F]/90 via-[#0A0D15]/95 to-[#07090E] p-12 text-center shadow-2xl backdrop-blur-xl">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto max-w-md flex flex-col items-center">
              {/* Stacked Photo Illustration */}
              <div className="relative mb-6 flex items-center justify-center">
                <div className="absolute -left-5 top-1 h-20 w-24 -rotate-12 rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl backdrop-blur-md" />
                <div className="absolute -right-5 top-1 h-20 w-24 rotate-12 rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl backdrop-blur-md" />
                <div className="relative z-10 flex h-24 w-28 items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 to-black text-emerald-400 shadow-2xl">
                  <HiPhoto size={42} />
                </div>
              </div>

              <h2 className="font-display text-xl font-bold text-white">
                No screenshots yet
              </h2>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Screenshots you take in-game using <span className="font-mono font-bold text-slate-200">F2</span> will automatically appear here across all your profiles and instances.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenFolder()}
                  className="flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 px-5 py-2.5 text-xs font-bold text-emerald-300 hover:text-white transition-all shadow-lg active:scale-95"
                >
                  <HiFolderOpen size={16} />
                  <span>Open Screenshots Folder</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ══════════ FULLSCREEN LIGHTBOX MODAL ══════════ */}
      <AnimatePresence>
        {currentPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl"
          >
            {/* Top Lightbox Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 inset-x-4 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-3 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-300">
                  {currentPreview.instanceName}
                </span>
                <span className="font-mono text-xs font-bold text-white truncate max-w-md">
                  {currentPreview.fileName}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  • {formatDate(currentPreview.dateModified)} ({formatBytes(currentPreview.size)})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Copy Button */}
                <button
                  type="button"
                  onClick={() => handleCopyScreenshot(currentPreview)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all"
                  title="Copy to clipboard"
                >
                  <HiClipboardDocument size={14} />
                  <span>Copy</span>
                </button>

                {/* Open Folder */}
                <button
                  type="button"
                  onClick={() => handleOpenFolder(currentPreview.instanceId)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all"
                  title="Show in folder"
                >
                  <HiFolderOpen size={14} />
                  <span>Reveal</span>
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDeleteScreenshot(currentPreview)}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-300 hover:text-white transition-all"
                  title="Delete"
                >
                  <HiTrash size={14} />
                  <span>Delete</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setPreviewIndex(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
                >
                  <HiXMark size={18} />
                </button>
              </div>
            </div>

            {/* Previous Arrow */}
            {filteredScreenshots.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  playSound('click')
                  setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredScreenshots.length - 1))
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/80 text-white hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all shadow-2xl backdrop-blur-xl"
                title="Previous (Left Arrow)"
              >
                <HiChevronLeft size={24} />
              </button>
            )}

            {/* High-Res Image Display */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[82vh] max-w-[88vw] overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)]"
            >
              <img
                src={currentPreview.dataUrl}
                alt={currentPreview.name}
                className="max-h-[82vh] max-w-[88vw] object-contain select-none"
              />
            </div>

            {/* Next Arrow */}
            {filteredScreenshots.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  playSound('click')
                  setPreviewIndex((prev) => (prev !== null && prev < filteredScreenshots.length - 1 ? prev + 1 : 0))
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/80 text-white hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all shadow-2xl backdrop-blur-xl"
                title="Next (Right Arrow)"
              >
                <HiChevronRight size={24} />
              </button>
            )}

            {/* Bottom Caption Pill */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-6 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-4 py-1 text-xs font-mono text-slate-400 backdrop-blur-md"
            >
              <span>{previewIndex! + 1} of {filteredScreenshots.length}</span>
              <span>• Use Left / Right arrow keys to navigate</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
