import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TrackNode } from './TrackNode'
import { getContext } from './AudioEngine'

const mockBuffer = { duration: 30, length: 1323000, sampleRate: 44100 } as unknown as AudioBuffer

describe('TrackNode', () => {
  let node: TrackNode
  // Typed access to the mock AudioContext instance
  let ctx: ReturnType<typeof getContext> & {
    createGain: ReturnType<typeof vi.fn>
    createStereoPanner: ReturnType<typeof vi.fn>
    createAnalyser: ReturnType<typeof vi.fn>
    createBufferSource: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // getContext() is a singleton within this test file — clear mocks but keep instance
    vi.clearAllMocks()
    ctx = getContext() as typeof ctx
    node = new TrackNode()
  })

  describe('constructor', () => {
    it('creates a gain, panner, and analyser node', () => {
      // Each TrackNode constructor calls createGain, createStereoPanner, createAnalyser
      expect(ctx.createGain).toHaveBeenCalled()
      expect(ctx.createStereoPanner).toHaveBeenCalled()
      expect(ctx.createAnalyser).toHaveBeenCalled()
    })

    it('exposes an analyser with fftSize 2048', () => {
      expect(node.analyser).toBeDefined()
      expect(node.analyser.fftSize).toBe(2048)
    })
  })

  describe('load / duration', () => {
    it('returns 0 before a buffer is loaded', () => {
      expect(node.duration).toBe(0)
    })

    it('returns the buffer duration after loading', () => {
      node.load(mockBuffer)
      expect(node.duration).toBe(30)
    })

    it('replaces the buffer on subsequent loads', () => {
      const other = { duration: 60 } as unknown as AudioBuffer
      node.load(mockBuffer)
      node.load(other)
      expect(node.duration).toBe(60)
    })
  })

  describe('isPlaying', () => {
    it('is false by default', () => {
      expect(node.isPlaying).toBe(false)
    })
  })

  describe('play', () => {
    it('does nothing without a loaded buffer', () => {
      node.play()
      expect(node.isPlaying).toBe(false)
      expect(ctx.createBufferSource).not.toHaveBeenCalled()
    })

    it('sets isPlaying to true when a buffer is loaded', () => {
      node.load(mockBuffer)
      node.play()
      expect(node.isPlaying).toBe(true)
    })

    it('creates and starts a BufferSourceNode', () => {
      node.load(mockBuffer)
      node.play()
      expect(ctx.createBufferSource).toHaveBeenCalledTimes(1)
      const src = ctx.createBufferSource.mock.results[0]?.value
      expect(src.start).toHaveBeenCalledWith(0, 0)
    })

    it('passes the offset to start()', () => {
      node.load(mockBuffer)
      node.play(10)
      const src = ctx.createBufferSource.mock.results[0]?.value
      expect(src.start).toHaveBeenCalledWith(0, 10)
    })

    it('is a no-op when already playing', () => {
      node.load(mockBuffer)
      node.play()
      node.play()
      expect(ctx.createBufferSource).toHaveBeenCalledTimes(1)
    })

    it('resets isPlaying when the source fires onended', () => {
      node.load(mockBuffer)
      node.play()
      const src = ctx.createBufferSource.mock.results[0]?.value
      src.onended?.()
      expect(node.isPlaying).toBe(false)
    })
  })

  describe('stop', () => {
    it('does nothing when not playing', () => {
      expect(() => node.stop()).not.toThrow()
      expect(node.isPlaying).toBe(false)
    })

    it('sets isPlaying to false', () => {
      node.load(mockBuffer)
      node.play()
      node.stop()
      expect(node.isPlaying).toBe(false)
    })

    it('calls stop() on the source node', () => {
      node.load(mockBuffer)
      node.play()
      const src = ctx.createBufferSource.mock.results[0]?.value
      node.stop()
      expect(src.stop).toHaveBeenCalledTimes(1)
    })
  })

  describe('currentTime', () => {
    it('returns 0 when idle with no prior offset', () => {
      expect(node.currentTime).toBe(0)
    })

    it('preserves the offset when stopped', () => {
      node.load(mockBuffer)
      node.play(5)
      node.stop()
      expect(node.currentTime).toBe(5)
    })
  })

  describe('setVolume', () => {
    it('calls setTargetAtTime on the gain node', () => {
      node.setVolume(0.5)
      const gainNode = ctx.createGain.mock.results[0]?.value
      expect(gainNode.gain.setTargetAtTime).toHaveBeenCalledWith(0.5, expect.any(Number), 0.01)
    })
  })

  describe('setPan', () => {
    it('calls setTargetAtTime on the panner node', () => {
      node.setPan(-0.5)
      const pannerNode = ctx.createStereoPanner.mock.results[0]?.value
      expect(pannerNode.pan.setTargetAtTime).toHaveBeenCalledWith(-0.5, expect.any(Number), 0.01)
    })
  })

  describe('setMuted', () => {
    it('sets gain to 0 when muting', () => {
      node.setMuted(true)
      const gainNode = ctx.createGain.mock.results[0]?.value
      expect(gainNode.gain.setTargetAtTime).toHaveBeenCalledWith(0, expect.any(Number), 0.01)
    })

    it('sets gain to 1 when unmuting', () => {
      node.setMuted(false)
      const gainNode = ctx.createGain.mock.results[0]?.value
      expect(gainNode.gain.setTargetAtTime).toHaveBeenCalledWith(1, expect.any(Number), 0.01)
    })
  })

  describe('destroy', () => {
    it('stops playback', () => {
      node.load(mockBuffer)
      node.play()
      node.destroy()
      expect(node.isPlaying).toBe(false)
    })

    it('disconnects all audio nodes', () => {
      node.destroy()
      const gainNode = ctx.createGain.mock.results[0]?.value
      const pannerNode = ctx.createStereoPanner.mock.results[0]?.value
      const analyserNode = ctx.createAnalyser.mock.results[0]?.value
      expect(gainNode.disconnect).toHaveBeenCalled()
      expect(pannerNode.disconnect).toHaveBeenCalled()
      expect(analyserNode.disconnect).toHaveBeenCalled()
    })
  })
})
