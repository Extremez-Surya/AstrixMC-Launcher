import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiArrowPath,
  HiRocketLaunch,
  HiCheckCircle,
  HiXMark,
  HiSparkles,
  HiArrowDownTray
} from 'react-icons/hi2'
import { playSound } from '../../utils/sound'

interface UpdateStatus {
  state: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  version?: string
  percent?: number
  bytesPerSecond?: number
  transferred?: number
  total?: number
  releaseNotes?: string
  error?: string
}

export default function UpdateNotificationModal() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ state: 'idle' })
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (!window.electronAPI?.onUpdateStatus) return

    const unsub = window.electronAPI.onUpdateStatus((status: UpdateStatus) => {
      console.log('[AutoUpdater UI] Status update:', status)
      setUpdateStatus(status)

      if (status.state === 'downloaded') {
        playSound('level-up')
        setIsDismissed(false)
      } else if (status.state === 'available') {
        playSound('tab')
        setIsDismissed(false)
      }
    })

    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [])

  if (isDismissed) return null
  if (updateStatus.state === 'idle' || updateStatus.state === 'not-available' || updateStatus.state === 'checking') {
    return null
  }

  const handleRestart = () => {
    playSound('click')
    window.electronAPI?.restartAndInstallUpdate()
  }

  const formatMb = (bytes?: number) => {
    if (!bytes) return '0 MB'
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const formatSpeed = (bytesPerSec?: number) => {
    if (!bytesPerSec) return ''
    return `${(bytesPerSec / 1024 / 1024).toFixed(1)} MB/s`
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl border border-cyan-500/40 bg-[#091326]/95 p-5 text-white shadow-[0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-xl select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              {updateStatus.state === 'downloaded' ? (
                <HiCheckCircle className="text-emerald-400" size={20} />
              ) : updateStatus.state === 'downloading' ? (
                <HiArrowDownTray className="text-cyan-400 animate-bounce" size={18} />
              ) : (
                <HiSparkles size={18} />
              )}
            </div>
            <div>
              <span className="font-pixel text-xs font-black tracking-wider text-cyan-400">
                {updateStatus.state === 'downloaded'
                  ? 'UPDATE READY TO INSTALL'
                  : 'NEW UPDATE FOUND'}
              </span>
              <div className="text-[11px] text-slate-300 font-medium">
                AstrixMC Launcher {updateStatus.version ? `v${updateStatus.version}` : ''}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Dismiss"
          >
            <HiXMark size={16} />
          </button>
        </div>

        {/* Downloading State */}
        {updateStatus.state === 'downloading' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
              <span>Downloading update in background...</span>
              <span className="font-mono font-bold text-cyan-300">
                {updateStatus.percent || 0}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                initial={{ width: 0 }}
                animate={{ width: `${updateStatus.percent || 0}%` }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>
                {formatMb(updateStatus.transferred)} / {formatMb(updateStatus.total)}
              </span>
              <span>{formatSpeed(updateStatus.bytesPerSecond)}</span>
            </div>
          </div>
        )}

        {/* Downloaded / Ready to Restart */}
        {updateStatus.state === 'downloaded' && (
          <div className="mt-4">
            <p className="text-xs text-slate-200 leading-relaxed">
              New version has been downloaded automatically! Restart now to apply changes without reinstalling.
            </p>

            <button
              type="button"
              onClick={handleRestart}
              className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 font-pixel text-xs font-black tracking-wider text-black shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:from-cyan-400 hover:to-blue-500 active:scale-[0.99] transition-all"
            >
              <HiRocketLaunch size={16} />
              RESTART & APPLY UPDATE
            </button>
          </div>
        )}

        {/* Error State */}
        {updateStatus.state === 'error' && (
          <div className="mt-3 text-xs text-rose-300">
            {updateStatus.error || 'Failed to download update.'}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
