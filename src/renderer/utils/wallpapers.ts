import bountifulImg from '../assets/mc_bountiful.jpg'
import cherryBiomeImg from '../assets/mc_cherry_biome.jpg'
import villageSunsetImg from '../assets/mc_village_sunset.jpg'
import landscapeImg from '../assets/landscape.jpg'
import trickyTrialsImg from '../assets/mc_tricky_trials.jpg'
import tinyTakeoverImg from '../assets/mc_tiny_takeover.jpg'
import forgeCoverImg from '../assets/mc_forge_cover.jpg'
import serverBannerImg from '../assets/astrix_server_banner.jpg'
import featuredNewsImg from '../assets/featured_news.jpg'
import caveBackdropImg from '../assets/mc_cave_backdrop.png'
import nightCastleImg from '../assets/login_night_castle.jpg'

export interface WallpaperItem {
  id: string
  name: string
  src: string
}

export const ROTATING_WALLPAPERS: WallpaperItem[] = [
  { id: 'bountiful', name: 'Birch River Valley', src: bountifulImg },
  { id: 'cherry', name: 'Cherry Blossom Grove', src: cherryBiomeImg },
  { id: 'village', name: 'Village Sunset', src: villageSunsetImg },
  { id: 'landscape', name: 'Mountain Sunset', src: landscapeImg },
  { id: 'trials', name: 'Tricky Trials Chamber', src: trickyTrialsImg },
  { id: 'tiny', name: 'Ocean Monument Guardian', src: tinyTakeoverImg },
  { id: 'forge', name: 'Nether Fortress & Forge', src: forgeCoverImg },
  { id: 'banner', name: 'Astrix Panoramic Wilds', src: serverBannerImg },
  { id: 'featured', name: 'Lush Overworld Sunrise', src: featuredNewsImg },
  { id: 'cave', name: 'Lush Glowberry Caverns', src: caveBackdropImg },
  { id: 'castle', name: 'Night Mountain Castle', src: nightCastleImg }
]
