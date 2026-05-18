import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

// ─── Web Audio API mock ────────────────────────────────────────────────────

function makeMockGainNode() {
  return {
    gain: { setTargetAtTime: vi.fn(), value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }
}

function makeMockPannerNode() {
  return {
    pan: { setTargetAtTime: vi.fn(), value: 0 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }
}

function makeMockAnalyserNode() {
  return {
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteTimeDomainData: vi.fn(),
    getByteFrequencyData: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  }
}

function makeMockBufferSourceNode() {
  return {
    buffer: null as AudioBuffer | null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as (() => void) | null,
  }
}

class MockAudioContext {
  state: AudioContextState = 'running'
  currentTime = 0
  destination = { connect: vi.fn() } as unknown as AudioDestinationNode

  createGain = vi.fn(makeMockGainNode)
  createStereoPanner = vi.fn(makeMockPannerNode)
  createAnalyser = vi.fn(makeMockAnalyserNode)
  createBufferSource = vi.fn(makeMockBufferSourceNode)
  resume = vi.fn(() => Promise.resolve())
  decodeAudioData = vi.fn((_: ArrayBuffer) =>
    Promise.resolve({ duration: 120, length: 5292000, sampleRate: 44100 } as unknown as AudioBuffer),
  )
}

vi.stubGlobal('AudioContext', MockAudioContext)

// ─── Canvas mock ──────────────────────────────────────────────────────────

const mockCtx2d = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
}

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx2d) as unknown as typeof HTMLCanvasElement.prototype.getContext

// ─── requestAnimationFrame mock ───────────────────────────────────────────

vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => { cb(0); return 0 }))
vi.stubGlobal('cancelAnimationFrame', vi.fn())

// ─── Cleanup ──────────────────────────────────────────────────────────────

afterEach(() => {
  vi.clearAllMocks()
})
