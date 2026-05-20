import { COMPANIONS, STEP5_ICON_PATHS, STEP5_ICON_COMPOSITE } from '@/mocks/tripNewStep5Data'

function SvgIcon({ name, className = 'w-6 h-6' }) {
  const composite = STEP5_ICON_COMPOSITE[name]
  if (composite) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        {composite.circles.map((c, i) => <circle key={i} cx={c.cx} cy={c.cy} r={c.r} />)}
        <path d={composite.path} />
      </svg>
    )
  }
  const d = STEP5_ICON_PATHS[name]
  if (!d) return null
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d={d} />
    </svg>
  )
}

export default function CompanionSelector({ selectedIds, onToggle }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {COMPANIONS.map((c) => {
        const isSelected = selectedIds.includes(c.id)
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onToggle(c.id)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3.5 text-center transition active:scale-[0.97] ${
              isSelected
                ? 'border-[#3db4dd] bg-[#3db4dd]/10 text-[#0f5762]'
                : 'border-gray-200 bg-white/80 text-gray-500 hover:border-[#3db4dd]/40 hover:bg-[#3db4dd]/5'
            }`}
          >
            <SvgIcon
              name={c.icon}
              className={`h-6 w-6 transition-colors ${isSelected ? 'text-[#3db4dd]' : 'text-gray-400'}`}
            />
            <span className="text-xs font-bold leading-tight">{c.label}</span>
          </button>
        )
      })}
    </div>
  )
}
