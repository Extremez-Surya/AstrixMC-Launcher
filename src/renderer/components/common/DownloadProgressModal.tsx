import { motion, AnimatePresence } from 'framer-motion'
import { useLaunch } from '../../hooks/useLaunch'
import logoImg from '../../assets/logo.jpg'

export default function DownloadProgressModal() {
  const { isLaunching, progress, stopGame } = useLaunch()

  if (!isLaunching || !progress || progress.stage === 'running' || progress.stage === 'error' || progress.stage === 'idle') {
    return null
  }

  const percent = progress.progress ?? 15
  const message = progress.message || 'Preparing game environment...'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="glass-panel relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0d12]/98 p-6 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex flex-col items-center text-center">
            {/* 3D Launcher Icon */}
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="relative mb-5"
            >
              <div className="absolute inset-0 rounded-2xl bg-white/10 blur-xl" />
              <img
                src={logoImg}
                alt="AstrixMC"
                className="relative h-16 w-16 rounded-2xl object-cover shadow-xl border border-white/20 filter grayscale contrast-125"
              />
            </motion.div>

            <h3 className="text-base font-black tracking-tight text-white mb-1 font-display">
              Preparing Minecraft Launch
            </h3>

            {/* Status Message */}
            <p className="max-w-xs truncate text-[12px] font-medium text-zinc-400 font-mono">
              {message}
            </p>

            {/* Progress Bar */}
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/[0.06] border border-white/10">
              <motion.div
                className="h-full rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                initial={{ width: '5%' }}
                animate={{ width: `${Math.max(5, Math.min(100, percent))}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>

            {/* Percentage */}
            <p className="mt-2 text-[11px] font-mono font-bold text-white">
              {percent}% Completed
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={stopGame}
              className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900/60 px-5 py-2 text-xs font-bold text-zinc-300 hover:border-zinc-500 hover:text-white transition-all shadow-lg font-mono"
            >
              Cancel Launch
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
