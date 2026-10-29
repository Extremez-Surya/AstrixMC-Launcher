import type { SVGProps } from 'react'

export function GrassBlockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" {...props}>
      <path
        d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
        fill="#2e7d32"
        stroke="#4ade80"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 2L21 7L12 12L3 7L12 2Z"
        fill="#4ade80"
        opacity="0.85"
      />
      <path
        d="M3 7L12 12V22L3 17V7Z"
        fill="#5d4037"
        opacity="0.9"
      />
      <path
        d="M21 7L12 12V22L21 17V7Z"
        fill="#4e342e"
      />
      <path
        d="M3 7L12 12L21 7"
        stroke="#86efac"
        strokeWidth="1"
      />
    </svg>
  )
}

export function SnapshotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" {...props}>
      <path
        d="M9 3H15M10 3V8L5 18C4.5 19 5.2 20.5 6.5 20.5H17.5C18.8 20.5 19.5 19 19 18L14 8V3"
        stroke="#f59e0b"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 15C9 14 11 16 13 15C15 14 17 15 17 15"
        stroke="#fbbf24"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="17" r="1" fill="#fef08a" />
      <circle cx="14" cy="18" r="0.75" fill="#fef08a" />
    </svg>
  )
}

export function FabricIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" {...props}>
      <path
        d="M19 4C19 4 15 7 12 11C9 15 8 18 8 18M19 4C19 4 16 9 14 13M19 4L11 20M5 19L8 18"
        stroke="#a855f7"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="11" r="1.5" fill="#c084fc" />
    </svg>
  )
}

export function ForgeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" {...props}>
      <path
        d="M4 8H20L18 12H6L4 8Z"
        fill="#f97316"
        stroke="#fb923c"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 12V18C9 19 10 20 11 20H13C14 20 15 19 15 18V12"
        stroke="#ea580c"
        strokeWidth="1.5"
      />
      <path d="M7 20H17" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function VanillaCubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" {...props}>
      <path
        d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
        fill="#1e293b"
        stroke="#64748b"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 2L21 7L12 12L3 7L12 2Z" fill="#334155" />
      <path d="M12 12V22" stroke="#475569" strokeWidth="1.5" />
    </svg>
  )
}
