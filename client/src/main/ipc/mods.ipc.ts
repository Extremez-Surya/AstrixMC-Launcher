import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/types/ipc'
import { searchModrinth, getModrinthProject, getModrinthVersions } from '../services/mods/modrinth-api'
import { searchCurseForge, getCurseForgeProject, getCurseForgeVersions } from '../services/mods/curseforge-api'
import {
  checkFpsBoostCompatibility,
  getInstalledMods,
  installFpsBoostPack,
  installModFile,
  removeMod,
  toggleMod
} from '../services/mods/mod-manager'
import { installModpack } from '../services/mods/modpack-installer'
import { checkInstanceModUpdates } from '../services/instances/instance-content'

export function registerModsIPC(): void {
  ipcMain.handle(IPC_CHANNELS.MODS_CHECK_FPS_COMPATIBILITY, async (_event, version: string, loader?: string) => {
    return await checkFpsBoostCompatibility(version, loader)
  })
  ipcMain.handle(IPC_CHANNELS.MODS_SEARCH, async (_event, query) => {
    const source = query.source || 'modrinth'
    if (source === 'curseforge') {
      return await searchCurseForge(query)
    }
    return await searchModrinth(query)
  })

  ipcMain.handle(IPC_CHANNELS.MODS_GET_DETAILS, async (_event, source: string, id: string) => {
    if (source === 'curseforge') {
      return await getCurseForgeProject(id)
    }
    return await getModrinthProject(id)
  })

  ipcMain.handle(IPC_CHANNELS.MODS_GET_VERSIONS, async (_event, source: string, id: string, loader?: string, gameVersion?: string) => {
    if (source === 'curseforge') {
      return await getCurseForgeVersions(id, gameVersion)
    }
    return await getModrinthVersions(id, loader, gameVersion)
  })

  ipcMain.handle(IPC_CHANNELS.MODS_INSTALL, async (_event, data) => {
    if (data.isFpsPack) {
      return await installFpsBoostPack(data.instanceId)
    }
    if (data.folderType === 'modpack' || data.isModpack) {
      return await installModpack(data.instanceId, data.downloadUrl)
    }
    return await installModFile(
      data.instanceId,
      data.downloadUrl,
      data.fileName,
      data.folderType || 'mods',
      data.dependencies
    )
  })

  ipcMain.handle(IPC_CHANNELS.MODS_REMOVE, (_event, instanceId: string, modId: string) => {
    return removeMod(instanceId, modId)
  })

  ipcMain.handle(IPC_CHANNELS.MODS_LIST_INSTALLED, (_event, instanceId: string) => {
    return getInstalledMods(instanceId)
  })

  ipcMain.handle(IPC_CHANNELS.MODS_TOGGLE, (_event, instanceId: string, modId: string) => {
    return toggleMod(instanceId, modId)
  })

  ipcMain.handle(IPC_CHANNELS.MODS_CHECK_UPDATES, (_event, instanceId: string) => {
    return checkInstanceModUpdates(instanceId)
  })
}
