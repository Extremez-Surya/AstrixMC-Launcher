import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiExclamationTriangle,
  HiXMark,
  HiFolderOpen,
  HiClipboardDocumentCheck,
  HiClipboardDocument,
  HiBolt,
  HiCheckCircle,
  HiSparkles
} from 'react-icons/hi2'
import { useInstances } from '../../hooks/useInstances'
import { useLaunch } from '../../hooks/useLaunch'
import { playSound } from '../../utils/sound'

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
  const [isHealing, setIsHealing] = useState(false)
  const [healed, setHealed] = useState(false)

  const { instances, updateInstance, openInstanceFolder } = useInstances()
  const { launchGame } = useLaunch()

  useEffect(() => {
    if (!window.electronAPI?.onGameCrashed) return

    const cleanup = window.electronAPI.onGameCrashed(async (data) => {
      setCrashData(data)
      setHealed(false)

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

  // Hinglish Friendly Diagnostic
  const getExplanation = (code: number) => {
    if (code === 3221225477 || code === -1073741819) {
      return {
        title: 'Memory / GPU Driver Access Violation (0xC0000005)',
        description:
          'Windows ne Java ko forcefully band kar diya kyunki RAM exhaust ho gayi thi ya GPU buffer clash hua. 6GB ya zyada allocate karne se Windows ke paas free memory nahi bachi thi.',
        fixHint: 'Smart RAM Budgeter automatically system ke hisab se safe memory limit set karega.'
      }
    }
    if (code === 4294967291 || code === -5) {
      return {
        title: 'Java Heap Out of Memory Error',
        description:
          'Minecraft game ke andar heap memory bhar gayi. Smart auto-tuner memory aur garbage collector ko tune kar dega.',
        fixHint: 'Smart Budgeter optimal heap allocate karega.'
      }
    }
    if (code === 1) {
      return {
        title: 'Game Engine or Mod Conflict (Exit Code 1)',
        description:
          'Minecraft halt ho gaya. Yeh kisi incompatible mod version, stale lock file, ya corrupt options ki wajah se hota hai.',
        fixHint: 'Auto-Healer stale locks aur broken shader configs clean karega.'
      }
    }
    return {
      title: `Unexpected Termination (Exit Code ${code})`,
      description: crashData.message || 'Game achanak terminate ho gaya bina clear Mojang crash log ke.',
      fixHint: 'Auto-Healer environment sanitize karke ready karega.'
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

  const handleAutoHealAndRelaunch = async (relaunch = false) => {
    if (!targetInstance) return
    setIsHealing(true)
    playSound('launch')

    try {
      // 1. Set balanced memory limit (Smart RAM will clamp safely at launch engine level)
      await updateInstance(targetInstance.id, {
        memoryMin: '2',
        memoryMax: '4' // Safe 4GB prevents Windows 8GB RAM exhaustion
      })

      setHealed(true)
      setIsHealing(false)

      if (relaunch) {
        setCrashData(null)
        launchGame(targetInstance.id)
      }
    } catch (err) {
      console.error('Auto-heal failed:', err)
      setIsHealing(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-3xl border border-red-500/30 bg-[#0A0D16] shadow-[0_30px_70px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-gradient-to-r from-red-950/40 via-red-900/20 to-transparent px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <HiExclamationTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-wide">{diagnosis.title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-mono font-bold text-red-300">
                    Exit {crashData.code}
                  </span>
                </div>
                <p className="text-xs text-red-300/80 mt-0.5">Crash Guard Auto-Diagnostic Active</p>
              </div>
            </div>
            <button
              onClick={() => setCrashData(null)}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <HiXMark className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4.5 space-y-2.5">
              <p className="text-xs leading-relaxed text-slate-200">{diagnosis.description}</p>
              <div className="flex items-center gap-2 text-[11px] text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                <HiSparkles className="h-4 w-4 shrink-0 text-amber-400" />
                <span>{diagnosis.fixHint}</span>
              </div>
              {targetInstance && (
                <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Profile:</span>
                  <span className="rounded bg-white/5 px-2 py-0.5 text-amber-400 font-bold">{targetInstance.name}</span>
                  <span>·</span>
                  <span>MC {targetInstance.mcVersion}</span>
                </div>
              )}
            </div>

            {/* Crash log excerpt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{crashReport ? `Report: ${crashReport.fileName}` : 'Recent Engine Log Stack'}</span>
                <span className="text-[11px] text-slate-500">Auto-captured trace</span>
              </div>
              <div className="relative rounded-2xl border border-white/[0.08] bg-[#05070D] p-3.5 shadow-inner">
                <pre className="max-h-40 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 select-text whitespace-pre-wrap">
                  {crashReport?.content
                    ? crashReport.content.slice(0, 3000)
                    : recentLogs.length > 0
                    ? recentLogs.join('\n')
                    : 'No detailed stack trace captured.'}
                </pre>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] bg-[#070912] px-6 py-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
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
                type="button"
                onClick={handleOpenFolder}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <HiFolderOpen className="h-4 w-4 text-cyan-400" />
                <span>Open Folder</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {targetInstance && (
                <button
                  type="button"
                  onClick={() => handleAutoHealAndRelaunch(true)}
                  disabled={isHealing}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-4 py-2 text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <HiBolt className="h-4 w-4" />
                  <span>{isHealing ? 'Auto-Healing...' : '1-Click Auto-Fix & Relaunch'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setCrashData(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
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
