import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HashRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import NoRiskSidebar from './components/norisk/NoRiskSidebar'
import NoRiskHeader from './components/norisk/NoRiskHeader'
import NoRiskPlayStage from './pages/norisk/NoRiskPlayStage'
import NoRiskModsPage from './pages/norisk/NoRiskModsPage'
import AccountsPage from './pages/AccountsPage'
import InstancesPage from './pages/InstancesPage'
import ModBrowserPage from './pages/ModBrowserPage'
import ModDetailPage from './pages/ModDetailPage'
import ClientHudPage from './pages/ClientHudPage'
import ClientFeaturesPage from './pages/ClientFeaturesPage'
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
import CommandPaletteModal from './components/common/CommandPaletteModal'
import { useAuth } from './hooks/useAuth'
import { useInstances } from './hooks/useInstances'

function PageContent() {
  const location = useLocation()

  return (
    <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-transparent">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.15 }}
          className="h-full w-full max-w-full overflow-hidden"
        >
          <Routes location={location}>
            <Route path="/" element={<NoRiskPlayStage />} />
            <Route path="/mods" element={<NoRiskModsPage />} />
            <Route path="/mod-browser" element={<ModBrowserPage />} />
            <Route path="/instances" element={<InstancesPage />} />
            <Route path="/instances/:id" element={<InstanceDetailPage />} />
            <Route path="/skins" element={<SkinSelectorPage />} />
            <Route path="/screenshots" element={<ScreenshotsPage />} />
            <Route path="/mods/:source/:id" element={<ModDetailPage />} />
            <Route path="/features" element={<ClientFeaturesPage />} />
            <Route path="/client-hud" element={<ClientFeaturesPage />} />
            <Route path="/store" element={<ClientFeaturesPage />} />
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

  // If no account is logged in, show exact NoRisk Login View
  if (!activeAccount) {
    return (
      <div className="flex h-screen w-screen overflow-hidden">
        <LoginView />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050A14] select-none font-sans">
      {/* ── LEFT SIDEBAR (NoRisk Style) ── */}
      <NoRiskSidebar />

      {/* ── RIGHT MAIN WORKSPACE ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <NoRiskHeader />

        {/* Page Content Viewport */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <PageContent />
        </div>
      </div>

      {/* Instance Creator Modal */}
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
      <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#050A14] text-[var(--astrix-text-primary)] select-none font-sans">
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
      </div>
    </HashRouter>
  )
}
