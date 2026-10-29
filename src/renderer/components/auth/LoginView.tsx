import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiUser,
  HiArrowRight,
  HiShieldCheck,
  HiBolt,
  HiChevronDown,
  HiArrowPath
} from 'react-icons/hi2'
import { FaMicrosoft } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'
import { getAccountAvatar } from '../../utils/avatar'
import { ROTATING_WALLPAPERS } from '../../utils/wallpapers'

// Floating animated embers/fireflies
function AmbientEmbers() {
  const embers = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 4.2 + 3) % 94}%`,
      bottom: `${(i * 3.6) % 36}%`,
      size: Math.random() * 3.5 + 2,
      duration: Math.random() * 6 + 6,
      delay: Math.random() * 4,
      drift: (Math.random() - 0.5) * 50
    }))
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
      {embers.map((e) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{
            opacity: [0, 0.75, 0.85, 0],
            y: [-10, -210 - Math.random() * 90],
            x: [0, e.drift, -e.drift / 2]
          }}
          transition={{
            duration: e.duration,
            repeat: Infinity,
            delay: e.delay,
            ease: 'easeInOut'
          }}
          className="absolute rounded-full bg-amber-400"
          style={{
            left: e.left,
            bottom: e.bottom,
            width: e.size,
            height: e.size,
            boxShadow: `0 0 ${e.size * 3}px #F59E0B, 0 0 ${e.size * 5}px #D97706`
          }}
        />
      ))}
    </div>
  )
}

// Sleek Astrix Glowing Flame Emblem (Box logo removed)
function AstrixFlameEmblem() {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 mb-1">
      {/* Soft warm pulse aura */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-yellow-500/25 blur-2xl animate-pulse" />

      {/* Floating container with subtle scale breathing */}
      <motion.div
        animate={{ y: [0, -5, 0], scale: [1, 1.025, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-[#0A0D15]/80 shadow-[0_0_25px_rgba(245,158,11,0.35)]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-8 w-8 text-amber-400 drop-shadow-[0_0_14px_rgba(245,158,11,0.85)]"
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

export default function LoginView({ onComplete }: { onComplete?: () => void }) {
  const {
    accounts,
    activeAccount,
    loginOffline,
    loginMicrosoft,
    setActiveAccount,
    isLoading,
    error,
    clearError
  } = useAuth()

  const [mode, setMode] = useState<'offline' | 'microsoft'>('offline')
  const [offlineName, setOfflineName] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false)
  const [bgIndex, setBgIndex] = useState(0)

  // Auto-rotate scenic wallpapers every 7.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % ROTATING_WALLPAPERS.length)
    }, 7500)
    return () => clearInterval(timer)
  }, [])

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
    if (ok && onComplete) {
      onComplete()
    }
  }

  const handleMicrosoft = async () => {
    const ok = await loginMicrosoft()
    if (ok && onComplete) {
      onComplete()
    }
  }

  const handleContinueWithExisting = (acc: any) => {
    setActiveAccount(acc)
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <div className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden font-sans select-none bg-[#07090E]">
      {/* ── AUTO-ROTATING VIBRANT MINECRAFT WALLPAPERS (LIGHT & BRIGHT) ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={ROTATING_WALLPAPERS[bgIndex].id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        >
          <img
            src={ROTATING_WALLPAPERS[bgIndex].src}
            alt="Astrix Minecraft Backdrop"
            className="h-full w-full object-cover object-center filter brightness-[0.96] contrast-[1.04] saturate-[1.10]"
          />
          {/* Subtle light vignette - keeps artwork clear & vivid while card pops */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06080E]/40 via-transparent to-[#06080E]/20" />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(6, 8, 14, 0.35) 90%, rgba(6, 8, 14, 0.55) 100%)'
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Floating Animated Embers in background */}
      <AmbientEmbers />

      {/* ── THE CENTER FLOATING GLASS CARD (Z-20) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 flex flex-col items-center w-full max-w-[460px] rounded-[32px] border border-amber-500/35 bg-[#0C0F17]/94 px-8 pt-7 pb-6 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_45px_rgba(245,158,11,0.22)] ring-1 ring-black/60"
      >
        {/* Ambient subtle border halo glow behind card */}
        <div className="absolute -inset-[1px] rounded-[33px] bg-gradient-to-b from-amber-500/35 via-orange-500/15 to-transparent blur-md opacity-70 pointer-events-none -z-10" />

        {/* Saved Profiles Quick Pill at top right if accounts exist */}
        {accounts.length > 0 && (
          <div className="absolute right-5 top-5 z-30">
            <button
              type="button"
              onClick={() => setIsSavedDrawerOpen(!isSavedDrawerOpen)}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-zinc-300 hover:border-amber-500/40 hover:text-amber-400 transition-colors"
            >
              <span>Saved ({accounts.length})</span>
              <HiChevronDown className={`h-3 w-3 transition-transform ${isSavedDrawerOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Saved Accounts Dropdown Menu */}
            <AnimatePresence>
              {isSavedDrawerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl border border-white/[0.12] bg-[#090C14]/95 p-1.5 shadow-2xl backdrop-blur-2xl z-50 ring-1 ring-black/50"
                >
                  <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                    Saved Accounts
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleContinueWithExisting(acc)}
                        className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-white/[0.08]"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={getAccountAvatar(acc, 24)}
                            alt=""
                            className="h-5 w-5 rounded object-cover"
                          />
                          <span className="truncate font-semibold text-white">{acc.username}</span>
                        </div>
                        <span className="text-[9px] text-amber-400 font-bold ml-1">Play →</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 1. Official Astrix Flame Emblem (Box logo removed) */}
        <AstrixFlameEmblem />

        {/* 2. Title: Welcome to AstrixMC */}
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[26px] font-black tracking-tight text-white leading-tight"
        >
          Welcome to <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">AstrixMC</span>
        </motion.h1>

        {/* 3. Subtitle with separators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-1 flex items-center gap-2.5 text-xs text-zinc-400 font-medium"
        >
          <div className="h-[1px] w-6 bg-white/[0.12]" />
          <span>Your world. Your adventure.</span>
          <div className="h-[1px] w-6 bg-white/[0.12]" />
        </motion.div>

        {/* Creeper pixel accent */}
        <div className="my-2.5 flex items-center justify-center">
          <CreeperIcon />
        </div>

        {/* 4. Pill Auth Switcher with Animated Sliding layoutId Pill */}
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
                layoutId="activeLoginTab"
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
                layoutId="activeLoginTab"
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

        {/* 5. Animated Tab Switcher Content (Slide & Blur Animation) */}
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

                {/* Big Animated "ENTER MINECRAFT →" Button with glowing pulse & shimmer */}
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
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <span>ENTER MINECRAFT</span>
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
