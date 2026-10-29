import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  VscChromeClose
} from 'react-icons/vsc'
import {
  HiUsers,
  HiGift,
  HiClipboardDocument,
  HiCheck,
  HiDevicePhoneMobile,
  HiArrowTopRightOnSquare,
  HiLink
} from 'react-icons/hi2'
import { FaDiscord, FaGithub, FaTwitch } from 'react-icons/fa6'
import { playSound } from '../../utils/sound'

interface SocialAccountsModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
}

export default function SocialAccountsModal({
  isOpen,
  onClose,
  username
}: SocialAccountsModalProps) {
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [linkedStatus, setLinkedStatus] = useState<Record<string, boolean>>({
    discord: false,
    github: false,
    twitch: false
  })

  if (!isOpen) return null

  const inviteUrl = `https://astrix.gg/invite/${username || 'player'}`

  const handleCopy = () => {
    playSound('click')
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleLink = (service: string) => {
    playSound('click')
    setLinkedStatus((prev) => ({ ...prev, [service]: !prev[service] }))
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#091122]/95 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-2xl"
        >
          {/* ── HEADER ── */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-[#0B152B]/80">
            <div className="flex items-center gap-2.5">
              <HiUsers className="text-cyan-400" size={18} />
              <span className="font-pixel text-xs font-bold tracking-wider text-white uppercase">
                SOCIAL ACCOUNTS
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound('click')
                onClose()
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <VscChromeClose size={13} />
            </button>
          </div>

          {/* ── BODY ── */}
          <div className="p-6 flex flex-col gap-5">
            {/* Top Referral Hero */}
            <div className="flex flex-col items-center text-center">
              {/* Gift Icon */}
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <HiGift size={28} />
              </div>

              <h3 className="font-pixel text-xs font-bold text-white mb-1">
                Refer your friends, get 3 Days of Astrix+ and more...
              </h3>

              {/* Referral Input & Copy */}
              <div className="mt-3 flex w-full max-w-md items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-1.5 shadow-inner">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 bg-transparent px-3 text-xs font-mono text-slate-300 focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 transition-all shrink-0"
                  title="Copy Invite Link"
                >
                  {copied ? <HiCheck size={15} /> : <HiClipboardDocument size={15} />}
                </button>
              </div>
            </div>

            {/* ── SOCIAL INTEGRATIONS LIST ── */}
            <div className="flex flex-col gap-2.5 pt-2">
              {/* 1. Mobile App */}
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0C172E]/70 p-3.5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-white">
                    <HiDevicePhoneMobile size={17} />
                  </div>
                  <span className="font-pixel text-xs font-bold text-white">
                    Mobile App
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/15 hover:bg-cyan-500/25 px-4 py-2 font-pixel text-[10px] font-bold text-cyan-300 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                >
                  <span>{showQr ? 'HIDE QR' : 'SHOW QR'}</span>
                </button>
              </div>

              {/* QR Code expansion */}
              {showQr && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-cyan-500/20 bg-black/40"
                >
                  <div className="h-32 w-32 rounded-xl bg-white p-2 shadow-lg flex items-center justify-center">
                    <div className="text-black text-center font-mono text-[9px] font-bold">
                      [ ASTRIX COMPANION APP QR ]
                    </div>
                  </div>
                  <span className="mt-2 font-mono text-[10px] text-slate-400">
                    Scan with camera to connect on iOS & Android
                  </span>
                </motion.div>
              )}

              {/* 2. Discord */}
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0C172E]/70 p-3.5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5865F2]/20 text-[#5865F2]">
                    <FaDiscord size={18} />
                  </div>
                  <span className="font-pixel text-xs font-bold text-white">
                    Discord
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleLink('discord')}
                    className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 font-pixel text-[10px] font-bold transition-all ${
                      linkedStatus.discord
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                        : 'border-cyan-500/30 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300'
                    }`}
                  >
                    <HiLink size={12} />
                    <span>{linkedStatus.discord ? 'LINKED' : 'LINK'}</span>
                  </button>
                  <a
                    href="https://discord.gg"
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                  >
                    <HiArrowTopRightOnSquare size={13} />
                  </a>
                </div>
              </div>

              {/* 3. GitHub */}
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0C172E]/70 p-3.5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-white">
                    <FaGithub size={18} />
                  </div>
                  <span className="font-pixel text-xs font-bold text-white">
                    GitHub
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleLink('github')}
                    className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 font-pixel text-[10px] font-bold transition-all ${
                      linkedStatus.github
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                        : 'border-cyan-500/30 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300'
                    }`}
                  >
                    <HiLink size={12} />
                    <span>{linkedStatus.github ? 'LINKED' : 'LINK'}</span>
                  </button>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                  >
                    <HiArrowTopRightOnSquare size={13} />
                  </a>
                </div>
              </div>

              {/* 4. Twitch */}
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0C172E]/70 p-3.5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9146FF]/20 text-[#9146FF]">
                    <FaTwitch size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-pixel text-xs font-bold text-white">
                      Twitch
                    </span>
                    <span className="font-sans text-[10px] text-slate-400">
                      Twitch alerts, chat and streams right in the game.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleLink('twitch')}
                  className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 font-pixel text-[10px] font-bold transition-all ${
                    linkedStatus.twitch
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-cyan-500/30 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300'
                  }`}
                >
                  <HiLink size={12} />
                  <span>{linkedStatus.twitch ? 'LINKED' : 'LINK'}</span>
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

