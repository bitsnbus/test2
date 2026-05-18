import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Track } from './Track'
import type { TrackState } from '../types'

// Mock canvas-heavy child components to avoid jsdom canvas limitations
vi.mock('./WaveformDisplay', () => ({ WaveformDisplay: () => <div data-testid="waveform" /> }))
vi.mock('./FrequencyDisplay', () => ({ FrequencyDisplay: () => <div data-testid="frequency" /> }))

const baseTrack: TrackState = {
  id: '1',
  name: 'Drums',
  volume: 1,
  pan: 0,
  muted: false,
  solo: false,
  isLoaded: false,
  isPlaying: false,
  duration: 0,
}

const defaultProps = {
  track: baseTrack,
  node: undefined,
  onLoadFile: vi.fn(),
  onVolumeChange: vi.fn(),
  onPanChange: vi.fn(),
  onMuteToggle: vi.fn(),
  onSoloToggle: vi.fn(),
  onRemove: vi.fn(),
}

describe('Track', () => {
  it('displays the track name', () => {
    render(<Track {...defaultProps} />)
    expect(screen.getByText('Drums')).toBeInTheDocument()
  })

  it('shows "Load file" when no audio is loaded', () => {
    render(<Track {...defaultProps} />)
    expect(screen.getByText('Load file')).toBeInTheDocument()
  })

  it('shows "Replace" when audio is loaded', () => {
    render(<Track {...defaultProps} track={{ ...baseTrack, isLoaded: true, duration: 60 }} />)
    expect(screen.getByText('Replace')).toBeInTheDocument()
  })

  it('shows formatted duration when loaded', () => {
    render(<Track {...defaultProps} track={{ ...baseTrack, isLoaded: true, duration: 125 }} />)
    expect(screen.getByText('2:05')).toBeInTheDocument()
  })

  it('hides duration when not loaded', () => {
    render(<Track {...defaultProps} />)
    expect(screen.queryByText('0:00')).not.toBeInTheDocument()
  })

  describe('Mute button', () => {
    it('calls onMuteToggle(id, true) when track is not muted', () => {
      const onMuteToggle = vi.fn()
      render(<Track {...defaultProps} onMuteToggle={onMuteToggle} />)
      fireEvent.click(screen.getByText('M'))
      expect(onMuteToggle).toHaveBeenCalledWith('1', true)
    })

    it('calls onMuteToggle(id, false) when track is already muted', () => {
      const onMuteToggle = vi.fn()
      render(<Track {...defaultProps} track={{ ...baseTrack, muted: true }} onMuteToggle={onMuteToggle} />)
      fireEvent.click(screen.getByText('M'))
      expect(onMuteToggle).toHaveBeenCalledWith('1', false)
    })
  })

  describe('Solo button', () => {
    it('calls onSoloToggle(id, true) when track is not soloed', () => {
      const onSoloToggle = vi.fn()
      render(<Track {...defaultProps} onSoloToggle={onSoloToggle} />)
      fireEvent.click(screen.getByText('S'))
      expect(onSoloToggle).toHaveBeenCalledWith('1', true)
    })

    it('calls onSoloToggle(id, false) when track is already soloed', () => {
      const onSoloToggle = vi.fn()
      render(<Track {...defaultProps} track={{ ...baseTrack, solo: true }} onSoloToggle={onSoloToggle} />)
      fireEvent.click(screen.getByText('S'))
      expect(onSoloToggle).toHaveBeenCalledWith('1', false)
    })
  })

  describe('Remove button', () => {
    it('calls onRemove with the track id', () => {
      const onRemove = vi.fn()
      render(<Track {...defaultProps} onRemove={onRemove} />)
      fireEvent.click(screen.getByText('✕'))
      expect(onRemove).toHaveBeenCalledWith('1')
    })
  })

  describe('FFT toggle', () => {
    it('hides FrequencyDisplay by default', () => {
      render(<Track {...defaultProps} />)
      expect(screen.queryByTestId('frequency')).not.toBeInTheDocument()
    })

    it('shows FrequencyDisplay when FFT button is clicked', () => {
      render(<Track {...defaultProps} />)
      fireEvent.click(screen.getByText('FFT'))
      expect(screen.getByTestId('frequency')).toBeInTheDocument()
    })

    it('hides FrequencyDisplay on second FFT click (toggle)', () => {
      render(<Track {...defaultProps} />)
      fireEvent.click(screen.getByText('FFT'))
      fireEvent.click(screen.getByText('FFT'))
      expect(screen.queryByTestId('frequency')).not.toBeInTheDocument()
    })
  })

  describe('file loading', () => {
    it('calls onLoadFile when a file is selected', () => {
      const onLoadFile = vi.fn()
      render(<Track {...defaultProps} onLoadFile={onLoadFile} />)
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File([new ArrayBuffer(8)], 'kick.wav', { type: 'audio/wav' })
      fireEvent.change(input, { target: { files: [file] } })
      expect(onLoadFile).toHaveBeenCalledWith('1', file)
    })
  })
})
