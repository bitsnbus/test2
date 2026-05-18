import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudioEngine } from './useAudioEngine'

// The module-level nextId in useAudioEngine persists across renders;
// tests capture IDs dynamically instead of assuming specific values.

describe('useAudioEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with no tracks, not playing, and master volume 1', () => {
    const { result } = renderHook(() => useAudioEngine())
    expect(result.current.tracks).toHaveLength(0)
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.masterVolume).toBe(1)
  })

  describe('addTrack', () => {
    it('appends a new track with default state', () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack() })
      expect(result.current.tracks).toHaveLength(1)
      const t = result.current.tracks[0]!
      expect(t.volume).toBe(1)
      expect(t.pan).toBe(0)
      expect(t.muted).toBe(false)
      expect(t.solo).toBe(false)
      expect(t.isLoaded).toBe(false)
    })

    it('assigns unique ids to each track', () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack(); result.current.addTrack() })
      const [a, b] = result.current.tracks
      expect(a!.id).not.toBe(b!.id)
    })
  })

  describe('removeTrack', () => {
    it('removes the track from the list', () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack() })
      const id = result.current.tracks[0]!.id
      act(() => { result.current.removeTrack(id) })
      expect(result.current.tracks).toHaveLength(0)
    })

    it('leaves other tracks intact', () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack(); result.current.addTrack() })
      const [first, second] = result.current.tracks
      act(() => { result.current.removeTrack(first!.id) })
      expect(result.current.tracks).toHaveLength(1)
      expect(result.current.tracks[0]!.id).toBe(second!.id)
    })
  })

  describe('setVolume', () => {
    it('updates the track volume in state', () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack() })
      const id = result.current.tracks[0]!.id
      act(() => { result.current.setVolume(id, 0.42) })
      expect(result.current.tracks[0]!.volume).toBe(0.42)
    })
  })

  describe('setPan', () => {
    it('updates the track pan in state', () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack() })
      const id = result.current.tracks[0]!.id
      act(() => { result.current.setPan(id, -0.5) })
      expect(result.current.tracks[0]!.pan).toBe(-0.5)
    })
  })

  describe('play / stop', () => {
    it('sets isPlaying to true on play', async () => {
      const { result } = renderHook(() => useAudioEngine())
      await act(async () => { await result.current.play() })
      expect(result.current.isPlaying).toBe(true)
    })

    it('sets isPlaying to false on stop', async () => {
      const { result } = renderHook(() => useAudioEngine())
      await act(async () => { await result.current.play() })
      act(() => { result.current.stop() })
      expect(result.current.isPlaying).toBe(false)
    })

    it('marks loaded tracks as playing on play', async () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack() })
      // Simulate a loaded track by triggering loadFile (mocked decodeAudioData returns a buffer)
      const id = result.current.tracks[0]!.id
      const file = new File([new ArrayBuffer(8)], 'a.wav', { type: 'audio/wav' })
      await act(async () => { await result.current.loadFile(id, file) })
      await act(async () => { await result.current.play() })
      expect(result.current.tracks[0]!.isPlaying).toBe(true)
    })

    it('marks all tracks as not playing on stop', async () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack() })
      await act(async () => { await result.current.play() })
      act(() => { result.current.stop() })
      expect(result.current.tracks.every(t => !t.isPlaying)).toBe(true)
    })
  })

  describe('setMuted', () => {
    it('marks the track as muted', () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack() })
      const id = result.current.tracks[0]!.id
      act(() => { result.current.setMuted(id, true) })
      expect(result.current.tracks[0]!.muted).toBe(true)
    })

    it('unmutes the track', () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack() })
      const id = result.current.tracks[0]!.id
      act(() => { result.current.setMuted(id, true) })
      act(() => { result.current.setMuted(id, false) })
      expect(result.current.tracks[0]!.muted).toBe(false)
    })
  })

  describe('setSolo', () => {
    it('marks the track as soloed', () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack() })
      const id = result.current.tracks[0]!.id
      act(() => { result.current.setSolo(id, true) })
      expect(result.current.tracks[0]!.solo).toBe(true)
    })

    it('unsolos when solo is set to false', () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack() })
      const id = result.current.tracks[0]!.id
      act(() => { result.current.setSolo(id, true) })
      act(() => { result.current.setSolo(id, false) })
      expect(result.current.tracks[0]!.solo).toBe(false)
    })

    it('keeps other tracks with solo=false when one is soloed', () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack(); result.current.addTrack() })
      const id1 = result.current.tracks[0]!.id
      act(() => { result.current.setSolo(id1, true) })
      expect(result.current.tracks[1]!.solo).toBe(false)
    })
  })

  describe('changeMasterVolume', () => {
    it('updates the masterVolume state', () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.changeMasterVolume(0.7) })
      expect(result.current.masterVolume).toBe(0.7)
    })
  })

  describe('loadFile', () => {
    it('marks the track as loaded and sets duration', async () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack() })
      const id = result.current.tracks[0]!.id
      const file = new File([new ArrayBuffer(8)], 'track.mp3', { type: 'audio/mp3' })
      await act(async () => { await result.current.loadFile(id, file) })
      const track = result.current.tracks[0]!
      expect(track.isLoaded).toBe(true)
      expect(track.duration).toBe(120) // mocked AudioContext returns duration: 120
      expect(track.name).toBe('track') // file extension stripped
    })
  })

  describe('getNode', () => {
    it('returns the TrackNode for an existing id', () => {
      const { result } = renderHook(() => useAudioEngine())
      act(() => { result.current.addTrack() })
      const id = result.current.tracks[0]!.id
      expect(result.current.getNode(id)).toBeDefined()
    })

    it('returns undefined for an unknown id', () => {
      const { result } = renderHook(() => useAudioEngine())
      expect(result.current.getNode('nonexistent')).toBeUndefined()
    })
  })
})
