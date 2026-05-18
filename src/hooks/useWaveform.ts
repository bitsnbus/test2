import { useEffect, useRef } from 'react'
import type { TrackNode } from '../audio/TrackNode'

export function useWaveform(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  node: TrackNode | undefined,
  isPlaying: boolean,
) {
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !node) return

    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return

    const { analyser } = node
    const data = new Uint8Array(analyser.frequencyBinCount)

    function draw() {
      if (!canvas || !ctx2d) return
      analyser.getByteTimeDomainData(data)

      const { width, height } = canvas
      ctx2d.clearRect(0, 0, width, height)
      ctx2d.fillStyle = '#111827'
      ctx2d.fillRect(0, 0, width, height)

      ctx2d.lineWidth = 1.5
      ctx2d.strokeStyle = '#22d3ee'
      ctx2d.beginPath()

      const sliceWidth = width / data.length
      let x = 0
      for (let i = 0; i < data.length; i++) {
        const v = (data[i]! / 128.0) - 1
        const y = (v * height) / 2 + height / 2
        if (i === 0) ctx2d.moveTo(x, y)
        else ctx2d.lineTo(x, y)
        x += sliceWidth
      }
      ctx2d.stroke()
      rafRef.current = requestAnimationFrame(draw)
    }

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(draw)
    } else {
      // Draw flat line when stopped
      const { width, height } = canvas
      ctx2d.fillStyle = '#111827'
      ctx2d.fillRect(0, 0, width, height)
      ctx2d.lineWidth = 1.5
      ctx2d.strokeStyle = '#374151'
      ctx2d.beginPath()
      ctx2d.moveTo(0, height / 2)
      ctx2d.lineTo(width, height / 2)
      ctx2d.stroke()
    }

    return () => cancelAnimationFrame(rafRef.current)
  }, [canvasRef, node, isPlaying])
}
