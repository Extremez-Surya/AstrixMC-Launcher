import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiUser,
  HiArrowRight,
  HiShieldCheck,
  HiBolt,
  HiCheck,
  HiChevronDown,
  HiArrowPath
} from 'react-icons/hi2'
import { FaMicrosoft } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'
import { getAccountAvatar } from '../../utils/avatar'
import loginNightImg from '../../assets/login_night_castle.jpg'

// Floating animated embers/fireflies
function AmbientEmbers() {
  const embers = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 4.1 + 3) % 94}%`,
      bottom: `${(i * 3.7) % 30}%`,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 6 + 6,
      delay: Math.random() * 5,
      drift: (Math.random() - 0.5) * 60
    }))
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {embers.map((e) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{
            opacity: [0, 0.85, 0.9, 0],
            y: [-10, -220 - Math.random() * 100],
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
            boxShadow: `0 0 ${e.size * 3}px #F59E0B, 0 0 ${e.size * 6}px #D97706`
          }}
        />
      ))}
    </div>
  )
}

// Glowing 3D Golden Minecraft Block with Orbital Ring
function GoldenCubeLogo() {
  return (
    <div className="relative flex items-center justify-center w-24 h-24 mb-2">
      {/* Soft golden aura */}
      <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-2xl animate-pulse" />

      {/* Floating Levitation Wrapper */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center"
      >
        {/* Orbital Elliptical Ring (Tilted 3D Orbit) */}
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute w-28 h-28 pointer-events-none"
          viewBox="0 0 100 100"
          style={{ transform: 'rotateX(65deg)' }}
        >
          <ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="20"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="2.2"
            strokeDasharray="8 6"
            className="opacity-90"
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#FDE047" stopOpacity="1" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Isometric Golden Cube SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-16 h-16 drop-shadow-[0_0_16px_rgba(245,158,11,0.7)]"
        >
          <defs>
            <linearGradient id="topFace" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="leftFace" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="rightFace" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>

          {/* Top Face */}
          <polygon points="50,15 82,33 50,51 18,33" fill="url(#topFace)" />
          {/* Left Face */}
          <polygon points="18,33 50,51 50,87 18,69" fill="url(#leftFace)" />
          {/* Right Face */}
          <polygon points="50,51 82,33 82,69 50,87" fill="url(#rightFace)" />

          {/* Golden Block Pixel Grid Highlights */}
          <polygon points="50,22 72,34 50,46 28,34" fill="#FFFBEB" opacity="0.45" />
          <line x1="18" y1="33" x2="50" y2="51" stroke="#FEF08A" strokeWidth="1.5" opacity="0.8" />
          <line x1="82" y1="33" x2="50" y2="51" stroke="#FDE047" strokeWidth="1.5" opacity="0.8" />
          <line x1="50" y1="51" x2="50" y2="87" stroke="#FEF08A" strokeWidth="1.5" opacity="0.8" />
        </svg>
      </motion.div>
    </div>
  )
}

// Minecraft Creeper Pixel Silhouette
function CreeperIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-amber-500/80 fill-current">
      <rect x="2" y="2" width="12" height="12" fill="none" />
      {/* Eyes */}
      <rect x="3" y="4" width="3" height="3" />
      <rect x="10" y="4" width="3" height="3" />
      {/* Nose */}
      <rect x="6" y="7" width="4" height="4" />
      {/* Mouth */}
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
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden font-sans select-none">
      {/* ── CINEMATIC FULLSCREEN BACKGROUND WITH BREATHING EFFECT ── */}
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 pointer-events-none -z-10 overflow-hidden"
      >
        <img
          src={loginNightImg}
          alt="Minecraft Night Landscape"
          className="h-full w-full object-cover object-center filter brightness-[0.75] contrast-[1.08] saturate-[1.15]"
        />
        {/* Soft edge-to-edge vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080E]/95 via-transparent to-[#06080E]/70" />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(6, 8, 14, 0.7) 70%, #06080E 100%)'
          }}
        />
      </motion.div>

      {/* Floating Animated Embers in background */}
      <AmbientEmbers />

      {/* ── THE CENTER FLOATING GLASS CARD ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 flex flex-col items-center w-full max-w-[460px] rounded-[32px] border border-amber-500/35 bg-[#0C0F17]/90 px-8 pt-7 pb-6 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_45px_rgba(245,158,11,0.22)] ring-1 ring-black/60"
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

        {/* 1. Golden Glowing 3D Cube with Orbital Ring */}
        <GoldenCubeLogo />

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

        {/* 4. Pill Auth Switcher (Offline Mode / Microsoft) */}
        <div className="flex w-full rounded-2xl border border-white/[0.08] bg-[#07090F]/90 p-1 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('offline')
              clearError()
              setValidationError('')
            }}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-all duration-200 ${
              mode === 'offline'
                ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/25 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <HiBolt className={`h-3.5 w-3.5 ${mode === 'offline' ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span>Offline Mode</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('microsoft')
              clearError()
              setValidationError('')
            }}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-all duration-200 ${
              mode === 'microsoft'
                ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                : 'text-zinc-400 hover:text-white'
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

        {/* 5. Offline Form */}
        {mode === 'offline' && (
          <form onSubmit={handleOfflineSubmit} className="w-full space-y-4">
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
                <div className="absolute right-3.5 h-6 w-6 rounded-md overflow-hidden ring-1 ring-white/10">
                  <img
                    src={`https://minotar.net/avatar/${encodeURIComponent(offlineName.trim())}/24.png`}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Big Vibrant Rounded "ENTER MINECRAFT →" Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#FFA500] to-[#E67E22] py-4 text-sm font-black tracking-wider uppercase text-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_10px_35px_rgba(245,158,11,0.45)] hover:shadow-[0_12px_45px_rgba(245,158,11,0.65)] transition-all disabled:opacity-60 overflow-hidden"
            >
              {/* Shimmer sweep effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out" />

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
          </form>
        )}

        {/* 6. Microsoft Mode Form */}
        {mode === 'microsoft' && (
          <div className="w-full space-y-4">
            <p className="text-xs leading-relaxed text-zinc-300 text-center">
              Sign in with your official Microsoft account to sync your skins, capes, and join official realms & servers.
            </p>

            <motion.button
              type="button"
              onClick={handleMicrosoft}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white hover:bg-zinc-100 py-4 text-sm font-black tracking-wider uppercase text-black shadow-[0_10px_35px_rgba(255,255,255,0.25)] transition-all disabled:opacity-60"
            >
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
          </div>
        )}

        {/* 7. Footer Trust Tags (Matching Screenshot) */}
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
