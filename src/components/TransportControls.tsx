import { VolumeSlider } from './VolumeSlider'

interface Props {
  isPlaying: boolean
  masterVolume: number
  onPlay: () => void
  onStop: () => void
  onMasterVolumeChange: (v: number) => void
}

export function TransportControls({ isPlaying, masterVolume, onPlay, onStop, onMasterVolumeChange }: Props) {
  return (
    <div className="flex items-center gap-6 rounded-xl bg-gray-800 px-6 py-4 shadow-lg border border-gray-700">
      <span className="text-lg font-bold tracking-widest text-cyan-400">MIXER</span>

      <div className="flex gap-3">
        <button
          onClick={onPlay}
          disabled={isPlaying}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-black text-lg font-bold hover:bg-cyan-400 disabled:opacity-40 transition-colors"
          title="Play"
        >
          ▶
        </button>
        <button
          onClick={onStop}
          disabled={!isPlaying}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 text-white text-lg font-bold hover:bg-gray-500 disabled:opacity-40 transition-colors"
          title="Stop"
        >
          ■
        </button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <VolumeSlider value={masterVolume} onChange={onMasterVolumeChange} label="Master" />
      </div>
    </div>
  )
}
