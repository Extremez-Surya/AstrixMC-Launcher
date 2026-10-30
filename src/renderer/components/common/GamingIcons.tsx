import type { ImgHTMLAttributes } from 'react'
import fabricPng from '../../assets/icons/fabric_official.png'
import forgePng from '../../assets/icons/forge_official.png'
import neoforgePng from '../../assets/icons/neoforge_official.png'
import vanillaGrassPng from '../../assets/icons/vanilla_official.png'

export { fabricPng, forgePng, neoforgePng, vanillaGrassPng }

export interface LoaderIconProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: number | string
}

/**
 * Official Authentic Minecraft Grass Block (Original Vanilla Icon)
 */
export function GrassBlockIcon({ className = 'h-5 w-5', alt = 'Vanilla Minecraft', ...props }: LoaderIconProps) {
  return (
    <img
      src={vanillaGrassPng}
      alt={alt}
      className={`inline-block object-contain drop-shadow-md select-none pointer-events-none ${className}`}
      {...props}
    />
  )
}

/**
 * Official Authentic Minecraft Fabric Modloader Icon (From fabricmc.net)
 */
export function FabricIcon({ className = 'h-5 w-5', alt = 'Fabric Modloader', ...props }: LoaderIconProps) {
  return (
    <img
      src={fabricPng}
      alt={alt}
      className={`inline-block object-contain drop-shadow-md select-none pointer-events-none ${className}`}
      {...props}
    />
  )
}

/**
 * Official Authentic Minecraft Forge Modloader Icon (From MinecraftForge)
 */
export function ForgeIcon({ className = 'h-5 w-5', alt = 'Minecraft Forge', ...props }: LoaderIconProps) {
  return (
    <img
      src={forgePng}
      alt={alt}
      className={`inline-block object-contain drop-shadow-md select-none pointer-events-none ${className}`}
      {...props}
    />
  )
}

/**
 * Official Authentic NeoForge Modloader Icon (From NeoForged)
 */
export function NeoForgeIcon({ className = 'h-5 w-5', alt = 'NeoForge', ...props }: LoaderIconProps) {
  return (
    <img
      src={neoforgePng}
      alt={alt}
      className={`inline-block object-contain drop-shadow-md select-none pointer-events-none ${className}`}
      {...props}
    />
  )
}

/**
 * Snapshot Icon fallback
 */
export function SnapshotIcon({ className = 'h-5 w-5', alt = 'Snapshot', ...props }: LoaderIconProps) {
  return (
    <img
      src={vanillaGrassPng}
      alt={alt}
      className={`inline-block object-contain drop-shadow-md select-none pointer-events-none ${className}`}
      {...props}
    />
  )
}

/**
 * Vanilla Cube Alias
 */
export function VanillaCubeIcon(props: LoaderIconProps) {
  return <GrassBlockIcon {...props} />
}
