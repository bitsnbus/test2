import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PanKnob } from './PanKnob'

describe('PanKnob', () => {
  it('shows "C" for center (0)', () => {
    render(<PanKnob value={0} onChange={vi.fn()} />)
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('shows "C" for near-zero values inside dead zone', () => {
    render(<PanKnob value={0.005} onChange={vi.fn()} />)
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('shows "L" label for negative pan', () => {
    render(<PanKnob value={-0.75} onChange={vi.fn()} />)
    expect(screen.getByText('L75')).toBeInTheDocument()
  })

  it('shows "R" label for positive pan', () => {
    render(<PanKnob value={0.5} onChange={vi.fn()} />)
    expect(screen.getByText('R50')).toBeInTheDocument()
  })

  it('renders the "Pan" header label', () => {
    render(<PanKnob value={0} onChange={vi.fn()} />)
    expect(screen.getByText('Pan')).toBeInTheDocument()
  })

  it('calls onChange with the numeric value when slider moves', () => {
    const onChange = vi.fn()
    render(<PanKnob value={0} onChange={onChange} />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '-0.3' } })
    expect(onChange).toHaveBeenCalledWith(-0.3)
  })

  it('has min=-1, max=1, step=0.01', () => {
    render(<PanKnob value={0} onChange={vi.fn()} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '-1')
    expect(slider).toHaveAttribute('max', '1')
    expect(slider).toHaveAttribute('step', '0.01')
  })
})
