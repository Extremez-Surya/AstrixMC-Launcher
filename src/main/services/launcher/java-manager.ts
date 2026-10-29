import { execSync } from 'child_process'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import type { JavaInstallation } from '../../../shared/types/version'

/**
 * Parses java version and architecture from the `release` file inside Java home,
 * or falls back to running `java.exe -version`.
 */
function inspectJava(executablePath: string): JavaInstallation | null {
  if (!existsSync(executablePath)) return null

  // On Windows, javaw.exe does not write to standard console streams. Use companion java.exe for version querying.
  const testExe = executablePath.endsWith('javaw.exe')
    ? executablePath.replace(/javaw\.exe$/, 'java.exe')
    : executablePath

  const javaHome = join(executablePath, '..', '..')
  const releaseFile = join(javaHome, 'release')

  let version = ''
  let is64Bit = true

  if (existsSync(releaseFile)) {
    try {
      const content = readFileSync(releaseFile, 'utf-8')
      const versionMatch = content.match(/JAVA_VERSION="([^"]+)"/)
      const archMatch = content.match(/OS_ARCH="([^"]+)"/)

      if (versionMatch) version = versionMatch[1]
      if (archMatch && archMatch[1].includes('x86') && !archMatch[1].includes('64')) {
        is64Bit = false
      }
    } catch {
      // Fallback
    }
  }

  if (!version && existsSync(testExe)) {
    try {
      // Note: java -version writes output to stderr on standard JVMs, redirect 2>&1
      const output = execSync(`"${testExe}" -version 2>&1`, {
        encoding: 'utf-8',
        timeout: 3000
      })
      const match = output.match(/(?:java|openjdk) version "([^"]+)"/)
      if (match) version = match[1]
      if (output.includes('64-Bit')) is64Bit = true
    } catch (err: any) {
      const errOut = String(err?.stderr || err?.stdout || '')
      const match = errOut.match(/(?:java|openjdk) version "([^"]+)"/)
      if (match) version = match[1]
      if (errOut.includes('64-Bit')) is64Bit = true
    }
  }

  if (!version) {
    version = 'Java Runtime'
  }

  return {
    path: executablePath,
    version,
    is64Bit
  }
}

/**
 * Extracts numeric major version from Java version string (e.g., "25.0.4" -> 25, "1.8.0_351" -> 8).
 */
export function parseJavaMajorVersion(versionStr: string): number {
  if (!versionStr) return 0
  if (versionStr.startsWith('1.')) {
    const parts = versionStr.split('.')
    return parseInt(parts[1], 10) || 8
  }
  const match = versionStr.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

/**
 * Returns the recommended Java major version for a given Minecraft version string.
 */
export function getRequiredJavaMajor(mcVersion: string): number {
  if (!mcVersion) return 21
  const parts = mcVersion.split('.').map(Number)
  const major = parts[0] ?? 1
  const minor = parts[1] ?? 0
  const patch = parts[2] ?? 0

  // Modern Minecraft 26.x+ uses Mojang java-runtime-epsilon (Java 25)
  if (major >= 26) {
    return 25
  }

  // Classic & Modern 1.x version series:
  if (major === 1) {
    if (minor <= 16) return 8 // 1.16.5 and below
    if (minor <= 20 && (minor < 20 || patch <= 4)) return 17 // 1.17 to 1.20.4
    return 21 // 1.20.5 and 1.21+
  }

  return 21
}

/**
 * Searches the Windows filesystem and PATH for installed Java runtimes.
 */
export function detectJavaInstallations(): JavaInstallation[] {
  const detectedPaths = new Set<string>()
  const results: JavaInstallation[] = []

  const addIfValid = (exePath: string) => {
    if (!exePath) return
    const normalized = exePath.trim()
    if (detectedPaths.has(normalized.toLowerCase())) return
    const inspected = inspectJava(normalized)
    if (inspected) {
      detectedPaths.add(normalized.toLowerCase())
      results.push(inspected)
    }
  }

  // 1. Check JAVA_HOME
  const javaHome = process.env['JAVA_HOME']
  if (javaHome) {
    addIfValid(join(javaHome, 'bin', 'javaw.exe'))
    addIfValid(join(javaHome, 'bin', 'java.exe'))
  }

  // 2. Check PATH via 'where.exe javaw' & 'where.exe java'
  try {
    const whereJavaw = execSync('where.exe javaw 2>nul', { encoding: 'utf-8' })
    whereJavaw
      .split(/\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach(addIfValid)
  } catch {
    // Ignore
  }

  try {
    const whereJava = execSync('where.exe java 2>nul', { encoding: 'utf-8' })
    whereJava
      .split(/\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach(addIfValid)
  } catch {
    // Ignore
  }

  // 3. Scan common Windows installation folders & official launcher runtimes
  const searchRoots = [
    'C:\\Program Files\\Java',
    'C:\\Program Files (x86)\\Java',
    'C:\\Program Files\\Eclipse Adoptium',
    'C:\\Program Files\\BellSoft',
    'C:\\Program Files\\Microsoft',
    'C:\\Program Files\\Zulu',
    'C:\\Program Files\\Amazon Corretto',
    'C:\\Program Files\\Common Files\\Oracle\\Java\\javapath'
  ]

  const appData = process.env['APPDATA']
  if (appData) {
    searchRoots.push(join(appData, '.minecraft', 'runtime'))
  }
  const localAppData = process.env['LOCALAPPDATA']
  if (localAppData) {
    searchRoots.push(
      join(localAppData, 'Packages', 'Microsoft.4297127D64C57_8wekyb3d8bbwe', 'LocalCache', 'Local', 'runtime')
    )
    searchRoots.push(join(localAppData, 'Programs', 'Eclipse Adoptium'))
  }
  const userProfile = process.env['USERPROFILE']
  if (userProfile) {
    searchRoots.push(join(userProfile, '.jdks'))
  }

  function scanFolder(folder: string, depth = 0): void {
    if (depth > 3 || !existsSync(folder)) return
    try {
      addIfValid(join(folder, 'javaw.exe'))
      addIfValid(join(folder, 'java.exe'))
      addIfValid(join(folder, 'bin', 'javaw.exe'))
      addIfValid(join(folder, 'bin', 'java.exe'))

      const entries = readdirSync(folder, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'node_modules') {
          scanFolder(join(folder, entry.name), depth + 1)
        }
      }
    } catch {
      // Ignore
    }
  }

  for (const root of searchRoots) {
    scanFolder(root)
  }

  // Sort installations: prioritize stable LTS versions (25, 21, 17, 8) and 64-bit runtimes over bleeding-edge 26+
  results.sort((a, b) => {
    const majorA = parseJavaMajorVersion(a.version)
    const majorB = parseJavaMajorVersion(b.version)

    // Penalize Java 26+ because it breaks Fabric/Mixin without upstream patches
    const scoreA = majorA >= 26 ? majorA - 100 : majorA
    const scoreB = majorB >= 26 ? majorB - 100 : majorB

    if (scoreB !== scoreA) {
      return scoreB - scoreA
    }
    // Prefer javaw.exe on Windows
    const aIsJavaw = a.path.toLowerCase().endsWith('javaw.exe') ? 1 : 0
    const bIsJavaw = b.path.toLowerCase().endsWith('javaw.exe') ? 1 : 0
    return bIsJavaw - aIsJavaw
  })

  return results
}

/**
 * Normalizes javaw.exe to java.exe on Windows.
 * In Node.js child_process, javaw.exe calls FreeConsole() which cuts stdio pipes and causes exit code -5 / 4294967291.
 * java.exe keeps pipes intact and runs silently when spawned with windowsHide: true.
 */
export function normalizeJavaExe(exePath: string): string {
  if (!exePath) return exePath
  if (exePath.toLowerCase().endsWith('javaw.exe')) {
    const companion = exePath.replace(/javaw\.exe$/i, 'java.exe')
    if (existsSync(companion)) return companion
  }
  return exePath
}

/**
 * Finds the most compatible Java installation path for a specific Minecraft version.
 * Automatically resolves Mojang runtime (Java 25 for 26.x, Java 21 for 1.21+, Java 17 for 1.20, Java 8 for legacy).
 */
export function findBestJavaForVersion(mcVersion: string, preferredPath?: string): string | null {
  const installed = detectJavaInstallations()
  if (installed.length === 0) return null

  const requiredMajor = getRequiredJavaMajor(mcVersion)

  // If a preferredPath was configured and is valid
  if (preferredPath && existsSync(preferredPath)) {
    const inspected = inspectJava(preferredPath)
    if (inspected) {
      const preferredMajor = parseJavaMajorVersion(inspected.version)
      // Accept preferred if it's an exact match or compatible (and strictly not Java 26+ on modern Fabric)
      if (preferredMajor === requiredMajor || (preferredMajor <= 25 && preferredMajor >= requiredMajor)) {
        return normalizeJavaExe(preferredPath)
      }
    }
  }

  // 1. Exact major match (prefer java.exe and 64-bit)
  const exactMatches = installed.filter((j) => parseJavaMajorVersion(j.version) === requiredMajor)
  if (exactMatches.length > 0) {
    const best =
      exactMatches.find((j) => j.path.toLowerCase().endsWith('java.exe') && !j.path.toLowerCase().endsWith('javaw.exe') && j.is64Bit) ||
      exactMatches.find((j) => j.is64Bit) ||
      exactMatches[0]
    return normalizeJavaExe(best.path)
  }

  // 2. Compatible match (strictly avoid Java 26+ as it breaks Mixin / LWJGL)
  const candidates = installed.filter((j) => {
    const major = parseJavaMajorVersion(j.version)
    if (major >= 26) return false
    if (requiredMajor === 8) return major === 8
    if (requiredMajor === 17) return major >= 17 && major <= 21
    if (requiredMajor === 21) return major >= 21 && major <= 25
    if (requiredMajor === 25) return major >= 21 && major <= 25
    return true
  })

  if (candidates.length > 0) {
    candidates.sort((a, b) => {
      const distA = Math.abs(parseJavaMajorVersion(a.version) - requiredMajor)
      const distB = Math.abs(parseJavaMajorVersion(b.version) - requiredMajor)
      if (distA !== distB) return distA - distB
      const aIsJava = a.path.toLowerCase().endsWith('java.exe') && !a.path.toLowerCase().endsWith('javaw.exe') ? 1 : 0
      const bIsJava = b.path.toLowerCase().endsWith('java.exe') && !b.path.toLowerCase().endsWith('javaw.exe') ? 1 : 0
      return bIsJava - aIsJava
    })
    return normalizeJavaExe(candidates[0].path)
  }

  // 3. Fallback: first runtime under version 26, or first available
  const safe = installed.find((j) => parseJavaMajorVersion(j.version) < 26)
  return normalizeJavaExe(safe ? safe.path : installed[0].path)
}
