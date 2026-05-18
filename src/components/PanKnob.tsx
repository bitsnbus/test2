interface Props {
  value: number // -1 to 1
  onChange: (value: number) => void
}

export function PanKnob({ value, onChange }: Props) {
  const label = value < -0.01 ? `L${Math.round(Math.abs(value) * 100)}` : value > 0.01 ? `R${Math.round(value * 100)}` : 'C'

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-400">Pan</span>
      <input
        type="range"
        min={-1}
        max={1}
        step={0.01}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-20 cursor-pointer accent-cyan-400"
      />
      <span className="text-xs text-gray-500 w-8 text-center">{label}</span>
    </div>
  )
}
