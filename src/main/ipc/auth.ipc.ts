import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/types/ipc'
import { loginMicrosoft, refreshMicrosoftAccount } from '../services/auth/microsoft'
import { loginOffline } from '../services/auth/offline'
import {
  getSavedAccounts,
  removeAccount,
  setDefaultAccount,
  updateAccount
} from '../services/auth/token-store'

export function registerAuthIPC(): void {
  ipcMain.handle(IPC_CHANNELS.AUTH_MICROSOFT_LOGIN, async () => {
    return await loginMicrosoft()
  })

  ipcMain.handle(IPC_CHANNELS.AUTH_OFFLINE_LOGIN, (_event, username: string) => {
    return loginOffline(username)
  })

  ipcMain.handle(IPC_CHANNELS.AUTH_GET_ACCOUNTS, () => {
    return getSavedAccounts()
  })

  ipcMain.handle(IPC_CHANNELS.AUTH_REMOVE_ACCOUNT, (_event, id: string) => {
    return removeAccount(id)
  })

  ipcMain.handle(IPC_CHANNELS.AUTH_SET_DEFAULT, (_event, id: string) => {
    return setDefaultAccount(id)
  })

  ipcMain.handle(IPC_CHANNELS.AUTH_UPDATE_ACCOUNT, (_event, id: string, data: any) => {
    return updateAccount(id, data)
  })

  ipcMain.handle(IPC_CHANNELS.AUTH_REFRESH, async (_event, id: string) => {
    return await refreshMicrosoftAccount(id)
  })
}
