import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ROTATING_WALLPAPERS } from '../../utils/wallpapers'

export default function GlobalAppBackground() {
  const [customBg, setCustomBg] = useState<string | null>(() => localStorage.getItem('astrix_custom_wallpaper') || null)
  const [blurAmount, setBlurAmount] = useState<number>(() => {
    const saved = localStorage.getItem('astrix_backdrop_blur')
    return saved !== null ? Number(saved) : 2
  })
  const [dimAmount, setDimAmount] = useState<number>(() => {
    const saved = localStorage.getItem('astrix_backdrop_dim')
    return saved !== null ? Number(saved) : 30
  })
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    const handleUpdate = () => {
      setCustomBg(localStorage.getItem('astrix_custom_wallpaper') || null)
      const b = localStorage.getItem('astrix_backdrop_blur')
      setBlurAmount(b !== null ? Number(b) : 2)
      const d = localStorage.getItem('astrix_backdrop_dim')
      setDimAmount(d !== null ? Number(d) : 30)
    }
    window.addEventListener('astrix:wallpaper-change', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('astrix:wallpaper-change', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // Auto-rotate scenic wallpapers every 8 seconds if no custom wallpaper
  useEffect(() => {
    if (customBg) return
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % ROTATING_WALLPAPERS.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [customBg])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#07080C]" style={{ contain: 'strict' }}>
      {/* ── 1. CINEMATIC MINECRAFT PANORAMA WALLPAPERS (10+ ROTATING SCENERIES) ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={customBg || ROTATING_WALLPAPERS[bgIndex].id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={customBg || ROTATING_WALLPAPERS[bgIndex].src}
            alt="Astrix Global Backdrop"
            className="h-full w-full object-cover object-center brightness-[0.96] contrast-[1.04] saturate-[1.10] transition-all duration-300"
            style={{ filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined }}
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {/* ── 2. DYNAMIC AMBIENT LIGHT DIMMER OVERLAY (BRIGHT & VIVID) ── */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ backgroundColor: `rgba(7, 8, 12, ${dimAmount / 100})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07080C]/40 via-transparent to-[#07080C]/75" />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(7, 8, 12, 0.45) 85%, #07080C 100%)'
        }}
      />

      {/* Ambient Radial Color Accents */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(245, 158, 11, 0.10) 0%, transparent 45%),
            radial-gradient(circle at 85% 15%, rgba(59, 130, 246, 0.10) 0%, transparent 45%),
            radial-gradient(circle at 50% 85%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)
          `
        }}
      />
    </div>
  )
}
