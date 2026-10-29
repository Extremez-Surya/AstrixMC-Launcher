import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  HiBolt,
  HiChevronDown,
  HiArrowPath,
  HiCheck
} from 'react-icons/hi2'
import { useAuth } from '../../hooks/useAuth'
import { useInstances } from '../../hooks/useInstances'
import { useLaunch } from '../../hooks/useLaunch'
import { playSound } from '../../utils/sound'
import { MinecraftSkinViewer3D } from '../../components/skins/MinecraftSkinViewer3D'
import LoginView from '../../components/auth/LoginView'
import type { GameInstance } from '../../../shared/types/instance'

export default function NoRiskPlayStage() {
  const navigate = useNavigate()
  const { activeAccount } = useAuth()
  const { instances, activeInstance, setActiveInstance, loadInstances } = useInstances()
  const { launchGame, stopGame, isPlaying, isLaunching } = useLaunch()

  // State
  const [skinAnimationEnabled, setSkinAnimationEnabled] = useState(true)
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false)
  const [presets, setPresets] = useState<any[]>([])

  useEffect(() => {
    if (window.electronAPI?.getPresets) {
      window.electronAPI.getPresets().then((list) => setPresets(list || [])).catch(() => {})
    }
  }, [instances])

  if (!activeAccount) return <LoginView />

  const currentInstance: GameInstance | undefined = activeInstance || instances[0]

  const handleLaunch = () => {
    playSound('launch')
    if (isPlaying) {
      stopGame()
    } else if (!isLaunching && currentInstance) {
      launchGame(currentInstance.id)
    }
  }

  const handleSelectInstance = (inst: GameInstance) => {
    playSound('click')
    setActiveInstance(inst)
    setIsVersionDropdownOpen(false)
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050A14] select-none font-sans">
      
      {/* ── 3D CYBER GRID / TRON PERSPECTIVE BACKGROUND ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Subtle radial space glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0D1B36_0%,_#050A14_75%)] opacity-80" />

        {/* Floor Grid (vanishing to center) */}
        <div
          className="absolute inset-x-0 bottom-0 h-[60%] opacity-35"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(56, 189, 248, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(56, 189, 248, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            transform: 'perspective(500px) rotateX(65deg)',
            transformOrigin: 'bottom center'
          }}
        />

        {/* Top subtle grid lines */}
        <div
          className="absolute inset-x-0 top-0 h-[50%] opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(56, 189, 248, 0.25) 1px, transparent 1px),
              linear-gradient(to top, rgba(56, 189, 248, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            transform: 'perspective(500px) rotateX(-65deg)',
            transformOrigin: 'top center'
          }}
        />

        {/* Horizon fading vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-transparent to-[#050A14]/70" />
      </div>

      {/* ── TOP-RIGHT CONTROLS: SKIN ANIMATION SWITCH ── */}
      <div className="relative z-10 flex justify-end p-6">
        <div className="flex items-center gap-3 rounded-2xl bg-[#091326]/70 border border-white/[0.08] px-4 py-2 backdrop-blur-md shadow-lg">
          <span className="font-pixel text-xs font-bold text-slate-300">
            Skin Animation
          </span>

          <button
            type="button"
            onClick={() => {
              playSound('click')
              setSkinAnimationEnabled(!skinAnimationEnabled)
            }}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              skinAnimationEnabled ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                skinAnimationEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── CENTER: 3D CHARACTER WITH FLOATING NAMETAG ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center -mt-6">
        
        {/* Floating Pixel Nametag Badge */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          className="z-20 mb-2 flex items-center gap-2 rounded-lg border border-white/20 bg-black/80 px-4 py-1 shadow-2xl backdrop-blur-md"
        >
          <HiBolt className="text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,1)]" size={15} />
          <span className="font-pixel text-sm font-black tracking-widest text-white">
            {activeAccount.username}
          </span>
        </motion.div>

        {/* 3D Interactive Skin Model (Drag to rotate 360°) */}
        <div className="relative h-[360px] w-full max-w-[420px] flex items-center justify-center cursor-grab active:cursor-grabbing">
          <MinecraftSkinViewer3D
            playerName={activeAccount.username}
            width={340}
            height={360}
            animation={skinAnimationEnabled ? 'wave' : 'none'}
            enableControls={true}
            enableZoom={false}
            showControlsBar={false}
          />
        </div>

        {/* Watermark above launch bar */}
        <span className="font-pixel text-[10px] font-bold text-slate-500 tracking-widest mt-1 mb-4 select-none">
          ASTRIX.NETWORK
        </span>

        {/* ── MAIN LAUNCH ACTION BAR (SPLIT BUTTON STYLE) ── */}
        <div className="relative z-30 flex items-stretch rounded-2xl border border-[#2563EB]/70 bg-gradient-to-r from-[#172554] via-[#1E3A8A] to-[#1E40AF] shadow-[0_0_35px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.65)] hover:border-cyan-400 transition-all duration-300 overflow-hidden">
          
          {/* Main Action (Launch / Stop) */}
          <button
            type="button"
            onClick={handleLaunch}
            disabled={isLaunching}
            className="flex min-w-[240px] flex-col items-center justify-center px-10 py-3.5 hover:bg-white/[0.04] transition-all cursor-pointer active:scale-[0.99]"
          >
            {isPlaying ? (
              <span className="font-pixel text-lg font-black tracking-widest text-rose-300 drop-shadow">
                STOP GAME
              </span>
            ) : isLaunching ? (
              <div className="flex items-center gap-2">
                <HiArrowPath className="animate-spin text-cyan-300" size={18} />
                <span className="font-pixel text-base font-black tracking-widest text-white">
                  LAUNCHING...
                </span>
              </div>
            ) : (
              <span className="font-pixel text-xl font-black tracking-widest text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                LAUNCH
              </span>
            )}

            <span className="font-pixel text-[10px] font-bold tracking-wider text-cyan-300 mt-0.5">
              {currentInstance ? currentInstance.name : 'ASTRIX 1.21.4'}
            </span>
          </button>

          {/* Right Split Dropdown Arrow */}
          <div className="relative border-l border-white/20">
            <button
              type="button"
              onClick={() => {
                playSound('click')
                setIsVersionDropdownOpen(!isVersionDropdownOpen)
              }}
              className="flex h-full w-12 items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              title="Select Profile / Version"
            >
              <HiChevronDown size={18} />
            </button>

            {/* Version / Profile Dropdown Menu */}
            <AnimatePresence>
              {isVersionDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  className="absolute bottom-full right-0 z-50 mb-3 w-72 overflow-hidden rounded-2xl border border-cyan-500/40 bg-[#091122]/95 p-2 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="p-2 font-pixel text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    SELECT INSTANCE / VERSION
                  </div>

                  <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
                    {instances.map((inst) => {
                      const isSel = currentInstance?.id === inst.id
                      return (
                        <button
                          key={inst.id}
                          type="button"
                          onClick={() => handleSelectInstance(inst)}
                          className={`flex items-center justify-between rounded-xl p-2.5 text-left transition-all ${
                            isSel
                              ? 'border border-cyan-500/40 bg-cyan-500/20 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                              : 'text-slate-300 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-pixel text-xs font-bold text-white">
                              {inst.name}
                            </span>
                            <span className="font-mono text-[9px] text-slate-400">
                              {inst.loader} • {inst.mcVersion}
                            </span>
                          </div>
                          {isSel && <HiCheck className="text-cyan-400" size={16} />}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Bottom spacer for balance */}
      <div className="h-6" />

    </div>
  )
}

