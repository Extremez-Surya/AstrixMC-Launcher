interface HeroAtmosphereProps {
  imageSrc: string
}

export default function HeroAtmosphere({ imageSrc }: HeroAtmosphereProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" style={{ contain: 'strict' }}>
      {/* ── CINEMATIC BACKDROP (STATIC & CRISP) ── */}
      <div className="absolute inset-0">
        <img
          src={imageSrc}
          alt="Minecraft World Panorama"
          className="h-full w-full object-cover object-center opacity-45 brightness-95 contrast-100"
          loading="eager"
        />
      </div>

      {/* ── AMBIENT RADIAL LIGHTING (PERFORMANCE-OPTIMIZED) ── */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 80% 20%, rgba(69, 183, 255, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 10% 90%, rgba(16, 185, 129, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(45, 226, 166, 0.08) 0%, transparent 50%)
          `
        }}
      />

      {/* ── MULTI-STAGE DEPTH GRADIENTS ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--astrix-bg)] via-[var(--astrix-bg)]/85 to-[var(--astrix-bg)]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--astrix-surface)] via-[var(--astrix-bg)]/60 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
    </div>
  )
}
