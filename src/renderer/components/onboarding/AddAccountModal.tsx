import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiUser, HiXMark } from 'react-icons/hi2'
import { useAuth } from '../../hooks/useAuth'

interface AddAccountModalProps {
  onComplete: () => void
  onClose?: () => void
}

export default function AddAccountModal({ onComplete, onClose }: AddAccountModalProps) {
  const { loginMicrosoft, loginOffline, isLoading, error, clearError } = useAuth()
  const [username, setUsername] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleOfflineLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = username.trim()
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

  const handleMicrosoftLogin = async () => {
    clearError()
    const ok = await loginMicrosoft()
    if (ok) {
      onComplete()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0E121B]/95 p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-white font-display tracking-tight">Add an account</h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose Microsoft for online play or a local name for offline play.
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <HiXMark size={20} />
            </button>
          )}
        </div>

        {/* Global Error Banner */}
        {(error || validationError) && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
            {error || validationError}
          </div>
        )}

        {/* Two Account Options Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Card 1: Microsoft Account */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#090D15]/80 p-6 transition-all hover:border-amber-500/40 hover:bg-[#0D121F]">
            <div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <HiShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Microsoft Account</h3>
                  <p className="text-[11px] text-slate-400">Online Minecraft</p>
                </div>
              </div>

              <div className="mt-6 text-[11px] text-slate-400">
                Don't own Minecraft yet?{' '}
                <a
                  href="https://www.minecraft.net/en-us/store/minecraft-deluxe-collection-pc"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-amber-400 hover:underline"
                >
                  Purchase Minecraft
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 py-3 text-xs font-extrabold text-white shadow-lg shadow-amber-600/30 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? 'Connecting to Microsoft...' : 'Sign in with Microsoft'}
            </button>
          </div>

          {/* Card 2: Local Account */}
          <form
            onSubmit={handleOfflineLogin}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#090D15]/80 p-6 transition-all hover:border-amber-500/40 hover:bg-[#0D121F]"
          >
            <div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <HiUser size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Local Account</h3>
                  <p className="text-[11px] text-slate-400">Local Minecraft</p>
                </div>
              </div>

              <div className="mt-5">
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B0F19] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!username.trim()}
              className="mt-6 w-full rounded-xl border border-white/10 bg-white/[0.06] hover:bg-amber-600 hover:text-white hover:border-amber-500 py-3 text-xs font-extrabold text-slate-300 disabled:opacity-40 transition-all active:scale-[0.98]"
            >
              Add Local Account
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
