import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/types/ipc'
import {
  getAstrixPresets,
  installOrSyncAstrixPresetMods,
  ensureDefaultAstrixPreset
} from '../services/presets/preset-manager'

export function registerPresetsIPC(): void {
  ipcMain.handle(IPC_CHANNELS.PRESETS_GET_ALL, () => {
    return getAstrixPresets()
  })

  ipcMain.handle(IPC_CHANNELS.PRESETS_ENSURE_DEFAULT, async () => {
    return await ensureDefaultAstrixPreset()
  })

  ipcMain.handle(IPC_CHANNELS.PRESETS_INSTALL_OR_SYNC, async (_event, instanceId: string) => {
    return await installOrSyncAstrixPresetMods(instanceId)
  })
}
