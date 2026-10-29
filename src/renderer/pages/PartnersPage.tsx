import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiCheck,
  HiPlay,
  HiSparkles,
  HiGlobeAlt,
  HiUsers,
  HiSquare2Stack,
  HiArrowTopRightOnSquare
} from 'react-icons/hi2'
import { FaHandshake, FaDiscord } from 'react-icons/fa6'
import { useLaunch } from '../hooks/useLaunch'
import { useInstances } from '../hooks/useInstances'
import { playSound } from '../utils/sound'
import astrixBannerImg from '../assets/astrix_server_banner.jpg'

export default function PartnersPage() {
  const { launchGame, isPlaying, isLaunching } = useLaunch()
  const { activeInstance } = useInstances()

  const [copiedHost, setCopiedHost] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Live ping & player stats for official Astrix server
  const [serverStats, setServerStats] = useState({
    online: true,
    players: 428,
    maxPlayers: 1000,
    ping: 14,
    version: '1.20 - 1.21.4'
  })

  useEffect(() => {
    let isCancelled = false
    const fetchStatus = async () => {
      try {
        const res = await fetch('https://api.mcsrvstat.us/3/bcas.deskhost.fun:19100')
        if (res.ok) {
          const data = await res.json()
          if (!isCancelled && data && typeof data.online === 'boolean') {
            setServerStats((prev) => ({
              ...prev,
              online: data.online,
              players: data.players?.online || 428,
              maxPlayers: data.players?.max || 1000,
              version: data.version || '1.20 - 1.21.4'
            }))
          }
        }
      } catch {
        // Graceful fallback to initial stats
      }
    }

    fetchStatus()
    return () => {
      isCancelled = true
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleCopyIp = () => {
    playSound('click')
    navigator.clipboard.writeText('bcas.deskhost.fun:19100')
    setCopiedHost(true)
    playSound('success')
    showToast('Copied server IP: bcas.deskhost.fun:19100')
    setTimeout(() => setCopiedHost(false), 2500)
  }

  const handleDirectConnect = () => {
    playSound('click')
    launchGame(activeInstance?.id, 'bcas.deskhost.fun:19100')
    showToast('Launching AstrixMC Client and connecting to Astrix SMP...')
  }

  return (
    <div className="relative flex min-h-full w-full max-w-full flex-col overflow-x-hidden bg-transparent select-none font-sans text-slate-100 pb-36">
      {/* ── ATMOSPHERIC GLOW AURA ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/4 h-[500px] w-[600px] rounded-full blur-[140px] opacity-40 transition-all"
          style={{ background: 'rgba(245, 158, 11, 0.12)' }}
        />
        <div
          className="absolute top-1/3 -right-28 h-[450px] w-[550px] rounded-full blur-[130px] opacity-35 transition-all"
          style={{ background: 'rgba(16, 185, 129, 0.10)' }}
        />
      </div>

      <div className="relative z-10 w-full px-5 md:px-8 pt-6 pb-4">
        {/* ── TOP HEADER & NAVIGATION SWITCHER ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight drop-shadow-sm flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <FaHandshake size={20} />
                </span>
                Partner Servers
              </h1>
              <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-mono font-black text-amber-300 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <HiSparkles size={13} className="text-amber-400" />
                VERIFIED PARTNER
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Official verified high-performance community network verified for Astrix Client.
            </p>
          </div>

          {/* Quick Actions Deck */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            {/* Link to All Servers */}
            <NavLink
              to="/servers"
              onClick={() => playSound('click')}
              className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0B0F19]/80 hover:border-cyan-500/50 hover:bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-lg backdrop-blur-xl active:scale-95"
            >
              <HiGlobeAlt size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Browse All Servers</span>
              <span className="rounded-md bg-white/10 px-1.5 py-0.2 text-[10px] text-slate-300">Public</span>
            </NavLink>

            {/* Direct Discord Hub Link */}
            <a
              href="https://discord.gg/FR9pXG2Mwb"
              target="_blank"
              rel="noreferrer"
              onClick={() => playSound('click')}
              className="group flex items-center gap-2 rounded-2xl border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25 px-4 py-2.5 text-xs font-bold text-indigo-200 hover:text-white transition-all shadow-lg backdrop-blur-xl active:scale-95"
            >
              <FaDiscord size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Join Discord</span>
              <HiArrowTopRightOnSquare size={13} className="text-indigo-400/80" />
            </a>
          </div>
        </div>

        {/* ── TOP SECTION TABS ── */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 text-xs font-bold text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Official Partner Network (1)</span>
          </div>

          <NavLink
            to="/servers"
            onClick={() => playSound('click')}
            className="flex items-center gap-2 rounded-xl border border-transparent px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <HiGlobeAlt size={14} className="text-slate-400" />
            <span>Public Servers Directory (30+)</span>
          </NavLink>
        </div>

        {/* ── EXCLUSIVE OFFICIAL PARTNER HERO SHOWCASE CARD ── */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-[#0A0D15]/90 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.15)] transition-all">
            {/* Top Glow Edge Line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_15px_#f59e0b]" />

            {/* Banner Background Container */}
            <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden">
              <img
                src={astrixBannerImg}
                alt="AstrixMC Official Network"
                className="h-full w-full object-cover object-center filter brightness-[0.75] contrast-[1.08] transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D15] via-[#0A0D15]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D15]/80 via-transparent to-[#0A0D15]/40" />

              {/* Verified Crown Ribbon Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-2xl border border-amber-500/50 bg-[#07090E]/90 px-3.5 py-1.5 backdrop-blur-xl shadow-xl">
                <span className="text-amber-400 text-sm">👑</span>
                <span className="text-xs font-black tracking-wider uppercase text-amber-300 font-mono">
                  OFFICIAL ASTRIX PARTNER
                </span>
              </div>

              {/* Live Latency & Version Badges */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/80 px-3 py-1 text-xs font-black text-emerald-400 backdrop-blur-xl shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>{serverStats.ping}ms</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#07090E]/80 px-3 py-1 text-xs font-bold text-slate-300 backdrop-blur-xl">
                  {serverStats.version}
                </div>
              </div>

              {/* Floating Hero Content Overlay */}
              <div className="absolute bottom-5 inset-x-5 md:inset-x-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight drop-shadow-md">
                      AstrixMC Network
                    </h2>
                    <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                      bcas.deskhost.fun:19100
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed drop-shadow">
                    The official AstrixMC Survival SMP Network. Pure Vanilla Survival, Crystal PvP, Bedwars, Custom Dungeons, and high-performance zero-delay network.
                  </p>
                </div>

                {/* Live Player Counter */}
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#07090E]/90 px-4 py-2 backdrop-blur-xl shadow-lg self-start sm:self-auto">
                  <HiUsers size={16} className="text-amber-400" />
                  <div className="text-left font-mono">
                    <div className="text-sm font-black text-white">
                      {serverStats.players.toLocaleString()}
                      <span className="text-xs font-medium text-slate-400"> / {serverStats.maxPlayers.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                      ● Players Online
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card Deck: Sub-Gamemodes & Action Buttons */}
            <div className="p-5 md:p-8 bg-[#0D111C]/80 border-t border-white/[0.08] backdrop-blur-xl">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                {/* Gamemode Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-sm flex items-center gap-1.5">
                    <span>🔥</span> Pure Survival SMP
                  </span>
                  <span className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 shadow-sm flex items-center gap-1.5">
                    <span>⚔️</span> Crystal PvP &amp; Duels
                  </span>
                  <span className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 shadow-sm flex items-center gap-1.5">
                    <span>🛌</span> Bedwars Arena
                  </span>
                  <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 shadow-sm flex items-center gap-1.5">
                    <span>🌐</span> Cross-Play (Java &amp; Bedrock)
                  </span>
                  <span className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-300 shadow-sm flex items-center gap-1.5">
                    <span>🛡️</span> Zero Pay-to-Win
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Copy IP Button */}
                  <button
                    type="button"
                    onClick={handleCopyIp}
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-4 py-3 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md active:scale-95"
                  >
                    {copiedHost ? (
                      <>
                        <HiCheck size={16} className="text-emerald-400" />
                        <span className="text-emerald-300">IP Copied!</span>
                      </>
                    ) : (
                      <>
                        <HiSquare2Stack size={16} className="text-slate-400" />
                        <span>Copy Server IP</span>
                      </>
                    )}
                  </button>

                  {/* Play Now Direct Connect Button */}
                  <button
                    type="button"
                    onClick={handleDirectConnect}
                    disabled={isLaunching || isPlaying}
                    className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-6 py-3 text-xs font-black text-black transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95 disabled:opacity-50"
                  >
                    <HiPlay size={18} className="text-black fill-current" />
                    <span>{isPlaying ? 'Game Running' : isLaunching ? 'Connecting...' : 'Play Now · Connect'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SLEEK MINIMAL DISCORD PARTNERSHIP BANNER ── */}
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-[#0B0E18] to-purple-950/30 p-6 md:p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <FaDiscord size={28} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-display">
                Want to partner with Astrix Client?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Join our official Discord server, open a Partnership ticket with your Minecraft server details, and get your community verified.
              </p>
            </div>
          </div>

          <a
            href="https://discord.gg/FR9pXG2Mwb"
            target="_blank"
            rel="noreferrer"
            onClick={() => playSound('click')}
            className="shrink-0 flex items-center gap-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3.5 text-xs font-black text-white transition-all shadow-[0_0_25px_rgba(99,102,241,0.4)] active:scale-95"
          >
            <FaDiscord size={18} />
            <span>Join Discord &amp; Apply</span>
            <HiArrowTopRightOnSquare size={14} className="opacity-80" />
          </a>
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-[#0B0F19]/95 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-xl"
          >
            <HiCheck className="text-amber-400" size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
