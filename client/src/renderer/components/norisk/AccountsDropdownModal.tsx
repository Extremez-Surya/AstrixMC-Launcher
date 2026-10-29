import { motion, AnimatePresence } from 'framer-motion'
import {
  VscChromeClose,
  VscTrash
} from 'react-icons/vsc'
import {
  HiPlus
} from 'react-icons/hi2'
import { useAuth } from '../../hooks/useAuth'
import { getAccountAvatar } from '../../utils/avatar'
import { playSound } from '../../utils/sound'

interface AccountsDropdownModalProps {
  isOpen: boolean
  onClose: () => void
  onAddAccount: () => void
}

export default function AccountsDropdownModal({
  isOpen,
  onClose,
  onAddAccount
}: AccountsDropdownModalProps) {
  const { accounts, activeAccount, setActiveAccount, removeAccount } = useAuth()

  if (!isOpen) return null

  const handleSelect = (acc: any) => {
    playSound('click')
    setActiveAccount(acc)
    onClose()
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    playSound('click')
    removeAccount(id)
  }

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[90] flex items-start justify-end pr-36 pt-16"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          className="relative w-80 overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#091122]/95 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-[#0B152B]/80">
            <span className="font-pixel text-[11px] font-bold text-white uppercase tracking-wider">
              MINECRAFT ACCOUNTS
            </span>
            <button
              type="button"
              onClick={() => {
                playSound('click')
                onClose()
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.04] text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <VscChromeClose size={12} />
            </button>
          </div>

          {/* Accounts List */}
          <div className="p-3 flex flex-col gap-2 max-h-60 overflow-y-auto">
            {accounts.map((acc) => {
              const isActive = activeAccount?.id === acc.id
              return (
                <div
                  key={acc.id}
                  onClick={() => handleSelect(acc)}
                  className={`flex items-center justify-between rounded-xl border p-2.5 cursor-pointer transition-all ${
                    isActive
                      ? 'border-cyan-500/40 bg-cyan-500/15 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'border-white/[0.06] bg-[#0C172E]/70 text-slate-300 hover:bg-[#0E1B36] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                      <img
                        src={getAccountAvatar(acc, 28)}
                        alt={acc.username}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          ;(e.currentTarget as HTMLElement).style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-pixel text-xs font-bold text-white">
                        {acc.username}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400">
                        {acc.type === 'microsoft' ? 'Microsoft' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, acc.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                    title="Remove Account"
                  >
                    <VscTrash size={14} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Add Account Button */}
          <div className="p-3 pt-1 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                playSound('click')
                onClose()
                onAddAccount()
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-600/30 via-cyan-500/25 to-blue-600/30 py-2.5 font-pixel text-[11px] font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:border-cyan-400 transition-all cursor-pointer"
            >
              <HiPlus size={14} />
              <span>ADD ACCOUNT</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

