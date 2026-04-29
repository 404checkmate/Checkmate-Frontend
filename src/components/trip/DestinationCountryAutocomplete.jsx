import { useEffect, useRef } from 'react'
import { TripDestinationSvgIcon } from '@/components/trip/TripDestinationIcons'

/**
 * 국가 검색 입력 + listbox 패널 (데스크톱/모바일 공통)
 * @param {'country' | 'arrival'} pickerPhase — 국가만 고르는 단계 / 취항지 선택 단계
 * @param {boolean} isPanelOpen — 패널 표시 여부
 * @param {string} panelId — `aria-controls` 및 패널 `id` (데스크톱/모바일별로 고유)
 */
export default function DestinationCountryAutocomplete({
  comboRef,
  countryQuery,
  onCountryInputChange,
  onCountryKeyDown,
  onCountryFocus,
  countryInputReadOnly = false,
  onChangeCountryRequest,
  suggestions,
  isPanelOpen,
  onPickCountry,
  pickerPhase,
  arrivalQuery,
  onArrivalQueryChange,
  onArrivalKeyDown,
  arrivalSuggestions,
  onPickArrival,
  panelId,
  placeholder,
}) {
  const arrivalInputRef = useRef(null)
  const isArrivalStep = pickerPhase === 'arrival'

  useEffect(() => {
    if (isArrivalStep && isPanelOpen) {
      arrivalInputRef.current?.focus()
    }
  }, [isArrivalStep, isPanelOpen])

  const panelMaxHeight = isArrivalStep ? 'max-h-[min(28rem,72vh)]' : 'max-h-52'

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
        <div className="flex items-stretch gap-1 pr-1">
          <input
            type="text"
            value={countryQuery}
            onChange={(e) => onCountryInputChange(e.target.value)}
            onKeyDown={onCountryKeyDown}
            onFocus={onCountryFocus}
            placeholder={placeholder}
            readOnly={countryInputReadOnly}
            onClick={countryInputReadOnly ? onChangeCountryRequest : undefined}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isPanelOpen}
            aria-controls={panelId}
            className={`min-w-0 flex-1 bg-transparent py-3.5 pl-12 pr-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 ${
              isPanelOpen ? 'rounded-t-2xl' : 'rounded-2xl'
            } ${countryInputReadOnly ? 'cursor-pointer bg-sky-50/40' : ''}`}
          />
          {countryInputReadOnly && onChangeCountryRequest && (
            <button
              type="button"
              onClick={onChangeCountryRequest}
              className="my-2 shrink-0 self-center rounded-lg px-2.5 py-1 text-xs font-semibold text-sky-700 underline-offset-2 hover:bg-sky-100/80 hover:underline"
            >
              국가 변경
            </button>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <div
          id={panelId}
          role="listbox"
          aria-label={isArrivalStep ? '취항지 자동완성' : '국가 자동완성'}
          className={`absolute left-0 right-0 top-full z-30 overflow-y-auto rounded-b-2xl border border-t-0 border-sky-200 bg-white shadow-lg ring-2 ring-sky-200 ring-t-0 ${panelMaxHeight}`}
        >
          {!isArrivalStep && (
            <>
              {suggestions.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500">
                  일치하는 국가가 없어요. 다른 검색어를 입력해 보세요.
                </p>
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
                          대표 {c.city} · {c.iata}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {isArrivalStep && (
            <div className="border-t border-sky-100">
              <div className="sticky top-0 z-10 border-b border-sky-100 bg-sky-50/95 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800/90">취항지 검색</p>
                <p className="text-xs text-gray-600">도시명 또는 공항 코드(IATA)로 찾을 수 있어요.</p>
              </div>
              <div className="relative border-b border-sky-50 bg-white px-3 py-2">
                <TripDestinationSvgIcon
                  name="search"
                  className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                />
                <input
                  ref={arrivalInputRef}
                  type="text"
                  value={arrivalQuery}
                  onChange={(e) => onArrivalQueryChange(e.target.value)}
                  onKeyDown={onArrivalKeyDown}
                  placeholder="예: 하네다, HND, 오사카…"
                  autoComplete="off"
                  className="w-full rounded-xl border border-sky-100 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none ring-0 focus:border-sky-300"
                />
              </div>
              {arrivalSuggestions.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500">일치하는 취항지가 없어요. 다른 검색어를 입력해 보세요.</p>
              ) : (
                <ul className="py-1">
                  {arrivalSuggestions.map((a) => (
                    <li key={`${a.iata}-${a.city}`} role="none">
                      <button
                        type="button"
                        role="option"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onPickArrival(a)
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-800 transition hover:bg-sky-50"
                      >
                        <span className="font-semibold">{a.city}</span>
                        <span className="text-xs text-gray-500">{a.iata}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
