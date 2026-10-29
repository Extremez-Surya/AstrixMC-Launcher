import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  VscChromeClose,
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeRestore
} from 'react-icons/vsc'
import {
  HiArrowLeft,
  HiArrowRight,
  HiBell,
  HiComputerDesktop,
  HiChevronDown,
  HiUsers,
  HiLink
} from 'react-icons/hi2'
import { getElectronAPI } from '../../lib/electron-api'
import { useAuth } from '../../hooks/useAuth'
import { useInstances } from '../../hooks/useInstances'
import { getAccountAvatar } from '../../utils/avatar'
import { playSound } from '../../utils/sound'
import AccountsDropdownModal from './AccountsDropdownModal'
import FriendsDrawer from './FriendsDrawer'
import SocialAccountsModal from './SocialAccountsModal'

const CONTROL_BASE =
  'no-drag flex h-8 w-8 items-center justify-center text-[#94A3B8] hover:bg-white/10 hover:text-white transition-colors duration-150 rounded-lg'

export default function NoRiskHeader() {
  const navigate = useNavigate()
  const { activeAccount } = useAuth()
  const { activeInstance, instances } = useInstances()
  const [isMaximized, setIsMaximized] = useState(false)

  // Modals state
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false)
  const [isFriendsDrawerOpen, setIsFriendsDrawerOpen] = useState(false)
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false)

  useEffect(() => {
    const api = getElectronAPI()
    if (!api) return
    Promise.resolve(api.isMaximized())
      .then((val) => setIsMaximized(Boolean(val)))
      .catch(() => {})

    const unsub = api.onMaximizeChange((val) => setIsMaximized(Boolean(val)))
    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [])

  const handleMinimize = () => getElectronAPI()?.minimize()
  const handleMaximize = () => {
    setIsMaximized((c) => !c)
    getElectronAPI()?.maximize()
  }
  const handleClose = () => getElectronAPI()?.close()

  const currentInstanceName = activeInstance?.name || (instances[0]?.name ?? 'NO INSTANCES')

  return (
    <>
      <header className="drag-region relative z-40 flex h-14 shrink-0 items-center justify-between border-b border-[#1B2B4A]/40 bg-[#070D1C]/95 px-5 select-none font-sans">
        
        {/* ── LEFT: BACK/FORWARD + BRAND + LIVE COUNT ── */}
        <div className="flex items-center gap-4">
          {/* Navigation Arrows */}
          <div className="no-drag flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                playSound('click')
                navigate(-1)
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              title="Go Back"
            >
              <HiArrowLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('click')
                navigate(1)
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              title="Go Forward"
            >
              <HiArrowRight size={14} />
            </button>
          </div>

          {/* Brand + Online Player Counter */}
          <div className="flex flex-col">
            <span className="font-pixel text-xs lg:text-sm font-black tracking-wider text-white">
              ASTRIX<span className="text-cyan-400">CLIENT</span>
            </span>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="h-1.5 w-1.5 rounded-xs bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,1)]" />
              <span className="font-pixel text-[9px] font-bold text-slate-400">
                48,253
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: NOTIFICATION + INSTANCE + ACCOUNT + FRIENDS + SOCIAL + WINDOW CONTROLS ── */}
        <div className="no-drag flex items-center gap-2.5">
          
          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => playSound('click')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0B152B]/80 text-slate-300 hover:border-cyan-500/40 hover:text-white transition-all"
            title="Notifications"
          >
            <HiBell size={16} />
          </button>

          {/* Instance Selector Button */}
          <button
            type="button"
            onClick={() => {
              playSound('click')
              navigate('/instances')
            }}
            className="flex items-center gap-2 rounded-xl border border-[#1E3A8A]/60 bg-[#0B1733]/90 px-3.5 py-2 text-white hover:border-cyan-500/50 hover:bg-[#0E1E42] transition-all shadow-sm"
          >
            <HiComputerDesktop className="text-cyan-400" size={15} />
            <span className="font-pixel text-[10px] font-bold uppercase tracking-wider">
              {currentInstanceName}
            </span>
          </button>

          {/* Account Selector Pill */}
          {activeAccount && (
            <button
              type="button"
              onClick={() => {
                playSound('click')
                setIsAccountsModalOpen(!isAccountsModalOpen)
              }}
              className="flex items-center gap-2.5 rounded-xl border border-[#1E3A8A]/60 bg-[#0B1733]/90 px-3 py-1.5 text-white hover:border-cyan-500/50 hover:bg-[#0E1E42] transition-all shadow-sm"
            >
              <div className="h-6 w-6 rounded-md overflow-hidden bg-black/40 border border-white/15 shrink-0">
                <img
                  src={getAccountAvatar(activeAccount, 28)}
                  alt={activeAccount.username}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLElement).style.display = 'none'
                  }}
                />
              </div>
              <span className="font-pixel text-[11px] font-bold text-white">
                {activeAccount.username}
              </span>
              <HiChevronDown size={13} className="text-slate-400 ml-0.5" />
            </button>
          )}

          {/* Friends Drawer Button */}
          <button
            type="button"
            onClick={() => {
              playSound('click')
              setIsFriendsDrawerOpen(true)
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0B152B]/80 text-slate-300 hover:border-cyan-500/40 hover:text-white transition-all"
            title="Friends List"
          >
            <HiUsers size={16} />
          </button>

          {/* Social Accounts Modal Button */}
          <button
            type="button"
            onClick={() => {
              playSound('click')
              setIsSocialModalOpen(true)
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0B152B]/80 text-slate-300 hover:border-cyan-500/40 hover:text-white transition-all"
            title="Social Accounts"
          >
            <HiLink size={16} />
          </button>

          {/* Window Controls */}
          <div className="flex items-center h-full ml-1 border-l border-white/[0.08] pl-2 gap-1">
            <button
              type="button"
              onClick={handleMinimize}
              aria-label="Minimize"
              className={CONTROL_BASE}
            >
              <VscChromeMinimize size={13} />
            </button>
            <button
              type="button"
              onClick={handleMaximize}
              aria-label="Maximize"
              className={CONTROL_BASE}
            >
              {isMaximized ? <VscChromeRestore size={13} /> : <VscChromeMaximize size={13} />}
            </button>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="no-drag flex h-8 w-8 items-center justify-center text-[#94A3B8] hover:bg-rose-600 hover:text-white transition-colors duration-150 rounded-lg"
            >
              <VscChromeClose size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Modals & Drawers */}
      <AccountsDropdownModal
        isOpen={isAccountsModalOpen}
        onClose={() => setIsAccountsModalOpen(false)}
        onAddAccount={() => navigate('/accounts')}
      />

      <FriendsDrawer
        isOpen={isFriendsDrawerOpen}
        onClose={() => setIsFriendsDrawerOpen(false)}
      />

      <SocialAccountsModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        username={activeAccount?.username || 'player'}
      />
    </>
  )
}

