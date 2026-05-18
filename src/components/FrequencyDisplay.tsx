import { useEffect, useRef } from 'react'
import type { TrackNode } from '../audio/TrackNode'

interface Props {
  node: TrackNode | undefined
  isPlaying: boolean
}

export function FrequencyDisplay({ node, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !node) return

    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return

    const { analyser } = node
    analyser.fftSize = 2048
    const data = new Uint8Array(analyser.frequencyBinCount)
    const { width, height } = canvas

    function draw() {
      if (!ctx2d || !canvas) return
      analyser.getByteFrequencyData(data)

      ctx2d.clearRect(0, 0, width, height)
      ctx2d.fillStyle = '#111827'
      ctx2d.fillRect(0, 0, width, height)

      const barCount = 64
      const step = Math.floor(data.length / barCount)
      const barW = width / barCount - 1

      for (let i = 0; i < barCount; i++) {
        let sum = 0
        for (let j = 0; j < step; j++) sum += data[i * step + j]!
        const avg = sum / step
        const barH = (avg / 255) * height

        const pct = avg / 255
        const r = Math.round(pct < 0.5 ? pct * 2 * 34 + (1 - pct * 2) * 34 : 239)
        const g = Math.round(pct < 0.5 ? 211 : (1 - (pct - 0.5) * 2) * 211)
        const b = Math.round(pct < 0.5 ? 34 + pct * 2 * (34 - 34) : 34)
        ctx2d.fillStyle = `rgb(${r},${g},${b})`
        ctx2d.fillRect(i * (barW + 1), height - barH, barW, barH)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(draw)
    } else {
      ctx2d.fillStyle = '#111827'
      ctx2d.fillRect(0, 0, width, height)
      ctx2d.fillStyle = '#1f2937'
      const barCount = 64
      const barW = width / barCount - 1
      for (let i = 0; i < barCount; i++) {
        ctx2d.fillRect(i * (barW + 1), height - 2, barW, 2)
      }
    }

    return () => cancelAnimationFrame(rafRef.current)
  }, [node, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={48}
      className="w-full rounded bg-gray-900"
    />
  )
}
