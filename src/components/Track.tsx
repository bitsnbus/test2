import { useRef, useState } from 'react'
import type { TrackState } from '../types'
import type { TrackNode } from '../audio/TrackNode'
import { WaveformDisplay } from './WaveformDisplay'
import { FrequencyDisplay } from './FrequencyDisplay'
import { VolumeSlider } from './VolumeSlider'
import { PanKnob } from './PanKnob'
import { formatTime } from '../utils/audio'

interface Props {
  track: TrackState
  node: TrackNode | undefined
  onLoadFile: (id: string, file: File) => void
  onVolumeChange: (id: string, v: number) => void
  onPanChange: (id: string, pan: number) => void
  onMuteToggle: (id: string, muted: boolean) => void
  onSoloToggle: (id: string, solo: boolean) => void
  onRemove: (id: string) => void
}

export function Track({ track, node, onLoadFile, onVolumeChange, onPanChange, onMuteToggle, onSoloToggle, onRemove }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [showFFT, setShowFFT] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onLoadFile(track.id, file)
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-gray-800 p-4 shadow-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-white truncate max-w-[160px]" title={track.name}>
          {track.name}
        </span>
        <div className="flex items-center gap-2">
          {track.isLoaded && (
            <span className="text-xs text-gray-400">{formatTime(track.duration)}</span>
          )}
          <button
            onClick={() => setShowFFT(v => !v)}
            className={`rounded px-2 py-0.5 text-xs font-bold transition-colors ${
              showFFT ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Toggle FFT"
          >
            FFT
          </button>
          <button
            onClick={() => onSoloToggle(track.id, !track.solo)}
            className={`rounded px-2 py-0.5 text-xs font-bold transition-colors ${
              track.solo ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            S
          </button>
          <button
            onClick={() => onMuteToggle(track.id, !track.muted)}
            className={`rounded px-2 py-0.5 text-xs font-bold transition-colors ${
              track.muted ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            M
          </button>
          <button
            onClick={() => onRemove(track.id)}
            className="rounded px-2 py-0.5 text-xs text-gray-400 hover:bg-red-900 hover:text-red-300 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Waveform */}
      <WaveformDisplay node={node} isPlaying={track.isPlaying} />

      {/* FFT */}
      {showFFT && <FrequencyDisplay node={node} isPlaying={track.isPlaying} />}

      {/* Controls */}
      <div className="flex items-end justify-between gap-4 pt-1">
        <VolumeSlider value={track.volume} onChange={v => onVolumeChange(track.id, v)} />
        <PanKnob value={track.pan} onChange={pan => onPanChange(track.id, pan)} />
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded bg-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-600 transition-colors"
          >
            {track.isLoaded ? 'Replace' : 'Load file'}
          </button>
          <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>
    </div>
  )
}
