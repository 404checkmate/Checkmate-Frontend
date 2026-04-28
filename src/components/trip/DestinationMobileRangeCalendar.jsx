import { useCallback, useEffect, useState } from 'react'

const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토']


function parseYmd(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function ymd(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function monthGrid(year, monthIndex) {
  const firstDow = new Date(year, monthIndex, 1).getDay()
  const dim = daysInMonth(year, monthIndex)
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= dim; d++) cells.push(d)
  const rows = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }
  return rows
}

function monthKey(y, m) {
  return y * 12 + m
}

function keyToYm(k) {
  const y = Math.floor(k / 12)
  const m = ((k % 12) + 12) % 12
  return { year: y, monthIndex: m }
}

function addMonthKey(k, delta) {
  return k + delta
}

/** Tailwind `md` — 모바일은 한 달, md 이상은 두 달 병렬 */
const MD_UP_MEDIA = '(min-width: 768px)'

function useMdUp() {
  const [mdUp, setMdUp] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MD_UP_MEDIA).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(MD_UP_MEDIA)
    const apply = () => setMdUp(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return mdUp
}


function ChevronLeft({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  )
}

function ChevronRight({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  )
}

function MonthCal({
  year,
  monthIndex,
  startDate,
  endDate,
  todayYmd,
  minD,
  disabled,
  onDayClick,
}) {
  const start = parseYmd(startDate)
  const end = parseYmd(endDate)

  const inRange = (day) => {
    if (!start || !end || !day) return false
    const t = new Date(year, monthIndex, day)
    return t > start && t < end
  }

  const isStart = (day) => {
    if (!startDate || day == null) return false
    const [ys, ms, ds] = startDate.split('-').map(Number)
    return ys === year && ms - 1 === monthIndex && ds === day
  }

  const isEnd = (day) => {
    if (!endDate || day == null) return false
    const [ye, me, de] = endDate.split('-').map(Number)
    return ye === year && me - 1 === monthIndex && de === day
  }

  const isDisabledDay = (day) => {
    const t = new Date(year, monthIndex, day)
    if (minD && t < minD) return true
    return false
  }

  return (
    <div className="min-w-0">
      <div className="mb-2 grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-gray-400 sm:text-[11px]">
        {WEEKDAYS_KO.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>
      <div className="space-y-0.5">
        {monthGrid(year, monthIndex).map((row, ri) => (
          <div key={ri} className="grid grid-cols-7 gap-0.5">
            {row.map((day, ci) => {
              if (day == null) {
                return <div key={`e-${ci}`} className="aspect-square min-h-[1.85rem] sm:min-h-[2.1rem]" />
              }
              const dis = isDisabledDay(day)
              const selStart = isStart(day)
              const selEnd = isEnd(day)
              const range = inRange(day)
              const isToday = ymd(new Date(year, monthIndex, day)) === todayYmd && !dis

              return (
                <button
                  key={day}
                  type="button"
                  disabled={dis || disabled}
                  onClick={() => onDayClick(year, monthIndex, day)}
                  className={`relative flex min-h-[1.85rem] items-center justify-center text-[11px] font-medium transition-colors sm:min-h-[2.1rem] sm:text-sm ${
                    dis || disabled
                      ? 'cursor-not-allowed text-gray-300'
                      : 'text-gray-800 active:scale-[0.96]'
                  }`}
                >
                  {range && (
                    <span className="absolute inset-y-0.5 left-0 right-0 bg-teal-100/90" aria-hidden />
                  )}
                  <span
                    className={`relative z-[1] flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
                      selStart || selEnd
                        ? 'bg-teal-600 font-bold text-white shadow-sm ring-2 ring-teal-600/25'
                        : range
                          ? 'bg-transparent font-medium text-teal-900'
                          : isToday
                            ? 'ring-1 ring-teal-500'
                            : ''
                    }`}
                  >
                    {day}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 목적지 페이지 — 기간 선택 (모바일·데스크톱 공용)
 * 모바일: 한 달 · md+: 두 달 나란히 · 월 이동 · 탭 · ±일 칩 (CHECKMATE 틸 톤)
 */
export default function DestinationMobileRangeCalendar({
  startDate,
  endDate,
  todayYmd,
  minDateYmd,
  disabled,
  onChangeRange,
}) {
  const minD = parseYmd(minDateYmd)
  const minMonthKey = minD
    ? monthKey(minD.getFullYear(), minD.getMonth())
    : monthKey(new Date().getFullYear(), new Date().getMonth())
  const maxMonthKey = minMonthKey + 18

  const isMdUp = useMdUp()

  const [viewMonthKey, setViewMonthKey] = useState(() => {
    const s = parseYmd(startDate)
    if (s) return monthKey(s.getFullYear(), s.getMonth())
    const m = parseYmd(minDateYmd)
    if (m) return monthKey(m.getFullYear(), m.getMonth())
    const n = new Date()
    return monthKey(n.getFullYear(), n.getMonth())
  })

  useEffect(() => {
    if (!startDate) {
      setViewMonthKey(minMonthKey)
    }
  }, [startDate, minMonthKey])

  /** 오늘(minDate)이 바뀌면(자정 등) 과거 달 화면에 머물지 않도록 */
  useEffect(() => {
    setViewMonthKey((k) => Math.max(k, minMonthKey))
  }, [minMonthKey])

  /** 데스크톱(두 달): 오른쪽 달이 maxMonthKey 미만이어야 함 → 왼쪽 최대 maxMonthKey - 2 */
  useEffect(() => {
    if (!isMdUp) return
    setViewMonthKey((k) => Math.min(k, maxMonthKey - 2))
  }, [isMdUp, maxMonthKey])

  const left = keyToYm(viewMonthKey)
  const right = keyToYm(addMonthKey(viewMonthKey, 1))

  const canGoPrev = viewMonthKey > minMonthKey
  const canGoNext = isMdUp
    ? addMonthKey(viewMonthKey, 1) < maxMonthKey
    : viewMonthKey < maxMonthKey - 1

  const goPrev = useCallback(() => {
    if (!canGoPrev) return
    setViewMonthKey((k) => addMonthKey(k, -1))
  }, [canGoPrev])

  const goNext = useCallback(() => {
    if (!canGoNext) return
    setViewMonthKey((k) => addMonthKey(k, 1))
  }, [canGoNext])

  const handleDayClick = (year, monthIndex, day) => {
    if (disabled) return
    const cell = new Date(year, monthIndex, day)
    const s = ymd(cell)
    if (minD && cell < minD) return

    if (!startDate || (startDate && endDate)) {
      onChangeRange({ start: s, end: '' })
      return
    }
    if (!endDate) {
      const a = parseYmd(startDate)
      const b = cell
      if (b < a) {
        onChangeRange({ start: s, end: startDate })
      } else if (+b === +a) {
        onChangeRange({ start: s, end: s })
      } else {
        onChangeRange({ start: startDate, end: s })
      }
    }
  }

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-teal-100/80 bg-white shadow-[0_8px_30px_rgba(15,118,110,0.08)] ring-1 ring-teal-50/90 ${
        disabled ? 'pointer-events-none opacity-55' : ''
      }`}
    >
      <div className="flex items-center gap-1 px-2 py-3 sm:px-3">
        <button
          type="button"
          aria-label="이전 달"
          disabled={!canGoPrev || disabled}
          onClick={goPrev}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-teal-800 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 justify-center gap-2 text-center md:grid md:grid-cols-2 md:justify-stretch md:gap-1">
          <span className="truncate text-sm font-bold text-gray-900">
            {left.year}년 {left.monthIndex + 1}월
          </span>
          <span className="hidden truncate text-sm font-bold text-gray-900 md:block">
            {right.year}년 {right.monthIndex + 1}월
          </span>
        </div>
        <button
          type="button"
          aria-label="다음 달"
          disabled={!canGoNext || disabled}
          onClick={goNext}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-teal-800 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 border-t border-teal-100/60 px-2 pb-3 pt-2 sm:px-4 md:grid-cols-2 md:gap-4 md:pb-4">
        <MonthCal
          year={left.year}
          monthIndex={left.monthIndex}
          startDate={startDate}
          endDate={endDate}
          todayYmd={todayYmd}
          minD={minD}
          disabled={disabled}
          onDayClick={handleDayClick}
        />
        <div className="hidden min-w-0 md:block">
          <MonthCal
            year={right.year}
            monthIndex={right.monthIndex}
            startDate={startDate}
            endDate={endDate}
            todayYmd={todayYmd}
            minD={minD}
            disabled={disabled}
            onDayClick={handleDayClick}
          />
        </div>
      </div>
    </div>
  )
}
