import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/types/ipc'
import { fetchPublicServers, pingServerStatus } from '../services/servers/server-finder'

export function registerServersIPC(): void {
  ipcMain.handle(IPC_CHANNELS.SERVERS_FETCH_PUBLIC, async (_event, page?: number, tag?: string, search?: string) => {
    return await fetchPublicServers({ page, tag, search })
  })

  ipcMain.handle(IPC_CHANNELS.SERVERS_PING_STATUS, async (_event, host: string) => {
    return await pingServerStatus(host)
  })
}
