import * as msmc from 'msmc'
import { randomUUID } from 'crypto'
import type { MinecraftAccount, AuthResult } from '../../../shared/types/auth'
import { getSavedAccounts, saveAccount } from './token-store'

export async function loginMicrosoft(): Promise<AuthResult> {
  const origLog = console.log
  try {
    let mc: any
    try {
      console.log = () => {} // Silence MSMC noisy debug prints from terminal
      const authManager = new msmc.Auth('select_account')
      const xbox = await authManager.launch('electron')
      mc = await xbox.getMinecraft()
    } finally {
      console.log = origLog
    }

    if (!mc.profile) {
      return {
        success: false,
        error: 'No Minecraft profile found for this Microsoft account. Ensure Minecraft is purchased on this account.'
      }
    }

    const skinUrl =
      mc.profile.skins?.[0]?.url ?? `https://minotar.net/avatar/${mc.profile.name}/128.png`

    const account: MinecraftAccount = {
      id: randomUUID(),
      username: mc.profile.name,
      uuid: mc.profile.id,
      type: 'microsoft',
      skinUrl,
      accessToken: mc.mcToken,
      refreshToken: mc.refreshTkn,
      xuid: mc.xuid,
      isDefault: false,
      lastUsed: new Date().toISOString()
    }

    const saved = saveAccount(account)
    return {
      success: true,
      account: saved
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    // Common MSMC cancel/close messages
    if (message.includes('closed') || message.includes('cancel')) {
      return {
        success: false,
        error: 'Login window was closed'
      }
    }
    return {
      success: false,
      error: `Microsoft login failed: ${message}`
    }
  }
}

export async function refreshMicrosoftAccount(id: string): Promise<AuthResult> {
  try {
    const accounts = getSavedAccounts()
    const target = accounts.find((a) => a.id === id || a.uuid === id)

    if (!target) {
      return { success: false, error: 'Account not found' }
    }

    if (target.type !== 'microsoft' || !target.refreshToken) {
      return { success: true, account: target }
    }

    const origLog = console.log
    let mc: any
    try {
      console.log = () => {} // Silence MSMC's noisy xui/module terminal output
      const authManager = new msmc.Auth('none')
      const refreshed = await authManager.refresh(target.refreshToken)
      mc = await refreshed.getMinecraft()
    } finally {
      console.log = origLog
    }

    if (mc.profile) {
      target.accessToken = mc.mcToken
      target.refreshToken = mc.refreshTkn
      target.username = mc.profile.name
      if (mc.xuid) {
        target.xuid = mc.xuid
      }
      if (mc.profile.skins?.[0]?.url) {
        target.skinUrl = mc.profile.skins[0].url
      }
      target.lastUsed = new Date().toISOString()
      saveAccount(target)
    }

    return { success: true, account: target }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    }
  }
}
