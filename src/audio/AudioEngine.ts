/**
 * Singleton AudioContext + master gain.
 * Call getContext() to lazily create — must be triggered by a user gesture
 * to satisfy browser autoplay policy.
 */
let ctx: AudioContext | null = null
let masterGain: GainNode | null = null

export function getContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    masterGain = ctx.createGain()
    masterGain.connect(ctx.destination)
  }
  return ctx
}

export function getMasterGain(): GainNode {
  getContext()
  return masterGain!
}

export function setMasterVolume(linear: number): void {
  getMasterGain().gain.setTargetAtTime(linear, getContext().currentTime, 0.01)
}

export async function resumeContext(): Promise<void> {
  const context = getContext()
  if (context.state === 'suspended') await context.resume()
}

export async function decodeFile(file: File): Promise<AudioBuffer> {
  const context = getContext()
  const arrayBuffer = await file.arrayBuffer()
  return context.decodeAudioData(arrayBuffer)
}
