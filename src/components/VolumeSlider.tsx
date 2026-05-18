interface Props {
  value: number // 0–1
  onChange: (value: number) => void
  label?: string
}

export function VolumeSlider({ value, onChange, label = 'Vol' }: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-400">{label}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="h-24 w-4 cursor-pointer appearance-none rounded-full bg-gray-700 accent-cyan-400"
        style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
      />
      <span className="text-xs text-gray-500">{Math.round(value * 100)}</span>
    </div>
  )
}
