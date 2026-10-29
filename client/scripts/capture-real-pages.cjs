const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')

const outputDir = path.join(__dirname, '../ui_screenshots')
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true })
}
fs.mkdirSync(outputDir, { recursive: true })

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
    show: true, // Visible window ensures requestAnimationFrame and GPU rendering runs full speed
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
  await sleep(2500)

  // 1. HOME DASHBOARD
  console.log('Capturing 01_home_dashboard.png...')
  let img = await win.webContents.capturePage()
  fs.writeFileSync(path.join(outputDir, '01_home_dashboard.png'), img.toPNG())
  console.log('Saved 01_home_dashboard.png')

  async function navigateAndCapture(selector, expectedText, fileName) {
    console.log(`Navigating to ${selector} (expecting "${expectedText}") -> ${fileName}...`)
    await win.webContents.executeJavaScript(`
      (() => {
        const link = document.querySelector('${selector}');
        if (link) link.click();
      })()
    `)

    const searchTarget = expectedText.toLowerCase()
    for (let i = 0; i < 25; i++) {
      await sleep(200)
      const found = await win.webContents.executeJavaScript(`
        document.body.innerText.toLowerCase().includes(${JSON.stringify(searchTarget)})
      `)
      if (found) break
    }

    await sleep(800) // Settle animations
    const screenshot = await win.webContents.capturePage()
    fs.writeFileSync(path.join(outputDir, fileName), screenshot.toPNG())
    console.log(`Saved ${fileName}`)
  }

  // 2. PLAY & INSTANCES
  await navigateAndCapture('a[href="#/instances"]', 'Instances & Versions', '02_play_and_instances.png')

  // 3. MODS & SHADERS
  await navigateAndCapture('a[href="#/mods"]', 'Content & Addons', '03_mods_and_shaders.png')

  // 4. DOWNLOADS
  await navigateAndCapture('a[href="#/downloads"]', 'Download Center', '04_downloads_center.png')

  // 5. WHAT'S NEW
  await navigateAndCapture('a[href="#/news"]', "What's New", '05_whats_new.png')

  // 6. SETTINGS
  await navigateAndCapture('a[href="#/settings"]', 'Java Runtime', '06_settings.png')

  // 7. CREATE NEW INSTANCE MODAL (Open from instances page or top bar)
  console.log('Navigating back to Instances to open modal...')
  await win.webContents.executeJavaScript(`
    const instLink = document.querySelector('a[href="#/instances"]');
    if (instLink) instLink.click();
  `)
  await sleep(1000)

  console.log('Clicking NEW INSTANCE button...')
  await win.webContents.executeJavaScript(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('NEW INSTANCE'));
      if (btn) btn.click();
    })()
  `)
  await sleep(1200)
  const modalImg = await win.webContents.capturePage()
  fs.writeFileSync(path.join(outputDir, '07_create_instance_modal.png'), modalImg.toPNG())
  console.log('Saved 07_create_instance_modal.png')

  // Close modal
  await win.webContents.executeJavaScript(`
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  `)
  await sleep(600)

  // 8. COMMAND PALETTE (Ctrl+K)
  console.log('Opening Command Palette...')
  await win.webContents.executeJavaScript(`
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  `)
  await sleep(1200)
  const searchImg = await win.webContents.capturePage()
  fs.writeFileSync(path.join(outputDir, '08_quick_search_palette.png'), searchImg.toPNG())
  console.log('Saved 08_quick_search_palette.png')

  // 9. LOGIN SCREEN (Clean separate window)
  console.log('Capturing Login screen with fresh window...')
  ipcMain.removeHandler('auth:get-accounts')
  ipcMain.handle('auth:get-accounts', () => [])

  const loginWin = new BrowserWindow({
    width: 1440,
    height: 900,
    frame: false,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, '../out/preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })
  await loginWin.loadFile(htmlPath)
  await sleep(2500)

  const loginImg = await loginWin.webContents.capturePage()
  fs.writeFileSync(path.join(outputDir, '00_login_screen.png'), loginImg.toPNG())
  console.log('Saved 00_login_screen.png')

  console.log('ALL REAL CURRENT SCREENSHOTS CAPTURED!')
  app.quit()
}

run().catch((err) => {
  console.error('Error during capture:', err)
  app.quit()
})
