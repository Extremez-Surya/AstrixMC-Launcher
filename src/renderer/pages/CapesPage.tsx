import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiSparkles,
  HiCheck,
  HiTrash,
  HiArrowUpTray,
  HiArrowDownTray,
  HiArrowsRightLeft,
  HiBolt,
  HiShieldCheck,
  HiInformationCircle
} from 'react-icons/hi2'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../stores/auth-store'
import { playSound } from '../utils/sound'
import { cn } from '../lib/cn'
import { MinecraftSkinViewer3D } from '../components/skins/MinecraftSkinViewer3D'
import { CURATED_CAPES, CapeItem } from '../utils/capes-library'

export default function CapesPage() {
  const { activeAccount } = useAuth()
  const { updateAccount } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'all' | 'astrix' | 'official' | 'community' | 'custom'>('all')
  const [selectedCapeId, setSelectedCapeId] = useState<string | null>(activeAccount?.capeId || 'astrix-void-nebula')
  const [previewCapeUrl, setPreviewCapeUrl] = useState<string | null>(activeAccount?.capeUrl || null)
  const [customCapeDataUri, setCustomCapeDataUri] = useState<string | null>(null)
  const [customCapeName, setCustomCapeName] = useState<string>('Custom Cape')
  const [isEquipping, setIsEquipping] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Initialize preview with active account cape or first curated cape
  useEffect(() => {
    if (activeAccount?.capeUrl) {
      setPreviewCapeUrl(activeAccount.capeUrl)
      setSelectedCapeId(activeAccount.capeId || 'custom')
    } else {
      const defaultCape = CURATED_CAPES[0]
      if (defaultCape) {
        setSelectedCapeId(defaultCape.id)
        setPreviewCapeUrl(defaultCape.generateTexture())
      }
    }
  }, [activeAccount?.id])

  const filteredCapes = useMemo(() => {
    if (activeTab === 'all') return CURATED_CAPES
    if (activeTab === 'custom') return []
    return CURATED_CAPES.filter((c) => c.category === activeTab)
  }, [activeTab])

  const handleSelectCuratedCape = (cape: CapeItem) => {
    playSound('click')
    setSelectedCapeId(cape.id)
    const texture = cape.generateTexture()
    setPreviewCapeUrl(texture)
  }

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.png')) {
      showToast('Please upload a valid .png cape texture.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUri = event.target?.result as string
      if (!dataUri) return

      const img = new Image()
      img.onload = () => {
        // Validate Cape dimensions: standard 64x32 or 2x HD 128x64 or 512x256
        const ratio = img.width / img.height
        if (Math.abs(ratio - 2.0) > 0.1) {
          showToast(`Cape aspect ratio should be 2:1 (e.g. 64x32). Loaded: ${img.width}x${img.height}`)
        } else {
          showToast(`Cape imported: ${img.width}x${img.height}px`)
        }
        setCustomCapeDataUri(dataUri)
        setCustomCapeName(file.name.replace(/\.[^/.]+$/, ''))
        setSelectedCapeId('custom')
        setPreviewCapeUrl(dataUri)
        setActiveTab('custom')
      }
      img.src = dataUri
    }
    reader.readAsDataURL(file)
  }

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3500)
  }

  const handleEquipCape = async () => {
    if (!activeAccount) {
      showToast('Please sign in or select an account first!')
      return
    }

    if (!previewCapeUrl) {
      showToast('Select or upload a cape first!')
      return
    }

    setIsEquipping(true)
    playSound('launch')

    try {
      await updateAccount(activeAccount.id, {
        capeId: selectedCapeId || 'custom',
        capeUrl: previewCapeUrl,
        capeEnabled: true
      })
      showToast('Cape equipped successfully! Dynamic Wavey Cloth Physics Active.')
    } catch (err) {
      console.error(err)
      showToast('Failed to save cape to account.')
    } finally {
      setIsEquipping(false)
    }
  }

  const handleUnequipCape = async () => {
    if (!activeAccount) return
    setIsEquipping(true)
    playSound('click')

    try {
      await updateAccount(activeAccount.id, {
        capeId: undefined,
        capeUrl: undefined,
        capeEnabled: false
      })
      setPreviewCapeUrl(null)
      setSelectedCapeId(null)
      showToast('Cape unequipped.')
    } catch (err) {
      console.error(err)
    } finally {
      setIsEquipping(false)
    }
  }

  const isCurrentEquipped =
    Boolean(activeAccount?.capeUrl) &&
    ((selectedCapeId === activeAccount?.capeId) ||
      (previewCapeUrl && previewCapeUrl === activeAccount?.capeUrl))

  return (
    <div className="flex-1 flex flex-col h-full bg-[#06080F] text-slate-100 overflow-hidden relative">
      {/* Background Astral Nebula glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-purple-500/40 text-purple-200 text-xs font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <HiSparkles className="h-4 w-4 text-purple-400 shrink-0 animate-pulse" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="px-8 pt-7 pb-4 flex items-center justify-between border-b border-white/[0.06] bg-black/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Cape Studio & Physics</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                WAVEY CLOTH ENGINE
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Equip animated & classic capes with realistic multi-segmented waving cloth simulation in-game.
          </p>
        </div>

        {/* Cloth Physics Status Pill */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs shadow-inner">
          <HiBolt className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="font-semibold text-[11px]">Real Cloth Physics: ON</span>
        </div>
      </div>

      {/* Main Content: Split 3D Stage & Cape Catalog */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: 3D Stage Pedestal */}
        <div className="w-[360px] lg:w-[420px] p-6 flex flex-col items-center justify-between border-r border-white/[0.06] bg-[#070A14]/70 relative">
          {/* Active Account Identity Pill */}
          <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs text-slate-300 font-medium">
                {activeAccount ? activeAccount.username : 'Offline Player'}
              </span>
            </div>
            {isCurrentEquipped ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <HiShieldCheck className="h-3.5 w-3.5" /> Equipped
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Previewing</span>
            )}
          </div>

          {/* 3D Skin & Cape Stage */}
          <div className="relative my-auto flex flex-col items-center justify-center">
            {/* Soft subtle ground shadow */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-5 w-40 rounded-[100%] bg-black/50 blur-md pointer-events-none -z-10" />

            <MinecraftSkinViewer3D
              width={300}
              height={380}
              skinUrl={activeAccount?.skinUrl}
              capeUrl={previewCapeUrl || undefined}
              playerName={activeAccount?.skinPlayerName || activeAccount?.username || 'Steve'}
              model={activeAccount?.customSkinModel || 'classic'}
              defaultAnimation="walk"
              showControlsBar={true}
              className="drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] z-10"
            />
          </div>

          {/* Bottom Controls */}
          <div className="w-full flex flex-col gap-2.5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleEquipCape}
                disabled={isEquipping || !previewCapeUrl || isCurrentEquipped}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg',
                  isCurrentEquipped
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]'
                )}
              >
                {isCurrentEquipped ? (
                  <>
                    <HiCheck className="h-4 w-4" /> Equipped In-Game
                  </>
                ) : (
                  <>
                    <HiSparkles className="h-4 w-4" /> Equip Cape
                  </>
                )}
              </button>

              {activeAccount?.capeUrl && (
                <button
                  type="button"
                  onClick={handleUnequipCape}
                  disabled={isEquipping}
                  className="px-3 py-2.5 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-400 transition-colors"
                  title="Unequip cape"
                >
                  <HiTrash className="h-4 w-4" />
                </button>
              )}
            </div>

            <p className="text-[10px] text-center text-slate-400">
              * Click the flip button in 3D controls to turn character 180° and view the cape back.
            </p>
          </div>
        </div>

        {/* Right Side: Cape Catalog & Custom Uploader */}
        <div className="flex-1 p-6 flex flex-col overflow-y-auto">
          {/* Navigation Category Filters */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              {[
                { id: 'all', label: 'All Capes' },
                { id: 'astrix', label: 'Astrix Signature' },
                { id: 'official', label: 'Minecon & Mojang' },
                { id: 'community', label: 'OptiFine & Special' },
                { id: 'custom', label: 'Custom Upload' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setActiveTab(tab.id as any)
                  }}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Custom File Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png"
                onChange={handleCustomFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all"
              >
                <HiArrowUpTray className="h-3.5 w-3.5" />
                <span>Upload .PNG Cape</span>
              </button>
            </div>
          </div>

          {/* Custom Upload Section view */}
          {activeTab === 'custom' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-lg p-10 rounded-3xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/10 hover:bg-purple-950/20 transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="h-16 w-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform mb-4 border border-purple-500/30">
                  <HiArrowUpTray className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  Click to select or drag & drop a Cape PNG
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Standard Minecraft 64x32 cape textures are supported. Will be rendered with dynamic waving cloth physics.
                </p>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-purple-300 font-mono">
                  Supported: 64x32, 128x64 HD, 512x256
                </span>
              </div>

              {customCapeDataUri && (
                <div className="mt-6 flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                  <div className="h-14 w-10 bg-slate-900 border border-white/20 rounded-md overflow-hidden flex items-center justify-center">
                    <img src={customCapeDataUri} alt="custom cape" className="max-h-full max-w-full" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{customCapeName}</h4>
                    <p className="text-xs text-emerald-400 font-semibold">Custom Cape Ready to Equip</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewCapeUrl(customCapeDataUri)
                      setSelectedCapeId('custom')
                      playSound('click')
                    }}
                    className="ml-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                  >
                    Select In Studio
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Cape Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-6">
              {filteredCapes.map((cape) => {
                const isSelected = selectedCapeId === cape.id
                const isEquipped = activeAccount?.capeId === cape.id

                return (
                  <motion.div
                    key={cape.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectCuratedCape(cape)}
                    className={cn(
                      'group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden',
                      isSelected
                        ? 'border-amber-400/80 bg-gradient-to-b from-amber-950/20 to-slate-900/80 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                        : 'border-white/[0.08] hover:border-white/20 bg-slate-900/40 hover:bg-slate-900/70'
                    )}
                  >
                    {/* Top Row: Badge & Status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 uppercase tracking-wider">
                        {cape.badge || cape.category}
                      </span>
                      {isEquipped && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <HiCheck className="h-3 w-3" /> Equipped
                        </span>
                      )}
                    </div>

                    {/* Visual Card Banner Preview */}
                    <div className={cn('h-24 w-full rounded-xl p-3 flex items-center justify-center bg-gradient-to-br border border-white/10 shadow-inner mb-3 relative overflow-hidden', cape.gradient)}>
                      <div className="h-16 w-10 rounded-sm shadow-2xl border border-white/20 overflow-hidden transform group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300">
                        <img
                          src={cape.generateTexture()}
                          alt={cape.name}
                          className="w-full h-full object-cover"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      {cape.isAnimated && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-purple-500/30 border border-purple-400/40 text-[9px] font-mono text-purple-200">
                          ANIMATED
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        {cape.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {cape.description}
                      </p>
                    </div>

                    {/* Action Indicator */}
                    <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                      <span className={cn('font-semibold', isSelected ? 'text-amber-400' : 'text-slate-500')}>
                        {isSelected ? 'Currently Selected' : 'Click to preview'}
                      </span>
                      <HiSparkles className={cn('h-3.5 w-3.5', isSelected ? 'text-amber-400 animate-spin' : 'text-slate-600')} />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

