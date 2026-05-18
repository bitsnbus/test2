export interface TrackConfig {
  id: string
  name: string
  file: File | null
}

export interface TrackState {
  id: string
  name: string
  volume: number   // 0–1
  pan: number      // -1 (L) to 1 (R)
  muted: boolean
  solo: boolean
  isLoaded: boolean
  isPlaying: boolean
  duration: number // seconds
}

export interface MixerState {
  tracks: TrackState[]
  isPlaying: boolean
  masterVolume: number
}
