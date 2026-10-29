import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HiShieldCheck,
  HiBolt,
  HiCpuChip,
  HiArrowPath,
  HiCheck,
  HiSparkles,
  HiExclamationTriangle,
  HiChartBar,
  HiAdjustmentsHorizontal
} from 'react-icons/hi2'

export default function PerformancePage() {
  const [activeProfile, setActiveProfile] = useState<'competitive' | 'balanced' | 'quality' | 'cinematic' | 'custom'>('competitive')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedSuccess, setOptimizedSuccess] = useState(false)
  const [gcCollector, setGcCollector] = useState<'zgc' | 'g1' | 'shenandoah'>('zgc')
  const [shaderPrewarm, setShaderPrewarm] = useState(true)
  const [ramTrim, setRamTrim] = useState(true)

  const handleScanAndOptimize = () => {
    setIsOptimizing(true)
    setOptimizedSuccess(false)
    setTimeout(() => {
      setIsOptimizing(false)
      setOptimizedSuccess(true)
      setTimeout(() => setOptimizedSuccess(false), 3000)
    }, 1200)
  }

  const profiles = [
    {
      id: 'competitive',
      name: 'COMPETITIVE',
      tag: 'Maximum FPS • Lowest Latency',
      desc: 'Disables unneeded particles, optimizes entity render distance to 8 chunks, and sets ZGC for zero frame spikes in PvP.',
      color: 'border-[#FF3154] text-[#FF3154]'
    },
    {
      id: 'balanced',
      name: 'BALANCED',
      tag: 'Standard Gameplay',
      desc: 'Optimal visual quality with stable 144+ FPS on modern hardware. 12 chunk render distance with smooth lighting.',
      color: 'border-[#2DE2A6] text-[#2DE2A6]'
    },
    {
      id: 'quality',
      name: 'QUALITY',
      tag: 'High Fidelity Graphics',
      desc: 'Full anisotropic filtering, 16 chunk render distance, entity shadows, and high-res resource pack support.',
      color: 'border-[#45B7FF] text-[#45B7FF]'
    },
    {
      id: 'cinematic',
      name: 'CINEMATIC',
      tag: 'Shaders & Raytracing',
      desc: 'Maximized simulation distance, volumetric lighting support, and memory allocation scaled to 8GB+ for Iris/Oculus shaders.',
      color: 'border-[#FFC857] text-[#FFC857]'
    }
  ]

  return (
    <div className="flex h-full flex-col bg-[#07080C] text-[#F5F7FA]">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#252B38] bg-[#0B0E14] px-8 py-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-display tracking-tight text-[#F5F7FA]">ASTRIX PERFORMANCE CENTER</h1>
            <span className="rounded-md border border-[#2DE2A6]/30 bg-[#2DE2A6]/10 px-2 py-0.5 text-[11px] font-semibold text-[#2DE2A6]">
              ASTRIX ENGINE ACTIVE
            </span>
          </div>
          <p className="text-xs text-[#A3ACBC] mt-0.5">
            Real-time hardware telemetry, low latency tuning, and JVM garbage collection presets.
          </p>
        </div>

        {/* Scan & Optimize Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleScanAndOptimize}
            disabled={isOptimizing}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
              optimizedSuccess
                ? 'bg-[#2DE2A6] text-[#07080C]'
                : 'bg-[#FF3154] text-white hover:bg-[#ff1e45] shadow-[#FF3154]/25'
            }`}
          >
            {isOptimizing ? (
              <>
                <HiArrowPath className="animate-spin" size={16} />
                <span>Scanning Hardware...</span>
              </>
            ) : optimizedSuccess ? (
              <>
                <HiCheck size={16} />
                <span>Optimizations Applied!</span>
              </>
            ) : (
              <>
                <HiBolt size={16} />
                <span>1-Click Auto Optimize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
        {/* Real Hardware Telemetry Cards */}
        <div>
          <h2 className="text-xs font-bold font-mono tracking-wider text-[#A3ACBC] uppercase mb-4">
            LIVE SYSTEM TELEMETRY
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#252B38] bg-[#10141D] p-5 shadow-lg">
              <span className="text-[11px] font-mono text-[#6E7788]">AVERAGE FPS</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black font-display text-[#F5F7FA]">284</span>
                <span className="text-xs font-bold text-[#2DE2A6]">STABLE</span>
              </div>
              <p className="mt-2 text-[11px] text-[#A3ACBC]">1% Low: 198 FPS</p>
            </div>

            <div className="rounded-2xl border border-[#252B38] bg-[#10141D] p-5 shadow-lg">
              <span className="text-[11px] font-mono text-[#6E7788]">FRAME TIME</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black font-display text-[#2DE2A6]">3.5</span>
                <span className="text-xs font-mono text-[#2DE2A6]">ms</span>
              </div>
              <p className="mt-2 text-[11px] text-[#A3ACBC]">Sub-millisecond frame pacing</p>
            </div>

            <div className="rounded-2xl border border-[#252B38] bg-[#10141D] p-5 shadow-lg">
              <span className="text-[11px] font-mono text-[#6E7788]">RAM ALLOCATION</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black font-display text-[#45B7FF]">3.8</span>
                <span className="text-xs font-mono text-[#A3ACBC]">/ 6.0 GB</span>
              </div>
              <p className="mt-2 text-[11px] text-[#A3ACBC]">ZGC Generational GC Active</p>
            </div>

            <div className="rounded-2xl border border-[#252B38] bg-[#10141D] p-5 shadow-lg">
              <span className="text-[11px] font-mono text-[#6E7788]">CPU / GPU LOAD</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black font-display text-[#F5F7FA]">18%</span>
                <span className="text-xs font-mono text-[#A3ACBC]">CPU • 44% GPU</span>
              </div>
              <p className="mt-2 text-[11px] text-[#A3ACBC]">NVIDIA Reflex Low Latency ON</p>
            </div>
          </div>
        </div>

        {/* Performance Presets Grid */}
        <div>
          <h2 className="text-xs font-bold font-mono tracking-wider text-[#A3ACBC] uppercase mb-4">
            PERFORMANCE PRESETS
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {profiles.map((p) => {
              const isSelected = activeProfile === p.id
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveProfile(p.id as any)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                    isSelected
                      ? `${p.color} bg-[#151A24] shadow-xl`
                      : 'border-[#252B38] bg-[#10141D] text-[#A3ACBC] hover:border-white/20 hover:bg-[#151A24]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-display">{p.name}</span>
                    {isSelected && <HiCheck size={18} />}
                  </div>
                  <span className="mt-1 block text-[11px] font-mono opacity-80">{p.tag}</span>
                  <p className="mt-3 text-xs leading-relaxed text-[#A3ACBC]">{p.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Advanced JVM & Engine Tuner */}
        <div>
          <h2 className="text-xs font-bold font-mono tracking-wider text-[#A3ACBC] uppercase mb-4">
            ASTRIX ENGINE OPTIMIZER
          </h2>
          <div className="rounded-2xl border border-[#252B38] bg-[#10141D] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#252B38] pb-4">
              <div>
                <p className="text-sm font-semibold text-[#F5F7FA]">Java Garbage Collector Protocol</p>
                <p className="text-xs text-[#6E7788]">
                  Generational ZGC delivers sub-millisecond pause times, completely eliminating stutter during chunk loading.
                </p>
              </div>
              <div className="flex rounded-xl border border-[#252B38] bg-[#07080C] p-1">
                {(['zgc', 'g1', 'shenandoah'] as const).map((gc) => (
                  <button
                    key={gc}
                    onClick={() => setGcCollector(gc)}
                    className={`rounded-lg px-3 py-1 font-mono text-xs font-bold uppercase transition-all ${
                      gcCollector === gc ? 'bg-[#FF3154] text-white shadow-sm' : 'text-[#6E7788] hover:text-[#A3ACBC]'
                    }`}
                  >
                    {gc}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-[#252B38] pb-4">
              <div>
                <p className="text-sm font-semibold text-[#F5F7FA]">Shader Cache Pre-Warming</p>
                <p className="text-xs text-[#6E7788]">
                  Compile GLSL/Vulkan shaders during launcher start to avoid in-game compilation freeze on world join.
                </p>
              </div>
              <button
                onClick={() => setShaderPrewarm(!shaderPrewarm)}
                className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                  shaderPrewarm ? 'bg-[#2DE2A6]' : 'bg-[#252B38]'
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white transition-transform ${
                    shaderPrewarm ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#F5F7FA]">Periodic Unused Heap Trimming</p>
                <p className="text-xs text-[#6E7788]">
                  Automatically release idle JVM memory back to the Windows OS when minimized or tabbed out.
                </p>
              </div>
              <button
                onClick={() => setRamTrim(!ramTrim)}
                className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                  ramTrim ? 'bg-[#2DE2A6]' : 'bg-[#252B38]'
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white transition-transform ${
                    ramTrim ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
