export function linearToDb(linear: number): number {
  if (linear <= 0) return -Infinity
  return 20 * Math.log10(linear)
}

export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20)
}

/** Clamp a value to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
