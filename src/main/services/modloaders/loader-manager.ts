import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { downloadFile, fetchJSON } from '../http'
import { getModrinthVersions } from '../mods/modrinth-api'

export interface LoaderConfig {
  type: 'vanilla' | 'fabric' | 'quilt' | 'forge' | 'neoforge'
  version?: string
}

export interface PreparedLoader {
  customVersion?: string
  forgeJarPath?: string
}

export async function ensureFabricApi(
  gameDirectory: string,
  mcVersion: string,
  loaderType: 'fabric' | 'quilt' = 'fabric',
  onProgress?: (message: string) => void
): Promise<void> {
  const modsDir = join(gameDirectory, 'mods')
  if (!existsSync(modsDir)) {
    return
  }

  try {
    const files = readdirSync(modsDir)
    const jarFiles = files.filter((f) => f.endsWith('.jar') && !f.endsWith('.disabled'))
    if (jarFiles.length === 0) {
      return
    }

    const hasFabricApi = jarFiles.some((f) => {
      const lower = f.toLowerCase()
      return lower.includes('fabric-api') || lower.includes('fabric_api') || lower.includes('quilted_fabric_api')
    })

    if (!hasFabricApi) {
      onProgress?.('Required Fabric API missing for installed mods. Fetching compatible version...')
      const versions = await getModrinthVersions('fabric-api', loaderType, mcVersion)
      if (versions && versions.length > 0 && versions[0].files.length > 0) {
        const file = versions[0].files.find((f) => f.primary) || versions[0].files[0]
        onProgress?.(`Downloading Fabric API (${file.filename})...`)
        await downloadFile(file.url, join(modsDir, file.filename))
      }
    }
  } catch (err) {
    console.warn('Fabric API auto-verification encountered an error:', err)
  }
}

export async function prepareModLoader(
  gameDirectory: string,
  mcVersion: string,
  loader?: LoaderConfig,
  onProgress?: (message: string) => void
): Promise<PreparedLoader> {
  if (!loader || loader.type === 'vanilla') {
    return {}
  }

  if (loader.type === 'fabric') {
    onProgress?.(`Configuring Fabric for Minecraft ${mcVersion}...`)
    try {
      const metaUrl = `https://meta.fabricmc.net/v2/versions/loader/${mcVersion}`
      const loaders = await fetchJSON<any[]>(metaUrl)
      if (loaders && loaders.length > 0) {
        let loaderVer = loaders[0].loader.version
        if (loader.version && loader.version !== 'latest') {
          const isObsolete =
            loader.version.startsWith('0.16') ||
            loader.version.startsWith('0.15') ||
            loader.version.startsWith('0.14') ||
            loader.version.startsWith('0.13')
          if (!isObsolete) {
            loaderVer = loader.version
          }
        }
        const profileId = `fabric-loader-${loaderVer}-${mcVersion}`
        const versionsDir = join(gameDirectory, 'versions', profileId)
        const profileFile = join(versionsDir, `${profileId}.json`)

        if (!existsSync(profileFile)) {
          mkdirSync(versionsDir, { recursive: true })
          const profileJsonUrl = `https://meta.fabricmc.net/v2/versions/loader/${mcVersion}/${loaderVer}/profile/json`
          const profileData = await fetchJSON<any>(profileJsonUrl)
          writeFileSync(profileFile, JSON.stringify(profileData, null, 2), 'utf-8')
        }

        // Auto-ensure Fabric API is installed if mods exist in the mods directory
        await ensureFabricApi(gameDirectory, mcVersion, 'fabric', onProgress)

        return { customVersion: profileId }
      }
    } catch (err) {
      console.error('Fabric setup failed:', err)
    }
  }

  if (loader.type === 'quilt') {
    onProgress?.(`Configuring Quilt for Minecraft ${mcVersion}...`)
    try {
      const metaUrl = `https://meta.quiltmc.org/v3/versions/loader/${mcVersion}`
      const loaders = await fetchJSON<any[]>(metaUrl)
      if (loaders && loaders.length > 0) {
        const loaderVer = loader.version && loader.version !== 'latest' ? loader.version : loaders[0].loader.version
        const profileId = `quilt-loader-${loaderVer}-${mcVersion}`
        const versionsDir = join(gameDirectory, 'versions', profileId)
        const profileFile = join(versionsDir, `${profileId}.json`)

        if (!existsSync(profileFile)) {
          mkdirSync(versionsDir, { recursive: true })
          const profileJsonUrl = `https://meta.quiltmc.org/v3/versions/loader/${mcVersion}/${loaderVer}/profile/json`
          const profileData = await fetchJSON<any>(profileJsonUrl)
          writeFileSync(profileFile, JSON.stringify(profileData, null, 2), 'utf-8')
        }

        return { customVersion: profileId }
      }
    } catch (err) {
      console.error('Quilt setup failed:', err)
    }
  }

  if (loader.type === 'forge') {
    onProgress?.(`Checking Forge for Minecraft ${mcVersion}...`)
    try {
      // Forge promotions
      const promoUrl = 'https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json'
      const promos = await fetchJSON<any>(promoUrl)
      const build = promos.promos?.[`${mcVersion}-recommended`] || promos.promos?.[`${mcVersion}-latest`]
      if (build) {
        const forgeVersion = `${mcVersion}-${build}`
        const forgeDir = join(gameDirectory, 'forge')
        if (!existsSync(forgeDir)) mkdirSync(forgeDir, { recursive: true })
        const installerName = `forge-${forgeVersion}-installer.jar`
        const installerPath = join(forgeDir, installerName)

        if (!existsSync(installerPath)) {
          onProgress?.(`Downloading Forge ${forgeVersion} installer...`)
          const downloadUrl = `https://maven.minecraftforge.net/net/minecraftforge/forge/${forgeVersion}/${installerName}`
          await downloadFile(downloadUrl, installerPath)
        }

        return { forgeJarPath: installerPath }
      }
    } catch (err) {
      console.error('Forge setup failed:', err)
    }
  }

  return {}
}
