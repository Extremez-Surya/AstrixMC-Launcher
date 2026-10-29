import bedrock1080x1920 from '../assets/mcwallpapers/wallpaper_minecraft_bedrock_edition_1080x1920.png'
import bedrock1920x1080 from '../assets/mcwallpapers/wallpaper_minecraft_bedrock_edition_1920x1080.png'
import bedrock2048x2048 from '../assets/mcwallpapers/wallpaper_minecraft_bedrock_edition_2048x2048.png'
import bedrock2058x1440 from '../assets/mcwallpapers/wallpaper_minecraft_bedrock_edition_2058x1440.png'
import bedrock560x1440 from '../assets/mcwallpapers/wallpaper_minecraft_bedrock_edition_560x1440.png'
import bedrock800x450 from '../assets/mcwallpapers/wallpaper_minecraft_bedrock_edition_800x450.png'
import bedrock800x800 from '../assets/mcwallpapers/wallpaper_minecraft_bedrock_edition_800x800.png'

import java1080x1920 from '../assets/mcwallpapers/wallpaper_minecraft_java_edition_1080x1920.png'
import java1920x1080 from '../assets/mcwallpapers/wallpaper_minecraft_java_edition_1920x1080.png'
import java2048x2048 from '../assets/mcwallpapers/wallpaper_minecraft_java_edition_2048x2048.png'
import java2058x1440 from '../assets/mcwallpapers/wallpaper_minecraft_java_edition_2058x1440.png'
import java2560x1440 from '../assets/mcwallpapers/wallpaper_minecraft_java_edition_2560x1440.png'

import pcBundle1080x1920 from '../assets/mcwallpapers/wallpaper_minecraft_pc_bundle_1080x1920.png'
import pcBundle1920x1080 from '../assets/mcwallpapers/wallpaper_minecraft_pc_bundle_1920x1080.png'
import pcBundle2048x2048 from '../assets/mcwallpapers/wallpaper_minecraft_pc_bundle_2048x2048.png'
import pcBundle2058x1440 from '../assets/mcwallpapers/wallpaper_minecraft_pc_bundle_2058x1440.png'
import pcBundle2560x1440 from '../assets/mcwallpapers/wallpaper_minecraft_pc_bundle_2560x1440.png'

export interface WallpaperItem {
  id: string
  name: string
  src: string
}

// All official wallpapers from mcwallpapers folder
export const ROTATING_WALLPAPERS: WallpaperItem[] = [
  // Primary Widescreen / High-Res Landscape editions
  { id: 'java-2560', name: 'Minecraft Java Edition (2.5K QHD)', src: java2560x1440 },
  { id: 'bedrock-2058', name: 'Minecraft Bedrock Edition (2K QHD)', src: bedrock2058x1440 },
  { id: 'pc-bundle-2560', name: 'Minecraft PC Bundle (2.5K QHD)', src: pcBundle2560x1440 },

  { id: 'java-1920', name: 'Minecraft Java Edition (1080p FHD)', src: java1920x1080 },
  { id: 'bedrock-1920', name: 'Minecraft Bedrock Edition (1080p FHD)', src: bedrock1920x1080 },
  { id: 'pc-bundle-1920', name: 'Minecraft PC Bundle (1080p FHD)', src: pcBundle1920x1080 },

  // Full-Height Panoramic Editions
  { id: 'java-2048', name: 'Minecraft Java Edition (Panoramic 2048)', src: java2048x2048 },
  { id: 'bedrock-2048', name: 'Minecraft Bedrock Edition (Panoramic 2048)', src: bedrock2048x2048 },
  { id: 'pc-bundle-2048', name: 'Minecraft PC Bundle (Panoramic 2048)', src: pcBundle2048x2048 },

  { id: 'java-2058', name: 'Minecraft Java Edition (Ultra Wide)', src: java2058x1440 },
  { id: 'pc-bundle-2058', name: 'Minecraft PC Bundle (Ultra Wide)', src: pcBundle2058x1440 },
  { id: 'bedrock-800x450', name: 'Minecraft Bedrock Edition (Cinematic)', src: bedrock800x450 },

  // Full Suite Crops
  { id: 'bedrock-800x800', name: 'Minecraft Bedrock Edition (Square)', src: bedrock800x800 },
  { id: 'java-1080x1920', name: 'Minecraft Java Edition (Vertical)', src: java1080x1920 },
  { id: 'bedrock-1080x1920', name: 'Minecraft Bedrock Edition (Vertical)', src: bedrock1080x1920 },
  { id: 'pc-bundle-1080x1920', name: 'Minecraft PC Bundle (Vertical)', src: pcBundle1080x1920 },
  { id: 'bedrock-560x1440', name: 'Minecraft Bedrock Edition (Tall)', src: bedrock560x1440 }
]
