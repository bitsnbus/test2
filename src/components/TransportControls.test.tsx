import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransportControls } from './TransportControls'

function renderTransport(overrides: Partial<Parameters<typeof TransportControls>[0]> = {}) {
  const defaults = {
    isPlaying: false,
    masterVolume: 1,
    onPlay: vi.fn(),
    onStop: vi.fn(),
    onMasterVolumeChange: vi.fn(),
  }
  return render(<TransportControls {...defaults} {...overrides} />)
}

describe('TransportControls', () => {
  it('renders the MIXER heading', () => {
    renderTransport()
    expect(screen.getByText('MIXER')).toBeInTheDocument()
  })

  describe('Play button', () => {
    it('is enabled when not playing', () => {
      renderTransport({ isPlaying: false })
      expect(screen.getByTitle('Play')).not.toBeDisabled()
    })

    it('is disabled while playing', () => {
      renderTransport({ isPlaying: true })
      expect(screen.getByTitle('Play')).toBeDisabled()
    })

    it('calls onPlay when clicked', () => {
      const onPlay = vi.fn()
      renderTransport({ onPlay })
      fireEvent.click(screen.getByTitle('Play'))
      expect(onPlay).toHaveBeenCalledTimes(1)
    })
  })

  describe('Stop button', () => {
    it('is disabled when not playing', () => {
      renderTransport({ isPlaying: false })
      expect(screen.getByTitle('Stop')).toBeDisabled()
    })

    it('is enabled while playing', () => {
      renderTransport({ isPlaying: true })
      expect(screen.getByTitle('Stop')).not.toBeDisabled()
    })

    it('calls onStop when clicked', () => {
      const onStop = vi.fn()
      renderTransport({ isPlaying: true, onStop })
      fireEvent.click(screen.getByTitle('Stop'))
      expect(onStop).toHaveBeenCalledTimes(1)
    })
  })

  describe('Master VolumeSlider', () => {
    it('renders the "Master" label', () => {
      renderTransport()
      expect(screen.getByText('Master')).toBeInTheDocument()
    })

    it('calls onMasterVolumeChange when slider changes', () => {
      const onMasterVolumeChange = vi.fn()
      renderTransport({ onMasterVolumeChange })
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '0.6' } })
      expect(onMasterVolumeChange).toHaveBeenCalledWith(0.6)
    })
  })
})
