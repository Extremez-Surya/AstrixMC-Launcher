const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const outputDir = path.join(__dirname, '../ui_screenshots')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const mockInstances = [
  {
    id: 'inst-1',
    name: 'Astrix Competitive 1.21.4',
    icon: 'default',
    mcVersion: '1.21.4',
    modLoader: { type: 'fabric', version: '0.16.9' },
    memoryMin: '2048',
    memoryMax: '4096',
    gameDirectory: 'D:/astrixmclauncher/instances/inst-1',
    created: new Date().toISOString()
  },
  {
    id: 'inst-2',
    name: 'PvP Bedwars 1.8.9',
    icon: 'default',
    mcVersion: '1.8.9',
    modLoader: { type: 'vanilla', version: '' },
    memoryMin: '2048',
    memoryMax: '4096',
    gameDirectory: 'D:/astrixmclauncher/instances/inst-2',
    created: new Date().toISOString()
  },
  {
    id: 'inst-3',
    name: 'Sodium Ultra FPS 1.20.1',
    icon: 'default',
    mcVersion: '1.20.1',
    modLoader: { type: 'fabric', version: '0.15.11' },
    memoryMin: '4096',
    memoryMax: '6144',
    gameDirectory: 'D:/astrixmclauncher/instances/inst-3',
    created: new Date().toISOString()
  }
]

const mockMods = [
  {
    id: 'sodium',
    name: 'Sodium',
    description: 'Modern rendering engine and FPS optimization mod for Minecraft',
    author: 'jellysquid3',
    downloads: 38200000,
    iconUrl: 'https://cdn.modrinth.com/data/AANobbMI/icon.png',
    categories: ['Optimization'],
    installed: false,
    source: 'modrinth'
  },
  {
    id: 'iris',
    name: 'Iris Shaders',
    description: 'A modern shaders mod for Minecraft compatible with Sodium',
    author: 'coderbot',
    downloads: 24500000,
    iconUrl: 'https://cdn.modrinth.com/data/YL57xq9U/icon.png',
    categories: ['Shaders', 'Optimization'],
    installed: false,
    source: 'modrinth'
  },
  {
    id: 'lithium',
    name: 'Lithium',
    description: 'General-purpose optimization mod improving game physics, mob AI, and ticking',
    author: 'jellysquid3',
    downloads: 29800000,
    iconUrl: 'https://cdn.modrinth.com/data/gvQqBUqZ/icon.png',
    categories: ['Optimization'],
    installed: true,
    source: 'modrinth'
  },
  {
    id: 'fabric-api',
    name: 'Fabric API',
    description: 'Core library for Fabric modding ecosystem',
    author: 'modmuss50',
    downloads: 85200000,
    iconUrl: 'https://cdn.modrinth.com/data/P7dR8mSH/icon.png',
    categories: ['Library'],
    installed: true,
    source: 'modrinth'
  }
]

async function run() {
  await app.whenReady()

  ipcMain.handle('auth:get-accounts', () => [
    {
      id: 'offline-alone',
      username: 'Alone_',
      uuid: '00000000-0000-0000-0000-000000000001',
      type: 'offline',
      isDefault: true
    }
  ])

  ipcMain.handle('instances:list', () => mockInstances)
  ipcMain.handle('instances:get-all', () => mockInstances)
  ipcMain.handle('instances:get-detail', (_e, id) => mockInstances.find(i => i.id === id) || mockInstances[0])

  ipcMain.handle('settings:get', () => ({
    javaPath: 'C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.2\\bin\\javaw.exe',
    memoryMin: '2048',
    memoryMax: '4096',
    jvmArgs: '-XX:+UseZGC -XX:+ZGenerational -XX:+UnlockExperimentalVMOptions',
    resolutionWidth: 1920,
    resolutionHeight: 1080,
    autoConnectServer: 'play.astrixmc.net'
  }))

  ipcMain.handle('launch:get-java', () => [
    { path: 'C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.2\\bin\\javaw.exe', version: '21.0.2', isJava21: true },
    { path: 'C:\\Program Files\\Java\\jdk-17\\bin\\javaw.exe', version: '17.0.9', isJava21: false }
  ])

  ipcMain.handle('launch:get-versions', () => ({
    releases: [
      { id: '1.21.4', type: 'release' },
      { id: '1.21.1', type: 'release' },
      { id: '1.20.1', type: 'release' },
      { id: '1.8.9', type: 'release' }
    ],
    snapshots: []
  }))

  ipcMain.handle('mods:search', () => mockMods)

  ipcMain.handle('mods:list-installed', () => [
    { name: 'Sodium', version: '0.6.0', enabled: true, filename: 'sodium-fabric-0.6.0.jar' },
    { name: 'Iris Shaders', version: '1.8.0', enabled: true, filename: 'iris-fabric-1.8.0.jar' },
    { name: 'Lithium', version: '0.12.7', enabled: true, filename: 'lithium-fabric-0.12.7.jar' }
  ])

  ipcMain.handle('cosmetics:get', () => ({
    selectedSkin: 'default',
    selectedCape: 'astrix_crimson',
    activeWings: 'dragon_dark',
    equipped: ['astrix_crimson', 'dragon_dark']
  }))
  ipcMain.handle('cosmetics:save', () => ({ success: true }))

  ipcMain.handle('window:is-maximized', () => false)

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../out/preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  const htmlPath = path.join(__dirname, '../out/renderer/index.html')
  await win.loadFile(htmlPath)

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  await sleep(1500)

  const routes = [
    { path: '/', name: '01_home_dashboard.png' },
    { path: '/instances', name: '02_play_and_instances.png' },
    { path: '/mods', name: '03_mods_and_shaders.png' },
    { path: '/downloads', name: '04_downloads_center.png' },
    { path: '/news', name: '05_whats_new.png' },
    { path: '/settings', name: '06_launcher_settings.png' },
    { path: '/accounts', name: '07_accounts_manager.png' },
    { path: '/wardrobe', name: '08_wardrobe_cosmetics.png' },
    { path: '/skin-studio', name: '09_skin_studio.png' },
    { path: '/client-hud', name: '10_client_hud.png' },
    { path: '/servers', name: '11_servers_browser.png' },
    { path: '/performance', name: '12_performance_engine.png' }
  ]

  for (const r of routes) {
    console.log(`Navigating to route: ${r.path} -> ${r.name}...`)
    await win.webContents.executeJavaScript(`
      window.location.hash = '#${r.path}';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      window.dispatchEvent(new PopStateEvent('popstate'));
    `)
    await sleep(1500)

    const image = await win.webContents.capturePage()
    const buffer = image.toPNG()
    const filePath = path.join(outputDir, r.name)
    fs.writeFileSync(filePath, buffer)
    console.log(`Saved screenshot: ${filePath} (${buffer.length} bytes)`)
  }

  // Capture Login Screen by launching a second window without account
  console.log('Capturing Login screen with fresh window...')
  ipcMain.removeHandler('auth:get-accounts')
  ipcMain.handle('auth:get-accounts', () => [])

  const loginWin = new BrowserWindow({
    width: 1440,
    height: 900,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../out/preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })
  await loginWin.loadFile(htmlPath)
  await sleep(2000)

  const loginImg = await loginWin.webContents.capturePage()
  fs.writeFileSync(path.join(outputDir, '00_login_screen.png'), loginImg.toPNG())
  console.log('Saved 00_login_screen.png')

  console.log('All screenshots captured successfully!')
  app.quit()
}

run().catch((err) => {
  console.error('Error during capture:', err)
  app.quit()
})
