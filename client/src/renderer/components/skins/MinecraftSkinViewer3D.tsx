import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  SkinViewer,
  IdleAnimation,
  WalkingAnimation,
  RunningAnimation,
  FlyingAnimation,
  PlayerAnimation
} from 'skinview3d'
import {
  HiArrowPath,
  HiPlay,
  HiPause,
  HiEye
} from 'react-icons/hi2'
import { cn } from '../../lib/cn'

export interface MinecraftSkinViewer3DProps {
  skinUrl?: string
  playerName?: string
  model?: 'classic' | 'slim' | 'default'
  width?: number
  height?: number
  className?: string
  enableControls?: boolean
  enableZoom?: boolean
  defaultAnimation?: 'idle' | 'walk' | 'run' | 'fly' | 'wave' | 'none'
  animation?: 'idle' | 'walk' | 'run' | 'fly' | 'wave' | 'none'
  showControlsBar?: boolean
  onModelChange?: (model: 'classic' | 'slim') => void
}

/**
 * Custom waving and breathing emote animation matching the NoRisk client aesthetic
 */
export class CustomWaveEmoteAnimation extends PlayerAnimation {
  animate(player: any) {
    if (!player || !player.skin) return
    const t = this.progress * 2 * Math.PI

    // Right arm waving high in the air
    player.skin.rightArm.rotation.x = Math.PI - 0.35 + Math.sin(t * 1.5) * 0.08
    player.skin.rightArm.rotation.z = -0.45 + Math.sin(t * 4.0) * 0.25
    player.skin.rightArm.rotation.y = 0.18 + Math.cos(t * 1.5) * 0.06

    // Left arm relaxed at side with subtle natural movement
    player.skin.leftArm.rotation.x = Math.sin(t * 1.2) * 0.06
    player.skin.leftArm.rotation.z = 0.12 + Math.cos(t * 1.2) * 0.04
    player.skin.leftArm.rotation.y = 0

    // Head playful cute tilt & looking slightly right/up
    player.skin.head.rotation.z = 0.1 + Math.sin(t * 1.5) * 0.05
    player.skin.head.rotation.y = 0.08 + Math.sin(t * 0.9) * 0.08
    player.skin.head.rotation.x = -0.06 + Math.sin(t * 1.8) * 0.04

    // Body subtle breathing oscillation
    player.skin.body.position.y = -6 + Math.sin(t * 2) * 0.2
  }
}

/**
 * Resolves a reliable 64x64/64x32 Minecraft skin texture URL for SkinViewer.
 */
export function resolveSkinTextureUrl(skinUrl?: string, playerName?: string): string {
  // 1. If custom uploaded data URI (base64)
  if (skinUrl && skinUrl.startsWith('data:')) {
    return skinUrl
  }

  // 2. If direct textures.minecraft.net or full image URL
  if (skinUrl && (skinUrl.startsWith('http://') || skinUrl.startsWith('https://'))) {
    // If it's already a full texture link
    if (skinUrl.includes('textures.minecraft.net') || skinUrl.includes('/skin/')) {
      return skinUrl
    }
    // If it was an mc-heads body or avatar render, extract the player name if possible
    const match = skinUrl.match(/\/(body|avatar)\/([^/]+)/)
    if (match && match[2] && !playerName) {
      playerName = decodeURIComponent(match[2])
    }
  }

  // 3. If player name is known
  if (playerName && playerName.trim()) {
    const clean = playerName.trim()
    // minotar.net/skin/{name} is the standard reliable 64x64 raw skin texture endpoint
    return `https://minotar.net/skin/${encodeURIComponent(clean)}`
  }

  // 4. Default Steve texture fallback
  return 'https://minotar.net/skin/Steve'
}

export const MinecraftSkinViewer3D: React.FC<MinecraftSkinViewer3DProps> = ({
  skinUrl,
  playerName,
  model = 'classic',
  width = 280,
  height = 360,
  className,
  enableControls = true,
  enableZoom = true,
  defaultAnimation = 'idle',
  animation,
  showControlsBar = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const viewerRef = useRef<SkinViewer | null>(null)
  const activeAnim = animation ?? defaultAnimation
  const [currentAnim, setCurrentAnim] = useState<'idle' | 'walk' | 'run' | 'wave' | 'none'>(
    activeAnim === 'fly' ? 'idle' : activeAnim
  )
  const [showOuterLayer, setShowOuterLayer] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  // Map 'classic' to skinview3d's 'default'
  const skinviewModelType = model === 'slim' ? 'slim' : 'default'

  // Initialize Viewer on canvas
  useEffect(() => {
    if (!canvasRef.current) return

    let viewer: SkinViewer
    try {
      viewer = new SkinViewer({
        canvas: canvasRef.current,
        width,
        height,
        fov: 48,
        zoom: 0.95
      })

      // Orbit drag controls
      if (viewer.controls) {
        viewer.controls.enableRotate = enableControls
        viewer.controls.enableZoom = enableZoom
        viewer.controls.enablePan = false
        // Smooth damping
        viewer.controls.dampingFactor = 0.1
      }

      // Initial camera angle (subtle 3D quarter-turn)
      viewer.camera.position.x = -18
      viewer.camera.position.y = 12
      viewer.camera.position.z = 42
      viewer.camera.lookAt(0, 0, 0)

      // Set initial animation
      if (activeAnim === 'wave' || activeAnim === 'idle') {
        const anim = new CustomWaveEmoteAnimation()
        anim.speed = 0.85
        viewer.animation = anim
      } else if (activeAnim === 'walk') {
        const anim = new WalkingAnimation()
        anim.speed = 0.6
        viewer.animation = anim
      } else if (activeAnim === 'run') {
        const anim = new RunningAnimation()
        anim.speed = 0.6
        viewer.animation = anim
      } else {
        viewer.animation = null
      }

      viewerRef.current = viewer
    } catch (err) {
      console.error('[SkinViewer3D] Failed to initialize:', err)
      setLoadError(true)
      return
    }

    return () => {
      try {
        viewer.dispose()
      } catch {
        // ignore dispose errors
      }
      viewerRef.current = null
    }
  }, [width, height, enableControls, enableZoom])

  // Live react to animation prop changes
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    if (activeAnim === 'none') {
      viewer.animation = null
      if (viewer.playerObject?.skin) {
        viewer.playerObject.skin.resetJoints()
      }
    } else if (activeAnim === 'wave' || activeAnim === 'idle') {
      const anim = new CustomWaveEmoteAnimation()
      anim.speed = 0.85
      viewer.animation = anim
    } else if (activeAnim === 'walk') {
      const anim = new WalkingAnimation()
      anim.speed = 0.6
      viewer.animation = anim
    } else if (activeAnim === 'run') {
      const anim = new RunningAnimation()
      anim.speed = 0.6
      viewer.animation = anim
    }
    setCurrentAnim(activeAnim as any)
  }, [activeAnim])

  // Load/update Skin texture whenever skinUrl, playerName, or model changes
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const textureTarget = resolveSkinTextureUrl(skinUrl, playerName)
    setIsLoading(true)
    setLoadError(false)

    viewer
      .loadSkin(textureTarget, {
        model: skinviewModelType,
        makeVisible: true
      })
      .then(() => {
        setIsLoading(false)
        setLoadError(false)
        if (activeAnim === 'none') {
          viewer.animation = null
          if (viewer.playerObject?.skin) {
            viewer.playerObject.skin.resetJoints()
          }
        } else if (activeAnim === 'wave' || activeAnim === 'idle') {
          const anim = new CustomWaveEmoteAnimation()
          anim.speed = 0.85
          viewer.animation = anim
        }
      })
      .catch((err) => {
        console.warn('[SkinViewer3D] Texture load warning, trying fallback:', err)
        // If primary texture endpoint failed (e.g. minotar rate limit), try mc-heads / crafatar
        if (playerName && !textureTarget.includes('mc-heads.net')) {
          const fallback = `https://mc-heads.net/skin/${encodeURIComponent(playerName)}`
          viewer
            .loadSkin(fallback, {
              model: skinviewModelType,
              makeVisible: true
            })
            .then(() => {
              setIsLoading(false)
              setLoadError(false)
            })
            .catch(() => {
              setIsLoading(false)
              setLoadError(true)
            })
        } else {
          setIsLoading(false)
          setLoadError(true)
        }
      })
  }, [skinUrl, playerName, skinviewModelType])

  // Toggle animation
  const handleToggleAnimation = useCallback(
    (animType: 'idle' | 'walk' | 'run' | 'none') => {
      const viewer = viewerRef.current
      if (!viewer) return

      setCurrentAnim(animType)

      let newAnim: PlayerAnimation | null = null
      if (animType === 'idle') {
        const a = new IdleAnimation()
        a.speed = 0.7
        newAnim = a
      } else if (animType === 'walk') {
        const a = new WalkingAnimation()
        a.speed = 0.6
        newAnim = a
      } else if (animType === 'run') {
        const a = new RunningAnimation()
        a.speed = 0.6
        newAnim = a
      }

      viewer.animation = newAnim
    },
    []
  )

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    viewer.camera.position.x = -18
    viewer.camera.position.y = 12
    viewer.camera.position.z = 42
    viewer.camera.lookAt(0, 0, 0)
    if (viewer.controls) {
      viewer.controls.target.set(0, 0, 0)
      viewer.controls.update()
    }
  }, [])

  // Toggle outer jacket/hat layer
  const handleToggleOuterLayer = useCallback(() => {
    const viewer = viewerRef.current
    if (!viewer || !viewer.playerObject) return

    const nextState = !showOuterLayer
    setShowOuterLayer(nextState)

    try {
      const skinObj = viewer.playerObject.skin
      if (skinObj) {
        skinObj.setOuterLayerVisible(nextState)
      }
    } catch (e) {
      console.warn('Failed to toggle layers:', e)
    }
  }, [showOuterLayer])

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center select-none group',
        className
      )}
      style={{ width, height }}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className={cn(
          'w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-300',
          isLoading ? 'opacity-40' : 'opacity-100'
        )}
        style={{
          width,
          height,
          imageRendering: 'pixelated'
        }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-6 w-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error Fallback */}
      {loadError && !isLoading && (
        <div className="absolute bottom-16 bg-red-950/80 border border-red-500/30 text-red-300 text-[10px] px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none">
          Offline Texture Mode
        </div>
      )}

      {/* Quick Interactive 3D Control Bar */}
      {showControlsBar && (
        <div className="absolute bottom-1 flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/85 px-2.5 py-1 backdrop-blur-md shadow-lg opacity-85 hover:opacity-100 transition-opacity">
          {/* Reset Camera */}
          <button
            type="button"
            onClick={handleResetCamera}
            className="flex items-center justify-center h-6 w-6 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset 3D camera view"
          >
            <HiArrowPath size={13} />
          </button>

          {/* Animation Toggle: Idle / Walk / Pause */}
          <button
            type="button"
            onClick={() => {
              if (currentAnim === 'none') {
                handleToggleAnimation('idle')
              } else if (currentAnim === 'idle') {
                handleToggleAnimation('walk')
              } else {
                handleToggleAnimation('none')
              }
            }}
            className={cn(
              'flex items-center gap-1 px-2 h-6 rounded-lg text-[10px] font-mono font-bold transition-colors',
              currentAnim !== 'none'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            )}
            title="Cycle 3D Animation (Idle / Walk / Pause)"
          >
            {currentAnim === 'none' ? (
              <HiPlay size={11} />
            ) : (
              <HiPause size={11} />
            )}
            <span className="capitalize">{currentAnim === 'none' ? 'Play' : currentAnim}</span>
          </button>

          {/* Toggle Layers (Jacket / Hat) */}
          <button
            type="button"
            onClick={handleToggleOuterLayer}
            className={cn(
              'flex items-center justify-center h-6 w-6 rounded-lg text-[11px] transition-colors',
              showOuterLayer
                ? 'text-cyan-400 hover:bg-cyan-500/15'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            )}
            title={showOuterLayer ? 'Hide 2nd Layer (Hat/Jacket)' : 'Show 2nd Layer (Hat/Jacket)'}
          >
            <HiEye size={13} />
          </button>
        </div>
      )}
    </div>
  )
}
