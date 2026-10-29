import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HiSparkles,
  HiCpuChip,
  HiExclamationTriangle,
  HiCheck,
  HiBolt,
  HiArrowPath,
  HiCommandLine,
  HiPaperAirplane
} from 'react-icons/hi2'

interface AiMessage {
  id: string
  sender: 'ai' | 'user'
  text: string
  actionCard?: {
    type: 'conflict' | 'crash' | 'optimization'
    title: string
    details: string
    actionLabel: string
    fixed?: boolean
  }
}

export default function AstrixAiPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Hello! I am Astrix AI, your contextual client intelligence engine. I can automatically scan your crash reports, isolate conflicting mods, optimize JVM flags for your CPU, and configure your competitive HUD.',
      actionCard: {
        type: 'conflict',
        title: '2 Mod Incompatibilities Detected',
        details: 'OptiFine G9 is conflicting with Sodium 0.6.2 in your 1.21.4 instance. Replacing OptiFine with Iris Shaders provides 3x higher FPS and resolves game crashes.',
        actionLabel: 'Replace with Iris & Fix'
      }
    }
  ])

  const suggestedPrompts = [
    'Why did Minecraft crash?',
    'Find conflicting mods in 1.21.4',
    'Optimize my Ryzen & RTX setup',
    'Create competitive PvP profile',
    'Explain latest crash log'
  ]

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input
    if (!q.trim()) return

    const userMsg: AiMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')

    setTimeout(() => {
      let reply: AiMessage
      if (q.toLowerCase().includes('crash') || q.toLowerCase().includes('log')) {
        reply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'I analyzed your latest log at ~/.minecraft/logs/latest.log. The game halted due to OutOfMemoryError in Java Heap Space while generating 32 chunks with Distant Horizons.',
          actionCard: {
            type: 'crash',
            title: 'Memory Starvation Diagnosis',
            details: 'Current heap is capped at 3072 MB. Distant Horizons requires at least 6144 MB RAM with Shenandoah GC for smooth lod generation.',
            actionLabel: 'Allocate 6GB RAM & Apply'
          }
        }
      } else if (q.toLowerCase().includes('pvp') || q.toLowerCase().includes('optimize') || q.toLowerCase().includes('fps')) {
        reply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Generated a customized Competitive PvP configuration for your instance with low latency settings.',
          actionCard: {
            type: 'optimization',
            title: 'Competitive Astrix Profile',
            details: 'Configured Keystrokes HUD, CPS counter, Fullbright module, and disabled explosion particles for unobstructed combat vision.',
            actionLabel: 'Apply PvP Modules'
          }
        }
      } else {
        reply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Analysis complete: Everything in your current instance is running on the latest patch with optimal Astrix parameters.`
        }
      }
      setMessages((prev) => [...prev, reply])
    }, 600)
  }

  const handleExecuteAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.actionCard) {
          return {
            ...m,
            actionCard: { ...m.actionCard, fixed: true }
          }
        }
        return m
      })
    )
  }

  return (
    <div className="flex h-full flex-col bg-[#07080C] text-[#F5F7FA]">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#252B38] bg-[#0B0E14] px-8 py-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-display tracking-tight text-[#F5F7FA]">ASTRIX AI ASSISTANT</h1>
            <span className="rounded-md border border-[#FF3154]/30 bg-[#FF3154]/10 px-2 py-0.5 text-[11px] font-semibold text-[#FF3154]">
              CONTEXTUAL DIAGNOSTICS
            </span>
          </div>
          <p className="text-xs text-[#A3ACBC] mt-0.5">
            Automatic crash log diagnosis, mod dependency resolving, and real-time hardware tuning.
          </p>
        </div>
      </div>

      {/* Suggested Quick Action Chips */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#252B38] bg-[#0B0E14]/60 px-8 py-3 scrollbar-none">
        {suggestedPrompts.map((p) => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="shrink-0 rounded-lg border border-[#252B38] bg-[#10141D] px-3.5 py-1.5 text-xs font-semibold text-[#A3ACBC] hover:border-[#FF3154] hover:text-[#F5F7FA] transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin max-w-4xl w-full mx-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#FF3154] text-white font-medium shadow-md shadow-[#FF3154]/20'
                  : 'border border-[#252B38] bg-[#10141D] text-[#F5F7FA] shadow-md'
              }`}
            >
              {msg.text}
            </div>

            {/* Diagnostic Action Card */}
            {msg.actionCard && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 w-full max-w-2xl rounded-2xl border border-[#252B38] bg-[#151A24] p-4 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FFC857]/15 text-[#FFC857]">
                      <HiExclamationTriangle size={14} />
                    </span>
                    <span className="text-xs font-bold text-[#F5F7FA]">{msg.actionCard.title}</span>
                  </div>
                  {msg.actionCard.fixed && (
                    <span className="flex items-center gap-1 rounded bg-[#2DE2A6]/20 px-2 py-0.5 text-[10px] font-bold text-[#2DE2A6]">
                      <HiCheck size={12} /> RESOLVED
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-[#A3ACBC] leading-relaxed">
                  {msg.actionCard.details}
                </p>

                {!msg.actionCard.fixed && (
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => handleExecuteAction(msg.id)}
                      className="rounded-xl bg-[#FF3154] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#FF3154]/25 hover:bg-[#ff1e45] transition-all"
                    >
                      {msg.actionCard.actionLabel}
                    </button>
                    <button className="rounded-xl border border-[#252B38] bg-[#10141D] px-3.5 py-2 text-xs font-semibold text-[#A3ACBC] hover:text-white">
                      Inspect Mod Files
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Input Field Bar */}
      <div className="border-t border-[#252B38] bg-[#0B0E14] p-5">
        <div className="max-w-4xl mx-auto flex items-center gap-3 rounded-2xl border border-[#252B38] bg-[#10141D] px-4 py-2.5 focus-within:border-[#FF3154] transition-all">
          <HiSparkles className="text-[#FF3154]" size={20} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Astrix AI to diagnose crash logs, fix mod conflicts, or optimize settings..."
            className="w-full bg-transparent text-xs text-[#F5F7FA] placeholder-[#6E7788] outline-none"
          />
          <button
            onClick={() => handleSend()}
            className="rounded-xl bg-[#FF3154] p-2 text-white hover:bg-[#ff1e45] shadow-sm transition-all"
          >
            <HiPaperAirplane size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
