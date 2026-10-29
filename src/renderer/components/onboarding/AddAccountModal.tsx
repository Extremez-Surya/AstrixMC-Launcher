import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiUser,
  HiArrowRight,
  HiShieldCheck,
  HiBolt,
  HiXMark,
  HiArrowPath
} from 'react-icons/hi2'
import { useAuth } from '../../hooks/useAuth'

interface AddAccountModalProps {
  onComplete: () => void
  onClose?: () => void
}

// Sleek Astrix Glowing Flame Emblem
function AstrixFlameEmblem() {
  return (
    <div className="relative flex items-center justify-center w-16 h-16 mb-1">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-yellow-500/25 blur-xl animate-pulse" />
      <motion.div
        animate={{ y: [0, -4, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-[#0A0D15]/80 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-7 w-7 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.85)]"
        >
          <path d="M12.001 2c-.382 0-.749.193-.964.514C10.15 3.84 8.784 5.922 8.01 7.234 6.786 9.308 6 11.589 6 14.004c0 3.313 2.686 6 6.001 6 3.313 0 6-2.687 6-6 0-2.415-.786-4.696-2.01-6.77-.774-1.312-2.14-3.394-3.027-4.72-.215-.321-.582-.514-.963-.514zm.001 7.5c1.657 0 3 1.343 3 3 0 1.657-1.343 3-3 3-1.657 0-3-1.343-3-3 0-1.657 1.343-3 3-3z" />
        </svg>
      </motion.div>
    </div>
  )
}

// Minecraft Creeper Pixel Silhouette
function CreeperIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-amber-500/70 fill-current">
      <rect x="2" y="2" width="12" height="12" fill="none" />
      <rect x="3" y="4" width="3" height="3" />
      <rect x="10" y="4" width="3" height="3" />
      <rect x="6" y="7" width="4" height="4" />
      <rect x="5" y="9" width="1" height="4" />
      <rect x="10" y="9" width="1" height="4" />
      <rect x="6" y="10" width="4" height="1" />
    </svg>
  )
}

export default function AddAccountModal({ onComplete, onClose }: AddAccountModalProps) {
  const { loginOffline, loginMicrosoft, isLoading, error, clearError } = useAuth()
  const [mode, setMode] = useState<'offline' | 'microsoft'>('offline')
  const [offlineName, setOfflineName] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleOfflineSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = offlineName.trim()
    if (!trimmed || trimmed.length < 3 || trimmed.length > 16) {
      setValidationError('Username must be 3-16 characters')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setValidationError('Letters, numbers, and underscores only')
      return
    }

    setValidationError('')
    const ok = await loginOffline(trimmed)
    if (ok) {
      onComplete()
    }
  }

  const handleMicrosoft = async () => {
    clearError()
    const ok = await loginMicrosoft()
    if (ok) {
      onComplete()
    }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl select-none font-sans"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 flex flex-col items-center w-full max-w-[460px] rounded-[32px] border border-amber-500/35 bg-[#0C0F17]/96 px-8 pt-7 pb-6 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_45px_rgba(245,158,11,0.22)] ring-1 ring-black/60"
      >
        {/* Ambient subtle border halo glow behind card */}
        <div className="absolute -inset-[1px] rounded-[33px] bg-gradient-to-b from-amber-500/35 via-orange-500/15 to-transparent blur-md opacity-70 pointer-events-none -z-10" />

        {/* Close Button top-right */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 hover:border-amber-500/40 hover:text-white hover:bg-white/10 transition-all"
            title="Close"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        )}

        {/* 1. Official Astrix Flame Emblem */}
        <AstrixFlameEmblem />

        {/* 2. Title: Add an Account */}
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-[24px] font-black tracking-tight text-white leading-tight"
        >
          Add <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">Minecraft Account</span>
        </motion.h1>

        {/* 3. Subtitle with separators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-1 flex items-center gap-2.5 text-xs text-zinc-400 font-medium"
        >
          <div className="h-[1px] w-6 bg-white/[0.12]" />
          <span>Connect your player profile</span>
          <div className="h-[1px] w-6 bg-white/[0.12]" />
        </motion.div>

        {/* Creeper pixel accent */}
        <div className="my-2.5 flex items-center justify-center">
          <CreeperIcon />
        </div>

        {/* 4. Pill Auth Switcher with Animated Sliding Highlight Pill */}
        <div className="relative flex w-full rounded-2xl border border-white/[0.08] bg-[#07090F]/90 p-1 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('offline')
              clearError()
              setValidationError('')
            }}
            className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-colors duration-200 ${
              mode === 'offline' ? 'text-amber-300' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <HiBolt className={`h-3.5 w-3.5 transition-colors ${mode === 'offline' ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span>Offline Mode</span>

            {/* Smooth animated sliding pill background */}
            {mode === 'offline' && (
              <motion.div
                layoutId="activeAddAccountTab"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/30 to-orange-500/25 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('microsoft')
              clearError()
              setValidationError('')
            }}
            className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-colors duration-200 ${
              mode === 'microsoft' ? 'text-sky-300' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {/* Microsoft 4-color square icon */}
            <div className="grid grid-cols-2 gap-0.5">
              <div className="h-1.5 w-1.5 bg-[#f25022]" />
              <div className="h-1.5 w-1.5 bg-[#7fba00]" />
              <div className="h-1.5 w-1.5 bg-[#00a4ef]" />
              <div className="h-1.5 w-1.5 bg-[#ffb900]" />
            </div>
            <span>Microsoft</span>

            {/* Smooth animated sliding pill background */}
            {mode === 'microsoft' && (
              <motion.div
                layoutId="activeAddAccountTab"
                className="absolute inset-0 rounded-xl bg-sky-500/25 border border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.25)] -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
          </button>
        </div>

        {/* Error notification */}
        {(error || validationError) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-3 rounded-xl border border-rose-500/30 bg-rose-500/15 p-2.5 text-xs font-medium text-rose-300 text-center"
          >
            {error || validationError}
          </motion.div>
        )}

        {/* 5. Animated Tab Switcher Content */}
        <div className="w-full relative min-h-[120px]">
          <AnimatePresence mode="wait">
            {mode === 'offline' ? (
              <motion.form
                key="offline-mode"
                initial={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 16, filter: 'blur(4px)' }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                onSubmit={handleOfflineSubmit}
                className="w-full space-y-4"
              >
                {/* Input Box */}
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-zinc-400">
                    <HiUser className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={offlineName}
                    onChange={(e) => {
                      setOfflineName(e.target.value)
                      if (validationError) setValidationError('')
                    }}
                    placeholder="Enter your Minecraft username..."
                    maxLength={16}
                    autoFocus
                    className="w-full rounded-2xl border border-white/[0.12] bg-[#07090F]/90 py-3.5 pl-11 pr-12 text-sm font-semibold text-white placeholder-zinc-500 focus:border-amber-400 focus:bg-[#090C14] focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-mono shadow-inner"
                  />
                  {/* Live Avatar Preview badge on right */}
                  {offlineName.trim().length >= 3 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute right-3.5 h-6 w-6 rounded-md overflow-hidden ring-1 ring-white/10"
                    >
                      <img
                        src={`https://minotar.net/avatar/${encodeURIComponent(offlineName.trim())}/24.png`}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Big Animated "ADD ACCOUNT →" Button with glowing pulse & shimmer */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(245,158,11,0.35)',
                      '0 0 35px rgba(245,158,11,0.6)',
                      '0 0 20px rgba(245,158,11,0.35)'
                    ]
                  }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#FFA500] to-[#E67E22] py-4 text-sm font-black tracking-wider uppercase text-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] transition-all disabled:opacity-60 overflow-hidden"
                >
                  {/* Continuous flowing light shimmer sweep */}
                  <motion.div
                    animate={{ x: ['-120%', '220%'] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      repeatDelay: 1.2
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
                  />

                  {isLoading ? (
                    <>
                      <HiArrowPath className="h-5 w-5 animate-spin text-black" />
                      <span>Adding Account...</span>
                    </>
                  ) : (
                    <>
                      <span>ADD ACCOUNT</span>
                      <HiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="microsoft-mode"
                initial={{ opacity: 0, x: 16, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="w-full space-y-4"
              >
                <p className="text-xs leading-relaxed text-zinc-300 text-center">
                  Sign in with your official Microsoft account to sync your skins, capes, and join official realms & servers.
                </p>

                {/* Animated Microsoft Button */}
                <motion.button
                  type="button"
                  onClick={handleMicrosoft}
                  disabled={isLoading}
                  animate={{
                    boxShadow: [
                      '0 0 15px rgba(255,255,255,0.15)',
                      '0 0 25px rgba(56,189,248,0.3)',
                      '0 0 15px rgba(255,255,255,0.15)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white hover:bg-zinc-100 py-4 text-sm font-black tracking-wider uppercase text-black transition-all disabled:opacity-60 overflow-hidden"
                >
                  {/* Continuous subtle shimmer sweep */}
                  <motion.div
                    animate={{ x: ['-120%', '220%'] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      repeatDelay: 1.5
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-300/30 to-transparent skew-x-12 pointer-events-none"
                  />

                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="h-2 w-2 bg-[#f25022]" />
                    <div className="h-2 w-2 bg-[#7fba00]" />
                    <div className="h-2 w-2 bg-[#00a4ef]" />
                    <div className="h-2 w-2 bg-[#ffb900]" />
                  </div>
                  <span>{isLoading ? 'Connecting to Microsoft...' : 'Continue with Microsoft'}</span>
                </motion.button>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-[10px] text-zinc-400 text-center">
                  🔒 Official secure Microsoft OAuth. AstrixMC never accesses your password.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 6. Footer Trust Tags */}
        <div className="mt-5 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <HiShieldCheck className="h-3.5 w-3.5" />
            <span>SECURE SESSION</span>
          </div>

          <div className="h-3 w-[1px] bg-white/10" />

          <div className="flex items-center gap-1.5 text-amber-400">
            <HiBolt className="h-3.5 w-3.5" />
            <span>OPTIMIZED FOR PERFORMANCE</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
