import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토']

/** 날짜 지정 모드 — 출발·귀국 기준 ±일 여유 (메타데이터, 실제 저장 구간은 사용자가 고른 시작·종료일) */
const FLEXIBILITY_OPTIONS = [
  { value: 0, label: '정확한 날짜' },
  { value: 1, label: '± 1일' },
  { value: 2, label: '± 2일' },
  { value: 3, label: '± 3일' },
  { value: 7, label: '± 7일' },
  { value: 14, label: '± 14일' },
]

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

/** 세로 스크롤 + 가운데 스냅 — 연·월 챗바퀴 선택 */
const WHEEL_ITEM_PX = 48
const WHEEL_VIEW_PX = 216
const WHEEL_PAD_PX = (WHEEL_VIEW_PX - WHEEL_ITEM_PX) / 2

/** 항목 행 중심이 뷰포트 세로 중앙에 오도록 scrollTop 계산 */
function scrollTopForIndex(el, idx) {
  const itemTop = WHEEL_PAD_PX + idx * WHEEL_ITEM_PX
  const target = itemTop + WHEEL_ITEM_PX / 2 - WHEEL_VIEW_PX / 2
  const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight)
  return Math.max(0, Math.min(maxScroll, target))
}

function indexFromScrollTop(scrollTop) {
  const centerInContent = scrollTop + WHEEL_VIEW_PX / 2
  return Math.round((centerInContent - WHEEL_PAD_PX - WHEEL_ITEM_PX / 2) / WHEEL_ITEM_PX)
}

/**
 * 연·월 휠 — 가운데 하이라이트에 값 고정(스냅), 보이는 이전·다음 행은 탭으로 선택
 */
function WheelColumn({ ariaLabel, options, value, onCommit, disabled, alignTrigger = '' }) {
  const ref = useRef(null)
  const settleTimer = useRef(null)
  const optionsRef = useRef(options)
  const valueRef = useRef(value)
  const suppressScrollCommit = useRef(true)
  const userDraggingRef = useRef(false)
  const pointerDragRef = useRef({
    active: false,
    pointerId: null,
    startY: 0,
    startScrollTop: 0,
  })

  optionsRef.current = options
  valueRef.current = value

  const resolveIndex = useCallback((v) => {
    const opts = optionsRef.current
    if (opts.length === 0) return 0
    let idx = opts.findIndex((o) => o.value === v)
    if (idx < 0 && typeof v === 'number') {
      const nums = opts.map((o) => Number(o.value))
      const closest = nums.reduce((best, n) =>
        Math.abs(n - v) < Math.abs(best - v) ? n : best,
      nums[0])
      idx = opts.findIndex((o) => o.value === closest)
    }
    if (idx < 0) idx = 0
    return Math.max(0, Math.min(opts.length - 1, idx))
  }, [])

  const scrollToValue = useCallback(
    (v) => {
      const el = ref.current
      if (!el || optionsRef.current.length === 0) return
      const idx = resolveIndex(v)
      el.scrollTop = scrollTopForIndex(el, idx)
    },
    [resolveIndex],
  )

  const endDrag = useCallback(() => {
    requestAnimationFrame(() => {
      userDraggingRef.current = false
    })
  }, [])

  const optionKey = options.map((o) => o.value).join('|')

  useLayoutEffect(() => {
    if (userDraggingRef.current) return
    suppressScrollCommit.current = true
    scrollToValue(valueRef.current)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        suppressScrollCommit.current = false
      })
    })
  }, [optionKey, alignTrigger, scrollToValue])

  const readCenterIndex = useCallback(() => {
    const el = ref.current
    if (!el) return -1
    const idx = indexFromScrollTop(el.scrollTop)
    return Math.max(0, Math.min(optionsRef.current.length - 1, idx))
  }, [])

  const snapAndCommit = useCallback(() => {
    if (disabled || suppressScrollCommit.current) return
    const el = ref.current
    if (!el) return
    const idx = readCenterIndex()
    const picked = optionsRef.current[idx]?.value
    if (picked === undefined) return
    suppressScrollCommit.current = true
    el.scrollTop = scrollTopForIndex(el, idx)
    if (picked !== valueRef.current) {
      onCommit(picked)
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        suppressScrollCommit.current = false
      })
    })
  }, [disabled, readCenterIndex, onCommit])

  const pickOption = useCallback(
    (v) => {
      if (disabled) return
      suppressScrollCommit.current = true
      scrollToValue(v)
      if (v !== valueRef.current) {
        onCommit(v)
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          suppressScrollCommit.current = false
        })
      })
    },
    [disabled, scrollToValue, onCommit],
  )

  const handleScroll = () => {
    if (disabled || suppressScrollCommit.current) return
    clearTimeout(settleTimer.current)
    settleTimer.current = window.setTimeout(snapAndCommit, 160)
  }

  const handlePointerDown = (e) => {
    if (disabled) return
    const el = ref.current
    if (!el) return
    userDraggingRef.current = true
    pointerDragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startY: e.clientY,
      startScrollTop: el.scrollTop,
    }
    el.setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (disabled) return
    const el = ref.current
    const state = pointerDragRef.current
    if (!el || !state.active || state.pointerId !== e.pointerId) return
    const deltaY = e.clientY - state.startY
    el.scrollTop = state.startScrollTop - deltaY
  }

  const handlePointerUp = (e) => {
    const el = ref.current
    const state = pointerDragRef.current
    if (state.active && state.pointerId === e.pointerId) {
      pointerDragRef.current = { active: false, pointerId: null, startY: 0, startScrollTop: 0 }
      el?.releasePointerCapture?.(e.pointerId)
    }
    endDrag()
  }

  return (
    <div
      className={`relative min-w-0 flex-1 ${disabled ? 'pointer-events-none opacity-45' : ''}`}
      style={{ height: WHEEL_VIEW_PX }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[72px] bg-gradient-to-b from-white via-white to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[72px] bg-gradient-to-t from-white via-white to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-1 top-1/2 z-[1] h-12 -translate-y-1/2 rounded-xl border border-teal-300/50 bg-teal-50/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]"
        aria-hidden
      />
      <div
        ref={ref}
        role="listbox"
        aria-label={ariaLabel}
        onScroll={handleScroll}
        onPointerDownCapture={handlePointerDown}
        onPointerMoveCapture={handlePointerMove}
        onPointerUpCapture={handlePointerUp}
        onPointerCancelCapture={handlePointerUp}
        onLostPointerCapture={endDrag}
        className="relative z-0 h-full cursor-ns-resize touch-pan-y overflow-y-auto overflow-x-hidden overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
      >
        <div className="shrink-0" style={{ height: WHEEL_PAD_PX }} aria-hidden />
        {options.map((o) => {
          const selected = o.value === value
          return (
            <button
              key={String(o.value)}
              type="button"
              role="option"
              aria-selected={selected}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                pickOption(o.value)
              }}
              className={`flex h-12 w-full shrink-0 items-center justify-center text-[15px] font-semibold transition-colors active:bg-teal-100/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1 ${
                selected ? 'text-teal-900' : 'text-gray-700'
              } ${disabled ? '' : 'cursor-pointer hover:text-teal-800'}`}
            >
              {o.label}
            </button>
          )
        })}
        <div className="shrink-0" style={{ height: WHEEL_PAD_PX }} aria-hidden />
      </div>
    </div>
  )
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
  scheduleMode = 'fixed',
  onScheduleModeChange,
  flexibilityDays = 0,
  onFlexibilityDaysChange,
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
      return
    }
    const s = parseYmd(startDate)
    if (s) setViewMonthKey(monthKey(s.getFullYear(), s.getMonth()))
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

  const minYear = minD ? minD.getFullYear() : new Date().getFullYear()
  const minMonth1 = minD ? minD.getMonth() + 1 : 1
  /** 유연 일정 연도 휠 — 과거만 막고 상한은 넉넉히 (고정 3년 때문에 끝(2029)·12월로 튀는 이슈 방지) */
  const maxYear = minYear + 20

  const flexYearOptions = useMemo(
    () =>
      Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
        const y = minYear + i
        return { value: y, label: `${y}년` }
      }),
    [minYear, maxYear],
  )

  const [wheelYear, setWheelYear] = useState(minYear)
  const [wheelMonth, setWheelMonth] = useState(minMonth1)
  const prevScheduleMode = useRef(scheduleMode)

  /** 선택한 연도가 «오늘이 속한 해»이면 지난 달은 휠에 없음 */
  const flexMonthOptions = useMemo(() => {
    const startM = wheelYear === minYear ? minMonth1 : 1
    const opts = []
    for (let mo = startM; mo <= 12; mo++) {
      opts.push({ value: mo, label: `${mo}월` })
    }
    return opts
  }, [wheelYear, minYear, minMonth1])

  const pickFlexibleMonth = useCallback(
    (y, mi) => {
      if (disabled) return
      const dim = daysInMonth(y, mi)
      let start = `${y}-${String(mi + 1).padStart(2, '0')}-01`
      const end = `${y}-${String(mi + 1).padStart(2, '0')}-${String(dim).padStart(2, '0')}`
      if (minD) {
        const first = parseYmd(start)
        if (first && first < minD) {
          start = minDateYmd
        }
      }
      onScheduleModeChange?.('flexible')
      onChangeRange({ start, end })
    },
    [disabled, minD, minDateYmd, onScheduleModeChange, onChangeRange],
  )

  const applyFlexPair = useCallback(
    (y, month1) => {
      if (disabled) return
      let ny = y
      let nm = month1
      if (ny < minYear) ny = minYear
      if (ny > maxYear) ny = maxYear
      if (ny === minYear) nm = Math.max(nm, minMonth1)
      nm = Math.min(12, Math.max(1, nm))
      setWheelYear(ny)
      setWheelMonth(nm)
      pickFlexibleMonth(ny, nm - 1)
    },
    [disabled, minYear, maxYear, minMonth1, pickFlexibleMonth],
  )

  useEffect(() => {
    if (scheduleMode !== 'flexible') {
      prevScheduleMode.current = scheduleMode
      return
    }

    const entering = prevScheduleMode.current !== 'flexible'
    prevScheduleMode.current = scheduleMode

    const datesCleared = !startDate && !endDate
    if (!entering && !datesCleared) return

    let y = minYear
    let m = minMonth1
    if (startDate) {
      const p = parseYmd(startDate)
      if (p) {
        y = p.getFullYear()
        m = p.getMonth() + 1
        if (y < minYear) y = minYear
        if (y > maxYear) y = maxYear
        if (y === minYear) m = Math.max(m, minMonth1)
        m = Math.min(12, Math.max(1, m))
      }
    }
    setWheelYear(y)
    setWheelMonth(m)
    if (!disabled) {
      pickFlexibleMonth(y, m - 1)
    }
  }, [
    scheduleMode,
    startDate,
    endDate,
    disabled,
    minYear,
    minMonth1,
    maxYear,
    pickFlexibleMonth,
  ])

  /** 자정 등으로 오늘(YYYY-MM-DD)이 바뀐 경우에만 — 휠 값 클램프 + 해당 달 구간 재적용 */
  const prevMinDateYmd = useRef(minDateYmd)
  useEffect(() => {
    if (scheduleMode !== 'flexible' || disabled) return
    if (prevMinDateYmd.current === minDateYmd) return
    prevMinDateYmd.current = minDateYmd

    const y = Math.min(maxYear, Math.max(minYear, wheelYear))
    const startM = y === minYear ? minMonth1 : 1
    let m = wheelMonth
    if (m < startM) m = startM
    if (m > 12) m = 12
    if (y !== wheelYear || m !== wheelMonth) {
      setWheelYear(y)
      setWheelMonth(m)
    }
    pickFlexibleMonth(y, m - 1)
  }, [
    minDateYmd,
    scheduleMode,
    disabled,
    wheelYear,
    wheelMonth,
    minYear,
    maxYear,
    minMonth1,
    pickFlexibleMonth,
  ])

  const setMode = (mode) => {
    if (disabled) return
    onScheduleModeChange?.(mode)
  }

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-teal-100/80 bg-white shadow-[0_8px_30px_rgba(15,118,110,0.08)] ring-1 ring-teal-50/90 ${
        disabled ? 'pointer-events-none opacity-55' : ''
      }`}
    >
      {/* 탭: 날짜 지정 / 유연한 일정 */}
      <div className="px-3 pt-4 sm:px-4">
        <div
          className="mx-auto flex max-w-md rounded-full bg-teal-100/50 p-1 ring-1 ring-teal-100/60"
          role="tablist"
          aria-label="일정 선택 방식"
        >
          <button
            type="button"
            role="tab"
            aria-selected={scheduleMode === 'fixed'}
            className={`flex-1 rounded-full px-3 py-2 text-center text-xs font-bold transition sm:text-sm ${
              scheduleMode === 'fixed'
                ? 'bg-white text-teal-900 shadow-sm ring-1 ring-teal-200/80'
                : 'text-teal-800/75 hover:text-teal-900'
            }`}
            onClick={() => setMode('fixed')}
          >
            날짜 지정
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={scheduleMode === 'flexible'}
            className={`flex-1 rounded-full px-3 py-2 text-center text-xs font-bold transition sm:text-sm ${
              scheduleMode === 'flexible'
                ? 'bg-white text-teal-900 shadow-sm ring-1 ring-teal-200/80'
                : 'text-teal-800/75 hover:text-teal-900'
            }`}
            onClick={() => setMode('flexible')}
          >
            유연한 일정
          </button>
        </div>
      </div>

      {scheduleMode === 'fixed' ? (
        <>
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

        </>
      ) : (
        <div className="border-t border-teal-100/60 px-3 py-4 sm:px-4">
          <p className="mb-1 text-sm font-semibold text-teal-900">유연한 일정</p>
          <p className="mb-4 text-xs leading-relaxed text-gray-600 sm:text-sm">
            여행 날짜가 정해지지 않았다면 유연하게 일정을 설정해주세요!
          </p>

          <div className="relative rounded-2xl border border-teal-100/80 bg-gradient-to-b from-teal-50/50 to-white px-2 py-3 shadow-inner">
            <div className="mb-2 flex justify-center gap-6 border-b border-teal-100/60 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700/85">연도</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700/85">월</span>
            </div>
            <div className="flex gap-1 sm:gap-3">
              <WheelColumn
                ariaLabel="여행 연도"
                options={flexYearOptions}
                value={wheelYear}
                disabled={disabled}
                alignTrigger={minDateYmd}
                onCommit={(y) => applyFlexPair(y, wheelMonth)}
              />
              <WheelColumn
                key={`flex-mo-${minDateYmd}-${wheelYear}`}
                ariaLabel="여행 월"
                options={flexMonthOptions}
                value={wheelMonth}
                disabled={disabled}
                alignTrigger={minDateYmd}
                onCommit={(m1) => applyFlexPair(wheelYear, m1)}
              />
              </div>
          </div>
        </div>
      )}
    </div>
  )
}
