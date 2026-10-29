import { motion } from 'framer-motion'
import logoImg from '../../assets/logo.jpg'

export default function SplashScreen({
  status = 'All tasks completed',
  onClose
}: {
  status?: string
  onClose?: () => void
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d121d] select-none"
    >
      {/* Grid Pattern Background like Image 1 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        {/* Glowing Circle with 3D Cube (Image 1) */}
        <div className="relative mb-8 flex h-40 w-40 items-center justify-center">
          {/* Animated gradient ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-400 border-r-indigo-500 border-b-purple-500 shadow-[0_0_30px_rgba(56,189,248,0.35)]"
          />

          {/* Glowing backdrop */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-600/20 blur-xl" />

          {/* Astrix Cube Logo */}
          <img
            src={logoImg}
            alt="AstrixMC"
            className="relative h-20 w-20 rounded-2xl object-cover shadow-2xl ring-1 ring-white/20"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black tracking-tight text-white">
          AstrixMC <span className="text-sky-400">Launcher</span>
        </h1>

        {/* Version */}
        <p className="mt-1 text-xs font-semibold text-slate-500">
          v1.0.0
        </p>

        {/* Status text */}
        <p className="mt-8 text-xs font-medium text-slate-400">
          {status}
        </p>
      </motion.div>
    </div>
  )
}
