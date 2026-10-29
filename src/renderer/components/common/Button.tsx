import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { HiArrowPath } from 'react-icons/hi2'
import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
  size?: ButtonSize
  children?: ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  className?: string
  title?: string
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-zinc-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]',
  secondary:
    'border border-white/10 bg-white/[0.04] text-zinc-200 hover:border-white/25 hover:bg-white/[0.08] hover:text-white backdrop-blur-md',
  danger:
    'border border-zinc-700 bg-zinc-900/90 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white',
  ghost:
    'bg-transparent text-zinc-400 hover:bg-white/[0.06] hover:text-white'
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-md px-3 text-xs',
  md: 'h-10 gap-2 rounded-lg px-4 text-sm',
  lg: 'h-12 gap-2.5 rounded-lg px-6 text-[15px]'
}

export default function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
  className,
  title
}: ButtonProps) {
  const inactive = disabled || loading

  return (
    <motion.button
      type={type}
      title={title}
      onClick={onClick}
      disabled={inactive}
      aria-busy={loading}
      whileHover={inactive ? undefined : { scale: 1.02 }}
      whileTap={inactive ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        inactive && 'cursor-not-allowed opacity-50 shadow-none',
        className
      )}
    >
      {loading ? (
        <HiArrowPath className="h-4 w-4 shrink-0 animate-spin" />
      ) : icon ? (
        <span className="flex shrink-0 items-center">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}
