import { useEffect, useState } from 'react'
import {
  VscChromeClose,
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeRestore
} from 'react-icons/vsc'
import {
  HiCommandLine,
  HiMagnifyingGlass,
  HiChevronDown
} from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import { getElectronAPI } from '../../lib/electron-api'
import { useAuth } from '../../hooks/useAuth'
import { getAccountAvatar } from '../../utils/avatar'
import { playSound } from '../../utils/sound'

const CONTROL_BASE =
  'no-drag flex h-full w-[44px] items-center justify-center text-[#A3ACBC] hover:bg-white/5 hover:text-[#F8FAFC] transition-colors duration-150 focus-visible:outline-none'

export default function TitleBar({
  onOpenLogs,
  onOpenSearch
}: {
  onOpenLogs?: () => void
  onOpenSearch?: () => void
}) {
  const [isMaximized, setIsMaximized] = useState(false)
  const navigate = useNavigate()
  const { activeAccount } = useAuth()

  useEffect(() => {
    const api = getElectronAPI()
    if (!api) return

    let active = true

    Promise.resolve(api.isMaximized())
      .then((value) => {
        if (active) setIsMaximized(Boolean(value))
      })
      .catch(() => {})

    const unsubscribe = api.onMaximizeChange((value) => setIsMaximized(Boolean(value)))

    return () => {
      active = false
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])

  const handleMinimize = () => {
    getElectronAPI()?.minimize()
  }

  const handleMaximize = () => {
    setIsMaximized((current) => !current)
    getElectronAPI()?.maximize()
  }

  const handleClose = () => {
    getElectronAPI()?.close()
  }

  return (
    <header className="drag-region relative z-50 flex h-11 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#07090E]/95 backdrop-blur-md select-none transition-colors duration-300 px-4 font-sans">
      {/* Left Brand: Flame Icon + ASTRIXCLIENT */}
      <div className="drag-region flex h-full items-center gap-2">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
          <path d="M12.001 2c-.382 0-.749.193-.964.514C10.15 3.84 8.784 5.922 8.01 7.234 6.786 9.308 6 11.589 6 14.004c0 3.313 2.686 6 6.001 6 3.313 0 6-2.687 6-6 0-2.415-.786-4.696-2.01-6.77-.774-1.312-2.14-3.394-3.027-4.72-.215-.321-.582-.514-.963-.514zm.001 7.5c1.657 0 3 1.343 3 3 0 1.657-1.343 3-3 3-1.657 0-3-1.343-3-3 0-1.657 1.343-3 3-3z" />
        </svg>
        <span className="font-display text-sm font-black tracking-wider uppercase text-white">
          ASTRIX<span className="text-amber-500">LAUNCHER</span>
        </span>
      </div>

      {/* Right Controls: Window Controls */}
      <div className="no-drag flex h-full items-center">
        {/* Window Controls */}
        <div className="flex items-center h-full">
          <button
            type="button"
            onClick={handleMinimize}
            aria-label="Minimize"
            className={CONTROL_BASE}
          >
            <VscChromeMinimize size={14} />
          </button>
          <button
            type="button"
            onClick={handleMaximize}
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            className={CONTROL_BASE}
          >
            {isMaximized ? <VscChromeRestore size={13} /> : <VscChromeMaximize size={13} />}
          </button>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="no-drag flex h-full w-[44px] items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white transition-colors"
          >
            <VscChromeClose size={14} />
          </button>
        </div>
      </div>
    </header>
  )
}
