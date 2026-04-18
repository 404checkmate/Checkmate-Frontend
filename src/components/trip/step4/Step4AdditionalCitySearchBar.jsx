import Step4SvgIcon from '@/components/trip/step4/Step4SvgIcon'

/** 항공·메인 도시 카드 바로 아래 — 추가 방문 지역 입력 (시안 색상, 모든 입국지 공통) */
export default function Step4AdditionalCitySearchBar({ value, onChange, placeholder, hint }) {
  return (
    <div className="w-full">
      <label className="block w-full">
        <span className="sr-only">추가 방문 도시·지역</span>
        <div
          className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm transition-colors duration-200 focus-within:border-white/50 focus-within:bg-[#D9F2FF]"
        >
          <Step4SvgIcon name="search" className="h-5 w-5 flex-shrink-0 text-[#5DA7C1]" />
          <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? '방문할 도시를 입력해주세요'}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-[#5DA7C1]"
            autoComplete="off"
          />
        </div>
      </label>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
    </div>
  )
}
