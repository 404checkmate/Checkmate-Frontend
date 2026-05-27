import { TRAVEL_STYLES } from '@/mocks/tripNewStep5Data'

const FILTER_IDLE = 'brightness(0) saturate(100%) invert(44%) sepia(82%) saturate(520%) hue-rotate(139deg) brightness(0.93) contrast(0.95)'
const FILTER_SELECTED = 'brightness(0) saturate(100%) invert(19%) sepia(60%) saturate(600%) hue-rotate(158deg) brightness(0.85) contrast(1.1)'

function TravelStyleIcon({ src, selected, className }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={`shrink-0 object-contain transition-[filter] duration-200 ${className ?? ''}`}
      style={{ filter: selected ? FILTER_SELECTED : FILTER_IDLE }}
    />
  )
}

export default function TravelStyleSelector({ selectedIds, onToggle }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {TRAVEL_STYLES.map((s) => {
        const isSelected = selectedIds.includes(s.id)
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onToggle(s.id)}
            className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3.5 text-center transition active:scale-[0.97] ${
              isSelected
                ? 'border-[#3db4dd] bg-[#3db4dd]/10 text-[#0f5762]'
                : 'border-gray-200 bg-white/80 text-gray-500 hover:border-[#3db4dd]/40 hover:bg-[#3db4dd]/5'
            }`}
          >
            <TravelStyleIcon src={s.iconSrc} selected={isSelected} className="h-7 w-7" />
            <span className="text-xs font-bold leading-tight">{s.label}</span>
          </button>
        )
      })}
    </div>
  )
}
