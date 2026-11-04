import { totalmem, freemem } from 'os'

export interface SmartRamProfile {
  totalSystemGb: number
  freeSystemGb: number
  safeMaxGb: number
  allocatedMinGb: number
  allocatedMaxGb: number
  jvmArgs: string[]
  reason?: string
}

/**
 * Intelligent RAM & JVM Auto-Budgeter.
 * Prevents OS Out-Of-Memory (OOM) kills and 0xC0000005 Access Violation crashes
 * by calculating physical RAM bounds, reserving memory for Windows & GPU off-heap buffers,
 * and injecting low-latency GC flags (Generational ZGC / tuned G1GC).
 */
export function computeSmartRam(
  requestedMin?: number,
  requestedMax?: number,
  javaMajor = 21
): SmartRamProfile {
  const totalBytes = totalmem()
  const freeBytes = freemem()
  const totalSystemGb = Math.round(totalBytes / (1024 * 1024 * 1024))
  const freeSystemGb = Number((freeBytes / (1024 * 1024 * 1024)).toFixed(1))

  // Operating System & GPU Buffer Reservation:
  // For 8GB total systems: reserve 2.5GB for Windows/GPU shaders. Safe Max = 4GB-5.5GB.
  // For 16GB total systems: reserve 3.5GB. Safe Max = 8GB-12GB.
  const osReserveGb = totalSystemGb <= 8 ? 2.5 : totalSystemGb <= 16 ? 3.5 : 4.0
  const safeMaxGb = Math.max(2, Math.floor(totalSystemGb - osReserveGb))

  let targetMax = requestedMax ? Number(requestedMax) : (totalSystemGb <= 8 ? 4 : 5)
  if (targetMax > 64) {
    targetMax = Math.round(targetMax / 1024)
  }

  let reason = ''
  // If user requested more than safeMaxGb (e.g. 6GB on 8GB machine), clamp it
  if (targetMax > safeMaxGb) {
    reason = `Smart RAM Guard: Clamped requested ${targetMax}GB to safe limit ${safeMaxGb}GB to prevent 0xC0000005 Windows crash (System RAM: ${totalSystemGb}GB, OS Reserve: ${osReserveGb}GB).`
    targetMax = safeMaxGb
  }

  // Ensure minimum viable allocation for modern Minecraft (1.20+)
  if (targetMax < 3 && safeMaxGb >= 3) {
    targetMax = 3
  }

  let targetMin = requestedMin ? Number(requestedMin) : 1
  if (targetMin > 64) targetMin = Math.round(targetMin / 1024)
  if (targetMin > targetMax) {
    targetMin = Math.max(1, Math.floor(targetMax / 2))
  }

  const jvmArgs: string[] = [
    // Prevent unbounded off-heap Metaspace leaks
    '-XX:MaxMetaspaceSize=512M',
    // Bound direct NIO buffers for LWJGL/OpenGL/Vulkan shaders
    '-XX:MaxDirectMemorySize=1536M',
    '-XX:+UnlockDiagnosticVMOptions'
  ]

  // Modern Low-Latency Garbage Collection:
  // On Java 21+ with >= 8GB RAM, Generational ZGC delivers sub-millisecond GC pauses
  if (javaMajor >= 21 && totalSystemGb >= 8) {
    jvmArgs.push(
      '-XX:+UseZGC',
      '-XX:+ZGenerational'
    )
  } else {
    // Highly optimized G1GC bounds for smooth 144+ FPS without frame hiccups
    jvmArgs.push(
      '-XX:+UseG1GC',
      '-XX:G1NewSizePercent=20',
      '-XX:G1ReservePercent=20',
      '-XX:MaxGCPauseMillis=40',
      '-XX:G1HeapRegionSize=32M'
    )
  }

  // Native String deduplication & optimization
  jvmArgs.push(
    '-XX:+OptimizeStringConcat',
    '-XX:+UseStringDeduplication'
  )

  return {
    totalSystemGb,
    freeSystemGb,
    safeMaxGb,
    allocatedMinGb: targetMin,
    allocatedMaxGb: targetMax,
    jvmArgs,
    reason
  }
}

