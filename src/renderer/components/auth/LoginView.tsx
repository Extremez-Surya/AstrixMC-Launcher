import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaUserAstronaut, FaChevronDown, FaRightToBracket } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'
import landscapeImg from '../../assets/landscape.jpg'
import logoImg from '../../assets/logo.jpg'

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

  const [isOfflineMode, setIsOfflineMode] = useState(accounts.length === 0)
  const [offlineName, setOfflineName] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

  return (
    <div className="flex h-full w-full overflow-hidden bg-transparent font-sans select-none">
      {/* Left Column: Login Panel */}
      <div className="relative z-10 flex h-full w-[420px] shrink-0 flex-col justify-between border-r border-white/10 bg-[#0A0D14]/90 backdrop-blur-2xl p-8 shadow-2xl">
        {/* Brand header */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <img
                src={logoImg}
                alt="AstrixMC"
                className="h-7 w-7 rounded-lg object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white font-display">
                AstrixMC <span className="text-emerald-400">Launcher</span>
              </h1>
              <p className="text-xs font-semibold text-emerald-500/80 font-mono">Ultra FPS Minecraft Client</p>
            </div>
          </div>

          {(error || validationError) && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 backdrop-blur-md"
            >
              {error || validationError}
            </motion.div>
          )}

          {/* Microsoft Login Button */}
          {!isOfflineMode && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleMicrosoft}
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-slate-950 shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all hover:bg-slate-100 active:scale-[0.98] disabled:opacity-60"
              >
                {/* Official Microsoft 4-square icon */}
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="h-2 w-2 bg-[#f25022]" />
                  <div className="h-2 w-2 bg-[#7fba00]" />
                  <div className="h-2 w-2 bg-[#00a4ef]" />
                  <div className="h-2 w-2 bg-[#ffb900]" />
                </div>
                <span>{isLoading ? 'Connecting to Microsoft...' : 'Login with Microsoft'}</span>
              </button>

              {/* Logged in users section (if accounts exist) */}
              {accounts.length > 0 && (
                <div className="space-y-2 pt-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] font-mono">
                    Logged In Users
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-left text-sm text-white transition-colors hover:border-emerald-500/40 backdrop-blur-md"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={`https://minotar.net/avatar/${activeAccount?.username || 'Steve'}/28.png`}
                          alt="avatar"
                          className="h-6 w-6 rounded"
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                        <span className="font-medium">
                          {activeAccount ? `${activeAccount.username} (${activeAccount.type})` : 'Select user'}
                        </span>
                      </div>
                      <FaChevronDown className="text-xs text-[#94A3B8]" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#0F1622] p-1 shadow-2xl backdrop-blur-xl">
                        {accounts.map((acc) => (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => {
                              setActiveAccount(acc)
                              setIsDropdownOpen(false)
                            }}
                            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                              activeAccount?.id === acc.id
                                ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
                                : 'text-zinc-300 hover:bg-white/5'
                            }`}
                          >
                            <img
                              src={`https://minotar.net/avatar/${acc.username}/24.png`}
                              alt="avatar"
                              className="h-5 w-5 rounded"
                            />
                            <span>{acc.username}</span>
                            <span className="ml-auto text-[10px] uppercase font-mono text-zinc-500">
                              {acc.type}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveAccount(null)}
                      className="text-xs text-[#94A3B8] hover:text-white transition-colors"
                    >
                      Log Out
                    </button>

                    {activeAccount && (
                      <button
                        type="button"
                        onClick={() => onComplete && onComplete()}
                        className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-black uppercase text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/25"
                      >
                        Play
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Offline Mode Form */}
          {isOfflineMode && (
            <form onSubmit={handleOfflineSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] font-mono">
                  Offline Username
                </label>
                <div className="relative">
                  <FaUserAstronaut className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={offlineName}
                    onChange={(e) => {
                      setOfflineName(e.target.value)
                      if (validationError) setValidationError('')
                    }}
                    placeholder="e.g. Alone_"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono backdrop-blur-md"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 py-3 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                <FaRightToBracket />
                <span>{isLoading ? 'Creating Account...' : 'Play Offline'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Bottom Switch Toggle */}
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => {
              setIsOfflineMode(!isOfflineMode)
              clearError()
              setValidationError('')
            }}
            className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8] transition-colors hover:text-white"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
              ⚡
            </div>
            <span>{isOfflineMode ? 'Switch to Microsoft Login' : 'Switch to offline mode'}</span>
          </button>
        </div>
      </div>

      {/* Right Column: Landscape Visual with Glass Accents */}
      <div className="relative flex-1 overflow-hidden">
        <img
          src={landscapeImg}
          alt="Minecraft World"
          className="h-full w-full object-cover filter brightness-90 contrast-105 opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14] via-transparent to-black/60" />
        <div className="absolute bottom-6 right-6 rounded-xl border border-white/12 bg-black/60 px-4 py-2 text-xs font-mono font-medium text-white backdrop-blur-xl shadow-lg">
          AstrixMC Shaders &bull; Ultra Performance Ready
        </div>
      </div>
    </div>
  )
}
