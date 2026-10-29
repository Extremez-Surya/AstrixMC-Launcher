import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiXMark,
  HiCommandLine,
  HiMagnifyingGlass,
  HiArrowUpTray,
  HiClipboardDocument,
  HiTrash,
  HiCheckCircle,
  HiShieldExclamation,
  HiArrowTopRightOnSquare
} from 'react-icons/hi2'
import { useLaunchStore } from '../../stores/launch-store'

interface ConsoleLogsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ConsoleLogsModal({ isOpen, onClose }: ConsoleLogsModalProps) {
  const { logs, clearLogs } = useLaunchStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  // Smart Crash Diagnosis
  const crashDiagnosis = useMemo(() => {
    const fullText = logs.join('\n')
    if (fullText.includes('java.lang.OutOfMemoryError') || fullText.includes('OutOfMemory')) {
      return {
        type: 'memory',
        title: 'Out of Memory Crash',
        description: 'Minecraft ran out of allocated RAM. Increase Max RAM in Settings to 4GB-8GB.',
        severity: 'high'
      }
    }
    if (fullText.includes('UnsupportedClassVersionError') || fullText.includes('has been compiled by a more recent version of the Java Runtime')) {
      return {
        type: 'java',
        title: 'Java Version Incompatibility',
        description: 'Minecraft version requires Java 17 or Java 21+. Please install or select a newer Java runtime in Settings.',
        severity: 'high'
      }
    }
    if (fullText.includes('net.fabricmc.loader.impl.FormattedException') || fullText.includes('Incompatible mods found')) {
      return {
        type: 'mod',
        title: 'Fabric Mod Incompatibility',
        description: 'One or more mods in your mods folder are incompatible with this Minecraft version or are missing required dependencies.',
        severity: 'warning'
      }
    }
    if (fullText.includes('Pixel format not accelerated') || fullText.includes('GLFW error 65542')) {
      return {
        type: 'gpu',
        title: 'Graphics Driver Error',
        description: 'OpenGL error detected. Update your graphics drivers (NVIDIA, AMD, or Intel) to run Minecraft.',
        severity: 'high'
      }
    }
    return null
  }, [logs])

  const handleUploadMclogs = async () => {
    if (logs.length === 0) return
    setIsUploading(true)
    try {
      const fullText = logs.join('\n')
      const res = await window.electronAPI.uploadLogs(fullText)
      if (res?.success && res.url) {
        setUploadedUrl(res.url)
        navigator.clipboard.writeText(res.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 4000)
      }
    } catch {
      // ignore
    } finally {
      setIsUploading(false)
    }
  }

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs
    const q = searchQuery.toLowerCase()
    return logs.filter(line => line.toLowerCase().includes(q))
  }, [logs, searchQuery])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0c0d12]/98 shadow-2xl backdrop-blur-2xl font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-black/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <HiCommandLine size={22} />
              </div>
              <div>
                <h2 className="text-base font-black text-white font-display">Live Console &amp; Crash Analyzer</h2>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Real-time process stream, error diagnostics, and 1-click mclo.gs sharing
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLogs}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all font-mono"
              >
                <HiClipboardDocument size={14} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                type="button"
                disabled={isUploading || logs.length === 0}
                onClick={handleUploadMclogs}
                className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-extrabold text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-zinc-200 transition-all disabled:opacity-50 font-mono"
              >
                <HiArrowUpTray size={14} />
                <span>{isUploading ? 'Uploading...' : 'Upload to mclo.gs'}</span>
              </button>

              <button
                type="button"
                onClick={clearLogs}
                className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                title="Clear Logs"
              >
                <HiTrash size={16} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <HiXMark size={20} />
              </button>
            </div>
          </div>

          {/* Crash Diagnosis Alert */}
          {crashDiagnosis && (
            <div className="flex items-start gap-3 border-b border-white/15 bg-white/[0.04] px-6 py-3 text-xs">
              <HiShieldExclamation size={20} className="shrink-0 text-white mt-0.5" />
              <div className="min-w-0">
                <h4 className="font-extrabold text-white font-display">{crashDiagnosis.title}</h4>
                <p className="mt-0.5 text-zinc-300 text-[11px] leading-relaxed">
                  {crashDiagnosis.description}
                </p>
              </div>
            </div>
          )}

          {/* Uploaded URL banner */}
          {uploadedUrl && (
            <div className="flex items-center justify-between border-b border-white/20 bg-white/10 px-6 py-2.5 text-xs font-bold text-white">
              <div className="flex items-center gap-2">
                <HiCheckCircle size={16} className="text-white" />
                <span>Log uploaded successfully! Share link:</span>
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-white underline flex items-center gap-1"
                >
                  {uploadedUrl}
                  <HiArrowTopRightOnSquare size={12} />
                </a>
              </div>
              <span className="text-[10px] text-zinc-300 font-mono">Copied to clipboard</span>
            </div>
          )}

          {/* Search Filter Bar */}
          <div className="border-b border-white/5 bg-black/30 px-6 py-2">
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                type="text"
                placeholder="Search log output (e.g. error, exception, player, loading)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-8 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 font-mono"
              />
            </div>
          </div>

          {/* Console Log Lines */}
          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed select-text space-y-0.5 bg-[#050507]"
          >
            {filteredLogs.length === 0 ? (
              <div className="flex h-full items-center justify-center text-zinc-600">
                {logs.length === 0 ? 'No logs yet. Launch Minecraft to see live output.' : 'No log lines match your search.'}
              </div>
            ) : (
              filteredLogs.map((line, idx) => {
                const isError = line.includes('ERROR') || line.includes('Exception') || line.includes('Fatal')
                const isWarn = line.includes('WARN')
                const isDebug = line.includes('DEBUG')

                return (
                  <div
                    key={idx}
                    className={`px-2 py-0.5 rounded ${
                      isError
                        ? 'text-white bg-white/10 font-bold border-l-2 border-white'
                        : isWarn
                        ? 'text-zinc-200 bg-white/[0.04]'
                        : isDebug
                        ? 'text-zinc-500'
                        : 'text-zinc-300 hover:bg-white/[0.02]'
                    }`}
                  >
                    {line}
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
