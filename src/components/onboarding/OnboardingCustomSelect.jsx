import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const CHEVRON = (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

/**
 * 네이티브 select 대체 — **열린 목록까지** 체크메이트 톤으로 통일 (OS 기본 회색 팝업 없음).
 * 옵션 패널은 document.body로 포털하여 부모 overflow에 잘리지 않게 함.
 *
 * @param {{ value: string | number, label: string }[]} options
 */
export default function OnboardingCustomSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder = '선택해 주세요',
  disabled = false,
  'aria-label': ariaLabel,
  className = '',
  /** 패널 최대 높이(px). 뷰포트·위/아래 공간에 맞춰 그보다 작게 잘림 */
  listMaxHeightCapPx = 280,
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const listRef = useRef(null)
  const listId = useId()

  const [fixedStyle, setFixedStyle] = useState(() => ({
    top: 0,
    left: 0,
    width: 0,
    bottom: undefined,
    maxHeight: 280,
    placement: 'below',
  }))

  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const gap = 6
    const margin = 8
    const vh = window.innerHeight
    /** 트리거 아래·위로 쓸 수 있는 높이 (스크롤 영역용) */
    const spaceBelow = vh - r.bottom - gap - margin
    const spaceAbove = r.top - gap - margin
    const idealMax = Math.min(listMaxHeightCapPx, vh * 0.45)
    const minComfort = 140

    const openAbove = spaceBelow < minComfort && spaceAbove > spaceBelow

    const width = Math.max(r.width, 160)

    if (openAbove) {
      const maxHeight = Math.min(idealMax, Math.max(96, spaceAbove))
      const bottom = vh - r.top + gap
      setFixedStyle({
        placement: 'above',
        top: undefined,
        bottom,
        left: r.left,
        width,
        maxHeight,
      })
      return
    }

    const maxHeight = Math.min(idealMax, Math.max(96, spaceBelow))
    setFixedStyle({
      placement: 'below',
      top: r.bottom + gap,
      bottom: undefined,
      left: r.left,
      width,
      maxHeight,
    })
  }, [listMaxHeightCapPx])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    const onScroll = () => updatePosition()
    const onResize = () => updatePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open, updatePosition])

  /** 열릴 때 선택 항목이 목록 상단에 오도록 스크롤 (연도 등 긴 목록) */
  useLayoutEffect(() => {
    if (!open || !listRef.current) return
    const list = listRef.current
    const selectedEl = list.querySelector('[role="option"][aria-selected="true"]')
    if (!(selectedEl instanceof HTMLElement)) {
      list.scrollTop = 0
      return
    }
    const listRect = list.getBoundingClientRect()
    const elRect = selectedEl.getBoundingClientRect()
    list.scrollTop += elRect.top - listRect.top
  }, [open, value, options.length])

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      const t = e.target
      if (triggerRef.current?.contains(t)) return
      if (listRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value || String(o.value) === String(value))
    return found?.label
  }, [options, value])

  const triggerClass = [
    'flex w-full items-center justify-between gap-2 rounded-xl border-2 border-cyan-100/95',
    'bg-gradient-to-b from-white via-white to-cyan-50/60',
    'py-3.5 pl-4 pr-3 text-left text-base font-semibold text-gray-900',
    'shadow-sm shadow-cyan-900/[0.04] outline-none transition',
    'hover:border-cyan-200 hover:shadow-md hover:shadow-cyan-900/[0.06]',
    'focus-visible:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500/30',
    'disabled:cursor-not-allowed disabled:opacity-55',
    open ? 'border-cyan-500 ring-2 ring-cyan-500/25' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const listContent = open && !disabled && (
    <div
      ref={listRef}
      id={listId}
      role="listbox"
      className="fixed z-[10000] overflow-y-auto overflow-x-hidden rounded-xl border-2 border-cyan-100 bg-white py-1.5 shadow-xl shadow-cyan-900/15 ring-1 ring-cyan-900/5"
      style={{
        top: fixedStyle.placement === 'above' ? 'auto' : fixedStyle.top,
        bottom: fixedStyle.placement === 'above' ? fixedStyle.bottom : 'auto',
        left: fixedStyle.left,
        width: fixedStyle.width,
        maxHeight: fixedStyle.maxHeight,
      }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value || String(opt.value) === String(value)
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="option"
            aria-selected={isActive}
            className={`flex w-full items-center px-4 py-2.5 text-left text-sm font-semibold transition sm:text-base ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white'
                : 'text-gray-800 hover:bg-cyan-50 active:bg-cyan-100/80'
            }`}
            onClick={() => {
              onValueChange(opt.value)
              setOpen(false)
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        className={triggerClass}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className={selectedLabel ? 'text-gray-900' : 'text-gray-400'}>{selectedLabel ?? placeholder}</span>
        <span
          className={`flex shrink-0 items-center justify-center rounded-lg border border-cyan-100/80 bg-gradient-to-b from-cyan-50 to-teal-50/80 px-2 py-1 text-cyan-700 shadow-sm transition ${
            open ? 'border-cyan-300 text-cyan-800' : ''
          }`}
        >
          {CHEVRON}
        </span>
      </button>
      {typeof document !== 'undefined' && listContent ? createPortal(listContent, document.body) : null}
    </div>
  )
}
