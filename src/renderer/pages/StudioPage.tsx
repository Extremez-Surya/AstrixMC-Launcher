import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiVideoCamera,
  HiPlay,
  HiPause,
  HiCamera,
  HiTrash,
  HiShare,
  HiArrowDownTray,
  HiFolderOpen,
  HiEye,
  HiSparkles,
  HiAdjustmentsHorizontal,
  HiViewColumns
} from 'react-icons/hi2'

interface ReplayFile {
  id: string
  title: string
  server: string
  duration: string
  date: string
  size: string
  thumbnail: string
  version: string
}

interface ScreenshotFile {
  id: string
  name: string
  instance: string
  date: string
  resolution: string
  url: string
}

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<'replays' | 'clips' | 'screenshots' | 'recordings'>('replays')
  const [selectedReplay, setSelectedReplay] = useState<ReplayFile | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [cameraMode, setCameraMode] = useState<'first' | 'third' | 'freecam'>('freecam')
  const [timelineProgress, setTimelineProgress] = useState(35) // percentage

  const [replays] = useState<ReplayFile[]>([
    {
      id: 'rep-1',
      title: 'Hypixel Bedwars Quad Clutch vs Leaderboard Team',
      server: 'mc.hypixel.net',
      duration: '14:22',
      date: 'Today, 18:45',
      size: '42.8 MB',
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      version: '1.8.9'
    },
    {
      id: 'rep-2',
      title: 'Minemen Club Ranked Boxing Final Round 5',
      server: 'na.minemen.club',
      duration: '06:15',
      date: 'Yesterday, 21:10',
      size: '18.4 MB',
      thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
      version: '1.8.9'
    },
    {
      id: 'rep-3',
      title: 'Ender Dragon Fight & Elytra Flight Cinematic',
      server: 'Local World (Survival)',
      duration: '28:50',
      date: 'Oct 04, 2026',
      size: '94.1 MB',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      version: '1.21.4'
    }
  ])

  const [screenshots] = useState<ScreenshotFile[]>([
    {
      id: 'ss-1',
      name: '2026-10-06_14.22.01.png',
      instance: 'Survival 1.21 Fabric',
      date: 'Today, 14:22',
      resolution: '2560×1440 2K',
      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'ss-2',
      name: '2026-10-05_19.05.34.png',
      instance: 'Competitive PvP',
      date: 'Yesterday, 19:05',
      resolution: '1920×1080 FHD',
      url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'ss-3',
      name: '2026-10-04_12.18.29.png',
      instance: 'Shaders Cinematic',
      date: 'Oct 04, 2026',
      resolution: '3840×2160 4K',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
    }
  ])

  return (
    <div className="flex h-full flex-col bg-[#07080C] text-[#F5F7FA]">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#252B38] bg-[#0B0E14] px-8 py-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-display tracking-tight text-[#F5F7FA]">ASTRIX STUDIO</h1>
            <span className="rounded-md border border-[#FF3154]/30 bg-[#FF3154]/10 px-2 py-0.5 text-[11px] font-semibold text-[#FF3154]">
              REPLAY & CINEMATICS
            </span>
          </div>
          <p className="text-xs text-[#A3ACBC] mt-0.5">
            Full keyframe replay studio, instant clips recording, and 4K screenshot manager.
          </p>
        </div>

        {/* Studio Quick Actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-[#252B38] bg-[#10141D] px-3.5 py-2 text-xs font-semibold text-[#A3ACBC] hover:border-white/20 hover:text-white transition-all">
            <HiFolderOpen size={16} className="text-[#FFC857]" />
            <span>Open Replay Folder</span>
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-[#FF3154] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#FF3154]/25 hover:bg-[#ff1e45] transition-all">
            <HiVideoCamera size={16} />
            <span>Launch Replay Viewer</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#252B38] bg-[#0B0E14]/60 px-8 py-3">
        {(['replays', 'clips', 'screenshots', 'recordings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab
                ? 'border border-[#FF3154]/50 bg-[#FF3154]/15 text-[#FF3154]'
                : 'border border-transparent text-[#6E7788] hover:bg-[#10141D] hover:text-[#A3ACBC]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Studio View */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
        {activeTab === 'replays' && (
          <div className="space-y-6 max-w-6xl">
            {/* Embedded Interactive Replay Studio Player */}
            <div className="overflow-hidden rounded-2xl border border-[#252B38] bg-[#10141D] shadow-2xl">
              {/* Video Viewport Stage */}
              <div className="relative h-96 w-full overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={selectedReplay?.thumbnail || replays[0].thumbnail}
                  alt="Replay Preview"
                  className="h-full w-full object-cover opacity-60"
                />

                {/* Camera HUD Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3.5 py-1 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#FF3154] animate-ping" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    {cameraMode} CAMERA ACTIVE
                  </span>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="flex rounded-lg border border-white/10 bg-black/60 p-1 backdrop-blur-md">
                    {(['first', 'third', 'freecam'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setCameraMode(mode)}
                        className={`rounded px-2.5 py-1 text-[11px] font-bold uppercase transition-all ${
                          cameraMode === mode ? 'bg-[#FF3154] text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big Central Play Trigger */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/15 backdrop-blur-md text-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
                >
                  {isPlaying ? <HiPause size={28} /> : <HiPlay size={28} className="translate-x-0.5" />}
                </button>
              </div>

              {/* Timeline Controls Bar */}
              <div className="border-t border-[#252B38] bg-[#0B0E14] p-4 space-y-3">
                {/* Timeline Scrubber */}
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={timelineProgress}
                    onChange={(e) => setTimelineProgress(Number(e.target.value))}
                    className="w-full accent-[#FF3154] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#A3ACBC]">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex items-center gap-1.5 font-bold text-[#F5F7FA] hover:text-[#FF3154]"
                    >
                      {isPlaying ? <HiPause size={16} /> : <HiPlay size={16} />}
                      <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                    </button>
                    <span className="font-mono text-[#6E7788]">05:02 / 14:22</span>
                  </div>

                  {/* Playback Speed Select */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#6E7788]">Playback Speed:</span>
                    {[0.5, 1, 2, 4].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold ${
                          playbackSpeed === spd
                            ? 'bg-[#FF3154] text-white'
                            : 'bg-[#151A24] text-[#A3ACBC] hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  {/* Keyframe & Export */}
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 text-[#FFC857] hover:underline font-semibold">
                      <HiSparkles size={14} /> Add Keyframe
                    </button>
                    <button className="rounded-lg bg-[#2DE2A6] px-3 py-1 font-bold text-[#07080C] hover:bg-[#25c48f]">
                      Render MP4
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Replay Files Library */}
            <div>
              <h3 className="text-sm font-bold font-mono tracking-wider text-[#A3ACBC] uppercase mb-4">
                RECORDED SESSIONS ({replays.length})
              </h3>
              <div className="grid grid-cols-3 gap-5">
                {replays.map((rep) => (
                  <motion.div
                    key={rep.id}
                    whileHover={{ y: -3 }}
                    onClick={() => setSelectedReplay(rep)}
                    className="cursor-pointer overflow-hidden rounded-2xl border border-[#252B38] bg-[#10141D] p-3.5 transition-all hover:border-[#FF3154]/50 hover:bg-[#151A24]"
                  >
                    <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl bg-black">
                      <img src={rep.thumbnail} alt={rep.title} className="h-full w-full object-cover" />
                      <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                        {rep.duration}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#F5F7FA] line-clamp-1">{rep.title}</h4>
                    <div className="mt-2 flex items-center justify-between text-xs text-[#6E7788]">
                      <span>{rep.server}</span>
                      <span className="font-mono">{rep.size}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'screenshots' && (
          <div className="space-y-4 max-w-6xl">
            <div className="grid grid-cols-3 gap-5">
              {screenshots.map((ss) => (
                <motion.div
                  key={ss.id}
                  whileHover={{ y: -3 }}
                  className="overflow-hidden rounded-2xl border border-[#252B38] bg-[#10141D] p-3 transition-all hover:border-[#45B7FF]/50 hover:bg-[#151A24]"
                >
                  <div className="relative mb-2.5 h-44 w-full overflow-hidden rounded-xl bg-black">
                    <img src={ss.url} alt={ss.name} className="h-full w-full object-cover" />
                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] text-[#45B7FF]">
                      {ss.resolution}
                    </span>
                  </div>

                  <p className="text-xs font-mono font-bold text-[#F5F7FA] truncate">{ss.name}</p>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-[#6E7788]">
                    <span>{ss.instance}</span>
                    <span>{ss.date}</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-[#252B38] pt-2.5">
                    <button className="flex-1 rounded-lg bg-[#151A24] py-1 text-xs font-semibold text-[#A3ACBC] hover:text-white">
                      Copy Image
                    </button>
                    <button className="rounded-lg bg-[#151A24] p-1 text-[#FF4D67] hover:bg-[#FF4D67]/20">
                      <HiTrash size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
