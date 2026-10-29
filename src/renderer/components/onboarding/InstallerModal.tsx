import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiArrowDownTray, HiCube, HiBolt } from 'react-icons/hi2'

interface InstallerModalProps {
  onComplete: () => void
}

const STAGES = [
  { progress: 12, label: 'Initializing Astrix sandbox environment...', mb: '16 / 135 MB' },
  { progress: 28, label: 'Verifying Java Virtual Machine & components...', mb: '38 / 135 MB' },
  { progress: 54, label: 'Downloading core Minecraft libraries & dependencies...', mb: '74 / 135 MB' },
  { progress: 79, label: 'Optimizing high-performance gaming shaders & pipeline...', mb: '108 / 135 MB' },
  { progress: 95, label: 'Finalizing isolated instance storage...', mb: '129 / 135 MB' },
  { progress: 100, label: 'Setup complete! Launching Astrix...', mb: '135 / 135 MB' }
]

export default function InstallerModal({ onComplete }: InstallerModalProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [progress, setProgress] = useState(15)

  useEffect(() => {
    // Check Java in background if available
    if (window.electronAPI?.getJavaInstallations) {
      window.electronAPI.getJavaInstallations().catch(() => null)
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 600)
          return 100
        }
        const next = prev + Math.floor(Math.random() * 8) + 4
        return Math.min(100, next)
      })
    }, 280)

    return () => clearInterval(interval)
  }, [onComplete])

  useEffect(() => {
    const stage = STAGES.findIndex(s => progress <= s.progress)
    if (stage !== -1) {
      setCurrentStageIndex(stage)
    } else {
      setCurrentStageIndex(STAGES.length - 1)
    }
  }, [progress])

  const stageInfo = STAGES[currentStageIndex] || STAGES[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090E]/95 p-4 backdrop-blur-2xl select-none font-sans">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[540px] overflow-hidden rounded-3xl border border-white/10 bg-[#0E121B]/95 p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.35)]">
              <HiBolt size={22} className="fill-current text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-tight text-white font-display">Astrix Client</h3>
              </div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                Setting Up Java
              </p>
            </div>
          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Setting up your launcher for the first time
          </span>
        </div>

        {/* Card Body */}
        <div className="mt-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 shadow-inner">
            <HiArrowDownTray size={22} className="text-amber-400" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white font-display tracking-tight">Getting Ready</h2>
              <span className="font-mono text-sm font-black text-amber-400">{progress}%</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Setting up your launcher for the first time</p>
          </div>
        </div>

        {/* Progress Bar & Telemetry */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="truncate max-w-[340px] text-slate-300">{stageInfo.label}</span>
            <span className="text-amber-400/90 font-bold">{stageInfo.mb}</span>
          </div>

          {/* Glowing Track */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </div>
        </div>

        {/* Bottom Tip Strip */}
        <div className="mt-7 flex items-center gap-2.5 rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-slate-400">
          <HiCube size={16} className="shrink-0 text-amber-400" />
          <span>This is a one-time setup. Future launches will be instant.</span>
        </div>
      </motion.div>
    </div>
  )
}
