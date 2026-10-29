import { create } from 'zustand'
import type { GameInstance } from '../../shared/types/instance'

interface InstanceState {
  instances: GameInstance[]
  activeInstance: GameInstance | null
  isLoading: boolean
  error: string | null

  loadInstances: () => Promise<void>
  createInstance: (data: Partial<GameInstance>) => Promise<GameInstance | null>
  updateInstance: (id: string, data: Partial<GameInstance>) => Promise<void>
  deleteInstance: (id: string) => Promise<boolean>
  deleteVersion: (versionId: string) => Promise<{ success: boolean; deletedCount: number }>
  duplicateInstance: (id: string) => Promise<void>
  openInstanceFolder: (id: string, subfolder?: string) => Promise<void>
  importInstance: () => Promise<GameInstance | null>
  setActiveInstance: (instance: GameInstance | null) => void
}

export const useInstanceStore = create<InstanceState>((set, get) => ({
  instances: [],
  activeInstance: null,
  isLoading: false,
  error: null,

  setActiveInstance: (instance) => set({ activeInstance: instance }),

  loadInstances: async () => {
    set({ isLoading: true })
    try {
      if (!window.electronAPI?.getInstances) return
      const list = await window.electronAPI.getInstances()
      const currentActive = get().activeInstance
      const active = currentActive
        ? list.find((i) => i.id === currentActive.id) || list[0] || null
        : list[0] || null
      set({ instances: list, activeInstance: active, isLoading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load instances',
        isLoading: false
      })
    }
  },

  createInstance: async (data) => {
    try {
      if (!window.electronAPI?.createInstance) return null
      const created = await window.electronAPI.createInstance(data)
      await get().loadInstances()
      set({ activeInstance: created })
      return created
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create instance' })
      return null
    }
  },

  updateInstance: async (id, data) => {
    try {
      if (!window.electronAPI?.updateInstance) return
      await window.electronAPI.updateInstance(id, data)
      await get().loadInstances()
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update instance' })
    }
  },

  deleteInstance: async (id) => {
    try {
      if (!window.electronAPI?.deleteInstance) return false
      const success = await window.electronAPI.deleteInstance(id)
      if (success) {
        const remaining = get().instances.filter((i) => i.id !== id && i.name.toLowerCase() !== id.toLowerCase())
        const newActive =
          get().activeInstance?.id === id || get().activeInstance?.name.toLowerCase() === id.toLowerCase()
            ? remaining[0] || null
            : get().activeInstance
        set({ instances: remaining, activeInstance: newActive })
      }
      return success
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete instance' })
      return false
    }
  },

  deleteVersion: async (versionId) => {
    try {
      if (!window.electronAPI?.deleteVersion) return { success: false, deletedCount: 0 }
      const res = await window.electronAPI.deleteVersion(versionId)
      await get().loadInstances()
      return res
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete version files' })
      return { success: false, deletedCount: 0 }
    }
  },

  duplicateInstance: async (id) => {
    try {
      if (!window.electronAPI?.duplicateInstance) return
      await window.electronAPI.duplicateInstance(id)
      await get().loadInstances()
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to duplicate instance' })
    }
  },

  openInstanceFolder: async (id, subfolder) => {
    try {
      if (!window.electronAPI?.openInstanceFolder) return
      await window.electronAPI.openInstanceFolder(id, subfolder)
    } catch (err) {
      console.error(err)
    }
  },

  importInstance: async () => {
    try {
      if (!window.electronAPI?.importInstance) return null
      const res = await window.electronAPI.importInstance()
      if (res?.success && res.instance) {
        await get().loadInstances()
        set({ activeInstance: res.instance })
        return res.instance
      }
      return null
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to import instance' })
      return null
    }
  }
}))
