import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        astrix: {
          bg: 'var(--astrix-bg, #07080C)',
          'bg-secondary': 'var(--astrix-bg-secondary, #0B0E14)',
          surface: 'var(--astrix-surface, #10141D)',
          'surface-elevated': 'var(--astrix-surface-elevated, #151A24)',
          'surface-hover': 'var(--astrix-surface-hover, #1B2130)',
          border: 'var(--astrix-border, #252B38)',
          'border-hover': 'var(--astrix-border-hover, rgba(255, 49, 84, 0.35))',
          'text-primary': 'var(--astrix-text-primary, #F5F7FA)',
          'text-secondary': 'var(--astrix-text-secondary, #A3ACBC)',
          'text-muted': 'var(--astrix-text-muted, #6E7788)',
          primary: 'var(--astrix-primary, #FF3154)',
          secondary: 'var(--astrix-secondary, #FF6B45)',
          gold: 'var(--astrix-gold, #FFC857)',
          success: 'var(--astrix-success, #2DE2A6)',
          info: 'var(--astrix-info, #45B7FF)',
          warning: 'var(--astrix-warning, #FFB84D)',
          danger: 'var(--astrix-danger, #FF4D67)'
        },
        mono: {
          bg: 'var(--astrix-bg, #07080C)',
          surface: 'var(--astrix-surface, #0B0E14)',
          card: 'var(--astrix-surface, #10141D)',
          cardHover: 'var(--astrix-surface-hover, #1B2130)',
          border: 'var(--astrix-border, #252B38)',
          borderHover: 'var(--astrix-border-hover, rgba(255, 255, 255, 0.22))',
          white: 'var(--astrix-text-primary, #F5F7FA)',
          silver: 'var(--astrix-text-secondary, #A3ACBC)',
          muted: 'var(--astrix-text-muted, #6E7788)',
          dim: 'var(--astrix-text-muted, #475163)'
        }
      },
      fontFamily: {
        sans: ['Inter', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Sora', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    }
  },
  plugins: []
}

export default config

