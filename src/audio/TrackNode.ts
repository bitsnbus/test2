import { getContext, getMasterGain } from './AudioEngine'

/**
 * Per-track audio graph: source → gain → panner → master
 *
 * A new AudioBufferSourceNode is created on every play() call because
 * source nodes are single-use in the Web Audio API.
 */
export class TrackNode {
  readonly analyser: AnalyserNode
  private readonly gainNode: GainNode
  private readonly pannerNode: StereoPannerNode
  private source: AudioBufferSourceNode | null = null
  private buffer: AudioBuffer | null = null
  private _startedAt = 0
  private _offsetAt = 0
  private _playing = false

  constructor() {
    const ctx = getContext()
    this.gainNode = ctx.createGain()
    this.pannerNode = ctx.createStereoPanner()
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 2048

    this.gainNode.connect(this.pannerNode)
    this.pannerNode.connect(this.analyser)
    this.analyser.connect(getMasterGain())
  }

  load(buffer: AudioBuffer): void {
    this.buffer = buffer
  }

  get duration(): number {
    return this.buffer?.duration ?? 0
  }

  get isPlaying(): boolean {
    return this._playing
  }

  play(offset = 0): void {
    if (!this.buffer || this._playing) return
    const ctx = getContext()
    this.source = ctx.createBufferSource()
    this.source.buffer = this.buffer
    this.source.connect(this.gainNode)
    this.source.onended = () => {
      this._playing = false
    }
    this._offsetAt = offset
    this._startedAt = ctx.currentTime
    this.source.start(0, offset)
    this._playing = true
  }

  stop(): void {
    if (!this._playing) return
    this.source?.stop()
    this.source = null
    this._playing = false
  }

  /** Current playback position in seconds. */
  get currentTime(): number {
    if (!this._playing) return this._offsetAt
    return getContext().currentTime - this._startedAt + this._offsetAt
  }

  setVolume(linear: number): void {
    this.gainNode.gain.setTargetAtTime(linear, getContext().currentTime, 0.01)
  }

  setPan(pan: number): void {
    this.pannerNode.pan.setTargetAtTime(pan, getContext().currentTime, 0.01)
  }

  setMuted(muted: boolean): void {
    this.gainNode.gain.setTargetAtTime(muted ? 0 : 1, getContext().currentTime, 0.01)
  }

  destroy(): void {
    this.stop()
    this.gainNode.disconnect()
    this.pannerNode.disconnect()
    this.analyser.disconnect()
  }
}
