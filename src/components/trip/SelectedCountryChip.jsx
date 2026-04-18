const CLOSE_ICON_PATH =
  'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'

/**
 * 선택된 국가 표시 칩 + 제거 (데스크톱: 라벨 + flex wrap, 모바일: 상단 구분선 섹션)
 */
export default function SelectedCountryChip({ country, onRemove, variant = 'desktop' }) {
  const chip = (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-900 shadow-sm">
      <span className="text-teal-600">#</span>
      {country.name}
      <span className="text-xs font-normal text-teal-700/80">({country.city})</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-teal-600 hover:bg-teal-200/60"
        aria-label={`${country.name} 선택 해제`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d={CLOSE_ICON_PATH} />
        </svg>
      </button>
    </span>
  )

  if (variant === 'mobile') {
    return (
      <div className="mt-3 border-t border-sky-100/80 pt-3">
        <p className="mb-2 text-[11px] font-medium text-gray-500">선택한 여행지</p>
        {chip}
      </div>
    )
  }

  return (
    <div className="mt-3">
      <p className="mb-1.5 text-[11px] font-medium text-gray-500">선택한 여행지</p>
      <div className="flex flex-wrap gap-2">{chip}</div>
    </div>
  )
}
