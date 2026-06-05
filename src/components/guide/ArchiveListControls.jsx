import { useState, useRef, useEffect } from 'react'

const STATUS_TABS = [
  { id: 'not_started', label: '시작 전' },
  { id: 'preparing',   label: '준비 중' },
  { id: 'completed',   label: '완료' },
  { id: 'shared',      label: '👥 함께' }, // 공동 편집 중인 체크리스트만
]

function FilterIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  )
}

function ChevronDown({ open, className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={`${className} transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function CheckIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function ArchiveListControls({
  filterTab,
  onTabChange,
  deleteMode,
  hasArchives,
  allSelected,
  selectedCount,
  onEnterDeleteMode,
  onSelectAll,
  onDeleteSelected,
  onExitDeleteMode,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!dropdownOpen) return
    const handleClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  const activeLabel = STATUS_TABS.find((t) => t.id === filterTab)?.label ?? ''

  return (
    <div className="mb-6 flex w-full items-center gap-2">

      {/* 모바일·태블릿: 필터 아이콘 + 드롭다운 */}
      <div className="relative md:hidden" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-white active:bg-white"
        >
          <FilterIcon />
          <span>{activeLabel}</span>
          <ChevronDown open={dropdownOpen} />
        </button>

        {dropdownOpen && (
          <div
            role="listbox"
            aria-label="체크리스트 필터"
            className="absolute left-0 top-full z-20 mt-1.5 w-32 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg"
          >
            {STATUS_TABS.map((tab) => {
              const active = filterTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { onTabChange(tab.id); setDropdownOpen(false) }}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    active ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex-1 text-left">{tab.label}</span>
                  {active && <CheckIcon className="h-4 w-4 text-sky-500" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 데스크탑: 기존 pill 탭 */}
      <div
        className="hidden md:inline-flex gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1 shadow-sm"
        role="tablist"
        aria-label="체크리스트 필터"
      >
        {STATUS_TABS.map((tab) => {
          const active = filterTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.id)}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${
                active ? 'bg-sky-100 text-sky-950 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {hasArchives && !deleteMode && (
        <button
          type="button"
          onClick={onEnterDeleteMode}
          className="ml-auto shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 shadow-sm transition-colors hover:bg-red-50 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
        >
          삭제
        </button>
      )}

      {hasArchives && deleteMode && (
        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-[11px] font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
          >
            {allSelected ? '전체 해제' : '전체선택'}
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={selectedCount === 0}
            className="rounded-lg border border-red-300 bg-red-50 px-2 py-2 text-[11px] font-bold text-red-800 shadow-sm transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
          >
            선택한 목록 삭제
          </button>
          <button
            type="button"
            onClick={onExitDeleteMode}
            className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-[11px] font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
          >
            취소
          </button>
        </div>
      )}
    </div>
  )
}
