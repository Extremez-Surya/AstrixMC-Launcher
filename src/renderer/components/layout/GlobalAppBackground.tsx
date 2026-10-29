import { useState, useEffect } from 'react'
import bgWallpaper from '../../assets/launcher_space_bg.jpg'

export default function GlobalAppBackground() {
  const [customBg, setCustomBg] = useState<string | null>(() => localStorage.getItem('astrix_custom_wallpaper') || null)
  const [blurAmount, setBlurAmount] = useState<number>(() => Number(localStorage.getItem('astrix_backdrop_blur') || 0))
  const [dimAmount, setDimAmount] = useState<number>(() => Number(localStorage.getItem('astrix_backdrop_dim') || 50))

  useEffect(() => {
    const handleUpdate = () => {
      setCustomBg(localStorage.getItem('astrix_custom_wallpaper') || null)
      setBlurAmount(Number(localStorage.getItem('astrix_backdrop_blur') || 0))
      setDimAmount(Number(localStorage.getItem('astrix_backdrop_dim') || 50))
    }
    window.addEventListener('astrix:wallpaper-change', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('astrix:wallpaper-change', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#07080C]" style={{ contain: 'strict' }}>
      {/* ── 1. CINEMATIC MINECRAFT PANORAMA WALLPAPER (CUSTOM OR DEFAULT) ── */}
      <div className="absolute inset-0">
        <img
          src={customBg || bgWallpaper}
          alt="Astrix Global Backdrop"
          className="h-full w-full object-cover object-center opacity-85 brightness-95 contrast-100 transition-all duration-300"
          style={{ filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined }}
          loading="eager"
        />
      </div>

      {/* ── 2. DYNAMIC DARK DIMMER OVERLAY ── */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ backgroundColor: `rgba(7, 8, 12, ${dimAmount / 100})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07080C]/60 via-transparent to-[#07080C]/85" />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, transparent 35%, rgba(7, 8, 12, 0.6) 85%, #07080C 100%)'
        }}
      />

      {/* Ambient Radial Color Accents */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 85% 15%, rgba(0, 210, 255, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 50% 85%, rgba(255, 200, 87, 0.08) 0%, transparent 50%)
          `
        }}
      />

      {/* Subtle clean grid accent */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  )
}
