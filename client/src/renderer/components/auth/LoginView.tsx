import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  VscChromeClose,
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeRestore
} from 'react-icons/vsc'
import {
  HiBolt,
  HiSparkles,
  HiShieldCheck,
  HiGlobeAlt,
  HiArrowRight,
  HiUser,
  HiCheck
} from 'react-icons/hi2'
import { useAuth } from '../../hooks/useAuth'
import { getElectronAPI } from '../../lib/electron-api'
import { playSound } from '../../utils/sound'
import landscapeBg from '../../assets/landscape.jpg'
import astrixLogo from '../../assets/astrix_official_logo.png'

const CONTROL_BASE =
  'no-drag flex h-8 w-8 items-center justify-center text-[#94A3B8] hover:bg-white/10 hover:text-white transition-colors duration-150 rounded-lg'

export default function LoginView({ onComplete }: { onComplete?: () => void }) {
  const { loginOffline, loginMicrosoft, isLoading, error, clearError } = useAuth()

  const [isOfflineInputOpen, setIsOfflineInputOpen] = useState(false)
  const [offlineName, setOfflineName] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const api = getElectronAPI()
    if (!api) return
    Promise.resolve(api.isMaximized())
      .then((val) => setIsMaximized(Boolean(val)))
      .catch(() => {})

    const unsub = api.onMaximizeChange((val) => setIsMaximized(Boolean(val)))
    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [])

  const handleMinimize = () => getElectronAPI()?.minimize()
  const handleMaximize = () => {
    setIsMaximized((c) => !c)
    getElectronAPI()?.maximize()
  }
  const handleClose = () => getElectronAPI()?.close()

  const handleMicrosoftLogin = async () => {
    playSound('launch')
    clearError()
    setValidationError('')
    const ok = await loginMicrosoft()
    if (ok && onComplete) onComplete()
  }

  const handleOfflineSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    playSound('click')
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
    if (ok && onComplete) onComplete()
  }

  const handleContinueAsGuest = async () => {
    playSound('click')
    const ok = await loginOffline('Player')
    if (ok && onComplete) onComplete()
  }

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#050A14] select-none font-sans">
      
      {/* ── LEFT SECTION: CINEMATIC ASTRIX HERO STAGE (66% WIDTH) ── */}
      <div className="relative hidden md:flex md:w-[66%] h-full flex-col justify-between p-10 lg:p-14 overflow-hidden">
        
        {/* Clean, high-res Minecraft backdrop (no baked-in text!) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={landscapeBg}
            alt="Minecraft Cinematic World"
            className="h-full w-full object-cover filter brightness-[0.7] contrast-125 scale-105"
          />
          {/* Deep dark gradient overlays & ambient vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-[#070D1C]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-transparent to-black/60" />
        </div>

        {/* ── TOP-LEFT: ASTRIX CLIENT BRAND LOGO & BADGE ── */}
        <div className="drag-region relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#070D1C]">
              <img
                src={astrixLogo}
                alt="Astrix"
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  ;(e.currentTarget as HTMLElement).style.display = 'none'
                }}
              />
              <HiBolt className="h-5 w-5 text-cyan-400" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-black tracking-widest uppercase text-white">
                ASTRIX<span className="text-cyan-400">CLIENT</span>
              </span>
              <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-cyan-300">
                PRO v4.2
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 tracking-wider">
              Ultra FPS & Competitive PvP Engine
            </span>
          </div>
        </div>

        {/* ── BOTTOM-LEFT: HEADLINE & 4 FEATURE PILL BADGES ── */}
        <div className="relative z-10 flex flex-col gap-6">
          {/* Punchy Dynamic Headline */}
          <div className="flex flex-col">
            <h1 className="font-display text-4xl lg:text-5xl font-black text-white tracking-tight leading-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
              UNLEASH YOUR FPS.
            </h1>
            <h2 className="font-display text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent tracking-tight leading-tight drop-shadow-[0_4px_25px_rgba(6,182,212,0.35)]">
              DOMINATE PVP.
            </h2>
            <p className="mt-2 text-xs lg:text-sm font-medium text-slate-300 max-w-lg leading-relaxed drop-shadow">
              Equipped with built-in Sodium optimization, custom 3D wavey capes, low-latency HUD overlays, and direct server connections.
            </p>
          </div>

          {/* 4 Feature Badges (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-3 max-w-[540px]">
            {/* Badge 1 */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02] hover:border-cyan-400/40">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                <HiBolt size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">500+ FPS Boost</span>
                <span className="text-[10px] text-slate-400 font-mono">Sodium + Lithium physics</span>
              </div>
            </div>

            {/* Badge 2 */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02] hover:border-cyan-400/40">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                <HiSparkles size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Free Custom Capes</span>
                <span className="text-[10px] text-slate-400 font-mono">3D WaveyCapes & cosmetics</span>
              </div>
            </div>

            {/* Badge 3 */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02] hover:border-cyan-400/40">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                <HiShieldCheck size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Competitive PvP HUD</span>
                <span className="text-[10px] text-slate-400 font-mono">Keystrokes, CPS & Armor</span>
              </div>
            </div>

            {/* Badge 4 */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02] hover:border-cyan-400/40">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                <HiGlobeAlt size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">1-Click Quick Play</span>
                <span className="text-[10px] text-slate-400 font-mono">Hypixel, Minemen & SMPs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT SECTION: AUTHENTICATION PANEL (34% WIDTH) ── */}
      <div className="relative flex flex-1 md:w-[34%] h-full flex-col justify-between border-l border-[#1B2B4A]/50 bg-[#070D1C] p-8 lg:p-10 shadow-2xl z-20">
        
        {/* Top Header: Frameless Window Controls */}
        <div className="drag-region flex items-center justify-end w-full">
          <div className="no-drag flex items-center gap-1">
            <button
              type="button"
              onClick={handleMinimize}
              aria-label="Minimize"
              className={CONTROL_BASE}
            >
              <VscChromeMinimize size={13} />
            </button>
            <button
              type="button"
              onClick={handleMaximize}
              aria-label="Maximize"
              className={CONTROL_BASE}
            >
              {isMaximized ? <VscChromeRestore size={13} /> : <VscChromeMaximize size={13} />}
            </button>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="no-drag flex h-8 w-8 items-center justify-center text-[#94A3B8] hover:bg-rose-600 hover:text-white transition-colors duration-150 rounded-lg"
            >
              <VscChromeClose size={14} />
            </button>
          </div>
        </div>

        {/* Center Auth Content */}
        <div className="flex flex-col items-center justify-center text-center my-auto w-full max-w-[340px] mx-auto">
          
          {/* Astrix Glowing Emblem */}
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-cyan-500/25 blur-xl animate-pulse" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-tr from-[#0E1E42] to-[#0A1326] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <HiBolt className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,1)]" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="font-display text-xl lg:text-2xl font-black uppercase tracking-wider text-white mb-2">
            WELCOME TO ASTRIX
          </h2>

          {/* Description */}
          <p className="font-sans text-xs text-slate-400 font-medium leading-relaxed mb-8 max-w-[280px]">
            Sign in with your Minecraft account to sync your custom capes, FPS presets, and PvP stats.
          </p>

          {/* Error message */}
          {(error || validationError) && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 w-full rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 font-medium"
            >
              {error || validationError}
            </motion.div>
          )}

          {/* ── PRIMARY MICROSOFT SIGN IN BUTTON ── */}
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-[#172554] via-[#1E3A8A] to-[#1E40AF] px-5 py-3.5 shadow-[0_0_30px_rgba(37,99,235,0.35)] hover:shadow-[0_0_45px_rgba(6,182,212,0.5)] hover:border-cyan-400 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {/* Microsoft 4-Square Icon */}
            <div className="grid grid-cols-2 gap-0.5 shrink-0">
              <div className="h-2 w-2 rounded-[1px] bg-[#f25022]" />
              <div className="h-2 w-2 rounded-[1px] bg-[#7fba00]" />
              <div className="h-2 w-2 rounded-[1px] bg-[#00a4ef]" />
              <div className="h-2 w-2 rounded-[1px] bg-[#ffb900]" />
            </div>

            <span className="font-display text-xs font-black uppercase tracking-widest text-white drop-shadow">
              {isLoading ? 'SIGNING IN...' : 'SIGN IN WITH MICROSOFT'}
            </span>
          </button>

          {/* ── SECONDARY ACTION: Offline / Guest Mode ── */}
          {!isOfflineInputOpen ? (
            <button
              type="button"
              onClick={() => {
                playSound('click')
                setIsOfflineInputOpen(true)
              }}
              className="mt-4 text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors duration-200 cursor-pointer"
            >
              Continue with an offline username
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleOfflineSubmit}
              className="mt-4 flex w-full flex-col gap-2"
            >
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={offlineName}
                  onChange={(e) => setOfflineName(e.target.value)}
                  placeholder="Enter Minecraft username..."
                  autoFocus
                  maxLength={16}
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2 text-xs font-medium text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2 text-xs font-bold text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <span>Play Offline</span>
                  <HiArrowRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition-all"
                >
                  Guest
                </button>
              </div>
            </motion.form>
          )}

          {/* Divider */}
          <div className="my-6 w-full border-t border-white/[0.07]" />

          {/* Footer note */}
          <p className="font-sans text-[11px] text-slate-500 text-center leading-relaxed max-w-[280px]">
            Without an online account you can play offline singleplayer and custom LAN servers.
          </p>
        </div>

        {/* Bottom space filler */}
        <div className="h-6" />
      </div>

    </div>
  )
}
