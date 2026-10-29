# ⚡ AstrixMC Launcher

<p align="center">
  <img src="resources/icon.ico" width="128" height="128" alt="AstrixMC Launcher Logo" />
</p>

<p align="center">
  <b>High-Performance Next-Gen Custom Minecraft Launcher</b><br />
  Engineered for Maximum FPS, Instant Modpack Installations, and Seamless Multiplayer Gaming.
</p>

<p align="center">
  <a href="https://github.com/Extremez-Surya/AstrixMC-Launcher/releases"><img src="https://img.shields.io/github/v/release/Extremez-Surya/AstrixMC-Launcher?color=cyan&label=Latest%20Release" alt="Latest Release" /></a>
  <img src="https://img.shields.io/badge/Platform-Windows%20x64-blue" alt="Windows x64" />
  <img src="https://img.shields.io/badge/Framework-Electron%20%7C%20React%20%7C%20TypeScript-61dafb" alt="Tech Stack" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

---

## 🚀 Key Features

* **⚡ 1-Click FPS Beast Pack**: Automatically installs Sodium, Iris Shaders, Lithium, FerriteCore, Entity Culling, Krypton, and BadOptimizations tailored to your Minecraft version.
* **📦 Modrinth & CurseForge Integration**: Search, browse, and 1-click install thousands of mods, resource packs, and shaders directly from the launcher.
* **🛡️ Dual Login Support**: Full official Microsoft OAuth 2.0 authentication and offline / local accounts with custom skin rendering.
* **🔄 In-App Silent Auto-Updater**: Instant in-place launcher updates without manual re-installation.
* **☕ Intelligent Java Runtime Resolver**: Auto-detects and isolates the exact compatible Java version (Java 25 for MC 26.x, Java 21 for 1.21+, Java 17 for 1.20, Java 8 for legacy).
* **🎮 Discord Rich Presence (RPC)**: Displays live in-game status, server address, and Minecraft version on your Discord profile.
* **🎨 Custom Client UI Studio**: Customize your in-game title screen, buttons, and panoramas.

---

## 📥 Download & Install

Get the latest verified Windows installer from the [Releases Page](https://github.com/Extremez-Surya/AstrixMC-Launcher/releases):

1. Download **`AstrixMC-Launcher-Setup-1.0.0.exe`**.
2. Run the setup installer and follow the quick setup wizard.
3. Launch and enjoy 200+ FPS Minecraft!

---

## 🛠️ Development & Building from Source

### Prerequisites
* [Node.js](https://nodejs.org/) (v20 or higher recommended)
* [Git](https://git-scm.com/)

### Clone and Install
```bash
git clone https://github.com/Extremez-Surya/AstrixMC-Launcher.git
cd AstrixMC-Launcher
npm install
```

### Run in Development Mode
```bash
npm run dev
```

### Build Production Binary
```bash
# Build web and main bundles
npm run build

# Package Windows NSIS Installer (.exe)
npx electron-builder --win
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
