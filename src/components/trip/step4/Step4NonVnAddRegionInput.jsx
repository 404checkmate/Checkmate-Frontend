import { useRef } from 'react'
import Step4SvgIcon from '@/components/trip/step4/Step4SvgIcon'

/** 비베트남: 도시·지역 입력 + 확인(엔터와 동일) */
export default function Step4NonVnAddRegionInput({ value, onChange, onConfirm }) {
  const inputRef = useRef(null)

  const submit = () => {
    const t = value.trim()
    if (t.length < 1) return
    onConfirm(t)
    inputRef.current?.blur()
  }

  return (
    <div className="flex w-full items-center gap-2 sm:gap-3">
      <div
        className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition-colors duration-200 focus-within:border-white/50 focus-within:bg-[#D9F2FF] sm:gap-3 sm:px-5 sm:py-4"
      >
        <Step4SvgIcon name="search" className="h-5 w-5 flex-shrink-0 text-[#5DA7C1]" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            if (e.nativeEvent.isComposing) return
            e.preventDefault()
            submit()
          }}
          placeholder="방문할 도시를 입력해주세요"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-[#5DA7C1]"
          autoComplete="off"
        />
      </div>
      <button
        type="button"
        onClick={submit}
        className="flex-shrink-0 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-teal-700"
      >
        확인
      </button>
    </div>
  )
}
