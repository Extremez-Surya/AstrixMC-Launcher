import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiExclamationTriangle,
  HiXMark,
  HiFolderOpen,
  HiClipboardDocumentCheck,
  HiClipboardDocument,
  HiBolt,
  HiArrowPath
} from 'react-icons/hi2'
import { useInstances } from '../../hooks/useInstances'

interface CrashData {
  code: number
  message: string
  instanceId?: string
}

export default function CrashDiagnosticModal() {
  const [crashData, setCrashData] = useState<CrashData | null>(null)
  const [crashReport, setCrashReport] = useState<{ fileName: string; content: string; path: string } | null>(null)
  const [recentLogs, setRecentLogs] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [fixedRam, setFixedRam] = useState(false)
  const { instances, updateInstance, openInstanceFolder } = useInstances()

  useEffect(() => {
    if (!window.electronAPI?.onGameCrashed) return

    const cleanup = window.electronAPI.onGameCrashed(async (data) => {
      setCrashData(data)
      setFixedRam(false)

      if (data.instanceId) {
        try {
          if (window.electronAPI?.getLatestCrashReport) {
            const report = await window.electronAPI.getLatestCrashReport(data.instanceId)
            setCrashReport(report)
          }
          if (window.electronAPI?.getCurrentLogs) {
            const logs = await window.electronAPI.getCurrentLogs(data.instanceId)
            setRecentLogs(logs.slice(-25))
          }
        } catch (e) {
          console.warn('Failed to fetch crash diagnostic details:', e)
        }
      }
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  if (!crashData) return null

  const targetInstance = instances.find((i) => i.id === crashData.instanceId)

  // Friendly human explanation
  const getExplanation = (code: number) => {
    if (code === 3221225477 || code === -1073741819) {
      return {
        title: 'Memory or GPU Driver Crash',
        description:
          'Minecraft experienced an Access Violation (0xC0000005). This usually occurs when RAM is exhausted, GPU drivers need an update, or a shader/rendering mod crashed.'
      }
    }
    if (code === 4294967291 || code === -5) {
      return {
        title: 'Out of Memory / Java Conflict',
        description:
          'Java halted execution because Minecraft ran out of allocated heap memory. Increasing memory allocation will fix this.'
      }
    }
    if (code === 1) {
      return {
        title: 'Game Engine or Mod Conflict',
        description:
          'Minecraft halted with an error. This is commonly caused by an incompatible mod version, corrupt options, or missing library dependencies.'
      }
    }
    return {
      title: `Unexpected Exit (Exit Code ${code})`,
      description: crashData.message || 'The Minecraft process terminated abruptly with a non-zero code.'
    }
  }

  const diagnosis = getExplanation(crashData.code)

  const handleCopyLogs = () => {
    const textToCopy =
      crashReport?.content ||
      recentLogs.join('\n') ||
      `AstrixMC Crash Log - Exit Code: ${crashData.code}\n${crashData.message}`

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenFolder = () => {
    if (crashData.instanceId) {
      openInstanceFolder(crashData.instanceId, 'crash-reports')
    }
  }

  const handleFixRam = async () => {
    if (!targetInstance) return
    await updateInstance(targetInstance.id, {
      memoryMin: '2',
      memoryMax: '6'
    })
    setFixedRam(true)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-2xl border border-red-500/20 bg-[#0C0E14] shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-red-500/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <HiExclamationTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">{diagnosis.title}</h3>
                <p className="text-xs text-red-300/80">Exit Code: {crashData.code}</p>
              </div>
            </div>
            <button
              onClick={() => setCrashData(null)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <HiXMark className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-sm leading-relaxed text-zinc-300">{diagnosis.description}</p>
              {targetInstance && (
                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">Profile:</span>
                  <span className="rounded bg-white/5 px-2 py-0.5 text-amber-400">{targetInstance.name}</span>
                  <span>·</span>
                  <span>MC {targetInstance.mcVersion}</span>
                  <span>·</span>
                  <span>Allocated: {targetInstance.memoryMax || 6} GB</span>
                </div>
              )}
            </div>

            {/* Crash log excerpt / report */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
                <span>{crashReport ? `Crash Report: ${crashReport.fileName}` : 'Recent Engine Logs'}</span>
                <span className="text-zinc-500">Auto-detected diagnostic</span>
              </div>
              <div className="relative rounded-xl border border-white/[0.08] bg-[#07080B] p-3">
                <pre className="max-h-48 overflow-y-auto font-mono text-[11px] leading-relaxed text-zinc-300 select-text whitespace-pre-wrap">
                  {crashReport?.content
                    ? crashReport.content.slice(0, 3000)
                    : recentLogs.length > 0
                    ? recentLogs.join('\n')
                    : 'No specific crash trace found. Check instance logs folder.'}
                </pre>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] bg-[#080A0E] px-6 py-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLogs}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {copied ? (
                  <>
                    <HiClipboardDocumentCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <HiClipboardDocument className="h-4 w-4" />
                    <span>Copy Logs</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOpenFolder}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <HiFolderOpen className="h-4 w-4 text-sky-400" />
                <span>Open Crash Folder</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {targetInstance && (
                <button
                  onClick={handleFixRam}
                  disabled={fixedRam}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    fixedRam
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500 text-black hover:bg-amber-400 shadow-md shadow-amber-500/20'
                  }`}
                >
                  <HiBolt className="h-4 w-4" />
                  <span>{fixedRam ? 'RAM Bumped to 6GB ✓' : 'Auto-Fix (Set 6GB RAM)'}</span>
                </button>
              )}

              <button
                onClick={() => setCrashData(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

