import { describe, it, expect } from 'vitest'
import { linearToDb, dbToLinear, clamp, formatTime } from './audio'

describe('linearToDb', () => {
  it('returns -Infinity for 0', () => {
    expect(linearToDb(0)).toBe(-Infinity)
  })

  it('returns -Infinity for negative values', () => {
    expect(linearToDb(-1)).toBe(-Infinity)
  })

  it('returns 0 for unity gain (1)', () => {
    expect(linearToDb(1)).toBeCloseTo(0)
  })

  it('returns ~-6 dB for half amplitude', () => {
    expect(linearToDb(0.5)).toBeCloseTo(-6.02, 1)
  })

  it('returns 20 dB for 10x amplitude', () => {
    expect(linearToDb(10)).toBeCloseTo(20)
  })
})

describe('dbToLinear', () => {
  it('returns 1 for 0 dB', () => {
    expect(dbToLinear(0)).toBeCloseTo(1)
  })

  it('returns 0.1 for -20 dB', () => {
    expect(dbToLinear(-20)).toBeCloseTo(0.1)
  })

  it('returns 10 for +20 dB', () => {
    expect(dbToLinear(20)).toBeCloseTo(10)
  })

  it('is the inverse of linearToDb', () => {
    const linear = 0.75
    expect(dbToLinear(linearToDb(linear))).toBeCloseTo(linear)
  })
})

describe('clamp', () => {
  it('returns the value unchanged when within range', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
  })

  it('clamps to min when value is below range', () => {
    expect(clamp(-0.1, 0, 1)).toBe(0)
  })

  it('clamps to max when value is above range', () => {
    expect(clamp(1.5, 0, 1)).toBe(1)
  })

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 1)).toBe(0)
  })

  it('returns max when value equals max', () => {
    expect(clamp(1, 0, 1)).toBe(1)
  })

  it('works with negative ranges', () => {
    expect(clamp(0, -1, 1)).toBe(0)
    expect(clamp(-2, -1, 1)).toBe(-1)
    expect(clamp(2, -1, 1)).toBe(1)
  })
})

describe('formatTime', () => {
  it('formats 0 seconds as 0:00', () => {
    expect(formatTime(0)).toBe('0:00')
  })

  it('zero-pads single-digit seconds', () => {
    expect(formatTime(5)).toBe('0:05')
  })

  it('formats 59 seconds', () => {
    expect(formatTime(59)).toBe('0:59')
  })

  it('formats exactly one minute', () => {
    expect(formatTime(60)).toBe('1:00')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('2:05')
  })

  it('truncates fractional seconds', () => {
    expect(formatTime(61.9)).toBe('1:01')
  })
})
