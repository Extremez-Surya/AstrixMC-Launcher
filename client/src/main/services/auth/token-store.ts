import { JSONStore } from '../store'
import type { MinecraftAccount } from '../../../shared/types/auth'

const accountsStore = new JSONStore<MinecraftAccount>('accounts')

export function getSavedAccounts(): MinecraftAccount[] {
  const accounts = accountsStore.read()
  let modified = false
  for (const acc of accounts) {
    if (acc.skinUrl && acc.skinUrl.includes('minotar.net/avatar')) {
      delete acc.skinUrl
      modified = true
    }
  }
  if (modified) {
    accountsStore.write(accounts)
  }
  return accounts
}

export function saveAccount(account: MinecraftAccount): MinecraftAccount {
  const accounts = accountsStore.read()
  const existingIdx = accounts.findIndex((a) => a.id === account.id || a.uuid === account.uuid)

  // If this is the only account or marked default, unmark others
  if (account.isDefault || accounts.length === 0) {
    account.isDefault = true
    for (const a of accounts) {
      a.isDefault = false
    }
  }

  if (existingIdx >= 0) {
    accounts[existingIdx] = { ...accounts[existingIdx], ...account }
  } else {
    accounts.push(account)
  }

  accountsStore.write(accounts)
  return account
}

export function removeAccount(id: string): boolean {
  const accounts = accountsStore.read()
  const filtered = accounts.filter((a) => a.id !== id && a.uuid !== id)
  if (filtered.length !== accounts.length) {
    // If the removed account was default, set a new default if available
    const removedWasDefault = accounts.find((a) => a.id === id || a.uuid === id)?.isDefault
    if (removedWasDefault && filtered.length > 0) {
      filtered[0].isDefault = true
    }
    accountsStore.write(filtered)
    return true
  }
  return false
}

export function setDefaultAccount(id: string): MinecraftAccount | null {
  const accounts = accountsStore.read()
  let found: MinecraftAccount | null = null
  for (const a of accounts) {
    if (a.id === id || a.uuid === id) {
      a.isDefault = true
      found = a
    } else {
      a.isDefault = false
    }
  }
  if (found) {
    accountsStore.write(accounts)
  }
  return found
}

export function getDefaultAccount(): MinecraftAccount | null {
  const accounts = accountsStore.read()
  return accounts.find((a) => a.isDefault) || accounts[0] || null
}

export function updateAccount(id: string, patch: Partial<MinecraftAccount>): MinecraftAccount | null {
  const accounts = accountsStore.read()
  const existingIdx = accounts.findIndex((a) => a.id === id || a.uuid === id)
  if (existingIdx >= 0) {
    accounts[existingIdx] = { ...accounts[existingIdx], ...patch }
    accountsStore.write(accounts)
    return accounts[existingIdx]
  }
  return null
}
