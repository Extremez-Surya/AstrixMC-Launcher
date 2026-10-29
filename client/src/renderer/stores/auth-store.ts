import { create } from 'zustand'
import type { MinecraftAccount } from '../../shared/types/auth'

interface AuthState {
  accounts: MinecraftAccount[]
  activeAccount: MinecraftAccount | null
  isLoading: boolean
  error: string | null

  loadAccounts: () => Promise<void>
  loginMicrosoft: () => Promise<boolean>
  loginOffline: (username: string) => Promise<boolean>
  removeAccount: (id: string) => Promise<boolean>
  setDefaultAccount: (id: string) => Promise<void>
  updateAccount: (id: string, data: Partial<MinecraftAccount>) => Promise<void>
  setActiveAccount: (account: MinecraftAccount | null) => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accounts: [],
  activeAccount: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),
  setActiveAccount: (account) => set({ activeAccount: account }),
  logout: () => set({ activeAccount: null }),

  loadAccounts: async () => {
    try {
      if (!window.electronAPI?.getAccounts) return
      let accounts = await window.electronAPI.getAccounts()

      // Sanitize legacy avatar URLs and merge cached skin metadata
      accounts = accounts.map((acc) => {
        let patched = { ...acc }
        if (patched.skinUrl && patched.skinUrl.includes('minotar.net/avatar')) {
          delete patched.skinUrl
        }
        try {
          const cached = localStorage.getItem(`astrix_skin_${acc.id}`) || localStorage.getItem(`astrix_skin_${acc.uuid}`)
          if (cached) {
            const data = JSON.parse(cached)
            patched = { ...patched, ...data }
          }
        } catch {}
        return patched
      })

      const active = accounts.find((a) => a.isDefault) || accounts[0] || null
      set({ accounts, activeAccount: active, error: null })
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : String(err) })
    }
  },

  loginMicrosoft: async () => {
    set({ isLoading: true, error: null })
    try {
      if (!window.electronAPI?.microsoftLogin) {
        throw new Error('Electron API not available')
      }
      const res = await window.electronAPI.microsoftLogin()
      if (!res.success) {
        set({ isLoading: false, error: res.error ?? 'Failed to login with Microsoft' })
        return false
      }
      await get().loadAccounts()
      set({ isLoading: false })
      return true
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Microsoft login failed'
      })
      return false
    }
  },

  loginOffline: async (username: string) => {
    set({ isLoading: true, error: null })
    try {
      if (!window.electronAPI?.offlineLogin) {
        throw new Error('Electron API not available')
      }
      const res = await window.electronAPI.offlineLogin(username)
      if (!res.success) {
        set({ isLoading: false, error: res.error ?? 'Failed to login' })
        return false
      }
      await get().loadAccounts()
      set({ isLoading: false })
      return true
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Offline login failed'
      })
      return false
    }
  },

  removeAccount: async (id: string) => {
    try {
      if (!window.electronAPI?.removeAccount) return false
      const success = await window.electronAPI.removeAccount(id)
      if (success) {
        await get().loadAccounts()
      }
      return success
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to remove account' })
      return false
    }
  },

  setDefaultAccount: async (id: string) => {
    try {
      if (!window.electronAPI?.setDefaultAccount) return
      await window.electronAPI.setDefaultAccount(id)
      await get().loadAccounts()
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to set default account' })
    }
  },

  updateAccount: async (id: string, data: Partial<MinecraftAccount>) => {
    try {
      // Optimistically update store state immediately so UI updates without lag or flicker
      set((state) => {
        const nextAccounts = state.accounts.map((acc) => {
          if (acc.id === id || acc.uuid === id) {
            return { ...acc, ...data }
          }
          return acc
        })
        const nextActive =
          state.activeAccount?.id === id || state.activeAccount?.uuid === id
            ? { ...state.activeAccount, ...data }
            : state.activeAccount
        return { accounts: nextAccounts, activeAccount: nextActive }
      })

      // Also persist to localStorage as immediate failsafe
      try {
        localStorage.setItem(`astrix_skin_${id}`, JSON.stringify(data))
      } catch {}

      if (window.electronAPI?.updateAccount) {
        await window.electronAPI.updateAccount(id, data)
      }
      await get().loadAccounts()
    } catch (err: unknown) {
      console.error('Failed to update account:', err)
      set({ error: err instanceof Error ? err.message : 'Failed to update account' })
    }
  }
}))
