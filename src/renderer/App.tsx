import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HashRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import LeftFloatingDock from './components/layout/LeftFloatingDock'
import TitleBar from './components/layout/TitleBar'
import GlobalAppBackground from './components/layout/GlobalAppBackground'
import AccountsPage from './pages/AccountsPage'
import HomePage from './pages/HomePage'
import InstancesPage from './pages/InstancesPage'
import ModBrowserPage from './pages/ModBrowserPage'
import ModDetailPage from './pages/ModDetailPage'
import ClientHudPage from './pages/ClientHudPage'
import StorePage from './pages/StorePage'
import ServersPage from './pages/ServersPage'
import PartnersPage from './pages/PartnersPage'
import StudioPage from './pages/StudioPage'
import PerformancePage from './pages/PerformancePage'
import AstrixAiPage from './pages/AstrixAiPage'
import AchievementsPage from './pages/AchievementsPage'
import NewsPage from './pages/NewsPage'
import SettingsPage from './pages/SettingsPage'
import SkinSelectorPage from './pages/SkinSelectorPage'
import ScreenshotsPage from './pages/ScreenshotsPage'
import InstanceDetailPage from './pages/InstanceDetailPage'
import LoginView from './components/auth/LoginView'
import CreateInstanceModal from './components/instances/CreateInstanceModal'
import ConsoleLogsModal from './components/common/ConsoleLogsModal'
import DownloadProgressModal from './components/common/DownloadProgressModal'
import UpdateNotificationModal from './components/common/UpdateNotificationModal'
import CrashDiagnosticModal from './components/common/CrashDiagnosticModal'
import CommandPaletteModal from './components/common/CommandPaletteModal'
import { useAuth } from './hooks/useAuth'
import { useInstances } from './hooks/useInstances'

function PageContent() {
  const location = useLocation()

  return (
    <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-transparent transition-colors duration-300">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.1, ease: 'easeOut' } }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="min-h-full w-full max-w-full overflow-x-hidden"
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/instances" element={<InstancesPage />} />
            <Route path="/instances/:id" element={<InstanceDetailPage />} />
            <Route path="/skins" element={<SkinSelectorPage />} />
            <Route path="/screenshots" element={<ScreenshotsPage />} />
            <Route path="/mods" element={<ModBrowserPage />} />
            <Route path="/mods/:source/:id" element={<ModDetailPage />} />
            <Route path="/client-hud" element={<ClientHudPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/servers" element={<ServersPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/ai" element={<AstrixAiPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

function MainLayout({
  onOpenSearch
}: {
  onOpenSearch: () => void
}) {
  const { activeAccount } = useAuth()
  const { createInstance } = useInstances()
  const [isNewInstanceModalOpen, setIsNewInstanceModalOpen] = useState(false)

  const handleCreate = async (data: any) => {
    const inst = await createInstance(data)
    if (inst && data.installFpsPack && window.electronAPI?.installMod) {
      window.electronAPI.installMod({ instanceId: inst.id, isFpsPack: true }).catch(console.error)
    }
  }

  // If no account is logged in, show split Login Screen
  if (!activeAccount) {
    return (
      <div className="flex min-h-0 flex-1">
        <LoginView />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-row overflow-hidden">
      {/* Left Vertical Floating Capsule Dock */}
      <div className="flex-shrink-0 my-auto ml-3 flex items-center z-40">
        <LeftFloatingDock onNewInstance={() => setIsNewInstanceModalOpen(true)} />
      </div>

      {/* Main Viewport Content */}
      <div className="relative min-w-0 flex-1 flex flex-col h-full overflow-hidden">
        <PageContent />
      </div>

      {/* FastClient CreateInstanceModal */}
      <CreateInstanceModal
        isOpen={isNewInstanceModalOpen}
        onClose={() => setIsNewInstanceModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}

export default function App() {
  const [isLogsOpen, setIsLogsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <HashRouter>
      <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#07080C] text-[var(--astrix-text-primary)] select-none font-sans transition-colors duration-300">
        <GlobalAppBackground />
        <TitleBar
          onOpenLogs={() => setIsLogsOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
        <MainLayout onOpenSearch={() => setIsSearchOpen(true)} />

        <ConsoleLogsModal
          isOpen={isLogsOpen}
          onClose={() => setIsLogsOpen(false)}
        />

        <CommandPaletteModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        <DownloadProgressModal />
        <UpdateNotificationModal />
        <CrashDiagnosticModal />
      </div>
    </HashRouter>
  )
}
