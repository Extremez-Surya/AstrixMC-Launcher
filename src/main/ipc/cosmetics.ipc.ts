import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/types/ipc'
import {
  getEquippedCosmetics,
  saveEquippedCosmetics,
  saveUploadedSkin,
  uploadSkinToMojang
} from '../services/cosmetics/cosmetics-manager'
import { getDefaultAccount } from '../services/auth/token-store'
import { readFileSync, existsSync } from 'fs'

export function registerCosmeticsIpc(): void {
  ipcMain.removeHandler(IPC_CHANNELS.COSMETICS_GET)
  ipcMain.handle(IPC_CHANNELS.COSMETICS_GET, () => {
    return getEquippedCosmetics()
  })

  ipcMain.removeHandler(IPC_CHANNELS.COSMETICS_SAVE)
  ipcMain.handle(IPC_CHANNELS.COSMETICS_SAVE, (_event, data: any) => {
    return saveEquippedCosmetics(data)
  })

  ipcMain.removeHandler(IPC_CHANNELS.COSMETICS_UPLOAD_SKIN)
  ipcMain.handle(IPC_CHANNELS.COSMETICS_UPLOAD_SKIN, (_event, { base64Data, model }: { base64Data: string; model: 'classic' | 'slim' }) => {
    const skinPath = saveUploadedSkin(base64Data, model)
    return { success: true, skinPath }
  })

  ipcMain.removeHandler(IPC_CHANNELS.COSMETICS_SYNC_MOJANG)
  ipcMain.handle(IPC_CHANNELS.COSMETICS_SYNC_MOJANG, async () => {
    const account = getDefaultAccount()
    if (!account || account.type !== 'microsoft' || !account.accessToken) {
      return { success: false, error: 'Microsoft account with active session required for Mojang cloud sync.' }
    }

    const cosmetics = getEquippedCosmetics()
    if (!cosmetics.skinPath || !existsSync(cosmetics.skinPath)) {
      return { success: false, error: 'No custom skin file equipped to upload.' }
    }

    const skinBuf = readFileSync(cosmetics.skinPath)
    return uploadSkinToMojang(account.accessToken, skinBuf, cosmetics.skinModel || 'classic')
  })
}
