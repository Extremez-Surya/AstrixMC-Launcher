import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiXMark,
  HiSparkles,
  HiArrowDownTray,
  HiArrowTopRightOnSquare,
  HiArrowUpTray,
  HiCheck,
  HiExclamationCircle,
  HiArrowPath,
  HiClipboardDocument,
  HiBolt,
  HiFire
} from 'react-icons/hi2'
import type { MinecraftAccount } from '../../../shared/types/auth'
import { useAuth } from '../../hooks/useAuth'
import { playSound } from '../../utils/sound'
import { cn } from '../../lib/cn'

interface SkinStudioModalProps {
  account: MinecraftAccount | null
  isOpen: boolean
  onClose: () => void
}

interface PresetSkin {
  id: string
  name: string
  username: string
  tag: string
  model: 'classic' | 'slim'
}

const PRESET_SKINS: PresetSkin[] = [
  { id: 'steve', name: 'Steve Classic', username: 'Steve', tag: 'Default', model: 'classic' },
  { id: 'alex', name: 'Alex Explorer', username: 'Alex', tag: 'Default', model: 'slim' },
  { id: 'techno', name: 'TechnoBlade', username: 'TechnoBlade', tag: 'Legend', model: 'classic' },
  { id: 'dream', name: 'Dream Smile', username: 'Dream', tag: 'Creator', model: 'classic' },
  { id: 'herobrine', name: 'Herobrine', username: 'Herobrine', tag: 'Myth', model: 'classic' },
  { id: 'notch', name: 'Notch Founder', username: 'Notch', tag: 'Founder', model: 'classic' },
  { id: 'ninja', name: 'Shadow Ninja', username: 'Ninja', tag: 'PvP', model: 'classic' },
  { id: 'grian', name: 'Grian Builder', username: 'Grian', tag: 'Architect', model: 'classic' },
  { id: 'mumbo', name: 'Mumbo Jumbo', username: 'MumboJumbo', tag: 'Redstone', model: 'classic' }
]

export default function SkinStudioModal({ account, isOpen, onClose }: SkinStudioModalProps) {
  const { updateAccount } = useAuth()
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'tools'>('custom')
  const [activeView, setActiveView] = useState<'body' | 'head'>('body')
  const [skinModel, setSkinModel] = useState<'classic' | 'slim'>('classic')
  const [skinType, setSkinType] = useState<'default' | 'player' | 'custom'>('default')
  const [skinPlayerName, setSkinPlayerName] = useState<string | null>(null)
  const [customSkinDataUrl, setCustomSkinDataUrl] = useState<string | null>(null)
  const [playerInput, setPlayerInput] = useState('')
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [copiedCommand, setCopiedCommand] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Sync state whenever modal opens or account changes
  useEffect(() => {
    if (!account || !isOpen) return

    setSkinModel(account.customSkinModel || 'classic')
    setStatusMsg(null)
    setPlayerInput('')
    setCopiedCommand(false)

    if (account.skinType === 'player' && account.skinPlayerName) {
      setSkinType('player')
      setSkinPlayerName(account.skinPlayerName)
      setCustomSkinDataUrl(null)
    } else if (account.skinUrl && account.skinUrl.startsWith('data:')) {
      setSkinType('custom')
      setCustomSkinDataUrl(account.skinUrl)
      setSkinPlayerName(null)
    } else if (account.skinUrl && !account.skinUrl.includes('/avatar/')) {
      const parts = account.skinUrl.split('/')
      const extractedName = parts[parts.length - 1]
      if (extractedName && extractedName !== account.username) {
        setSkinType('player')
        setSkinPlayerName(extractedName)
        setCustomSkinDataUrl(null)
      } else {
        setSkinType('default')
        setSkinPlayerName(null)
        setCustomSkinDataUrl(null)
      }
    } else {
      setSkinType('default')
      setSkinPlayerName(null)
      setCustomSkinDataUrl(null)
    }
  }, [account, isOpen])

  // Draw 2D custom assembled skin if uploaded custom base64 skin is active
  useEffect(() => {
    if (skinType !== 'custom' || !customSkinDataUrl) return

    const img = new Image()
    img.src = customSkinDataUrl

    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.imageSmoothingEnabled = false // Pixel-perfect crisp rendering

      if (activeView === 'head') {
        const s = 14
        const dx = (canvas.width - 8 * s) / 2
        const dy = (canvas.height - 8 * s) / 2

        ctx.drawImage(img, 8, 8, 8, 8, dx, dy, 8 * s, 8 * s)
        ctx.drawImage(img, 40, 8, 8, 8, dx, dy, 8 * s, 8 * s)
      } else {
        const s = 6
        const totalW = 16 * s
        const totalH = 32 * s
        const dx = (canvas.width - totalW) / 2
        const dy = (canvas.height - totalH) / 2

        // Head + Hat
        ctx.drawImage(img, 8, 8, 8, 8, dx + 4 * s, dy, 8 * s, 8 * s)
        ctx.drawImage(img, 40, 8, 8, 8, dx + 4 * s, dy, 8 * s, 8 * s)

        // Torso + Jacket
        ctx.drawImage(img, 20, 20, 8, 12, dx + 4 * s, dy + 8 * s, 8 * s, 12 * s)
        if (img.height >= 64) {
          ctx.drawImage(img, 20, 36, 8, 12, dx + 4 * s, dy + 8 * s, 8 * s, 12 * s)
        }

        // Right Arm + Sleeve
        const armW = skinModel === 'slim' ? 3 * s : 4 * s
        ctx.drawImage(img, 44, 20, 4, 12, dx + 4 * s - armW, dy + 8 * s, armW, 12 * s)
        if (img.height >= 64) {
          ctx.drawImage(img, 44, 36, 4, 12, dx + 4 * s - armW, dy + 8 * s, armW, 12 * s)
        }

        // Left Arm + Sleeve
        if (img.height >= 64) {
          ctx.drawImage(img, 36, 52, 4, 12, dx + 12 * s, dy + 8 * s, armW, 12 * s)
          ctx.drawImage(img, 52, 52, 4, 12, dx + 12 * s, dy + 8 * s, armW, 12 * s)
        } else {
          ctx.save()
          ctx.scale(-1, 1)
          ctx.drawImage(img, 44, 20, 4, 12, -(dx + 12 * s + armW), dy + 8 * s, armW, 12 * s)
          ctx.restore()
        }

        // Right Leg + Pants
        ctx.drawImage(img, 4, 20, 4, 12, dx + 4 * s, dy + 20 * s, 4 * s, 12 * s)
        if (img.height >= 64) {
          ctx.drawImage(img, 4, 36, 4, 12, dx + 4 * s, dy + 20 * s, 4 * s, 12 * s)
        }

        // Left Leg + Pants
        if (img.height >= 64) {
          ctx.drawImage(img, 20, 52, 4, 12, dx + 8 * s, dy + 20 * s, 4 * s, 12 * s)
          ctx.drawImage(img, 0, 52, 4, 12, dx + 8 * s, dy + 20 * s, 4 * s, 12 * s)
        } else {
          ctx.save()
          ctx.scale(-1, 1)
          ctx.drawImage(img, 4, 20, 4, 12, -(dx + 12 * s), dy + 20 * s, 4 * s, 12 * s)
          ctx.restore()
        }
      }
    }
  }, [skinType, customSkinDataUrl, activeView, skinModel])

  // Process PNG File for upload / drag-and-drop
  const processSkinFile = useCallback((file: File) => {
    if (!account) return
    if (!file.name.toLowerCase().endsWith('.png')) {
      playSound('error')
      setStatusMsg({ type: 'error', text: 'Please choose a valid .png Minecraft skin texture file.' })
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const img = new Image()
      img.onload = async () => {
        if ((img.width !== 64 && img.width !== 128) || (img.height !== 64 && img.height !== 32 && img.height !== 128)) {
          playSound('error')
          setStatusMsg({
            type: 'error',
            text: `Invalid skin dimensions (${img.width}x${img.height}). Minecraft skins must be 64x64 or 64x32 PNG.`
          })
          return
        }

        setSkinType('custom')
        setCustomSkinDataUrl(dataUrl)
        setSkinPlayerName(null)
        playSound('success')
        setStatusMsg({ type: 'success', text: `Custom skin "${file.name}" applied successfully!` })

        await updateAccount(account.id, {
          skinUrl: dataUrl,
          skinType: 'custom',
          skinPlayerName: undefined,
          customSkinModel: skinModel
        })
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }, [account, skinModel, updateAccount])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processSkinFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processSkinFile(file)
  }

  // Apply Skin from player username (e.g. TechnoBlade, Dream)
  const handleApplyPlayerSkin = async (overrideName?: string) => {
    if (!account) return
    const target = (overrideName || playerInput).trim()
    if (!target) return
    setIsApplying(true)
    try {
      const minotarUrl = `https://minotar.net/skin/${target}`
      setSkinType('player')
      setSkinPlayerName(target)
      setCustomSkinDataUrl(null)
      playSound('success')
      setStatusMsg({ type: 'success', text: `Skin from "${target}" applied to profile!` })
      if (!overrideName) setPlayerInput('')

      await updateAccount(account.id, {
        skinUrl: minotarUrl,
        skinType: 'player',
        skinPlayerName: target,
        customSkinModel: skinModel
      })
    } catch {
      playSound('error')
      setStatusMsg({ type: 'error', text: 'Failed to apply player skin.' })
    } finally {
      setIsApplying(false)
    }
  }

  // Reset to default Minecraft skin
  const handleResetToDefault = async () => {
    if (!account) return
    playSound('click')
    setSkinType('default')
    setSkinPlayerName(null)
    setCustomSkinDataUrl(null)
    setStatusMsg({ type: 'success', text: 'Reset to default skin!' })

    await updateAccount(account.id, {
      skinUrl: undefined,
      skinType: 'default',
      skinPlayerName: undefined
    })
  }

  // Handle Model Change (Classic vs Slim)
  const handleModelChange = async (model: 'classic' | 'slim') => {
    if (!account) return
    playSound('click')
    setSkinModel(model)
    if (skinType !== 'default') {
      await updateAccount(account.id, { customSkinModel: model })
    }
  }

  if (!isOpen || !account) return null

  // URLs for 3D body & head preview
  const previewPlayer = skinType === 'player' && skinPlayerName ? skinPlayerName : account.username
  const head3dUrl = `https://mc-heads.net/avatar/${encodeURIComponent(previewPlayer)}/200`
  const body3dUrl = `https://mc-heads.net/body/${encodeURIComponent(previewPlayer)}/380`

  const skinDownloadUrl =
    customSkinDataUrl ||
    (skinType === 'player' && skinPlayerName
      ? `https://minotar.net/skin/${skinPlayerName}`
      : `https://minotar.net/skin/${account.username}`)
  const nameMcUrl = `https://namemc.com/profile/${encodeURIComponent(previewPlayer)}`

  const handleDownloadSkin = () => {
    playSound('click')
    if (customSkinDataUrl?.startsWith('data:')) {
      const a = document.createElement('a')
      a.href = customSkinDataUrl
      a.download = `${previewPlayer}_skin.png`
      a.click()
    } else {
      window.open(skinDownloadUrl, '_blank')
    }
  }

  const isCustomActive = skinType !== 'default'

  return (
    <AnimatePresence>
      {/* 
        High z-index (z-[70]) ensures the studio overlay floats cleanly ABOVE the bottom dock 
        with bottom padding to prevent any clipping.
      */}
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-3 sm:p-5 pb-24 sm:pb-6 backdrop-blur-2xl select-none font-sans overflow-y-auto"
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/12 bg-[#0B0F19]/98 shadow-[0_25px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl ring-1 ring-black/80 max-h-[85vh] flex flex-col"
        >
          {/* Drag & Drop Overlay */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-emerald-950/90 border-2 border-dashed border-emerald-400 backdrop-blur-md text-center p-6"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-3 shadow-lg shadow-emerald-500/30">
                  <HiArrowUpTray size={32} />
                </div>
                <h3 className="text-xl font-black text-white font-display">Drop Skin Texture Here</h3>
                <p className="mt-1 text-xs text-emerald-200">Supports standard 64x64 or 64x32 PNG skin files</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── TOP HEADER BAR ── */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-[#080B12]/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                <HiSparkles size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white font-display tracking-tight truncate">
                    Skin Studio &amp; Customizer
                  </h2>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-300 shrink-0">
                    3D Stage
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  Customizing player skin for <span className="text-white font-bold">{account.username}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound('click')
                onClose()
              }}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              title="Close Skin Studio"
            >
              <HiXMark size={20} />
            </button>
          </div>

          {/* ── NOTIFICATION / STATUS ALERT ── */}
          <AnimatePresence>
            {statusMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`px-6 py-2.5 border-b flex items-center justify-between text-xs font-semibold backdrop-blur ${
                  statusMsg.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {statusMsg.type === 'success' ? (
                    <HiCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <HiExclamationCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  )}
                  <span>{statusMsg.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusMsg(null)}
                  className="p-1 opacity-70 hover:opacity-100"
                >
                  <HiXMark size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── 2-COLUMN STUDIO BODY ── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-y-auto flex-1 scrollbar-thin">
            {/* ── LEFT: 3D PREVIEW STAGE (md:col-span-5) ── */}
            <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-white/[0.08] bg-gradient-to-b from-black/60 via-black/30 to-black/60 p-5 flex flex-col justify-between relative overflow-hidden">
              {/* Radial Ambient Glow */}
              <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />

              {/* Stage Controls: View Switcher (Body vs Head) & Arm Model (Classic vs Slim) */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                {/* Arm Model Toggle */}
                <div className="flex items-center gap-1 rounded-xl bg-black/60 p-1 border border-white/10 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => handleModelChange('classic')}
                    className={cn(
                      'rounded-lg px-2 py-1 text-[10px] font-mono font-bold transition-all',
                      skinModel === 'classic'
                        ? 'bg-white/20 text-white font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    )}
                    title="Classic Steve 4px arm thickness"
                  >
                    Classic (4px)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModelChange('slim')}
                    className={cn(
                      'rounded-lg px-2 py-1 text-[10px] font-mono font-bold transition-all',
                      skinModel === 'slim'
                        ? 'bg-white/20 text-white font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    )}
                    title="Slim Alex 3px arm thickness"
                  >
                    Slim (3px)
                  </button>
                </div>

                {/* Perspective View Toggle */}
                <div className="flex items-center gap-1 rounded-xl bg-black/60 p-1 border border-white/10 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click')
                      setActiveView('body')
                    }}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-[10px] font-mono font-bold transition-all',
                      activeView === 'body'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Body
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click')
                      setActiveView('head')
                    }}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-[10px] font-mono font-bold transition-all',
                      activeView === 'head'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Head
                  </button>
                </div>
              </div>

              {/* 3D Model Display / 2D Canvas */}
              <div className="relative z-10 my-4 flex flex-col items-center justify-center min-h-[260px]">
                {skinType === 'custom' && customSkinDataUrl ? (
                  <div className="flex flex-col items-center">
                    <canvas
                      ref={canvasRef}
                      width={210}
                      height={240}
                      className="drop-shadow-[0_16px_30px_rgba(0,0,0,0.9)] filter transition-all duration-300"
                    />
                    <span className="mt-2 font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 shadow-sm">
                      ✓ Custom Texture Active
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <img
                      src={activeView === 'head' ? head3dUrl : body3dUrl}
                      alt={previewPlayer}
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src =
                          activeView === 'head'
                            ? 'https://mc-heads.net/avatar/Steve/200'
                            : 'https://mc-heads.net/body/Steve/380'
                      }}
                      className={cn(
                        'w-auto object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.85)] filter transition-all duration-300',
                        activeView === 'head' ? 'max-h-40' : 'max-h-56'
                      )}
                    />
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <span
                        className={cn(
                          'font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm',
                          isCustomActive
                            ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                            : 'text-slate-300 bg-white/5 border-white/10'
                        )}
                      >
                        {skinType === 'player'
                          ? `Skin from "${skinPlayerName}"`
                          : 'Standard Profile Skin'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stage Bottom Bar: Direct Download & NameMC */}
              <div className="relative z-10 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={handleDownloadSkin}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm"
                  title="Download raw .PNG texture"
                >
                  <HiArrowDownTray size={14} className="text-amber-400" />
                  <span>Download .PNG</span>
                </button>

                <a
                  href={nameMcUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-amber-300 px-3 py-1.5 text-xs font-bold text-slate-300 transition-all shadow-sm"
                  title="View on NameMC skin database"
                >
                  <span>NameMC</span>
                  <HiArrowTopRightOnSquare size={13} />
                </a>
              </div>
            </div>

            {/* ── RIGHT: CONTROLS & PRESET SUITE (md:col-span-7) ── */}
            <div className="md:col-span-7 p-5 flex flex-col gap-3.5 bg-[#0B0F19]/90">
              {/* Category Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                {[
                  { id: 'custom', label: 'Upload & Steal Skin', icon: HiArrowUpTray },
                  { id: 'presets', label: 'Popular Presets', icon: HiFire },
                  { id: 'tools', label: 'Galleries & Tools', icon: HiBolt }
                ].map((tab) => {
                  const isActive = activeTab === tab.id
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        playSound('click')
                        setActiveTab(tab.id as typeof activeTab)
                      }}
                      className={cn(
                        'flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all',
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25'
                          : 'border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/10'
                      )}
                    >
                      <Icon size={14} className={isActive ? 'text-slate-950' : 'text-slate-400'} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* ── TAB 1: UPLOAD & STEAL FROM USERNAME ── */}
              {activeTab === 'custom' && (
                <div className="space-y-3">
                  {/* File Upload Section */}
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Upload Local Skin
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">64x64 or 64x32 PNG</span>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png,.png"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => {
                          playSound('click')
                          fileInputRef.current?.click()
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 py-2.5 px-4 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
                      >
                        <HiArrowUpTray size={16} className="stroke-[2.5]" />
                        <span>Select .PNG File</span>
                      </motion.button>

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] hover:border-emerald-400/50 hover:bg-white/[0.05] p-2 text-center cursor-pointer transition-all"
                      >
                        <span className="text-[11px] text-slate-400">
                          or drag &amp; drop onto stage
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Copy / Steal from Username Section */}
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Steal Skin from Player
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Instant Mojang Sync</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={playerInput}
                        onChange={(e) => setPlayerInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPlayerSkin()}
                        placeholder="Enter player username (e.g. Dream, TechnoBlade)..."
                        className="flex-1 rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 font-mono"
                      />
                      <button
                        type="button"
                        disabled={!playerInput.trim() || isApplying}
                        onClick={() => handleApplyPlayerSkin()}
                        className="rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 px-4 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 whitespace-nowrap active:scale-95"
                      >
                        {isApplying ? 'Fetching...' : 'Apply Skin'}
                      </button>
                    </div>

                    {/* Quick Try Avatars */}
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">Quick Try:</span>
                      {['TechnoBlade', 'Dream', 'Herobrine', 'Steve', 'Alex'].map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            playSound('click')
                            handleApplyPlayerSkin(name)
                          }}
                          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-white/10 px-2 py-0.5 text-[10px] text-slate-300 hover:text-white transition-all shrink-0"
                        >
                          <img
                            src={`https://mc-heads.net/avatar/${name}/16`}
                            alt={name}
                            className="h-3.5 w-3.5 rounded object-cover"
                          />
                          <span>{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Multiplayer Server Tip */}
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-200">
                    <div className="min-w-0">
                      <p className="font-bold text-amber-300 text-[11px] flex items-center gap-1.5">
                        <HiBolt size={13} className="text-amber-400" />
                        <span>Cracked &amp; SMP Server Broadcast</span>
                      </p>
                      <p className="text-[11px] text-amber-200/80 truncate mt-0.5">
                        Run <code className="bg-black/50 px-1 py-0.2 rounded font-mono font-bold text-amber-300">/skin {previewPlayer}</code> in chat so other players see your skin!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click')
                        navigator.clipboard.writeText(`/skin ${previewPlayer}`)
                        setCopiedCommand(true)
                        setTimeout(() => setCopiedCommand(false), 2000)
                      }}
                      className="shrink-0 flex items-center gap-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1 font-mono text-[11px] font-bold transition-all active:scale-95"
                    >
                      {copiedCommand ? <HiCheck size={13} /> : <HiClipboardDocument size={13} />}
                      <span>{copiedCommand ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Skin Synchronization Info Card */}
                  <div className="rounded-2xl border border-white/5 bg-black/25 p-3 flex items-start gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/5 text-amber-400 shrink-0 mt-0.5">
                      <HiSparkles size={15} />
                    </div>
                    <div className="min-w-0 text-xs">
                      <p className="font-bold text-slate-300 text-[11px]">Automatic HD Skin &amp; Layer Sync</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                        Skins and full 3D overlays (hats, jackets, sleeves) are automatically synced to your offline launcher profile and Minecraft instances.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: POPULAR PRESETS GALLERY ── */}
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Iconic Community Presets
                    </span>
                    <span className="text-[10px] text-slate-500">1-Click Apply</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {PRESET_SKINS.map((preset) => {
                      const isCurrent =
                        skinType === 'player' &&
                        skinPlayerName?.toLowerCase() === preset.username.toLowerCase()

                      return (
                        <motion.button
                          key={preset.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => {
                            handleModelChange(preset.model)
                            handleApplyPlayerSkin(preset.username)
                          }}
                          className={cn(
                            'group flex items-center gap-2.5 rounded-2xl border p-2 text-left transition-all backdrop-blur-md',
                            isCurrent
                              ? 'border-amber-500/60 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                              : 'border-white/10 bg-black/40 hover:border-amber-400/40 hover:bg-white/[0.06]'
                          )}
                        >
                          <img
                            src={`https://mc-heads.net/avatar/${preset.username}/40`}
                            alt={preset.name}
                            onError={(e) => {
                              ;(e.currentTarget as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve/40'
                            }}
                            className="h-9 w-9 rounded-xl border border-white/20 object-cover bg-black/60 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-white truncate font-display group-hover:text-amber-300 transition-colors">
                              {preset.name}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400">
                              {preset.tag}
                            </span>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── TAB 3: GALLERIES & TOOLS ── */}
              {activeTab === 'tools' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      External Skin Catalogs &amp; Editors
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href="https://www.minecraftskins.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 hover:border-amber-400/40 hover:bg-white/[0.06] p-3.5 transition-all group shadow-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                        <HiSparkles size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-1">
                          <span>The Skindex</span>
                          <HiArrowTopRightOnSquare size={12} />
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">Millions of community skins</p>
                      </div>
                    </a>

                    <a
                      href="https://namemc.com/minecraft-skins"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 hover:border-cyan-400/40 hover:bg-white/[0.06] p-3.5 transition-all group shadow-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                        <HiBolt size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                          <span>NameMC Trending</span>
                          <HiArrowTopRightOnSquare size={12} />
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">Trending top player skins</p>
                      </div>
                    </a>

                    <a
                      href="https://www.planetminecraft.com/skins/"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 hover:border-emerald-400/40 hover:bg-white/[0.06] p-3.5 transition-all group shadow-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                        <HiFire size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                          <span>Planet Minecraft</span>
                          <HiArrowTopRightOnSquare size={12} />
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">Creative skins &amp; packs</p>
                      </div>
                    </a>

                    <a
                      href="https://minecraft.novaskin.me/"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 hover:border-purple-400/40 hover:bg-white/[0.06] p-3.5 transition-all group shadow-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                        <HiSparkles size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-white group-hover:text-purple-300 transition-colors flex items-center gap-1">
                          <span>NovaSkin 3D Editor</span>
                          <HiArrowTopRightOnSquare size={12} />
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">Draw &amp; create your own skin</p>
                      </div>
                    </a>
                  </div>
                </div>
              )}

              {/* Reset to Default Action if custom skin is active */}
              {isCustomActive && (
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Active custom skin overrides original skin</span>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="flex items-center gap-1 text-[11px] font-mono text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    <HiArrowPath size={13} />
                    <span>Reset to Original Skin</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── FOOTER ACTIONS ── */}
          <div className="flex items-center justify-between border-t border-white/[0.08] px-6 py-3.5 bg-[#080B12]/90">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
              <span className="text-xs text-slate-400 font-medium">
                Changes apply instantly across online &amp; offline sessions
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound('success')
                onClose()
              }}
              className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-400 hover:brightness-110 px-7 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-amber-500/25 active:scale-95"
            >
              Done &amp; Save
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

