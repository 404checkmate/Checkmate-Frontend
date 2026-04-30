import { useEffect, useRef, useState } from 'react'

function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handlePointerDown(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between border border-slate-200/80 bg-white px-4 py-3 text-sm shadow-sm transition-colors duration-200 ${
          open
            ? 'rounded-t-2xl border-sky-200 bg-[#D9F2FF]'
            : 'rounded-2xl hover:border-sky-200 hover:bg-[#D9F2FF]'
        }`}
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-sky-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-30 w-full overflow-hidden rounded-b-2xl border border-t-0 border-sky-200 bg-white shadow-lg ring-2 ring-sky-200"
        >
          {options.map((opt) => (
            <li key={opt.value} role="none">
              <button
                type="button"
                role="option"
                aria-selected={value === opt.value}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors hover:bg-sky-50 ${
                  value === opt.value ? 'font-semibold text-sky-700' : 'text-gray-800'
                }`}
              >
                {value === opt.value && (
                  <svg className="mr-2 h-3.5 w-3.5 shrink-0 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const PREP_TYPE_OPTIONS = [
  { value: 'item', label: '준비물' },
  { value: 'pre_booking', label: '사전 예약/신청' },
  { value: 'pre_departure_check', label: '출국 전 확인사항' },
]

const BAGGAGE_TYPE_OPTIONS = [
  { value: 'carry_on', label: '기내 반입' },
  { value: 'checked', label: '위탁 수하물' },
]

export default function GuideChecklistDirectAddModal({
  open,
  draft,
  onDraftChange,
  onSubmit,
  onClose,
  sectionLabel,
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-archive-direct-add-title"
        className="max-h-[min(90dvh,640px)] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-h-[85vh] sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="guide-archive-direct-add-title" className="mb-4 text-lg font-extrabold text-[#0a3d3d]">
          직접 추가
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          제목과 준비물 유형은 필수입니다. 항목은 체크리스트 본문 맨 아래 「{sectionLabel}」 블록에 붙습니다.
        </p>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-semibold text-gray-600">
            제목 <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => onDraftChange((d) => ({ ...d, title: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
            placeholder="예: 보조배터리"
          />
        </label>

        <div className="mb-3">
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            준비물 유형 <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={draft.prepType}
            onChange={(val) => onDraftChange((d) => ({ ...d, prepType: val }))}
            options={PREP_TYPE_OPTIONS}
            placeholder="선택해주세요"
          />
        </div>

        {draft.prepType === 'item' && (
          <div className="mb-3">
            <label className="mb-1 block text-xs font-semibold text-gray-600">수하물 구분</label>
            <CustomSelect
              value={draft.baggageType}
              onChange={(val) => onDraftChange((d) => ({ ...d, baggageType: val }))}
              options={BAGGAGE_TYPE_OPTIONS}
              placeholder="선택해주세요"
            />
          </div>
        )}

        <label className="mb-6 block">
          <span className="mb-1 block text-xs font-semibold text-gray-600">추가 메모</span>
          <textarea
            value={draft.memo}
            onChange={(e) => onDraftChange((d) => ({ ...d, memo: e.target.value }))}
            rows={2}
            className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
          />
        </label>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onSubmit}
            className="min-h-12 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-teal-700 sm:min-h-0 sm:px-5"
          >
            추가
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-50 sm:min-h-0 sm:px-5"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
