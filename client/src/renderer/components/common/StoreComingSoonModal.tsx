import { AnimatePresence, motion } from 'framer-motion'

interface StoreComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function StoreComingSoonModal({
  isOpen,
  onClose
}: StoreComingSoonModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Card (Matches user screenshot 3 exactly) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#121620] p-6 shadow-2xl"
          >
            <h3 className="font-display text-xl font-bold tracking-tight text-white mb-2">
              Store
            </h3>
            <p className="font-sans text-sm text-slate-400 mb-8 leading-relaxed">
              Coming Soon
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#232936] hover:bg-[#2e3748] px-6 py-2.5 text-xs font-semibold text-white transition-all shadow-md active:scale-95"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
