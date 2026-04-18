import { TripDestinationSvgIcon } from '@/components/trip/TripDestinationIcons'

/**
 * 국가 검색 입력 + listbox 패널 (데스크톱/모바일 공통)
 * @param {boolean} isPanelOpen — `dropdownOpen && countryQuery.trim().length > 0` 등 부모에서 계산
 * @param {string} panelId — `aria-controls` 및 패널 `id` (데스크톱/모바일별로 고유)
 */
export default function DestinationCountryAutocomplete({
  comboRef,
  countryQuery,
  onCountryInputChange,
  onCountryKeyDown,
  onCountryFocus,
  suggestions,
  isPanelOpen,
  onPickCountry,
  panelId,
  placeholder,
}) {
  return (
    <div ref={comboRef} className="relative z-20">
      <div
        className={`relative border border-sky-100/80 bg-white shadow-inner transition-[border-radius,box-shadow] ${
          isPanelOpen ? 'rounded-t-2xl ring-2 ring-sky-200' : 'rounded-2xl'
        }`}
      >
        <TripDestinationSvgIcon
          name="search"
          className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={countryQuery}
          onChange={(e) => onCountryInputChange(e.target.value)}
          onKeyDown={onCountryKeyDown}
          onFocus={onCountryFocus}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isPanelOpen}
          aria-controls={panelId}
          className={`w-full bg-transparent py-3.5 pl-12 pr-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 ${
            isPanelOpen ? 'rounded-t-2xl' : 'rounded-2xl'
          }`}
        />
      </div>

      {isPanelOpen && (
        <div
          id={panelId}
          role="listbox"
          aria-label="국가 자동완성"
          className="absolute left-0 right-0 top-full z-30 max-h-52 overflow-y-auto rounded-b-2xl border border-t-0 border-sky-200 bg-white shadow-lg ring-2 ring-sky-200 ring-t-0"
        >
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">일치하는 국가가 없어요. 다른 검색어를 입력해 보세요.</p>
          ) : (
            <ul className="py-1">
              {suggestions.map((c) => (
                <li key={c.name} role="none">
                  <button
                    type="button"
                    role="option"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onPickCountry(c)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-800 transition hover:bg-sky-50"
                  >
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-xs text-gray-500">
                      {c.city} · {c.iata}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
