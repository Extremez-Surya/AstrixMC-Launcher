import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  HiPlay,
  HiStop,
  HiArrowPath,
  HiChevronDown,
  HiSparkles,
  HiBolt,
  HiShieldCheck,
  HiPuzzlePiece,
  HiFolderOpen,
  HiAdjustmentsHorizontal,
  HiDocumentText,
  HiCheck
} from 'react-icons/hi2'
import { FaFire, FaGem, FaCrosshairs } from 'react-icons/fa6'
import { useInstances } from '../../hooks/useInstances'
import { useLaunch } from '../../hooks/useLaunch'
import { playSound } from '../../utils/sound'
import type { GameInstance } from '../../../shared/types/instance'

export default function QuickPlayBar() {
  const navigate = useNavigate()
  const { instances, activeInstance, setActiveInstance, openInstanceFolder, loadInstances } = useInstances()
  const { launchGame, stopGame, isPlaying, isLaunching } = useLaunch()

  const [presets, setPresets] = useState<any[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)

  const currentInstance: GameInstance | undefined = activeInstance || instances[0]

  useEffect(() => {
    loadPresets()
  }, [instances])

  const loadPresets = async () => {
    try {
      if (window.electronAPI?.getPresets) {
        const list = await window.electronAPI.getPresets()
        setPresets(list || [])
      }
    } catch {}
  }

  const handleSelectPreset = async (presetItem: any) => {
    playSound('click')
    setIsDropdownOpen(false)

    if (presetItem.installedInstance) {
      setActiveInstance(presetItem.installedInstance)
    } else {
      // Auto-install preset
      setIsSyncing(true)
      setSyncStatus(`Creating ${presetItem.preset.name}...`)
      try {
        const inst = await window.electronAPI.ensureDefaultPreset()
        if (inst) {
          setSyncStatus(`Syncing core client mods...`)
          await window.electronAPI.installOrSyncPreset(inst.id)
          await loadInstances()
          setActiveInstance(inst)
        }
      } catch (err) {
        console.error('Failed to setup preset:', err)
      } finally {
        setIsSyncing(false)
        setSyncStatus(null)
      }
    }
  }

  const handleLaunch = async () => {
    if (!currentInstance) return
    playSound('launch')

    if (isPlaying) {
      stopGame()
      return
    }

    if (isLaunching || isSyncing) return

    // If it's an Astrix Client instance, ensure core mods & environment are synchronized
    const isAstrixPreset = currentInstance.name.toLowerCase().includes('astrix')
    if (isAstrixPreset && window.electronAPI?.installOrSyncPreset) {
      setIsSyncing(true)
      setSyncStatus('Verifying client engine...')
      try {
        await window.electronAPI.installOrSyncPreset(currentInstance.id)
      } catch (err) {
        console.warn('Sync notice:', err)
      } finally {
        setIsSyncing(false)
        setSyncStatus(null)
      }
    }

    launchGame(currentInstance.id)
  }

  const isAstrixClient = Boolean(currentInstance?.name?.toLowerCase().includes('astrix'))

  return (
    <div className="relative z-30 w-full rounded-2xl border border-white/10 bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-slate-950/90 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-cyan-500/10 blur-xl opacity-60" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Side: Profile Selector with Dropdown */}
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-left transition-all hover:border-amber-500/50 hover:bg-white/[0.08]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-amber-600/10 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                {isAstrixClient ? (
                  <FaGem className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                ) : (
                  <FaCrosshairs className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                )}
              </div>

              <div className="flex flex-col pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-black text-white tracking-wide">
                    {currentInstance?.name || 'Astrix Client 1.21.4'}
                  </span>
                  {isAstrixClient && (
                    <span className="rounded bg-gradient-to-r from-amber-500 to-amber-600 px-1.5 py-0.2 text-[9px] font-black uppercase text-black tracking-wider">
                      OFFICIAL CLIENT
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">
                    {currentInstance?.modLoader?.type?.toUpperCase() || 'FABRIC'}{' '}
                    {currentInstance?.mcVersion || '1.21.4'}
                  </span>
                  <span>•</span>
                  <span>{currentInstance?.memoryMax || '4'} GB RAM</span>
                </div>
              </div>

              <HiChevronDown
                className={`ml-1 h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-white/15 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/80">
                    Astrix Official Client Profiles
                  </div>

                  <div className="flex flex-col gap-1">
                    {presets.map((item) => {
                      const isSelected = currentInstance?.id === item.installedInstance?.id
                      return (
                        <button
                          key={item.preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(item)}
                          className={`flex items-center justify-between rounded-xl p-2.5 text-left transition-all ${
                            isSelected
                              ? 'border border-amber-500/40 bg-amber-500/10 text-white'
                              : 'hover:bg-white/[0.06] text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                              <FaGem size={14} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-display text-xs font-bold text-white">
                                {item.preset.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {item.preset.tagline}
                              </span>
                            </div>
                          </div>

                          {isSelected ? (
                            <HiCheck className="h-4 w-4 text-amber-400" />
                          ) : !item.installedInstance ? (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                              + INSTALL
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>

                  {instances.filter((i) => !i.name.toLowerCase().includes('astrix')).length > 0 && (
                    <>
                      <div className="mt-2 border-t border-white/10 px-3 pt-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Custom User Profiles
                      </div>
                      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                        {instances
                          .filter((i) => !i.name.toLowerCase().includes('astrix'))
                          .map((inst) => (
                            <button
                              key={inst.id}
                              type="button"
                              onClick={() => {
                                setActiveInstance(inst)
                                setIsDropdownOpen(false)
                              }}
                              className={`flex items-center justify-between rounded-xl p-2 text-left transition-all ${
                                currentInstance?.id === inst.id
                                  ? 'bg-emerald-500/10 text-white'
                                  : 'hover:bg-white/[0.06] text-slate-300'
                              }`}
                            >
                              <span className="text-xs font-medium truncate">{inst.name}</span>
                              <span className="font-mono text-[10px] text-slate-500">
                                {inst.mcVersion}
                              </span>
                            </button>
                          ))}
                      </div>
                    </>
                  )}

                  <div className="mt-2 border-t border-white/10 pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false)
                        navigate('/instances')
                      }}
                      className="w-full rounded-lg py-1.5 text-center text-xs font-medium text-slate-400 hover:text-white transition-colors"
                    >
                      Manage All Instances →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick-Toggle Feature Chips */}
          <div className="hidden xl:flex items-center gap-2">
            <div
              title="Sodium + Lithium + FerriteCore + G1GC JVM Flags Enabled"
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300"
            >
              <HiBolt className="h-3.5 w-3.5 text-emerald-400" />
              <span>500+ FPS Boost</span>
            </div>

            <div
              title="CustomSkinLoader & WaveyCapes Active"
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300"
            >
              <HiSparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>3D Capes</span>
            </div>

            <div
              title="Iris Shader Engine Pre-bundled"
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300"
            >
              <HiShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>Iris Shaders</span>
            </div>
          </div>
        </div>

        {/* Right Side: Fast Tool Icons + Massive 3D Launch Action Button */}
        <div className="flex items-center gap-3 justify-end">
          
          {/* Quick Tools */}
          <div className="flex items-center gap-1 text-slate-400">
            <button
              type="button"
              onClick={() => currentInstance && openInstanceFolder(currentInstance.id)}
              title="Open Game Directory"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] hover:border-white/20 hover:bg-white/10 hover:text-white transition-all"
            >
              <HiFolderOpen size={17} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/mods')}
              title="Manage Mods"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] hover:border-white/20 hover:bg-white/10 hover:text-white transition-all"
            >
              <HiPuzzlePiece size={17} />
            </button>
            <button
              type="button"
              onClick={() => currentInstance && navigate(`/instances/${currentInstance.id}`)}
              title="In-Launcher Live Logs & Files"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] hover:border-white/20 hover:bg-white/10 hover:text-white transition-all"
            >
              <HiDocumentText size={17} />
            </button>
          </div>

          {/* ── BIG GLOWING 3D LAUNCH BUTTON (Feather / NoRisk Style) ── */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={isLaunching || isSyncing}
            onClick={handleLaunch}
            className={`relative flex items-center justify-center gap-3 overflow-hidden rounded-xl px-7 py-3 font-display font-black tracking-wider transition-all select-none shadow-xl ${
              isPlaying
                ? 'bg-rose-600 text-white shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:bg-rose-500'
                : isLaunching || isSyncing
                ? 'cursor-wait bg-amber-500/80 text-black shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-black shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:shadow-[0_0_45px_rgba(245,158,11,0.7)]'
            }`}
          >
            {/* Animated Light Sweep Effect */}
            {!isPlaying && !isLaunching && !isSyncing && (
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              />
            )}

            {isPlaying ? (
              <>
                <HiStop className="h-5 w-5 animate-pulse" />
                <span className="text-sm uppercase">STOP MINECRAFT</span>
              </>
            ) : isLaunching || isSyncing ? (
              <>
                <HiArrowPath className="h-5 w-5 animate-spin" />
                <span className="text-sm uppercase">
                  {syncStatus || 'PREPARING CLIENT...'}
                </span>
              </>
            ) : (
              <>
                <HiPlay className="h-5 w-5" />
                <span className="text-sm uppercase">
                  {isAstrixClient ? '⚡ LAUNCH ASTRIX CLIENT' : 'LAUNCH GAME'}
                </span>
              </>
            )}
          </motion.button>
        </div>

      </div>
    </div>
  )
}
