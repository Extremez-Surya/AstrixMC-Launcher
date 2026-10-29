import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { HiXMark } from 'react-icons/hi2'
import { cn } from '../../lib/cn'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: ModalSize
  children?: ReactNode
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
}

export default function Modal({ isOpen, onClose, title, size = 'md', children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
              'glass-panel relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0d12]/95 shadow-2xl shadow-black/80 backdrop-blur-2xl',
              SIZE_CLASSES[size]
            )}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/[0.08] px-6 py-4">
              <h2 className="text-base font-bold text-white font-display tracking-wide">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <HiXMark className="h-5 w-5" />
              </button>
            </header>
            <div className="overflow-y-auto px-6 py-5 text-zinc-200">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
