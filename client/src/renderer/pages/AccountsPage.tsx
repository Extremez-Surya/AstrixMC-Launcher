import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiPlus,
  HiMagnifyingGlass,
  HiXMark,
  HiChevronUpDown,
  HiUserGroup,
  HiTrash,
  HiExclamationCircle,
  HiCheckCircle,
  HiShieldCheck,
  HiBolt,
  HiPencilSquare,
  HiCheck,
  HiUser,
  HiArrowRight,
  HiSparkles
} from 'react-icons/hi2'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { FaShirt } from 'react-icons/fa6'
import AccountCard from '../components/accounts/AccountCard'
import SkinStudioModal from '../components/accounts/SkinStudioModal'
import AddAccountModal from '../components/onboarding/AddAccountModal'
import type { MinecraftAccount } from '../../shared/types/auth'
import { playSound } from '../utils/sound'
import { cn } from '../lib/cn'
import mcVillageImg from '../assets/mc_village_sunset.jpg'

type SortOption = 'name-asc' | 'name-desc' | 'type' | 'active-first'
type AccountFilter = 'all' | 'microsoft' | 'offline'

export default function AccountsPage() {
  const {
    accounts,
    activeAccount,
    isLoading,
    error,
    clearError,
    removeAccount,
    setDefaultAccount,
    updateAccount,
    loadAccounts
  } = useAuth()

  const navigate = useNavigate()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedSkinAccount, setSelectedSkinAccount] = useState<MinecraftAccount | null>(null)
  const [accountToRemove, setAccountToRemove] = useState<MinecraftAccount | null>(null)
  const [accountToRename, setAccountToRename] = useState<MinecraftAccount | null>(null)
  const [newUsername, setNewUsername] = useState('')
  const [renameError, setRenameError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<AccountFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const microsoftCount = useMemo(() => accounts.filter((a) => a.type === 'microsoft').length, [accounts])
  const offlineCount = useMemo(() => accounts.filter((a) => a.type === 'offline').length, [accounts])

  const handleSetActive = async (id: string) => {
    try {
      await setDefaultAccount(id)
      playSound('success')
      setNotification({
        type: 'success',
        message: 'Active profile switched successfully.'
      })
    } catch {
      playSound('error')
      setNotification({
        type: 'error',
        message: 'Failed to switch active profile.'
      })
    }
  }

  const confirmRemove = async () => {
    if (!accountToRemove) return
    try {
      await removeAccount(accountToRemove.id)
      playSound('success')
      setNotification({
        type: 'success',
        message: `Removed account "${accountToRemove.username}".`
      })
    } catch {
      playSound('error')
      setNotification({
        type: 'error',
        message: `Failed to remove account "${accountToRemove.username}".`
      })
    } finally {
      setAccountToRemove(null)
    }
  }

  const openRenameModal = (account: MinecraftAccount) => {
    playSound('click')
    setAccountToRename(account)
    setNewUsername(account.username)
    setRenameError('')
  }

  const handleSaveRename = async () => {
    if (!accountToRename) return
    const trimmed = newUsername.trim()
    if (!trimmed) {
      setRenameError('Username cannot be empty')
      playSound('error')
      return
    }
    if (trimmed.length < 3 || trimmed.length > 16) {
      setRenameError('Username must be between 3 and 16 characters')
      playSound('error')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setRenameError('Only letters, numbers, and underscores allowed')
      playSound('error')
      return
    }

    try {
      await updateAccount(accountToRename.id, { username: trimmed })
      playSound('success')
      setNotification({
        type: 'success',
        message: `Profile renamed to "${trimmed}".`
      })
      setAccountToRename(null)
    } catch {
      playSound('error')
      setRenameError('Failed to rename account')
    }
  }

  // Filter & Sort accounts
  const processedAccounts = useMemo(() => {
    let result = accounts.filter((acc) => {
      const matchesSearch =
        acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.uuid.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter =
        selectedFilter === 'all'
          ? true
          : selectedFilter === 'microsoft'
          ? acc.type === 'microsoft'
          : acc.type === 'offline'

      return matchesSearch && matchesFilter
    })

    result.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.username.localeCompare(b.username, undefined, { sensitivity: 'base' })
      }
      if (sortBy === 'name-desc') {
        return b.username.localeCompare(a.username, undefined, { sensitivity: 'base' })
      }
      if (sortBy === 'type') {
        return a.type.localeCompare(b.type)
      }
      if (sortBy === 'active-first') {
        const aActive = a.isDefault || activeAccount?.id === a.id
        const bActive = b.isDefault || activeAccount?.id === b.id
        if (aActive && !bActive) return -1
        if (!aActive && bActive) return 1
        return a.username.localeCompare(b.username)
      }
      return 0
    })

    return result
  }, [accounts, activeAccount, searchQuery, selectedFilter, sortBy])

  const sortLabels: Record<SortOption, string> = {
    'name-asc': '↑ Name (A-Z)',
    'name-desc': '↓ Name (Z-A)',
    'active-first': '★ Active First',
    'type': '🛡️ Account Type'
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 py-7 pb-32 bg-transparent min-h-full font-sans select-none">
      {/* ── TOP HEADER WITH LIVE STATS ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
              Your Accounts
            </h1>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-0.5 font-mono text-[11px] font-black uppercase text-emerald-400">
              {accounts.length} {accounts.length === 1 ? 'Profile' : 'Profiles'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Manage Microsoft Online and Local Minecraft profiles for seamless multiplayer and singleplayer gaming.
          </p>
        </div>

        {/* Quick summary stats bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeAccount && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-[#0C101A]/90 px-3.5 py-2 shadow-inner backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
              <span className="text-[11px] font-medium text-slate-400">Active:</span>
              <span className="text-xs font-black text-emerald-300 font-display truncate max-w-[120px]">
                {activeAccount.username}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0C101A]/80 px-3 py-2 text-xs font-medium text-slate-400 backdrop-blur-xl shadow-inner">
            <HiShieldCheck size={14} className="text-emerald-400" />
            <span className="text-slate-300 font-bold">{microsoftCount}</span>
            <span className="text-[10px] text-slate-500">Online</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0C101A]/80 px-3 py-2 text-xs font-medium text-slate-400 backdrop-blur-xl shadow-inner">
            <HiBolt size={14} className="text-cyan-400" />
            <span className="text-slate-300 font-bold">{offlineCount}</span>
            <span className="text-[10px] text-slate-500">Offline</span>
          </div>
        </div>
      </motion.div>

      {/* ── TOOLBAR: SEARCH + SORT + ADD ACCOUNT ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
      >
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts by username or UUID..."
            className="w-full rounded-2xl border border-white/10 bg-[#0C101A]/90 pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all backdrop-blur-xl shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <HiXMark size={14} />
            </button>
          )}
        </div>

        {/* Action Controls: Sort Selector + Add Account */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Sort Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                playSound('click')
                setIsSortDropdownOpen((prev) => !prev)
              }}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0C101A]/90 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:border-white/20 hover:text-white transition-all backdrop-blur-xl shadow-sm"
            >
              <span>{sortLabels[sortBy]}</span>
              <HiChevronUpDown size={15} className="text-slate-400" />
            </button>

            <AnimatePresence>
              {isSortDropdownOpen && (
                <>
                  <div
                    onClick={() => setIsSortDropdownOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-white/12 bg-[#0E1320]/95 p-1.5 shadow-2xl backdrop-blur-2xl z-50 text-left"
                  >
                    {(Object.keys(sortLabels) as SortOption[]).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          playSound('click')
                          setSortBy(opt)
                          setIsSortDropdownOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                          sortBy === opt
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{sortLabels[opt]}</span>
                        {sortBy === opt && <span className="text-emerald-400 text-xs">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Skin Selector Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              playSound('click')
              navigate('/skins')
            }}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0C101A]/90 hover:border-emerald-500/40 hover:bg-[#121A28] px-4 py-2.5 text-xs font-bold text-white shadow-sm backdrop-blur-xl transition-all whitespace-nowrap"
          >
            <FaShirt className="text-emerald-400" size={14} />
            <span>Skin Selector</span>
          </motion.button>

          {/* + Add Account Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              playSound('click')
              setIsAddModalOpen(true)
            }}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
          >
            <HiPlus className="h-4 w-4 stroke-[3]" />
            <span>Add Account</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ── FILTER CHIPS WITH COUNTS ── */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `All Accounts (${accounts.length})` },
          { id: 'microsoft', label: `Microsoft Online (${microsoftCount})` },
          { id: 'offline', label: `Local Offline (${offlineCount})` }
        ].map((chip) => {
          const isActive = selectedFilter === chip.id
          return (
            <button
              key={chip.id}
              onClick={() => {
                playSound('click')
                setSelectedFilter(chip.id as AccountFilter)
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/25'
                  : 'border border-white/10 bg-[#0A0D15]/80 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {/* ── NOTIFICATIONS & ERRORS ── */}
      <AnimatePresence>
        {(notification || error) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mb-5 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold backdrop-blur ${
              notification?.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification?.type === 'success' ? (
                <HiCheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              ) : (
                <HiExclamationCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
              )}
              <span>{notification?.message || error}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setNotification(null)
                clearError()
              }}
              className="rounded-lg p-1 text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              <HiXMark className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACCOUNTS GRID ── */}
      {accounts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#0B0E16]/80 backdrop-blur-xl px-8 py-20 text-center shadow-2xl"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20">
            <HiUserGroup className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-white font-display">No Accounts Found</h2>
          <p className="mt-1 max-w-sm text-xs text-slate-400 leading-relaxed">
            Add a Microsoft account for official servers or create a local offline player profile.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => {
              playSound('click')
              setIsAddModalOpen(true)
            }}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <HiPlus className="h-4 w-4 stroke-[3]" />
            <span>Add Your First Account</span>
          </motion.button>
        </motion.div>
      ) : processedAccounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0B0E16]/70 p-12 text-center backdrop-blur-xl">
          <p className="text-sm font-semibold text-slate-300">No accounts match &ldquo;{searchQuery}&rdquo;</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedFilter('all')
            }}
            className="mt-3 text-xs font-bold text-emerald-400 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {processedAccounts.map((account) => {
            const isAccountActive = account.isDefault || activeAccount?.id === account.id

            return (
              <AccountCard
                key={account.id}
                account={account}
                isActive={isAccountActive}
                onSetActive={handleSetActive}
                onRemove={(id) => {
                  const target = accounts.find((a) => a.id === id)
                  if (target) setAccountToRemove(target)
                }}
                onOpenSkins={(acc) => setSelectedSkinAccount(acc)}
                onRename={openRenameModal}
              />
            )
          })}

          {/* ── "+ ADD ACCOUNT" CARD ── */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              playSound('click')
              setIsAddModalOpen(true)
            }}
            className="group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#090C14]/70 hover:border-emerald-500/50 hover:bg-[#0C101A]/90 hover:shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(16,185,129,0.15)] backdrop-blur-xl p-8 text-center transition-all duration-300 min-h-[175px] overflow-hidden"
          >
            {/* Subtle Minecraft scenery on hover */}
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
              <img
                src={mcVillageImg}
                alt="Add Account Backdrop"
                className="h-full w-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090C14] via-[#090C14]/80 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 group-hover:border-emerald-400/50 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300">
                <HiPlus size={26} />
              </div>
              <span className="mt-3.5 text-sm font-black font-display uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
                Add Account
              </span>
              <span className="mt-1 text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors">
                Connect Microsoft OAuth or create a local player profile
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── RENAME LOCAL PROFILE MODAL ── */}
      <AnimatePresence>
        {accountToRename && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 pb-24 sm:pb-4 backdrop-blur-2xl select-none font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 14 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#0C101B]/98 p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.95)] backdrop-blur-3xl ring-1 ring-cyan-500/20"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                    <HiPencilSquare size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white font-display tracking-tight">
                        Rename Player Profile
                      </h3>
                      <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                        Local Mode
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Change your offline player identity &amp; in-game display tag.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setAccountToRename(null)
                  }}
                  className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <HiXMark size={20} />
                </button>
              </div>

              {/* Transformation Stage: Current -> New Identity */}
              <div className="mb-5 rounded-2xl border border-white/10 bg-black/50 p-4 shadow-inner">
                <div className="flex items-center justify-between gap-3">
                  {/* Before */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={`https://mc-heads.net/avatar/${encodeURIComponent(accountToRename.username)}/56`}
                      alt={accountToRename.username}
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve/56'
                      }}
                      className="h-11 w-11 rounded-xl border border-white/15 bg-black/60 object-cover shadow"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Current</span>
                      <p className="text-xs font-black text-slate-300 truncate font-display">
                        {accountToRename.username}
                      </p>
                    </div>
                  </div>

                  {/* Transition Arrow */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                    <HiArrowRight size={16} />
                  </div>

                  {/* After (Live Preview) */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end text-right">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">New Preview</span>
                      <p className="text-xs font-black text-white truncate font-display">
                        {newUsername.trim() || 'Steve'}
                      </p>
                    </div>
                    <img
                      src={`https://mc-heads.net/avatar/${encodeURIComponent(newUsername.trim() || 'Steve')}/56`}
                      alt="New Preview"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve/56'
                      }}
                      className="h-11 w-11 rounded-xl border border-cyan-400/50 bg-black/60 object-cover shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/30"
                    />
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    New Username
                  </label>
                  <span className={cn(
                    'text-[10px] font-mono font-bold',
                    newUsername.trim().length >= 3 && newUsername.trim().length <= 16
                      ? 'text-cyan-400'
                      : 'text-slate-500'
                  )}>
                    {newUsername.trim().length} / 16 chars
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={16}
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value)
                      setRenameError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename()
                      if (e.key === 'Escape') setAccountToRename(null)
                    }}
                    placeholder="Enter new username..."
                    className="w-full rounded-2xl border border-cyan-500/30 bg-black/60 pl-4 pr-10 py-3 text-sm font-mono text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all shadow-inner"
                    autoFocus
                  />
                  {newUsername && (
                    <button
                      type="button"
                      onClick={() => setNewUsername('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      <HiXMark size={15} />
                    </button>
                  )}
                </div>

                {/* Quick Suffix Presets */}
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">Add Suffix:</span>
                  {['_PvP', '_MC', '_X', '_Gamer'].map((suffix) => (
                    <button
                      key={suffix}
                      type="button"
                      onClick={() => {
                        playSound('click')
                        const base = newUsername.replace(/(_PvP|_MC|_X|_Gamer)$/, '')
                        const combined = (base + suffix).slice(0, 16)
                        setNewUsername(combined)
                      }}
                      className="rounded-lg border border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-300 hover:text-white transition-all shrink-0"
                    >
                      {suffix}
                    </button>
                  ))}
                </div>

                {/* Error message */}
                {renameError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs text-rose-400 pt-1 font-medium"
                  >
                    <HiExclamationCircle size={15} />
                    <span>{renameError}</span>
                  </motion.div>
                )}
              </div>

              {/* Requirement Indicators */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className={cn(
                  'flex items-center gap-1.5 rounded-xl border p-2 backdrop-blur',
                  newUsername.trim().length >= 3 && newUsername.trim().length <= 16
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/10 bg-white/[0.02] text-slate-400'
                )}>
                  <HiCheck size={13} className={newUsername.trim().length >= 3 && newUsername.trim().length <= 16 ? 'text-emerald-400' : 'text-slate-500'} />
                  <span>3 to 16 characters</span>
                </div>

                <div className={cn(
                  'flex items-center gap-1.5 rounded-xl border p-2 backdrop-blur',
                  /^[a-zA-Z0-9_]+$/.test(newUsername.trim()) && newUsername.trim().length > 0
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/10 bg-white/[0.02] text-slate-400'
                )}>
                  <HiCheck size={13} className={/^[a-zA-Z0-9_]+$/.test(newUsername.trim()) && newUsername.trim().length > 0 ? 'text-emerald-400' : 'text-slate-500'} />
                  <span>Letters, 0-9 &amp; _</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setAccountToRename(null)
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newUsername.trim() || newUsername.trim() === accountToRename.username}
                  onClick={handleSaveRename}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-cyan-500/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  <HiCheck size={15} className="stroke-[3]" />
                  <span>Save &amp; Apply Name</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD ACCOUNT MODAL ── */}
      {isAddModalOpen && (
        <AddAccountModal
          onComplete={() => {
            setIsAddModalOpen(false)
            loadAccounts()
          }}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* ── SKIN STUDIO MODAL ── */}
      {selectedSkinAccount && (
        <SkinStudioModal
          account={accounts.find((a) => a.id === selectedSkinAccount.id || a.uuid === selectedSkinAccount.uuid) || selectedSkinAccount}
          isOpen={Boolean(selectedSkinAccount)}
          onClose={() => setSelectedSkinAccount(null)}
        />
      )}

      {/* ── REMOVE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {accountToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-[#10141E] p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-400 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/30">
                  <HiTrash size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Remove Account?</h3>
                  <p className="text-xs text-slate-400">This account will be unlinked from the launcher.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to remove <strong className="text-white">&ldquo;{accountToRemove.username}&rdquo;</strong>? You can add it back anytime.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setAccountToRemove(null)
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRemove}
                  className="rounded-xl bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/30 transition-all"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

