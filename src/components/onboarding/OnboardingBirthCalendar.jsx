import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { ko } from 'date-fns/locale'
import { startOfMonth } from 'date-fns'

import OnboardingCustomSelect from '@/components/onboarding/OnboardingCustomSelect'
import 'react-day-picker/style.css'

/** 로컬 날짜 문자열 YYYY-MM-DD → Date (UTC 오프셋으로 하루 밀림 방지) */
function parseLocalDateString(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

function toIsoDateString(date) {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${mo}-${d}`
}

function clampMonthToRange(monthDate, rangeStart, rangeEnd) {
  const m = startOfMonth(monthDate)
  const rs = startOfMonth(rangeStart)
  const re = startOfMonth(rangeEnd)
  if (m < rs) return rs
  if (m > re) return re
  return m
}

/**
 * 체크메이트 톤 날짜 선택 (생년월일·만료일·발급일 등)
 * - 연/월은 커스텀 select + DayPicker 그리드
 * @param {{ value: string, onChange: (iso: string) => void, minDate?: Date, maxDate?: Date, initialEmptyYear?: number }} props
 * - minDate/maxDate 미지정 시: 생년월일 기본 범위 (1900-01-01 ~ 오늘)
 * - initialEmptyYear: value가 비었을 때 처음 보여 줄 연도(1월 기준, 범위로 clamp)
 */
export default function OnboardingBirthCalendar({
  value,
  onChange,
  minDate: minDateProp,
  maxDate: maxDateProp,
  initialEmptyYear,
}) {
  const selected = useMemo(() => parseLocalDateString(value), [value])

  const today = useMemo(() => {
    const t = new Date()
    t.setHours(23, 59, 59, 999)
    return t
  }, [])

  const rangeStart = useMemo(() => minDateProp ?? new Date(1900, 0, 1), [minDateProp])
  const rangeEnd = useMemo(() => maxDateProp ?? today, [maxDateProp, today])

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const sel = parseLocalDateString(value)
    let seed
    if (sel) {
      seed = sel
    } else if (initialEmptyYear != null) {
      seed = new Date(initialEmptyYear, 0, 1)
    } else {
      const midYear = Math.floor((rangeStart.getFullYear() + rangeEnd.getFullYear()) / 2)
      seed = new Date(midYear, 0, 1)
    }
    return clampMonthToRange(startOfMonth(seed), rangeStart, rangeEnd)
  })

  /** 날짜 미선택 시: min/max 범위가 잡힌 뒤에도 initialEmptyYear(예: 2000·2030·2015)가 연도 드롭다운·그리드에 반영되도록 동기화 */
  useLayoutEffect(() => {
    if (value) return
    if (initialEmptyYear == null) return
    const seed = clampMonthToRange(startOfMonth(new Date(initialEmptyYear, 0, 1)), rangeStart, rangeEnd)
    setVisibleMonth(seed)
  }, [value, initialEmptyYear, rangeStart, rangeEnd])

  useEffect(() => {
    if (!value) return
    const d = parseLocalDateString(value)
    if (d) setVisibleMonth(clampMonthToRange(startOfMonth(d), rangeStart, rangeEnd))
  }, [value, rangeStart, rangeEnd])

  const year = visibleMonth.getFullYear()
  const monthIndex = visibleMonth.getMonth()

  const yearOptions = useMemo(() => {
    const startY = rangeStart.getFullYear()
    const endY = rangeEnd.getFullYear()
    const list = []
    for (let y = startY; y <= endY; y += 1) list.push(y)
    return list
  }, [rangeStart, rangeEnd])

  const setYear = (y) => {
    const next = new Date(y, monthIndex, 1)
    setVisibleMonth(clampMonthToRange(next, rangeStart, rangeEnd))
  }

  const setMonth = (m) => {
    const next = new Date(year, m, 1)
    setVisibleMonth(clampMonthToRange(next, rangeStart, rangeEnd))
  }

  return (
    <div
      className="onboarding-birth-calendar-wrap overflow-hidden rounded-2xl border border-teal-100/90 bg-gradient-to-b from-white to-teal-50/35 p-4 shadow-md shadow-teal-900/[0.07] sm:p-5"
      style={{
        ['--rdp-accent-color']: '#0f7663',
        ['--rdp-accent-background-color']: '#ccfbf1',
        ['--rdp-day_button-border-radius']: '10px',
        ['--rdp-day-height']: '2.25rem',
        ['--rdp-day-width']: '2.25rem',
        ['--rdp-day_button-height']: '2.25rem',
        ['--rdp-day_button-width']: '2.25rem',
      }}
    >
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-teal-900/80">연도</span>
          <OnboardingCustomSelect
            aria-label="연도 선택"
            value={year}
            onValueChange={(v) => setYear(Number(v))}
            options={yearOptions.map((y) => ({ value: y, label: `${y}년` }))}
            placeholder="연도"
            listMaxHeightCapPx={320}
            className="!py-3 !text-sm"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-teal-900/80">월</span>
          <OnboardingCustomSelect
            aria-label="월 선택"
            value={monthIndex}
            onValueChange={(v) => setMonth(Number(v))}
            options={Array.from({ length: 12 }, (_, i) => ({
              value: i,
              label: new Date(2000, i, 1).toLocaleString('ko-KR', { month: 'long' }),
            }))}
            placeholder="월"
            listMaxHeightCapPx={320}
            className="!py-3 !text-sm"
          />
        </label>
      </div>

      <DayPicker
        mode="single"
        selected={selected}
        onSelect={(date) => {
          if (!date) return
          onChange(toIsoDateString(date))
        }}
        locale={ko}
        month={visibleMonth}
        onMonthChange={(m) => setVisibleMonth(clampMonthToRange(startOfMonth(m), rangeStart, rangeEnd))}
        disabled={[{ before: rangeStart }, { after: rangeEnd }]}
        startMonth={startOfMonth(rangeStart)}
        endMonth={startOfMonth(rangeEnd)}
        captionLayout="label"
        classNames={{
          root: 'rdp-root w-full max-w-full',
          months: 'w-full',
          month: 'w-full space-y-2',
          month_caption: 'hidden',
          caption_label: 'hidden',
          dropdowns: 'hidden',
          nav: 'hidden',
          button_previous: 'hidden',
          button_next: 'hidden',
          month_grid: 'w-full table-fixed border-collapse',
          weekdays: '',
          weekday:
            'w-[14.28%] p-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-teal-800/90 sm:text-xs',
          weeks: '',
          week: '',
          day: 'rdp-day p-0.5 text-center align-middle',
          day_button:
            'rdp-day_button mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-gray-800 transition hover:bg-teal-100/90 sm:h-10 sm:w-10',
          selected: 'rdp-selected font-bold',
          today: 'rdp-today font-semibold text-teal-700',
          disabled: 'rdp-disabled opacity-35',
          outside: 'rdp-outside opacity-40',
        }}
        components={{
          Nav: () => null,
        }}
      />
    </div>
  )
}
