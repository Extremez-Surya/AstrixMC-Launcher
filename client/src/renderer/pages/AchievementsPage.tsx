import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HiTrophy,
  HiFire,
  HiCheck,
  HiLockClosed,
  HiSparkles,
  HiBolt,
  HiShieldCheck
} from 'react-icons/hi2'

interface Achievement {
  id: string
  title: string
  description: string
  category: 'Combat' | 'Exploration' | 'Social' | 'Performance' | 'Progression'
  progress: number // 0 to 100
  unlocked: boolean
  gemsReward: number
  xpReward: number
  icon: string
}

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const [achievements] = useState<Achievement[]>([
    {
      id: 'ach-1',
      title: 'First Flight',
      description: 'Successfully launch your first optimized Minecraft instance with Astrix Engine.',
      category: 'Progression',
      progress: 100,
      unlocked: true,
      gemsReward: 150,
      xpReward: 500,
      icon: '🚀'
    },
    {
      id: 'ach-2',
      title: 'Competitive Winstreak',
      description: 'Win 10 Bedwars or Duels matches on Hypixel or Minemen Club.',
      category: 'Combat',
      progress: 70,
      unlocked: false,
      gemsReward: 300,
      xpReward: 1200,
      icon: '⚔️'
    },
    {
      id: 'ach-3',
      title: 'Zero Latency Titan',
      description: 'Maintain over 240 FPS for 30 consecutive minutes with ZGC garbage collector active.',
      category: 'Performance',
      progress: 100,
      unlocked: true,
      gemsReward: 250,
      xpReward: 800,
      icon: '⚡'
    },
    {
      id: 'ach-4',
      title: 'Party Vanguard',
      description: 'Host or join an Astrix voice party with 3 or more friends.',
      category: 'Social',
      progress: 100,
      unlocked: true,
      gemsReward: 200,
      xpReward: 600,
      icon: '🎙️'
    },
    {
      id: 'ach-5',
      title: 'Cosmetic Maestro',
      description: 'Equip an animated cloak, wings, and custom hat in the Wardrobe.',
      category: 'Exploration',
      progress: 66,
      unlocked: false,
      gemsReward: 400,
      xpReward: 1500,
      icon: '👑'
    },
    {
      id: 'ach-6',
      title: 'Shader Enchanter',
      description: 'Download and run Iris Shaders with real-time dynamic lighting.',
      category: 'Performance',
      progress: 100,
      unlocked: true,
      gemsReward: 200,
      xpReward: 700,
      icon: '✨'
    }
  ])

  const filtered = selectedCategory === 'All'
    ? achievements
    : achievements.filter((a) => a.category === selectedCategory)

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalXp = 4800

  return (
    <div className="flex h-full flex-col bg-[#07080C] text-[#F5F7FA]">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#252B38] bg-[#0B0E14] px-8 py-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-display tracking-tight text-[#F5F7FA]">ACHIEVEMENTS & PROGRESSION</h1>
            <span className="rounded-md border border-[#FFC857]/30 bg-[#FFC857]/10 px-2 py-0.5 text-[11px] font-semibold text-[#FFC857]">
              CLIENT BADGES
            </span>
          </div>
          <p className="text-xs text-[#A3ACBC] mt-0.5">
            Unlock client achievements during gameplay to earn Astrix Gems and profile badges.
          </p>
        </div>

        {/* Global Progress Snapshot */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#252B38] bg-[#10141D] px-5 py-2.5 shadow-md">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#6E7788] uppercase">UNLOCKED</span>
            <span className="font-mono text-sm font-black text-[#2DE2A6]">
              {unlockedCount} / {achievements.length}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-[#252B38]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#6E7788] uppercase">TOTAL XP</span>
            <span className="font-mono text-sm font-black text-[#FFC857]">
              {totalXp.toLocaleString()} XP
            </span>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 border-b border-[#252B38] bg-[#0B0E14]/60 px-8 py-3">
        {['All', 'Combat', 'Performance', 'Social', 'Progression', 'Exploration'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-3.5 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
              selectedCategory === cat
                ? 'border border-[#FF3154]/50 bg-[#FF3154]/15 text-[#FF3154]'
                : 'border border-transparent text-[#6E7788] hover:bg-[#10141D] hover:text-[#A3ACBC]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievements Cards Grid */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
        <div className="grid grid-cols-2 gap-4 max-w-5xl">
          {filtered.map((ach) => (
            <div
              key={ach.id}
              className={`flex items-start gap-4 rounded-2xl border p-5 transition-all ${
                ach.unlocked
                  ? 'border-[#2DE2A6]/30 bg-[#10141D] shadow-md'
                  : 'border-[#252B38] bg-[#0B0E14]/60 opacity-80'
              }`}
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl border ${
                  ach.unlocked
                    ? 'border-[#2DE2A6]/40 bg-[#2DE2A6]/10'
                    : 'border-[#252B38] bg-[#10141D]'
                }`}
              >
                {ach.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-display text-[#F5F7FA]">{ach.title}</h3>
                  {ach.unlocked ? (
                    <span className="flex items-center gap-1 rounded bg-[#2DE2A6]/20 px-2 py-0.5 text-[10px] font-bold text-[#2DE2A6]">
                      <HiCheck size={12} /> COMPLETED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-[#6E7788]">
                      <HiLockClosed size={12} /> LOCKED
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-[#A3ACBC] leading-relaxed">{ach.description}</p>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#6E7788] mb-1">
                    <span>Progress</span>
                    <span>{ach.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#07080C] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        ach.unlocked ? 'bg-[#2DE2A6]' : 'bg-[#FF3154]'
                      }`}
                      style={{ width: `${ach.progress}%` }}
                    />
                  </div>
                </div>

                {/* Reward Badges */}
                <div className="mt-3 flex items-center gap-3 text-[11px] font-mono">
                  <span className="text-[#FFC857]">💎 +{ach.gemsReward} Gems</span>
                  <span className="text-[#45B7FF]">⭐ +{ach.xpReward} XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
