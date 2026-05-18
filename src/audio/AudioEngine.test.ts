import { describe, it, expect, vi, beforeEach } from 'vitest'

// Each test gets a fresh AudioEngine module (singleton reset) via resetModules.
describe('AudioEngine', () => {
  type EngineModule = typeof import('./AudioEngine')
  let mod: EngineModule

  beforeEach(async () => {
    vi.resetModules()
    mod = await import('./AudioEngine')
  })

  describe('getContext', () => {
    it('creates an AudioContext on the first call', () => {
      const ctx = mod.getContext()
      expect(ctx).toBeDefined()
    })

    it('returns the same instance on subsequent calls (singleton)', () => {
      const ctx1 = mod.getContext()
      const ctx2 = mod.getContext()
      expect(ctx1).toBe(ctx2)
    })

    it('creates a master gain node wired to destination', () => {
      const ctx = mod.getContext() as unknown as { createGain: ReturnType<typeof vi.fn>; destination: object }
      // createGain is called once inside getContext() for the master gain
      expect(ctx.createGain).toHaveBeenCalledTimes(1)
    })
  })

  describe('getMasterGain', () => {
    it('returns a gain node', () => {
      const gain = mod.getMasterGain()
      expect(gain).toBeDefined()
      expect(gain.gain).toBeDefined()
    })

    it('returns the same node on subsequent calls', () => {
      const g1 = mod.getMasterGain()
      const g2 = mod.getMasterGain()
      expect(g1).toBe(g2)
    })
  })

  describe('setMasterVolume', () => {
    it('calls setTargetAtTime on the master gain', () => {
      const gain = mod.getMasterGain()
      mod.setMasterVolume(0.5)
      expect(gain.gain.setTargetAtTime).toHaveBeenCalledWith(0.5, expect.any(Number), 0.01)
    })

    it('sets to 0 for silence', () => {
      const gain = mod.getMasterGain()
      mod.setMasterVolume(0)
      expect(gain.gain.setTargetAtTime).toHaveBeenCalledWith(0, expect.any(Number), 0.01)
    })
  })

  describe('resumeContext', () => {
    it('calls resume() when context is suspended', async () => {
      const ctx = mod.getContext() as unknown as { state: string; resume: ReturnType<typeof vi.fn> }
      ctx.state = 'suspended'
      await mod.resumeContext()
      expect(ctx.resume).toHaveBeenCalledTimes(1)
    })

    it('does not call resume() when context is already running', async () => {
      const ctx = mod.getContext() as unknown as { state: string; resume: ReturnType<typeof vi.fn> }
      ctx.state = 'running'
      await mod.resumeContext()
      expect(ctx.resume).not.toHaveBeenCalled()
    })
  })

  describe('decodeFile', () => {
    it('calls decodeAudioData and returns an AudioBuffer', async () => {
      const file = new File([new ArrayBuffer(8)], 'test.wav', { type: 'audio/wav' })
      const buffer = await mod.decodeFile(file)
      expect(buffer).toBeDefined()
      expect(buffer.duration).toBe(120)
    })
  })
})
