import { useRef } from 'react'
import { useWaveform } from '../hooks/useWaveform'
import type { TrackNode } from '../audio/TrackNode'

interface Props {
  node: TrackNode | undefined
  isPlaying: boolean
}

export function WaveformDisplay({ node, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useWaveform(canvasRef, node, isPlaying)

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={60}
      className="w-full rounded bg-gray-900"
    />
  )
}
