import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiSparkles,
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
import landscapeImg from '../../assets/landscape.jpg'

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
  const [selectedExistingId, setSelectedExistingId] = useState<string | null>(
    activeAccount ? activeAccount.id : accounts[0]?.id || null
  )

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
      {/* ── CINEMATIC FULLSCREEN BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <img
          src={landscapeImg}
          alt="Cinematic Minecraft World"
          className="h-full w-full object-cover object-center filter brightness-[0.6] contrast-[1.1] saturate-[1.15] scale-105"
        />
        {/* Dark radial glow & vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/60 to-[#07090E]/40" />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 45%, transparent 20%, rgba(7, 9, 14, 0.75) 75%, #07090E 100%)'
          }}
        />
      </div>

      {/* ── FLOATING GLASS AUTH CARD ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-20 flex flex-col w-full max-w-[460px] rounded-3xl border border-white/[0.14] bg-[#0A0D15]/85 p-8 backdrop-blur-3xl shadow-[0_30px_70px_rgba(0,0,0,0.85)] ring-1 ring-black/50"
      >
        {/* Brand Glow & Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-transparent border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.35)]">
            <HiSparkles className="h-7 w-7 text-amber-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Welcome to <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">AstrixMC</span>
          </h2>
          <p className="mt-1 text-xs font-medium text-zinc-400">
            Sign in to start playing Minecraft with 200+ FPS stack
          </p>
        </div>

        {/* Existing Accounts Bar (if user already logged in previously) */}
        {accounts.length > 0 && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
              <span>Saved Profiles</span>
              <span className="text-zinc-500">{accounts.length} profile{accounts.length > 1 ? 's' : ''}</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1.5">
              {accounts.map((acc) => {
                const avatar = getAccountAvatar(acc, 28)
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleContinueWithExisting(acc)}
                    className="group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg overflow-hidden ring-1 ring-white/10 shrink-0 bg-black/40">
                        <img
                          src={avatar}
                          alt={acc.username}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                          {acc.username}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium capitalize">
                          {acc.type === 'microsoft' ? 'Microsoft Account' : 'Offline Account'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Play</span>
                      <HiArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Divider if existing accounts exist */}
        {accounts.length > 0 && (
          <div className="my-5 flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-white/[0.08]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Or New Login</span>
            <div className="h-[1px] flex-1 bg-white/[0.08]" />
          </div>
        )}

        {/* Auth Mode Pill Tabs */}
        <div className={`flex rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1 ${accounts.length === 0 ? 'mt-6' : ''}`}>
          <button
            type="button"
            onClick={() => {
              setMode('offline')
              clearError()
              setValidationError('')
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${mode === 'offline'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 shadow-md'
                : 'text-zinc-400 hover:text-white'
              }`}
          >
            <HiBolt className="h-4 w-4 text-amber-400" />
            <span>Offline / Cracked</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('microsoft')
              clearError()
              setValidationError('')
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${mode === 'microsoft'
                ? 'bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-300 border border-sky-500/30 shadow-md'
                : 'text-zinc-400 hover:text-white'
              }`}
          >
            <FaMicrosoft className="h-3.5 w-3.5 text-sky-400" />
            <span>Microsoft</span>
          </button>
        </div>

        {/* Error Notification */}
        {(error || validationError) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/15 p-3 text-xs font-medium text-rose-300"
          >
            {error || validationError}
          </motion.div>
        )}

        {/* ── OFFLINE FORM ── */}
        {mode === 'offline' && (
          <form onSubmit={handleOfflineSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wide text-zinc-300">
                Choose Minecraft In-Game Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-zinc-400">
                  <HiUser className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={offlineName}
                  onChange={(e) => {
                    setOfflineName(e.target.value)
                    if (validationError) setValidationError('')
                  }}
                  placeholder="e.g. Alone_ or Steve"
                  maxLength={16}
                  autoFocus
                  className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] py-3 pl-13 pr-12 text-sm font-semibold text-white placeholder-zinc-500 focus:border-amber-500/60 focus:bg-[#0E121B] focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all font-mono"
                />
                {/* Live Preview Avatar on right of input */}
                {offlineName.trim().length >= 3 && (
                  <div className="absolute right-3 h-7 w-7 rounded-lg overflow-hidden ring-1 ring-white/10">
                    <img
                      src={`https://minotar.net/avatar/${encodeURIComponent(offlineName.trim())}/28.png`}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-500">
                Play on all cracked and offline multiplayer servers instantly.
              </p>
            </div>

            {/* Launch Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#EAB308] to-[#D97706] py-3.5 text-sm font-extrabold tracking-wide text-black shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_45px_rgba(245,158,11,0.6)] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <HiArrowPath className="h-5 w-5 animate-spin" />
                  <span>Setting Up Account...</span>
                </>
              ) : (
                <>
                  <span>Enter Minecraft</span>
                  <HiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ── MICROSOFT LOGIN FORM ── */}
        {mode === 'microsoft' && (
          <div className="mt-5 space-y-4">
            <p className="text-xs leading-relaxed text-zinc-300">
              Sign in with your official Microsoft account to sync your licensed skins, capes, and join official realms & servers.
            </p>

            <button
              type="button"
              onClick={handleMicrosoft}
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white hover:bg-zinc-100 py-3.5 text-sm font-extrabold text-black shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              <div className="grid grid-cols-2 gap-0.5">
                <div className="h-2 w-2 bg-[#f25022]" />
                <div className="h-2 w-2 bg-[#7fba00]" />
                <div className="h-2 w-2 bg-[#00a4ef]" />
                <div className="h-2 w-2 bg-[#ffb900]" />
              </div>
              <span>{isLoading ? 'Connecting to Microsoft...' : 'Continue with Microsoft'}</span>
            </button>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-[11px] text-zinc-400">
              🔒 Uses official secure OAuth. AstrixMC never stores your password.
            </div>
          </div>
        )}

        {/* Footer Badges */}
        <div className="mt-6 flex items-center justify-center gap-3 border-t border-white/[0.08] pt-4 text-[11px] font-semibold text-zinc-500">
          <div className="flex items-center gap-1 text-emerald-400/90">
            <HiShieldCheck className="h-4 w-4" />
            <span>Verified Clean</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1 text-amber-400/90">
            <HiBolt className="h-4 w-4" />
            <span>200+ FPS Stack</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
