import { ipcMain } from 'electron'
import { join } from 'path'
import { IPC_CHANNELS } from '../../shared/types/ipc'
import {
  createInstance,
  deleteInstance,
  deleteVersionFiles,
  duplicateInstance,
  getInstance,
  getInstances,
  openInstanceFolder,
  updateInstance
} from '../services/instances/instance-manager'
import {
  getInstanceFiles,
  getInstanceRawFiles,
  readInstanceLog,
  toggleInstanceFile,
  deleteInstanceFile,
  backupWorld,
  exportInstanceZip,
  importInstanceZip,
  uploadToMclogs
} from '../services/instances/instance-content'
import {
  readGameOptions,
  setGameOption,
  getLatestCrashReport
} from '../services/instances/game-settings'

export function registerInstancesIPC(): void {
  ipcMain.handle(IPC_CHANNELS.INSTANCES_LIST, () => {
    return getInstances()
  })

  ipcMain.handle(IPC_CHANNELS.INSTANCES_CREATE, (_event, data) => {
    return createInstance(data)
  })

  ipcMain.handle(IPC_CHANNELS.INSTANCES_UPDATE, (_event, id: string, data) => {
    return updateInstance(id, data)
  })

  ipcMain.handle(IPC_CHANNELS.INSTANCES_DELETE, (_event, id: string) => {
    return deleteInstance(id)
  })

  ipcMain.handle(IPC_CHANNELS.INSTANCES_DELETE_VERSION, (_event, versionId: string) => {
    return deleteVersionFiles(versionId)
  })

  ipcMain.handle(IPC_CHANNELS.INSTANCES_DUPLICATE, (_event, id: string) => {
    return duplicateInstance(id)
  })

  ipcMain.handle(IPC_CHANNELS.INSTANCES_OPEN_FOLDER, (_event, id: string, subfolder?: string) => {
    return openInstanceFolder(id, subfolder)
  })

  ipcMain.handle(IPC_CHANNELS.INSTANCES_GET_DETAIL, (_event, id: string) => {
    return getInstance(id)
  })

  // Prism Launcher features
  ipcMain.handle(IPC_CHANNELS.INSTANCES_GET_FILES, (_event, instanceId: string, category: any) => {
    return getInstanceFiles(instanceId, category)
  })

  ipcMain.handle(IPC_CHANNELS.INSTANCES_TOGGLE_FILE, (_event, instanceId: string, category: any, fileName: string) => {
    return toggleInstanceFile(instanceId, category, fileName)
  })

  ipcMain.handle(IPC_CHANNELS.INSTANCES_DELETE_FILE, (_event, instanceId: string, category: any, fileName: string) => {
    return deleteInstanceFile(instanceId, category, fileName)
  })

  ipcMain.handle(IPC_CHANNELS.INSTANCES_BACKUP_WORLD, (_event, instanceId: string, worldName: string) => {
    return backupWorld(instanceId, worldName)
  })

  ipcMain.handle(IPC_CHANNELS.INSTANCES_EXPORT, (_event, instanceId: string) => {
    return exportInstanceZip(instanceId)
  })

  ipcMain.handle(IPC_CHANNELS.INSTANCES_IMPORT, () => {
    return importInstanceZip()
  })

  ipcMain.handle(IPC_CHANNELS.LOGS_UPLOAD, (_event, logContent: string) => {
    return uploadToMclogs(logContent)
  })

  ipcMain.handle('instances:get-raw-files', (_event, instanceId: string, subPath?: string) => {
    return getInstanceRawFiles(instanceId, subPath)
  })

  ipcMain.handle('instances:read-log', (_event, instanceId: string, logFile?: string) => {
    return readInstanceLog(instanceId, logFile)
  })

  ipcMain.handle('instances:get-game-options', (_event, instanceId: string) => {
    return readGameOptions(instanceId)
  })

  ipcMain.handle('instances:set-game-option', (_event, instanceId: string, key: string, value: any) => {
    return setGameOption(instanceId, key, value)
  })

  ipcMain.handle('instances:get-crash-report', (_event, instanceId: string) => {
    return getLatestCrashReport(instanceId)
  })
}
