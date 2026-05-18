import { useAudioEngine } from '../hooks/useAudioEngine'
import { Track } from './Track'
import { TransportControls } from './TransportControls'

export function MixerBoard() {
  const {
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
  } = useAudioEngine()

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 flex flex-col gap-6">
      <TransportControls
        isPlaying={isPlaying}
        masterVolume={masterVolume}
        onPlay={play}
        onStop={stop}
        onMasterVolumeChange={changeMasterVolume}
      />

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
        {tracks.map(track => (
          <Track
            key={track.id}
            track={track}
            node={getNode(track.id)}
            onLoadFile={loadFile}
            onVolumeChange={setVolume}
            onPanChange={setPan}
            onMuteToggle={setMuted}
            onSoloToggle={setSolo}
            onRemove={removeTrack}
          />
        ))}

        <button
          onClick={addTrack}
          className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-700 text-gray-500 hover:border-cyan-700 hover:text-cyan-500 transition-colors text-4xl"
          title="Add track"
        >
          +
        </button>
      </div>
    </div>
  )
}
