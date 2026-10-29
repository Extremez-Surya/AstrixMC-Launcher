import { create } from 'zustand'

export type LauncherTheme = 'dark'

interface AppState {
  sidebarCollapsed: boolean
  theme: LauncherTheme
  toggleSidebar: () => void
  setTheme: (theme: LauncherTheme) => void
}

const cleanupCustomDomProperties = () => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.removeProperty('--astrix-bg')
  root.style.removeProperty('--astrix-surface')
  root.style.removeProperty('--astrix-surface-elevated')
  root.style.removeProperty('--astrix-surface-hover')
  root.style.removeProperty('--astrix-primary')
  root.style.removeProperty('--astrix-text-primary')
  root.style.removeProperty('--astrix-text-secondary')
  root.style.removeProperty('--astrix-border')
  root.style.removeProperty('--astrix-glow')
  root.style.removeProperty('--card-bg-start')
  root.style.removeProperty('--card-bg-end')
  root.style.removeProperty('--card-border')
  root.style.removeProperty('--app-font-family')
  root.style.removeProperty('--app-border-radius')
  root.style.removeProperty('--app-wallpaper')
  if (document.body) {
    document.body.style.backgroundImage = 'none'
    document.body.style.fontFamily = ''
    ;(document.body.style as any).zoom = '1'
  }
}

const applyThemeToDom = (theme: LauncherTheme = 'dark') => {
  if (typeof document !== 'undefined') {
    cleanupCustomDomProperties()
    document.documentElement.setAttribute('data-theme', 'dark')
    if (document.body) {
      document.body.setAttribute('data-theme', 'dark')
    }
  }
}

if (typeof window !== 'undefined' && window.localStorage) {
  try {
    localStorage.setItem('astrix_theme', 'dark')
  } catch {}
}

applyThemeToDom('dark')

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  theme: 'dark',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTheme: () => {
    applyThemeToDom('dark')
    try {
      localStorage.setItem('astrix_theme', 'dark')
      localStorage.removeItem('astrix_custom_theme')
    } catch {}
    window.electronAPI?.setSettings?.({ theme: 'dark' }).catch(() => {})
    set({ theme: 'dark' })
  }
}))
