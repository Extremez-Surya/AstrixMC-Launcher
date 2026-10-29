import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/types/ipc'
import { getMinecraftVersions } from '../services/launcher/version-manager'
import { detectJavaInstallations } from '../services/launcher/java-manager'
import { launchEngine } from '../services/launcher/launch-engine'
import type { LaunchConfig } from '../../shared/types/launch'

export function registerLaunchIPC(): void {
  ipcMain.handle(IPC_CHANNELS.LAUNCH_GET_VERSIONS, async () => {
    return await getMinecraftVersions()
  })

  ipcMain.handle(IPC_CHANNELS.LAUNCH_GET_JAVA, () => {
    return detectJavaInstallations()
  })

  ipcMain.handle(IPC_CHANNELS.LAUNCH_START, async (_event, config: LaunchConfig) => {
    return await launchEngine.launch(config)
  })

  ipcMain.handle(IPC_CHANNELS.LAUNCH_STOP, async () => {
    return await launchEngine.stop()
  })

  ipcMain.handle(IPC_CHANNELS.LAUNCH_GET_STATUS, () => {
    return launchEngine.getStatus()
  })

  ipcMain.handle('launch:get-current-logs', (_event, instanceId?: string) => {
    return launchEngine.getSessionLogs(instanceId)
  })

  ipcMain.handle('launch:clear-current-logs', (_event, instanceId?: string) => {
    launchEngine.clearSessionLogs(instanceId)
    return true
  })
}
