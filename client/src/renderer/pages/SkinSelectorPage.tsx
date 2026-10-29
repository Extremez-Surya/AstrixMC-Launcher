import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiPlus,
  HiCheck,
  HiTrash,
  HiArrowDownTray,
  HiPencilSquare,
  HiChevronDown,
  HiChevronUp,
  HiSparkles,
  HiXMark,
  HiArrowPath,
  HiMagnifyingGlass,
  HiBookmark,
  HiGlobeAlt,
  HiFolder
} from 'react-icons/hi2'
import { FaShirt } from 'react-icons/fa6'
import { useAuth } from '../hooks/useAuth'
import { playSound } from '../utils/sound'
import { cn } from '../lib/cn'
import { getAccountAvatar, getAccountBody } from '../utils/avatar'
import { generateSkinBodyDataUrl } from '../utils/skin-renderer'
import { MinecraftSkinViewer3D } from '../components/skins/MinecraftSkinViewer3D'

export interface SkinItem {
  id: string
  name: string
  model: 'classic' | 'slim'
  category: 'default' | 'saved' | 'trending' | 'pvp' | 'superheroes' | 'anime' | 'gaming' | 'aesthetic' | 'fantasy' | 'mobs'
  previewUrl: string
  textureUrl?: string
  playerName?: string
  tag?: string
  dateAdded?: string
}

// 9 Official Minecraft Default Characters with verified real player models
const DEFAULT_SKINS: SkinItem[] = [
  {
    id: 'steve',
    name: 'Steve',
    model: 'classic',
    category: 'default',
    playerName: 'Steve',
    previewUrl: 'https://mc-heads.net/body/Steve/280'
  },
  {
    id: 'alex',
    name: 'Alex',
    model: 'slim',
    category: 'default',
    playerName: 'Alex',
    previewUrl: 'https://mc-heads.net/body/Alex/280'
  },
  {
    id: 'ari',
    name: 'Ari',
    model: 'slim',
    category: 'default',
    playerName: 'Ari',
    previewUrl: 'https://mc-heads.net/body/Ari/280'
  },
  {
    id: 'efe',
    name: 'Efe',
    model: 'slim',
    category: 'default',
    playerName: 'Efe',
    previewUrl: 'https://mc-heads.net/body/Efe/280'
  },
  {
    id: 'makena',
    name: 'Makena',
    model: 'classic',
    category: 'default',
    playerName: 'Makena',
    previewUrl: 'https://mc-heads.net/body/Makena/280'
  },
  {
    id: 'noor',
    name: 'Noor',
    model: 'classic',
    category: 'default',
    playerName: 'Noor',
    previewUrl: 'https://mc-heads.net/body/Noor/280'
  },
  {
    id: 'sunny',
    name: 'Sunny',
    model: 'classic',
    category: 'default',
    playerName: 'Sunny',
    previewUrl: 'https://mc-heads.net/body/Sunny/280'
  },
  {
    id: 'zuri',
    name: 'Zuri',
    model: 'classic',
    category: 'default',
    playerName: 'Zuri',
    previewUrl: 'https://mc-heads.net/body/Zuri/280'
  },
  {
    id: 'kai',
    name: 'Kai',
    model: 'classic',
    category: 'default',
    playerName: 'Kai',
    previewUrl: 'https://mc-heads.net/body/Kai/280'
  }
]

// Massive World Catalog of iconic, high-demand Minecraft skins across all major categories
const WORLD_SKINS_CATALOG: SkinItem[] = [
  // ── TRENDING & ALL-TIME LEGENDS ──
  {
    id: 'leg_techno',
    name: 'TechnoBlade',
    model: 'classic',
    category: 'trending',
    playerName: 'TechnoBlade',
    tag: 'Crown & Cloak',
    previewUrl: 'https://mc-heads.net/body/TechnoBlade/280'
  },
  {
    id: 'leg_dream',
    name: 'Dream',
    model: 'classic',
    category: 'trending',
    playerName: 'Dream',
    tag: 'Green Smiley',
    previewUrl: 'https://mc-heads.net/body/Dream/280'
  },
  {
    id: 'leg_tommy',
    name: 'TommyInnit',
    model: 'classic',
    category: 'trending',
    playerName: 'TommyInnit',
    tag: 'Red & White',
    previewUrl: 'https://mc-heads.net/body/TommyInnit/280'
  },
  {
    id: 'leg_george',
    name: 'GeorgeNotFound',
    model: 'classic',
    category: 'trending',
    playerName: 'GeorgeNotFound',
    tag: 'White Goggles',
    previewUrl: 'https://mc-heads.net/body/GeorgeNotFound/280'
  },
  {
    id: 'leg_ranboo',
    name: 'Ranboo',
    model: 'classic',
    category: 'trending',
    playerName: 'Ranboo',
    tag: 'Dual Ender Suit',
    previewUrl: 'https://mc-heads.net/body/Ranboo/280'
  },
  {
    id: 'leg_wilbur',
    name: 'Wilbur Soot',
    model: 'classic',
    category: 'trending',
    playerName: 'WilburSoot',
    tag: 'Yellow Beanie',
    previewUrl: 'https://mc-heads.net/body/WilburSoot/280'
  },
  {
    id: 'leg_dantdm',
    name: 'DanTDM',
    model: 'classic',
    category: 'trending',
    playerName: 'DanTDM',
    tag: 'Blue Hair Scientist',
    previewUrl: 'https://mc-heads.net/body/DanTDM/280'
  },
  {
    id: 'leg_captain',
    name: 'CaptainSparklez',
    model: 'classic',
    category: 'trending',
    playerName: 'CaptainSparklez',
    tag: 'Red Hoodie',
    previewUrl: 'https://mc-heads.net/body/CaptainSparklez/280'
  },
  {
    id: 'leg_notch',
    name: 'Notch',
    model: 'classic',
    category: 'trending',
    playerName: 'Notch',
    tag: 'Creator',
    previewUrl: 'https://mc-heads.net/body/Notch/280'
  },
  {
    id: 'leg_herobrine',
    name: 'Herobrine',
    model: 'classic',
    category: 'trending',
    playerName: 'Herobrine',
    tag: 'White-Eyed Myth',
    previewUrl: 'https://mc-heads.net/body/Herobrine/280'
  },
  {
    id: 'leg_skeppy',
    name: 'Skeppy',
    model: 'classic',
    category: 'trending',
    playerName: 'Skeppy',
    tag: 'Diamond Block',
    previewUrl: 'https://mc-heads.net/body/Skeppy/280'
  },
  {
    id: 'leg_badboyhalo',
    name: 'BadBoyHalo',
    model: 'classic',
    category: 'trending',
    playerName: 'BadBoyHalo',
    tag: 'Hooded Demon',
    previewUrl: 'https://mc-heads.net/body/BadBoyHalo/280'
  },

  // ── PVP & SWEATY TRYHARDS ──
  {
    id: 'pvp_spiderman',
    name: 'Spider-Man PvP',
    model: 'classic',
    category: 'pvp',
    playerName: 'spiderman1',
    tag: 'Sweat PvP',
    previewUrl: 'https://mc-heads.net/body/spiderman1/280'
  },
  {
    id: 'pvp_pumpkin',
    name: 'Pumpkin Suit',
    model: 'classic',
    category: 'pvp',
    playerName: 'BCAS_',
    tag: 'Astrix Signature',
    previewUrl: 'https://mc-heads.net/body/BCAS_/280'
  },
  {
    id: 'pvp_ninja',
    name: 'Shadow Ninja',
    model: 'classic',
    category: 'pvp',
    playerName: 'Ninja',
    tag: 'Stealth Shinobi',
    previewUrl: 'https://mc-heads.net/body/Ninja/280'
  },
  {
    id: 'pvp_fruit',
    name: 'Fruitberries',
    model: 'classic',
    category: 'pvp',
    playerName: 'Fruitberries',
    tag: 'Movement God',
    previewUrl: 'https://mc-heads.net/body/Fruitberries/280'
  },
  {
    id: 'pvp_illumina',
    name: 'Illumina',
    model: 'classic',
    category: 'pvp',
    playerName: 'IlluminaHD',
    tag: 'Speedrunner',
    previewUrl: 'https://mc-heads.net/body/IlluminaHD/280'
  },
  {
    id: 'pvp_clown',
    name: 'ClownPierce',
    model: 'classic',
    category: 'pvp',
    playerName: 'ClownPierce',
    tag: 'Lifesteal Assassin',
    previewUrl: 'https://mc-heads.net/body/ClownPierce/280'
  },
  {
    id: 'pvp_minemen',
    name: 'Minemen Duelist',
    model: 'classic',
    category: 'pvp',
    playerName: 'Minemen',
    tag: 'Nodebuff Pro',
    previewUrl: 'https://mc-heads.net/body/Minemen/280'
  },
  {
    id: 'pvp_huahwi',
    name: 'Huahwi',
    model: 'classic',
    category: 'pvp',
    playerName: 'Huahwi',
    tag: 'Original PvP King',
    previewUrl: 'https://mc-heads.net/body/Huahwi/280'
  },

  // ── SUPERHEROES & MARVEL / DC ──
  {
    id: 'hero_spiderman',
    name: 'Spider-Man',
    model: 'classic',
    category: 'superheroes',
    playerName: 'SpiderMan',
    tag: 'Marvel',
    previewUrl: 'https://mc-heads.net/body/SpiderMan/280'
  },
  {
    id: 'hero_batman',
    name: 'Batman',
    model: 'classic',
    category: 'superheroes',
    playerName: 'Batman',
    tag: 'DC Comics',
    previewUrl: 'https://mc-heads.net/body/Batman/280'
  },
  {
    id: 'hero_ironman',
    name: 'Iron Man',
    model: 'classic',
    category: 'superheroes',
    playerName: 'IronMan',
    tag: 'Stark Armor',
    previewUrl: 'https://mc-heads.net/body/IronMan/280'
  },
  {
    id: 'hero_deadpool',
    name: 'Deadpool',
    model: 'classic',
    category: 'superheroes',
    playerName: 'Deadpool',
    tag: 'Merc With a Mouth',
    previewUrl: 'https://mc-heads.net/body/Deadpool/280'
  },
  {
    id: 'hero_wolverine',
    name: 'Wolverine',
    model: 'classic',
    category: 'superheroes',
    playerName: 'Wolverine',
    tag: 'X-Men',
    previewUrl: 'https://mc-heads.net/body/Wolverine/280'
  },
  {
    id: 'hero_venom',
    name: 'Venom',
    model: 'classic',
    category: 'superheroes',
    playerName: 'Venom',
    tag: 'Symbiote',
    previewUrl: 'https://mc-heads.net/body/Venom/280'
  },
  {
    id: 'hero_superman',
    name: 'Superman',
    model: 'classic',
    category: 'superheroes',
    playerName: 'Superman',
    tag: 'Man of Steel',
    previewUrl: 'https://mc-heads.net/body/Superman/280'
  },
  {
    id: 'hero_flash',
    name: 'The Flash',
    model: 'classic',
    category: 'superheroes',
    playerName: 'TheFlash',
    tag: 'Speedster',
    previewUrl: 'https://mc-heads.net/body/TheFlash/280'
  },
  {
    id: 'hero_joker',
    name: 'The Joker',
    model: 'classic',
    category: 'superheroes',
    playerName: 'Joker',
    tag: 'Gotham Villain',
    previewUrl: 'https://mc-heads.net/body/Joker/280'
  },

  // ── ANIME & MANGA ──
  {
    id: 'ani_goku',
    name: 'Son Goku',
    model: 'classic',
    category: 'anime',
    playerName: 'Goku',
    tag: 'Dragon Ball Z',
    previewUrl: 'https://mc-heads.net/body/Goku/280'
  },
  {
    id: 'ani_naruto',
    name: 'Naruto Uzumaki',
    model: 'classic',
    category: 'anime',
    playerName: 'Naruto',
    tag: 'Hokage',
    previewUrl: 'https://mc-heads.net/body/Naruto/280'
  },
  {
    id: 'ani_luffy',
    name: 'Monkey D. Luffy',
    model: 'classic',
    category: 'anime',
    playerName: 'Luffy',
    tag: 'Straw Hat',
    previewUrl: 'https://mc-heads.net/body/Luffy/280'
  },
  {
    id: 'ani_zoro',
    name: 'Roronoa Zoro',
    model: 'classic',
    category: 'anime',
    playerName: 'Zoro',
    tag: 'Three Sword Style',
    previewUrl: 'https://mc-heads.net/body/Zoro/280'
  },
  {
    id: 'ani_gojo',
    name: 'Satoru Gojo',
    model: 'classic',
    category: 'anime',
    playerName: 'Gojo',
    tag: 'Jujutsu Kaisen',
    previewUrl: 'https://mc-heads.net/body/Gojo/280'
  },
  {
    id: 'ani_tanjiro',
    name: 'Tanjiro Kamado',
    model: 'classic',
    category: 'anime',
    playerName: 'Tanjiro',
    tag: 'Demon Slayer',
    previewUrl: 'https://mc-heads.net/body/Tanjiro/280'
  },
  {
    id: 'ani_nezuko',
    name: 'Nezuko',
    model: 'slim',
    category: 'anime',
    playerName: 'Nezuko',
    tag: 'Demon Girl',
    previewUrl: 'https://mc-heads.net/body/Nezuko/280'
  },
  {
    id: 'ani_levi',
    name: 'Captain Levi',
    model: 'classic',
    category: 'anime',
    playerName: 'Levi',
    tag: 'Attack on Titan',
    previewUrl: 'https://mc-heads.net/body/Levi/280'
  },
  {
    id: 'ani_eren',
    name: 'Eren Yeager',
    model: 'classic',
    category: 'anime',
    playerName: 'Eren',
    tag: 'Scout Regiment',
    previewUrl: 'https://mc-heads.net/body/Eren/280'
  },
  {
    id: 'ani_kakashi',
    name: 'Kakashi Hatake',
    model: 'classic',
    category: 'anime',
    playerName: 'Kakashi',
    tag: 'Sharingan Sensei',
    previewUrl: 'https://mc-heads.net/body/Kakashi/280'
  },

  // ── GAMING ICONS ──
  {
    id: 'game_masterchief',
    name: 'Master Chief',
    model: 'classic',
    category: 'gaming',
    playerName: 'MasterChief',
    tag: 'Halo Spartan',
    previewUrl: 'https://mc-heads.net/body/MasterChief/280'
  },
  {
    id: 'game_kratos',
    name: 'Kratos',
    model: 'classic',
    category: 'gaming',
    playerName: 'Kratos',
    tag: 'God of War',
    previewUrl: 'https://mc-heads.net/body/Kratos/280'
  },
  {
    id: 'game_mario',
    name: 'Mario',
    model: 'classic',
    category: 'gaming',
    playerName: 'Mario',
    tag: 'Nintendo',
    previewUrl: 'https://mc-heads.net/body/Mario/280'
  },
  {
    id: 'game_sonic',
    name: 'Sonic The Hedgehog',
    model: 'classic',
    category: 'gaming',
    playerName: 'Sonic',
    tag: 'SEGA',
    previewUrl: 'https://mc-heads.net/body/Sonic/280'
  },
  {
    id: 'game_link',
    name: 'Link',
    model: 'classic',
    category: 'gaming',
    playerName: 'Link',
    tag: 'Zelda Hero',
    previewUrl: 'https://mc-heads.net/body/Link/280'
  },
  {
    id: 'game_sans',
    name: 'Sans',
    model: 'classic',
    category: 'gaming',
    playerName: 'Sans',
    tag: 'Undertale',
    previewUrl: 'https://mc-heads.net/body/Sans/280'
  },
  {
    id: 'game_geralt',
    name: 'Geralt of Rivia',
    model: 'classic',
    category: 'gaming',
    playerName: 'Geralt',
    tag: 'Witcher',
    previewUrl: 'https://mc-heads.net/body/Geralt/280'
  },
  {
    id: 'game_doom',
    name: 'Doom Slayer',
    model: 'classic',
    category: 'gaming',
    playerName: 'DoomSlayer',
    tag: 'Praetor Armor',
    previewUrl: 'https://mc-heads.net/body/DoomSlayer/280'
  },

  // ── AESTHETIC & STREETWEAR ──
  {
    id: 'aest_boy',
    name: 'Aesthetic Boy',
    model: 'classic',
    category: 'aesthetic',
    playerName: 'Aesthetic',
    tag: 'Hoodie & Kicks',
    previewUrl: 'https://mc-heads.net/body/Aesthetic/280'
  },
  {
    id: 'aest_pastel',
    name: 'Pastel Dreams',
    model: 'slim',
    category: 'aesthetic',
    playerName: 'Pastel',
    tag: 'Soft Vibe',
    previewUrl: 'https://mc-heads.net/body/Pastel/280'
  },
  {
    id: 'aest_neon',
    name: 'Neon Cyber',
    model: 'classic',
    category: 'aesthetic',
    playerName: 'Neon',
    tag: 'Glowing Violet',
    previewUrl: 'https://mc-heads.net/body/Neon/280'
  },
  {
    id: 'aest_cozy',
    name: 'Cozy Knit',
    model: 'slim',
    category: 'aesthetic',
    playerName: 'Cozy',
    tag: 'Autumn Knit',
    previewUrl: 'https://mc-heads.net/body/Cozy/280'
  },
  {
    id: 'aest_cybergoth',
    name: 'Cyber Goth',
    model: 'classic',
    category: 'aesthetic',
    playerName: 'Goth',
    tag: 'Dark Aesthetic',
    previewUrl: 'https://mc-heads.net/body/Goth/280'
  },

  // ── MEDIEVAL & FANTASY ──
  {
    id: 'fant_knight',
    name: 'Iron Crusader',
    model: 'classic',
    category: 'fantasy',
    playerName: 'Crusader',
    tag: 'Holy Knight',
    previewUrl: 'https://mc-heads.net/body/Crusader/280'
  },
  {
    id: 'fant_paladin',
    name: 'Golden Paladin',
    model: 'classic',
    category: 'fantasy',
    playerName: 'Paladin',
    tag: 'Golden Armor',
    previewUrl: 'https://mc-heads.net/body/Paladin/280'
  },
  {
    id: 'fant_wizard',
    name: 'Grand Wizard',
    model: 'classic',
    category: 'fantasy',
    playerName: 'Wizard',
    tag: 'Mystic Robes',
    previewUrl: 'https://mc-heads.net/body/Wizard/280'
  },
  {
    id: 'fant_viking',
    name: 'Viking Berserker',
    model: 'classic',
    category: 'fantasy',
    playerName: 'Viking',
    tag: 'Fur Cloak',
    previewUrl: 'https://mc-heads.net/body/Viking/280'
  },

  // ── ANIMALS & MOBS ──
  {
    id: 'mob_fox',
    name: 'Cute Fox',
    model: 'classic',
    category: 'mobs',
    playerName: 'Fox',
    tag: 'Fox Onesie',
    previewUrl: 'https://mc-heads.net/body/Fox/280'
  },
  {
    id: 'mob_panda',
    name: 'Panda Suit',
    model: 'classic',
    category: 'mobs',
    playerName: 'Panda',
    tag: 'Black & White',
    previewUrl: 'https://mc-heads.net/body/Panda/280'
  },
  {
    id: 'mob_enderman',
    name: 'Suited Enderman',
    model: 'classic',
    category: 'mobs',
    playerName: 'Enderman',
    tag: 'Purple Eyes',
    previewUrl: 'https://mc-heads.net/body/Enderman/280'
  },
  {
    id: 'mob_warden',
    name: 'Deep Dark Warden',
    model: 'classic',
    category: 'mobs',
    playerName: 'Warden',
    tag: 'Sculk Horns',
    previewUrl: 'https://mc-heads.net/body/Warden/280'
  },
  {
    id: 'mob_creeper',
    name: 'Creeper Suit',
    model: 'classic',
    category: 'mobs',
    playerName: 'Creeper',
    tag: 'Explosive Green',
    previewUrl: 'https://mc-heads.net/body/Creeper/280'
  }
]

const STORAGE_SAVED_SKINS_KEY = 'astrix_saved_skins'

type CatalogCategory =
  | 'all'
  | 'trending'
  | 'pvp'
  | 'superheroes'
  | 'anime'
  | 'gaming'
  | 'aesthetic'
  | 'fantasy'
  | 'mobs'

export default function SkinSelectorPage() {
  const { accounts, activeAccount, setDefaultAccount, updateAccount } = useAuth()

  // Tab switcher: My Wardrobe vs World Catalog
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'catalog'>('catalog')
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Saved skins list in localStorage
  const [savedSkins, setSavedSkins] = useState<SkinItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_SKINS_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    // Initial starter saved skins
    return [
      {
        id: 'saved_bcas_pumpkin',
        name: 'Pumpkin Suit',
        model: 'classic',
        category: 'saved',
        playerName: 'BCAS_',
        tag: 'Astrix Signature',
        previewUrl: 'https://mc-heads.net/body/BCAS_/280',
        dateAdded: new Date().toISOString()
      },
      {
        id: 'saved_spiderman',
        name: "spiderman1's Skin",
        model: 'classic',
        category: 'saved',
        playerName: 'spiderman1',
        tag: 'PvP Favorite',
        previewUrl: 'https://mc-heads.net/body/spiderman1/280',
        dateAdded: new Date().toISOString()
      }
    ]
  })

  // Accordion section states
  const [savedExpanded, setSavedExpanded] = useState(true)
  const [defaultExpanded, setDefaultExpanded] = useState(true)

  // 3D Model drag rotation state
  // Edit skin modal & Stealer
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [stealInput, setStealInput] = useState('')
  const [isStealing, setIsStealing] = useState(false)
  const [isDragOverWindow, setIsDragOverWindow] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Save changes to localStorage
  const persistSavedSkins = (skins: SkinItem[]) => {
    setSavedSkins(skins)
    try {
      localStorage.setItem(STORAGE_SAVED_SKINS_KEY, JSON.stringify(skins))
    } catch {}
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Detect currently equipped skin identity
  const currentEquippedSkinId = useMemo(() => {
    if (!activeAccount) return 'steve'
    if (activeAccount.skinType === 'player' && activeAccount.skinPlayerName) {
      const pName = activeAccount.skinPlayerName.toLowerCase()
      const foundSaved = savedSkins.find((s) => s.playerName?.toLowerCase() === pName)
      if (foundSaved) return foundSaved.id
      const foundDef = DEFAULT_SKINS.find((s) => s.playerName?.toLowerCase() === pName)
      if (foundDef) return foundDef.id
      const foundCat = WORLD_SKINS_CATALOG.find((s) => s.playerName?.toLowerCase() === pName)
      if (foundCat) return foundCat.id
    }
    if (activeAccount.skinType === 'custom' && activeAccount.skinUrl) {
      const found = savedSkins.find((s) => s.textureUrl === activeAccount.skinUrl)
      if (found) return found.id
    }
    const matchName = DEFAULT_SKINS.find((s) => s.playerName?.toLowerCase() === activeAccount.username.toLowerCase())
    return matchName ? matchName.id : 'steve'
  }, [activeAccount, savedSkins])

  // Equip Skin to Current Active Account
  const handleEquipSkin = async (skin: SkinItem) => {
    if (!activeAccount) return
    playSound('success')

    try {
      if (skin.textureUrl) {
        await updateAccount(activeAccount.id, {
          skinUrl: skin.textureUrl,
          skinType: 'custom',
          skinPlayerName: undefined,
          customSkinModel: skin.model
        })
      } else if (skin.playerName) {
        const skinUrl = `https://mc-heads.net/skin/${encodeURIComponent(skin.playerName)}`
        await updateAccount(activeAccount.id, {
          skinUrl,
          skinType: 'player',
          skinPlayerName: skin.playerName,
          customSkinModel: skin.model
        })
      }
      showToast(`Equipped "${skin.name}" to ${activeAccount.username}!`)
    } catch {
      playSound('error')
      showToast('Failed to equip skin.')
    }
  }

  // Save Skin from World Catalog into User's Wardrobe
  const handleSaveToWardrobe = (skin: SkinItem, e: React.MouseEvent) => {
    e.stopPropagation()
    playSound('click')
    const alreadySaved = savedSkins.some(
      (s) => s.id === skin.id || (s.playerName && s.playerName.toLowerCase() === skin.playerName?.toLowerCase())
    )
    if (alreadySaved) {
      showToast(`"${skin.name}" is already in your saved wardrobe!`)
      return
    }

    const newSaved: SkinItem = {
      ...skin,
      id: `saved_${Date.now()}_${skin.playerName || 'custom'}`,
      category: 'saved',
      dateAdded: new Date().toISOString()
    }

    const updated = [newSaved, ...savedSkins]
    persistSavedSkins(updated)
    showToast(`Saved "${skin.name}" to your Wardrobe!`)
  }

  // Process PNG File for upload / drag-and-drop
  const handleProcessSkinFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith('.png')) {
        playSound('error')
        showToast('Please select a valid .png Minecraft skin file.')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        const img = new Image()
        img.onload = async () => {
          if (
            (img.width !== 64 && img.width !== 128) ||
            (img.height !== 64 && img.height !== 32 && img.height !== 128)
          ) {
            playSound('error')
            showToast(`Invalid dimensions (${img.width}x${img.height}). Minecraft skins must be 64x64 or 64x32 PNG.`)
            return
          }

          const model: 'classic' | 'slim' = activeAccount?.customSkinModel || 'classic'
          const previewUrl = generateSkinBodyDataUrl(img, model, 260, 380)

          const newSkin: SkinItem = {
            id: `skin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            model,
            category: 'saved',
            textureUrl: dataUrl,
            previewUrl,
            dateAdded: new Date().toISOString()
          }

          const updated = [newSkin, ...savedSkins]
          persistSavedSkins(updated)
          await handleEquipSkin(newSkin)
          showToast(`Added and equipped "${newSkin.name}"!`)
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    },
    [activeAccount, savedSkins]
  )

  // Window-level Drag and Drop events
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOverWindow(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.relatedTarget === null) {
        setIsDragOverWindow(false)
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOverWindow(false)

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        handleProcessSkinFile(files[0])
      }
    }

    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('drop', handleDrop)
    }
  }, [handleProcessSkinFile])

  // Delete skin from Saved
  const handleDeleteSavedSkin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    playSound('click')
    const updated = savedSkins.filter((s) => s.id !== id)
    persistSavedSkins(updated)
    showToast('Skin removed from saved wardrobe.')
  }

  // Steal / Fetch Player Skin
  const handleStealSkin = async (e: React.FormEvent) => {
    e.preventDefault()
    const target = stealInput.trim()
    if (!target) return

    setIsStealing(true)
    playSound('click')

    try {
      const previewUrl = `https://mc-heads.net/body/${encodeURIComponent(target)}/280`
      const newSkin: SkinItem = {
        id: `skin_player_${Date.now()}`,
        name: `${target}'s Skin`,
        model: 'classic',
        category: 'saved',
        playerName: target,
        previewUrl,
        dateAdded: new Date().toISOString()
      }

      const updated = [newSkin, ...savedSkins]
      persistSavedSkins(updated)
      await handleEquipSkin(newSkin)
      setStealInput('')
      setIsEditModalOpen(false)
      showToast(`Fetched & equipped skin from ${target}!`)
    } catch {
      playSound('error')
      showToast('Could not fetch player skin.')
    } finally {
      setIsStealing(false)
    }
  }

  // Model switch
  const handleToggleModel = async (model: 'classic' | 'slim') => {
    if (!activeAccount) return
    playSound('toggle')
    await updateAccount(activeAccount.id, {
      customSkinModel: model
    })
    showToast(`Switched arm model to ${model === 'classic' ? 'Classic (4px)' : 'Slim (3px - Alex)'}`)
  }

  const activeModel = activeAccount?.customSkinModel || 'classic'

  // Filter World Catalog Skins
  const filteredCatalogSkins = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return WORLD_SKINS_CATALOG.filter((skin) => {
      const matchesCategory = selectedCategory === 'all' || skin.category === selectedCategory
      if (!matchesCategory) return false

      if (!q) return true
      return (
        skin.name.toLowerCase().includes(q) ||
        skin.playerName?.toLowerCase().includes(q) ||
        skin.tag?.toLowerCase().includes(q) ||
        skin.category.toLowerCase().includes(q)
      )
    })
  }, [selectedCategory, searchQuery])

  // Category Tabs Configuration
  const categories: { id: CatalogCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All World Skins', count: WORLD_SKINS_CATALOG.length },
    { id: 'trending', label: '🔥 Trending & Legends', count: WORLD_SKINS_CATALOG.filter((s) => s.category === 'trending').length },
    { id: 'pvp', label: '⚔️ PvP & Sweaty', count: WORLD_SKINS_CATALOG.filter((s) => s.category === 'pvp').length },
    { id: 'superheroes', label: '🦸 Superheroes', count: WORLD_SKINS_CATALOG.filter((s) => s.category === 'superheroes').length },
    { id: 'anime', label: '🎌 Anime & Manga', count: WORLD_SKINS_CATALOG.filter((s) => s.category === 'anime').length },
    { id: 'gaming', label: '🎮 Gaming Icons', count: WORLD_SKINS_CATALOG.filter((s) => s.category === 'gaming').length },
    { id: 'aesthetic', label: '✨ Aesthetic', count: WORLD_SKINS_CATALOG.filter((s) => s.category === 'aesthetic').length },
    { id: 'fantasy', label: '🛡️ Medieval & Fantasy', count: WORLD_SKINS_CATALOG.filter((s) => s.category === 'fantasy').length },
    { id: 'mobs', label: '🐾 Animals & Mobs', count: WORLD_SKINS_CATALOG.filter((s) => s.category === 'mobs').length }
  ]

  return (
    <div className="relative flex min-h-full w-full max-w-full flex-col overflow-x-hidden bg-transparent select-none font-sans text-slate-100 pb-36">
      {/* ── ATMOSPHERIC AURA ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/4 h-[500px] w-[600px] rounded-full blur-[140px] opacity-35"
          style={{ background: 'rgba(16, 185, 129, 0.12)' }}
        />
        <div
          className="absolute top-1/2 -right-32 h-[450px] w-[550px] rounded-full blur-[130px] opacity-25"
          style={{ background: 'rgba(56, 189, 248, 0.10)' }}
        />
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleProcessSkinFile(e.target.files[0])
          }
        }}
      />

      {/* ── FULL SCREEN DRAG & DROP OVERLAY ── */}
      <AnimatePresence>
        {isDragOverWindow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl border-4 border-dashed border-emerald-500/80 m-4 rounded-3xl"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400 shadow-2xl mb-4 animate-bounce">
              <FaShirt size={44} />
            </div>
            <h2 className="text-2xl font-black text-white font-display">Drop Your Minecraft Skin Here</h2>
            <p className="text-sm text-slate-300 mt-1">Supports standard 64x64 or 64x32 PNG files</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP HEADER (TITLE & PLAYING AS) ── */}
      <div className="relative z-10 w-full px-5 md:px-8 pt-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Left Title */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <FaShirt size={20} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                Skin selector
              </h1>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-mono font-bold text-emerald-400">
                WORLD SKINS CATALOG
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 ml-13">
              Explore 70+ trending skins, instant 1-click equip, 3D orbit preview, and universal live player search.
            </p>
          </div>

          {/* Right: Playing As Card */}
          <div className="relative">
            <div
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0A0E18]/85 px-4 py-2.5 shadow-lg backdrop-blur-xl cursor-pointer hover:border-emerald-500/40 hover:bg-[#0E1524] transition-all"
            >
              <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-inner">
                <img
                  src={getAccountAvatar(activeAccount, 40)}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                  Playing as
                </span>
                <span className="font-display text-sm font-black text-white truncate max-w-[130px]">
                  {activeAccount?.username || 'No Account'}
                </span>
              </div>

              <HiChevronDown
                size={16}
                className={cn('text-slate-400 transition-transform duration-200 ml-1', accountDropdownOpen && 'rotate-180')}
              />
            </div>

            {/* Account Switcher Dropdown */}
            <AnimatePresence>
              {accountDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 z-50 rounded-2xl border border-white/10 bg-[#0A0E18]/95 p-2 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase font-bold text-slate-400 border-b border-white/5 mb-1">
                    Switch Account
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {accounts.map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => {
                          setDefaultAccount(acc.id)
                          playSound('click')
                          setAccountDropdownOpen(false)
                        }}
                        className={cn(
                          'flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all text-xs',
                          acc.id === activeAccount?.id
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                            : 'hover:bg-white/5 text-slate-200'
                        )}
                      >
                        <img
                          src={getAccountAvatar(acc, 24)}
                          alt={acc.username}
                          className="h-6 w-6 rounded-lg object-cover bg-black/40"
                        />
                        <span className="truncate flex-1">{acc.username}</span>
                        {acc.id === activeAccount?.id && <HiCheck size={14} className="text-emerald-400" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── MAIN STUDIO CONTENT: LEFT 3D STAGE & RIGHT CATALOG ── */}
      <div className="relative z-10 w-full px-5 md:px-8 mt-2">
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* ══════════ LEFT COLUMN: 3D HERO STAGE ══════════ */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col items-center">
            <div className="relative flex flex-col items-center w-full rounded-3xl border border-white/[0.08] bg-[#0A0E18]/80 p-6 shadow-2xl backdrop-blur-2xl overflow-hidden sticky top-6">
              
              {/* Radial backdrop highlight */}
              <div
                className="pointer-events-none absolute inset-0 -top-20 opacity-40 blur-3xl"
                style={{
                  background: 'radial-gradient(circle at 50% 30%, rgba(16,185,129,0.25) 0%, transparent 70%)'
                }}
              />

              {/* Username Pill Tag */}
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 mb-4 rounded-xl border border-white/10 bg-black/60 px-4 py-1.5 shadow-lg backdrop-blur-md flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-display text-sm font-black text-white tracking-wide">
                  {activeAccount?.username || 'BCAS_'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase bg-white/5 px-2 py-0.2 rounded-md">
                  {activeModel}
                </span>
              </motion.div>

              {/* True 3D WebGL Skin Viewer */}
              <div className="relative w-full flex flex-col items-center justify-center my-2">
                <MinecraftSkinViewer3D
                  skinUrl={activeAccount?.skinUrl}
                  playerName={activeAccount?.skinPlayerName || activeAccount?.username}
                  model={activeModel}
                  width={280}
                  height={320}
                  defaultAnimation="idle"
                  showControlsBar={true}
                />

                {/* Subtle Ground Disc Shadow */}
                <div
                  className="pointer-events-none -mt-3 h-5 w-40 rounded-full bg-black/60 blur-md border border-white/5"
                  style={{
                    boxShadow: '0 0 25px rgba(16,185,129,0.2)'
                  }}
                />
              </div>

              {/* 3D Orbit Helper Label */}
              <div className="z-10 mt-1 flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400">
                <span className="text-emerald-400 text-sm">✦</span>
                <span>Drag to 3D Orbit • Scroll to Zoom</span>
              </div>

              {/* Edit Skin Action Button */}
              <button
                type="button"
                onClick={() => {
                  playSound('click')
                  setIsEditModalOpen(true)
                }}
                className="z-10 mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-emerald-500/15 hover:border-emerald-500/40 px-4 py-3 text-xs font-bold text-white transition-all shadow-md active:scale-95"
              >
                <HiPencilSquare size={16} className="text-emerald-400" />
                <span>Edit skin</span>
              </button>
            </div>
          </div>

          {/* ══════════ RIGHT COLUMN: WORLD CATALOG & WARDROBE ══════════ */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col gap-5">
            
            {/* ── TOP NAV BAR: TABS & SEARCH BAR ── */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-3xl border border-white/[0.08] bg-[#0A0E18]/80 p-3 backdrop-blur-xl shadow-lg">
              
              {/* Tab Switcher: World Catalog vs My Wardrobe */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setActiveTab('catalog')
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all active:scale-95 shadow-sm',
                    activeTab === 'catalog'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  )}
                >
                  <HiGlobeAlt size={16} className="text-emerald-400" />
                  <span>World Catalog</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 font-mono text-[10px] text-emerald-300">
                    {WORLD_SKINS_CATALOG.length}+
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setActiveTab('wardrobe')
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all active:scale-95 shadow-sm',
                    activeTab === 'wardrobe'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  )}
                >
                  <HiFolder size={16} className="text-amber-400" />
                  <span>My Wardrobe</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.2 font-mono text-[10px] text-slate-300">
                    {savedSkins.length}
                  </span>
                </button>
              </div>

              {/* Real-time Global Search Input */}
              <div className="relative flex-1 max-w-md">
                <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalog or enter any Minecraft username..."
                  className="w-full rounded-2xl border border-white/10 bg-black/50 pl-10 pr-9 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:bg-black/80 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <HiXMark size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* ══════════════ TAB 1: WORLD SKINS CATALOG ══════════════ */}
            {activeTab === 'catalog' && (
              <div className="flex flex-col gap-4">
                
                {/* Category Chips Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => {
                    const isSel = selectedCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          playSound('click')
                          setSelectedCategory(cat.id)
                        }}
                        className={cn(
                          'flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap active:scale-95',
                          isSel
                            ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.1)]'
                            : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
                        )}
                      >
                        <span>{cat.label}</span>
                        <span className="rounded-full bg-white/10 px-1.5 py-0.2 font-mono text-[10px] text-slate-300">
                          {cat.count}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Live World Player Lookup Card (When searching any custom name) */}
                {searchQuery.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/25 p-4 shadow-lg backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-black/60 border border-emerald-500/30 shadow-inner">
                        <img
                          src={`https://mc-heads.net/avatar/${encodeURIComponent(searchQuery.trim())}/40`}
                          alt={searchQuery}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve/40'
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-display text-sm font-black text-white">
                          Lookup &quot;{searchQuery.trim()}&quot; on Mojang Global Network
                        </span>
                        <span className="text-xs text-emerald-400/90 font-mono">
                          Fetch and equip this exact skin directly into your launcher
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          const target = searchQuery.trim()
                          const newSkin: SkinItem = {
                            id: `lookup_${Date.now()}_${target}`,
                            name: `${target}'s Skin`,
                            model: 'classic',
                            category: 'saved',
                            playerName: target,
                            previewUrl: `https://mc-heads.net/body/${encodeURIComponent(target)}/280`,
                            dateAdded: new Date().toISOString()
                          }
                          const updated = [newSkin, ...savedSkins]
                          persistSavedSkins(updated)
                          handleEquipSkin(newSkin)
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all"
                      >
                        <HiSparkles size={14} />
                        <span>Fetch & Equip Now</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Grid of World Catalog Skins */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
                  {filteredCatalogSkins.map((skin) => {
                    const isEquipped = currentEquippedSkinId === skin.id
                    const isSaved = savedSkins.some(
                      (s) => s.id === skin.id || (s.playerName && s.playerName.toLowerCase() === skin.playerName?.toLowerCase())
                    )

                    return (
                      <motion.div
                        key={skin.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleEquipSkin(skin)}
                        className={cn(
                          'group relative flex flex-col items-center justify-between rounded-2xl border p-3.5 h-64 cursor-pointer transition-all shadow-lg overflow-hidden',
                          isEquipped
                            ? 'bg-gradient-to-b from-emerald-950/30 via-[#121620] to-[#0A0E18] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                            : 'bg-[#121620]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#151B28]'
                        )}
                      >
                        {/* Checkmark Badge on Top Right */}
                        {isEquipped && (
                          <div className="absolute top-2.5 right-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black shadow-lg">
                            <HiCheck size={15} className="stroke-[3]" />
                          </div>
                        )}

                        {/* Save to Wardrobe Action Button */}
                        <button
                          type="button"
                          onClick={(e) => handleSaveToWardrobe(skin, e)}
                          title={isSaved ? 'Saved in wardrobe' : 'Save to My Wardrobe'}
                          className={cn(
                            'absolute top-2.5 left-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-lg transition-all',
                            isSaved
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'opacity-0 group-hover:opacity-100 bg-black/60 text-slate-400 hover:text-white hover:bg-white/20'
                          )}
                        >
                          <HiBookmark size={13} />
                        </button>

                        {/* 3D Skin Body Render */}
                        <div className="relative flex-1 w-full flex items-center justify-center pt-2">
                          <img
                            src={skin.previewUrl}
                            alt={skin.name}
                            className="h-44 w-auto object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              ;(e.currentTarget as HTMLImageElement).src = 'https://mc-heads.net/body/Steve/280'
                            }}
                          />
                        </div>

                        {/* Skin Name & Model Label */}
                        <div className="w-full flex flex-col gap-1 pt-2 border-t border-white/5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-display text-xs font-bold text-white truncate flex-1">
                              {skin.name}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 uppercase bg-black/40 px-1.5 py-0.2 rounded">
                              {skin.model}
                            </span>
                          </div>
                          {skin.tag && (
                            <span className="text-[10px] text-emerald-400/80 font-mono truncate">
                              {skin.tag}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {filteredCatalogSkins.length === 0 && (
                  <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center text-slate-400">
                    <HiMagnifyingGlass size={32} className="mx-auto mb-3 text-slate-500" />
                    <p className="text-sm font-bold text-white">No skins found in this category</p>
                    <p className="text-xs text-slate-400 mt-1">Try another category chip or search for a player username above.</p>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════ TAB 2: MY WARDROBE (SAVED & DEFAULTS) ══════════════ */}
            {activeTab === 'wardrobe' && (
              <div className="flex flex-col gap-6">
                
                {/* ── 1. SAVED SKINS SECTION ── */}
                <div className="rounded-3xl border border-white/[0.08] bg-[#0A0E18]/70 p-5 shadow-xl backdrop-blur-xl">
                  
                  {/* Accordion Header */}
                  <div
                    onClick={() => {
                      playSound('click')
                      setSavedExpanded(!savedExpanded)
                    }}
                    className="flex items-center justify-between cursor-pointer pb-3 border-b border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-400 text-xs">
                        {savedExpanded ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
                      </span>
                      <h3 className="font-display text-base font-bold text-white tracking-wide">
                        Saved skins
                      </h3>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                        {savedSkins.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>Click any card to equip</span>
                    </div>
                  </div>

                  {/* Grid of Saved Skins */}
                  <AnimatePresence initial={false}>
                    {savedExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pt-4"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
                          
                          {/* + Add Skin Card */}
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              playSound('click')
                              fileInputRef.current?.click()
                            }}
                            className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-emerald-500/[0.05] hover:border-emerald-500/40 p-5 h-56 cursor-pointer transition-all shadow-md text-center"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 transition-all mb-3 shadow-inner">
                              <HiPlus size={24} />
                            </div>
                            <span className="font-display text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                              Add skin
                            </span>
                            <span className="font-mono text-[11px] text-slate-400 mt-0.5">
                              Drag and drop
                            </span>
                          </motion.div>

                          {/* Saved Skin Cards */}
                          {savedSkins.map((skin) => {
                            const isEquipped = currentEquippedSkinId === skin.id

                            return (
                              <motion.div
                                key={skin.id}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleEquipSkin(skin)}
                                className={cn(
                                  'group relative flex flex-col items-center justify-between rounded-2xl border p-3.5 h-56 cursor-pointer transition-all shadow-lg overflow-hidden',
                                  isEquipped
                                    ? 'bg-gradient-to-b from-emerald-950/30 via-[#121620] to-[#0A0E18] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                                    : 'bg-[#121620]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#151B28]'
                                )}
                              >
                                {/* Checkmark Badge on Top Right */}
                                {isEquipped && (
                                  <div className="absolute top-2.5 right-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black shadow-lg">
                                    <HiCheck size={15} className="stroke-[3]" />
                                  </div>
                                )}

                                {/* Delete Action button on hover */}
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteSavedSkin(skin.id, e)}
                                  className="absolute top-2.5 left-2.5 z-20 opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-lg bg-black/60 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
                                  title="Delete from saved skins"
                                >
                                  <HiTrash size={13} />
                                </button>

                                {/* 3D Skin Body Render */}
                                <div className="relative flex-1 w-full flex items-center justify-center pt-2">
                                  <img
                                    src={skin.previewUrl}
                                    alt={skin.name}
                                    className="h-40 w-auto object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      ;(e.currentTarget as HTMLImageElement).src = 'https://mc-heads.net/body/Steve/280'
                                    }}
                                  />
                                </div>

                                {/* Skin Name & Model Label */}
                                <div className="w-full flex items-center justify-between pt-2 border-t border-white/5 text-left">
                                  <span className="font-display text-xs font-bold text-white truncate flex-1">
                                    {skin.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 uppercase bg-black/40 px-1.5 py-0.2 rounded">
                                    {skin.model}
                                  </span>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── 2. DEFAULT MOJANG SKINS SECTION ── */}
                <div className="rounded-3xl border border-white/[0.08] bg-[#0A0E18]/70 p-5 shadow-xl backdrop-blur-xl">
                  
                  {/* Accordion Header */}
                  <div
                    onClick={() => {
                      playSound('click')
                      setDefaultExpanded(!defaultExpanded)
                    }}
                    className="flex items-center justify-between cursor-pointer pb-3 border-b border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-400 text-xs">
                        {defaultExpanded ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
                      </span>
                      <h3 className="font-display text-base font-bold text-white tracking-wide">
                        Default skins
                      </h3>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                        {DEFAULT_SKINS.length}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-400">Official Mojang character roster</span>
                  </div>

                  {/* Grid of Default Skins */}
                  <AnimatePresence initial={false}>
                    {defaultExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pt-4"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
                          {DEFAULT_SKINS.map((skin) => {
                            const isEquipped = currentEquippedSkinId === skin.id

                            return (
                              <motion.div
                                key={skin.id}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleEquipSkin(skin)}
                                className={cn(
                                  'group relative flex flex-col items-center justify-between rounded-2xl border p-3.5 h-56 cursor-pointer transition-all shadow-lg overflow-hidden',
                                  isEquipped
                                    ? 'bg-gradient-to-b from-emerald-950/30 via-[#121620] to-[#0A0E18] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                                    : 'bg-[#121620]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#151B28]'
                                )}
                              >
                                {/* Checkmark Badge on Top Right */}
                                {isEquipped && (
                                  <div className="absolute top-2.5 right-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black shadow-lg">
                                    <HiCheck size={15} className="stroke-[3]" />
                                  </div>
                                )}

                                {/* 3D Skin Body Render */}
                                <div className="relative flex-1 w-full flex items-center justify-center pt-2">
                                  <img
                                    src={skin.previewUrl}
                                    alt={skin.name}
                                    className="h-40 w-auto object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      ;(e.currentTarget as HTMLImageElement).src = 'https://mc-heads.net/body/Steve/280'
                                    }}
                                  />
                                </div>

                                {/* Skin Name & Model Label */}
                                <div className="w-full flex items-center justify-between pt-2 border-t border-white/5 text-left">
                                  <span className="font-display text-xs font-bold text-white truncate flex-1">
                                    {skin.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 uppercase bg-black/40 px-1.5 py-0.2 rounded">
                                    {skin.model}
                                  </span>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── EDIT SKIN MODAL (MODEL & STEALER) ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0A0E18] p-6 shadow-2xl backdrop-blur-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <HiPencilSquare size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-white">Edit Skin & Model</h3>
                    <p className="text-xs text-slate-400">Customize arms and steal community skins</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <HiXMark size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-5 pt-4">
                
                {/* 1. Arm Model Selector */}
                <div>
                  <label className="text-xs font-mono font-bold uppercase text-slate-300 block mb-2">
                    Arm Model Type
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleModel('classic')}
                      className={cn(
                        'flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all',
                        activeModel === 'classic'
                          ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-md ring-1 ring-emerald-500/40'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      )}
                    >
                      <span className="text-sm">Classic</span>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5">4-pixel arms (Steve)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleModel('slim')}
                      className={cn(
                        'flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all',
                        activeModel === 'slim'
                          ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-md ring-1 ring-emerald-500/40'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      )}
                    >
                      <span className="text-sm">Slim</span>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5">3-pixel arms (Alex)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Skin Stealer (Fetch from any Minecraft username) */}
                <div>
                  <label className="text-xs font-mono font-bold uppercase text-slate-300 block mb-2">
                    Skin Stealer (Fetch By Username)
                  </label>
                  <form onSubmit={handleStealSkin} className="flex gap-2">
                    <div className="relative flex-1">
                      <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        value={stealInput}
                        onChange={(e) => setStealInput(e.target.value)}
                        placeholder="e.g. TechnoBlade, Dream, DanTDM..."
                        className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/40"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isStealing || !stealInput.trim()}
                      className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                    >
                      {isStealing ? 'Fetching...' : 'Fetch & Equip'}
                    </button>
                  </form>
                </div>

                {/* 3. Upload File Alternative */}
                <div>
                  <label className="text-xs font-mono font-bold uppercase text-slate-300 block mb-2">
                    Local Skin File
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false)
                      fileInputRef.current?.click()
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-2.5 text-xs font-semibold text-slate-300 transition-all"
                  >
                    <span>Browse .PNG file from computer...</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-[#0B1220]/95 px-5 py-3 text-xs font-bold text-emerald-300 shadow-[0_12px_36px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <HiCheck size={14} />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
