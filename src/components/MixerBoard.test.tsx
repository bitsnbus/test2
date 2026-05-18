import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MixerBoard } from './MixerBoard'

// Mock canvas-heavy sub-components
vi.mock('./WaveformDisplay', () => ({ WaveformDisplay: () => <div data-testid="waveform" /> }))
vi.mock('./FrequencyDisplay', () => ({ FrequencyDisplay: () => <div data-testid="frequency" /> }))

describe('MixerBoard', () => {
  it('renders the transport bar', () => {
    render(<MixerBoard />)
    expect(screen.getByText('MIXER')).toBeInTheDocument()
  })

  it('renders the add-track button', () => {
    render(<MixerBoard />)
    expect(screen.getByTitle('Add track')).toBeInTheDocument()
  })

  it('shows no tracks initially', () => {
    render(<MixerBoard />)
    // No "Load file" buttons should be visible yet
    expect(screen.queryByText('Load file')).not.toBeInTheDocument()
  })

  it('adds a track when the "+" button is clicked', async () => {
    render(<MixerBoard />)
    await act(async () => { fireEvent.click(screen.getByTitle('Add track')) })
    expect(screen.getByText('Load file')).toBeInTheDocument()
  })

  it('adds multiple tracks', async () => {
    render(<MixerBoard />)
    await act(async () => {
      fireEvent.click(screen.getByTitle('Add track'))
      fireEvent.click(screen.getByTitle('Add track'))
    })
    expect(screen.getAllByText('Load file')).toHaveLength(2)
  })

  it('removes a track when ✕ is clicked', async () => {
    render(<MixerBoard />)
    await act(async () => { fireEvent.click(screen.getByTitle('Add track')) })
    expect(screen.getByText('Load file')).toBeInTheDocument()
    await act(async () => { fireEvent.click(screen.getByText('✕')) })
    expect(screen.queryByText('Load file')).not.toBeInTheDocument()
  })

  it('play button triggers playback (isPlaying disables Play)', async () => {
    render(<MixerBoard />)
    const playBtn = screen.getByTitle('Play')
    expect(playBtn).not.toBeDisabled()
    await act(async () => { fireEvent.click(playBtn) })
    expect(screen.getByTitle('Play')).toBeDisabled()
  })

  it('stop button ends playback (re-enables Play)', async () => {
    render(<MixerBoard />)
    await act(async () => { fireEvent.click(screen.getByTitle('Play')) })
    await act(async () => { fireEvent.click(screen.getByTitle('Stop')) })
    expect(screen.getByTitle('Play')).not.toBeDisabled()
  })
})
