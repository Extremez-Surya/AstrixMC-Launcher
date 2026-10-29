import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  VscChromeClose,
  VscSync
} from 'react-icons/vsc'
import {
  HiUsers,
  HiBell,
  HiCog6Tooth,
  HiMagnifyingGlass,
  HiPlus,
  HiEnvelope,
  HiUserPlus,
  HiCheck
} from 'react-icons/hi2'
import { playSound } from '../../utils/sound'

interface FriendItem {
  id: string
  username: string
  status: 'online' | 'offline' | 'in-game'
  activity?: string
}

interface FriendsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function FriendsDrawer({ isOpen, onClose }: FriendsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends')
  const [searchQuery, setSearchQuery] = useState('')
  const [newFriendInput, setNewFriendInput] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [friends, setFriends] = useState<FriendItem[]>([
    {
      id: '1',
      username: 'CR7Applejuice',
      status: 'online',
      activity: 'Playing Hypixel Bedwars'
    }
  ])
  const [requests, setRequests] = useState<string[]>([])

  if (!isOpen) return null

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFriendInput.trim()) return
    playSound('click')
    setFriends((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        username: newFriendInput.trim(),
        status: 'offline',
        activity: 'Just added'
      }
    ])
    setNewFriendInput('')
    setIsAdding(false)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          className="relative flex h-full w-full max-w-[380px] flex-col border-l border-cyan-500/30 bg-[#091122]/95 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl font-sans"
        >
          {/* ── HEADER ── */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] px-5 bg-[#0B152B]/90">
            <div className="flex items-center gap-2">
              <HiCog6Tooth className="text-slate-400 hover:text-white cursor-pointer transition-colors" size={17} />
              <span className="font-pixel text-xs font-bold uppercase tracking-wider text-white">
                FRIENDS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => playSound('click')}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                title="Refresh Friends"
              >
                <VscSync size={14} />
              </button>

              <button
                type="button"
                onClick={() => playSound('click')}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                title="Friend Notifications"
              >
                <HiBell size={15} />
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('click')
                  onClose()
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <VscChromeClose size={14} />
              </button>
            </div>
          </div>

          {/* ── SUB-TABS (FRIENDS / REQUESTS) ── */}
          <div className="p-4 pb-2">
            <div className="flex rounded-xl bg-black/40 border border-white/[0.06] p-1">
              <button
                type="button"
                onClick={() => {
                  playSound('tab')
                  setActiveTab('friends')
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 font-pixel text-[11px] font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'friends'
                    ? 'bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HiUsers size={14} />
                <span>Friends ({friends.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('tab')
                  setActiveTab('requests')
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 font-pixel text-[11px] font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'requests'
                    ? 'bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HiEnvelope size={14} />
                <span>Requests ({requests.length})</span>
              </button>
            </div>
          </div>

          {/* ── SEARCH & ADD BAR ── */}
          <div className="px-4 pb-3 flex items-center gap-2">
            <div className="relative flex-1">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2 text-xs font-medium text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all shrink-0"
              title="Add New Friend"
            >
              <HiPlus size={16} />
            </button>
          </div>

          {/* Quick Add Friend Input */}
          {isAdding && (
            <form onSubmit={handleAddFriend} className="px-4 pb-3 flex gap-2">
              <input
                type="text"
                value={newFriendInput}
                onChange={(e) => setNewFriendInput(e.target.value)}
                placeholder="Minecraft username..."
                autoFocus
                className="flex-1 rounded-xl border border-cyan-500/40 bg-black/60 px-3 py-1.5 text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-cyan-500 px-3 py-1.5 font-pixel text-[10px] font-bold text-slate-950"
              >
                ADD
              </button>
            </form>
          )}

          {/* ── CONTENT AREA ── */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {activeTab === 'friends' && (
              friends.length === 0 ? (
                /* Empty state matching Screenshot 3 */
                <div className="flex h-full flex-col items-center justify-center text-center p-6 my-auto">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <HiUsers size={32} />
                  </div>
                  <h4 className="font-pixel text-xs font-bold text-white mb-1">
                    No Friends Yet
                  </h4>
                  <p className="font-pixel text-[10px] text-cyan-400 font-bold uppercase">
                    ADD SOME!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="font-pixel text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    ONLINE ({friends.filter((f) => f.status === 'online').length})
                  </span>

                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0C172E]/70 p-3 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={`https://minotar.net/avatar/${friend.username}/32`}
                            alt={friend.username}
                            className="h-8 w-8 rounded-lg object-cover bg-black/40 border border-white/10"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-black shadow-[0_0_6px_rgba(52,211,153,1)]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-pixel text-xs font-bold text-white">
                            {friend.username}
                          </span>
                          <span className="font-sans text-[10px] text-slate-400">
                            {friend.activity}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => playSound('click')}
                        className="rounded-lg bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25 px-2.5 py-1 font-pixel text-[9px] font-bold text-cyan-300 transition-all"
                      >
                        JOIN
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'requests' && (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 my-auto">
                <HiUserPlus size={32} className="text-slate-500 mb-2" />
                <span className="font-pixel text-xs text-slate-400">
                  No Pending Requests
                </span>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}

