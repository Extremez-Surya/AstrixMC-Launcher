import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiUser, HiXMark } from 'react-icons/hi2'
import { useAuth } from '../../hooks/useAuth'
import { playSound } from '../../utils/sound'

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
    playSound('click')
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
    playSound('launch')
    clearError()
    const ok = await loginMicrosoft()
    if (ok) {
      onComplete()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#091122]/95 p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white font-pixel tracking-wide">
              ADD AN ACCOUNT
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 font-sans">
              Choose Microsoft for online play or an offline nickname to play locally.
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={() => {
                playSound('click')
                onClose()
              }}
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
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0C172E]/70 p-6 transition-all hover:border-cyan-500/40 hover:bg-[#0E1E42]">
            <div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <HiShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-pixel">Microsoft</h3>
                  <p className="text-[11px] text-slate-400 font-sans">Online Minecraft</p>
                </div>
              </div>

              <div className="mt-6 text-[11px] text-slate-400">
                Play on official multiplayer servers like Hypixel with cosmetics & skins support.
              </div>
            </div>

            <button
              type="button"
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#3B82F6]/60 bg-gradient-to-r from-[#172554] via-[#1E3A8A] to-[#1E40AF] py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:border-cyan-400 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <div className="grid grid-cols-2 gap-0.5">
                <div className="h-2 w-2 rounded-[1px] bg-white" />
                <div className="h-2 w-2 rounded-[1px] bg-white" />
                <div className="h-2 w-2 rounded-[1px] bg-white" />
                <div className="h-2 w-2 rounded-[1px] bg-white" />
              </div>
              <span className="font-pixel text-[11px]">
                {isLoading ? 'SIGNING IN...' : 'SIGN IN MICROSOFT'}
              </span>
            </button>
          </div>

          {/* Card 2: Local Account */}
          <form
            onSubmit={handleOfflineLogin}
            className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0C172E]/70 p-6 transition-all hover:border-cyan-500/40 hover:bg-[#0E1E42]"
          >
            <div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <HiUser size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-pixel">Local / Offline</h3>
                  <p className="text-[11px] text-slate-400 font-sans">Singleplayer & Offline</p>
                </div>
              </div>

              <div className="mt-5">
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!username.trim()}
              className="mt-6 w-full rounded-xl border border-cyan-500/40 bg-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 py-3 text-xs font-bold text-cyan-300 disabled:opacity-40 transition-all active:scale-[0.98] font-pixel text-[11px]"
            >
              ADD LOCAL ACCOUNT
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
