import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

export type ProgressBarSize = 'sm' | 'md'

export interface ProgressBarProps {
  /** Progress value between 0 and 100. Values outside the range are clamped. */
  progress: number
  size?: ProgressBarSize
  className?: string
  showLabel?: boolean
  label?: string
}

export default function ProgressBar({
  progress,
  size = 'md',
  className,
  showLabel = false,
  label
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress))
  const rounded = Math.round(clamped)

  return (
    <div className={cn('w-full', className)}>
      {(label || showLabel) && (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
          <span className="truncate text-nexus-text-muted">{label}</span>
          {showLabel && (
            <span className="shrink-0 font-semibold tabular-nums text-nexus-text">{rounded}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn(
          'w-full overflow-hidden rounded-full bg-nexus-surface ring-1 ring-inset ring-white/5',
          size === 'sm' ? 'h-1.5' : 'h-2.5'
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className={cn(
            'relative h-full rounded-full bg-gradient-to-r from-nexus-accent-dim via-nexus-accent to-nexus-accent-hover',
            size === 'md' && 'shadow-[0_0_12px_rgba(14,165,233,0.55)]'
          )}
        >
          <div className="absolute inset-x-0 top-0 h-1/2 rounded-full bg-white/15" />
        </motion.div>
      </div>
    </div>
  )
}
