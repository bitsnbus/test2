import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VolumeSlider } from './VolumeSlider'

describe('VolumeSlider', () => {
  it('renders the default label "Vol"', () => {
    render(<VolumeSlider value={1} onChange={vi.fn()} />)
    expect(screen.getByText('Vol')).toBeInTheDocument()
  })

  it('renders a custom label', () => {
    render(<VolumeSlider value={1} onChange={vi.fn()} label="Master" />)
    expect(screen.getByText('Master')).toBeInTheDocument()
  })

  it('displays the value as a percentage', () => {
    render(<VolumeSlider value={0.75} onChange={vi.fn()} />)
    expect(screen.getByText('75')).toBeInTheDocument()
  })

  it('displays 0 when value is 0', () => {
    render(<VolumeSlider value={0} onChange={vi.fn()} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('displays 100 when value is 1', () => {
    render(<VolumeSlider value={1} onChange={vi.fn()} />)
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('calls onChange with the numeric value when the slider changes', () => {
    const onChange = vi.fn()
    render(<VolumeSlider value={1} onChange={onChange} />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '0.5' } })
    expect(onChange).toHaveBeenCalledWith(0.5)
  })

  it('has min=0, max=1, step=0.01', () => {
    render(<VolumeSlider value={1} onChange={vi.fn()} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '1')
    expect(slider).toHaveAttribute('step', '0.01')
  })
})
