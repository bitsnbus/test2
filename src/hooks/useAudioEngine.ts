import { useCallback, useRef, useState } from 'react'
import { resumeContext, setMasterVolume, decodeFile } from '../audio/AudioEngine'
import { TrackNode } from '../audio/TrackNode'
import type { TrackState } from '../types'

function makeTrackState(id: string, name: string): TrackState {
  return { id, name, volume: 1, pan: 0, muted: false, solo: false, isLoaded: false, isPlaying: false, duration: 0 }
}

let nextId = 1

export function useAudioEngine() {
  const nodes = useRef<Map<string, TrackNode>>(new Map())
  const [tracks, setTracks] = useState<TrackState[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [masterVolume, setMasterVolumeState] = useState(1)

  const addTrack = useCallback(() => {
    const id = String(nextId++)
    const name = `Track ${id}`
    nodes.current.set(id, new TrackNode())
    setTracks(prev => [...prev, makeTrackState(id, name)])
  }, [])

  const removeTrack = useCallback((id: string) => {
    nodes.current.get(id)?.destroy()
    nodes.current.delete(id)
    setTracks(prev => prev.filter(t => t.id !== id))
  }, [])

  const loadFile = useCallback(async (id: string, file: File) => {
    const node = nodes.current.get(id)
    if (!node) return
    const buffer = await decodeFile(file)
    node.load(buffer)
    setTracks(prev =>
      prev.map(t => t.id === id ? { ...t, isLoaded: true, duration: buffer.duration, name: file.name.replace(/\.[^.]+$/, '') } : t)
    )
  }, [])

  const play = useCallback(async () => {
    await resumeContext()
    nodes.current.forEach(node => node.play())
    setTracks(prev => prev.map(t => ({ ...t, isPlaying: t.isLoaded })))
    setIsPlaying(true)
  }, [])

  const stop = useCallback(() => {
    nodes.current.forEach(node => node.stop())
    setTracks(prev => prev.map(t => ({ ...t, isPlaying: false })))
    setIsPlaying(false)
  }, [])

  const setVolume = useCallback((id: string, volume: number) => {
    nodes.current.get(id)?.setVolume(volume)
    setTracks(prev => prev.map(t => t.id === id ? { ...t, volume } : t))
  }, [])

  const setPan = useCallback((id: string, pan: number) => {
    nodes.current.get(id)?.setPan(pan)
    setTracks(prev => prev.map(t => t.id === id ? { ...t, pan } : t))
  }, [])

  const setMuted = useCallback((id: string, muted: boolean) => {
    setTracks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, muted } : t)
      const anySolo = next.some(t => t.solo)
      next.forEach(t => {
        const silenced = t.muted || (anySolo && !t.solo)
        nodes.current.get(t.id)?.setMuted(silenced)
      })
      return next
    })
  }, [])

  const setSolo = useCallback((id: string, solo: boolean) => {
    setTracks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, solo } : t)
      const anySolo = next.some(t => t.solo)
      next.forEach(t => {
        const silenced = t.muted || (anySolo && !t.solo)
        nodes.current.get(t.id)?.setMuted(silenced)
      })
      return next
    })
  }, [])

  const changeMasterVolume = useCallback((v: number) => {
    setMasterVolume(v)
    setMasterVolumeState(v)
  }, [])

  const getNode = useCallback((id: string) => nodes.current.get(id), [])

  return {
    tracks,
    isPlaying,
    masterVolume,
    addTrack,
    removeTrack,
    loadFile,
    play,
    stop,
    setVolume,
    setPan,
    setMuted,
    setSolo,
    changeMasterVolume,
    getNode,
  }
}
