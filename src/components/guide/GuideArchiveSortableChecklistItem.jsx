import { useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GUIDE_ARCHIVE_LEGACY_AI_CATEGORY } from '@/utils/guideArchiveChecklistReorder'
import aiSparklesImg from '@/assets/ai-sparkles.png'
import AiSparkleMaskIcon from '@/components/search/AiSparkleMaskIcon'

const SORTABLE_TRANSITION = {
  duration: 260,
  easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
}

function AiRecommendedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50/90 px-2 py-0.5 text-[10px] font-bold leading-none tracking-wide text-violet-800">
      <img src={aiSparklesImg} alt="" aria-hidden className="h-3.5 w-3.5 object-contain" />
      MATE추천
    </span>
  )
}

/**
 * DragOverlay용 — 목록 카드와 동일 레이아웃(포인터 이벤트 없음)
 */
export function GuideArchiveChecklistDragPreview({ item, checks }) {
  const id = String(item.id)
  const on = Boolean(checks[id])
  const showCheckedStyle = on
  const isAiOrigin =
    (item?.category ?? '_misc') === GUIDE_ARCHIVE_LEGACY_AI_CATEGORY ||
    item?.prepType === 'ai_recommend'

  const cardToneClass = on
    ? 'border-amber-400 bg-amber-200 shadow-sm ring-1 ring-amber-300/70'
    : isAiOrigin
      ? 'border-violet-200 bg-violet-50 shadow-sm shadow-violet-900/5 ring-1 ring-violet-100'
      : 'border-gray-100 bg-white shadow-sm'

  return (
    <div
      className="w-full cursor-grabbing touch-manipulation drop-shadow-[0_14px_36px_-8px_rgba(15,23,42,0.28)]"
      style={{ pointerEvents: 'none' }}
    >
      <div className={`flex min-w-0 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 ${cardToneClass}`}>
        <input
          type="checkbox"
          checked={on}
          readOnly
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none h-5 w-5 shrink-0 rounded border-gray-300 accent-amber-600"
        />
        <span className="min-w-0 flex-1">
          {isAiOrigin ? (
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-800 sm:hidden">
              <AiSparkleMaskIcon selected={false} className="h-3 w-3" />
              MATE추천
            </span>
          ) : null}
          <span className="flex items-start justify-between gap-2">
            <span
              className={`block text-sm font-semibold ${
                showCheckedStyle
                  ? 'text-gray-900 line-through decoration-amber-700/45'
                  : 'text-gray-900'
              }`}
            >
              {item.title}
            </span>
            {isAiOrigin ? (
              <span className="hidden sm:inline-flex">
                <AiRecommendedBadge />
              </span>
            ) : null}
          </span>
          {item.description ? (
            <span
              className={`mt-1 block text-xs leading-relaxed ${showCheckedStyle ? 'text-gray-700' : 'text-gray-600'}`}
            >
              {item.description}
            </span>
          ) : null}
          {item.detail ? (
            <span
              className={`mt-2 block border-l-2 pl-2 text-xs leading-relaxed ${
                showCheckedStyle
                  ? 'border-amber-300 text-gray-700'
                  : isAiOrigin
                    ? 'border-violet-300/90 text-gray-600'
                    : 'border-cyan-200 text-gray-500'
              }`}
            >
              {item.detail}
            </span>
          ) : null}
        </span>
      </div>
    </div>
  )
}

function RowActionIconButton({ onClick, ariaLabel, variant, tone = 'neutral', children }) {
  const isAi = variant === 'ai'
  const cls =
    tone === 'danger'
      ? isAi
        ? 'border-red-300 bg-red-50/95 text-red-800 hover:bg-red-100'
        : 'border-red-200 bg-white text-red-700 hover:bg-red-50'
      : isAi
        ? 'border-violet-200 bg-violet-50/90 text-violet-900 hover:bg-violet-100'
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
  const focusRing = tone === 'danger' ? 'focus-visible:outline-red-500' : isAi ? 'focus-visible:outline-violet-500' : 'focus-visible:outline-sky-500'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 md:h-8 md:w-8 ${cls} ${focusRing}`}
    >
      {children}
    </button>
  )
}

const SWIPE_ACTION_WIDTH = 80 // px — 모바일 스와이프로 노출되는 액션 영역 너비

const EditIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
)

const DeleteIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
)

/**
 * 보관함 체크리스트 행
 * - 모바일: 드래그 핸들은 카드 왼쪽 인라인, 좌로 스와이프하면 수정/삭제 버튼 노출 (카카오톡 스타일)
 * - 데스크톱(md+): 드래그 핸들은 카드 바깥 왼쪽(-left-10) 절대 배치, 수정/삭제 버튼은 카드 오른쪽에 항상 표시
 */
export default function GuideArchiveSortableChecklistItem({
  item,
  sortableDisabled,
  checks,
  handleToggle,
  onEditItem,
  onDeleteItem,
  actionVariant = 'default',
}) {
  const id = String(item.id)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: sortableDisabled,
    transition: SORTABLE_TRANSITION,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
  }

  // ── 스와이프 상태 (DOM 직접 조작으로 jank 없이 부드럽게) ────────────
  const cardInnerRef = useRef(null)
  const liRef = useRef(null)
  const touchState = useRef({ startX: 0, startY: 0, startOffset: 0, isHoriz: false, isVert: false })
  const currentXRef = useRef(0)

  const setCardX = (x, animated = true) => {
    const el = cardInnerRef.current
    if (!el) return
    el.style.transition = animated ? 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)' : 'none'
    el.style.transform = `translateX(${-x}px)`
    currentXRef.current = x
  }

  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return
    touchState.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      startOffset: currentXRef.current,
      isHoriz: false,
      isVert: false,
    }
  }

  const onTouchMove = (e) => {
    const s = touchState.current
    if (s.isVert || e.touches.length !== 1) return
    const dx = s.startX - e.touches[0].clientX
    const dy = Math.abs(e.touches[0].clientY - s.startY)
    if (!s.isHoriz) {
      if (dy > Math.abs(dx)) { s.isVert = true; return }
      if (Math.abs(dx) < 5) return
      s.isHoriz = true
    }
    setCardX(Math.max(0, Math.min(SWIPE_ACTION_WIDTH, s.startOffset + dx)), false)
  }

  const onTouchEnd = () => {
    if (!touchState.current.isHoriz) return
    setCardX(currentXRef.current >= SWIPE_ACTION_WIDTH * 0.4 ? SWIPE_ACTION_WIDTH : 0)
  }

  // 카드 열린 상태에서 탭하면 닫기 (체크박스 토글 방지)
  const onClickCapture = (e) => {
    if (currentXRef.current > 0) {
      e.stopPropagation()
      e.preventDefault()
      setCardX(0)
    }
  }

  // 카드가 열린 상태에서 외부 터치/클릭 시 부드럽게 닫기
  useEffect(() => {
    const close = (e) => {
      if (currentXRef.current <= 0) return
      if (liRef.current?.contains(e.target)) return
      setCardX(0)
    }
    document.addEventListener('touchstart', close, { passive: true })
    document.addEventListener('mousedown', close)
    return () => {
      document.removeEventListener('touchstart', close)
      document.removeEventListener('mousedown', close)
    }
  }, [])

  // ── 파생값 ────────────────────────────────────────────────────────────
  const on = Boolean(checks[id])
  const showCheckedStyle = on
  const isAi = actionVariant === 'ai'
  const isAiOrigin =
    (item?.category ?? '_misc') === GUIDE_ARCHIVE_LEGACY_AI_CATEGORY ||
    item?.prepType === 'ai_recommend'

  const dragHandleProps = !sortableDisabled ? { ...listeners, ...attributes } : {}
  const stop = (e) => e.stopPropagation()

  const gripColor = isAi ? 'text-violet-300' : 'text-slate-300'
  const gripBorderMd = isAi
    ? 'md:border md:border-violet-100 md:bg-violet-50/50 md:rounded-lg md:text-violet-500'
    : 'md:border md:border-slate-100 md:bg-slate-50/80 md:rounded-lg md:text-slate-400'

  const cardToneClass = on
    ? 'border-amber-400 bg-amber-200 shadow-sm ring-1 ring-amber-300/70'
    : isAiOrigin
      ? 'border-violet-200 bg-violet-50 shadow-sm shadow-violet-900/5 ring-1 ring-violet-100'
      : 'border-gray-100 bg-white shadow-sm'

  const actionRailBorder = isAiOrigin && !on ? 'border-violet-200/55' : 'border-slate-100/90'

  // 모바일 액션 영역 배경: 카드 색상과 자연스럽게 어울리도록
  const mobileActionBg = on
    ? 'bg-amber-100'
    : isAiOrigin
      ? 'bg-violet-50'
      : 'bg-gray-50'

  return (
    <li
      ref={(node) => { liRef.current = node; setNodeRef(node) }}
      data-guide-archive-dnd-item={id}
      style={style}
      className={`relative list-none transition-[opacity,filter] duration-200 ease-out ${
        isDragging ? 'opacity-[0.38] saturate-75' : ''
      }`}
    >
      {/* 스와이프 클리핑 컨테이너 — 모바일에서 overflow-hidden 으로 카드 밖으로 튀어나가는 부분 차단 */}
      <div className="relative overflow-hidden rounded-xl md:overflow-visible md:rounded-2xl">

        {/* 모바일 전용: 스와이프로 드러나는 액션 영역 */}
        <div
          aria-hidden
          className={`absolute right-0 top-0 flex h-full w-20 items-center justify-center gap-2 rounded-r-xl md:hidden ${mobileActionBg}`}
        >
          <RowActionIconButton
            variant={actionVariant}
            ariaLabel="이 항목 수정"
            onClick={() => { setCardX(0); onEditItem?.(item) }}
          >
            <EditIcon />
          </RowActionIconButton>
          <RowActionIconButton
            variant={actionVariant}
            tone="danger"
            ariaLabel="이 항목 삭제"
            onClick={() => { setCardX(0); onDeleteItem?.(item) }}
          >
            <DeleteIcon />
          </RowActionIconButton>
        </div>

        {/* 메인 카드 — 터치 스와이프로 translateX */}
        <div
          ref={cardInnerRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClickCapture={onClickCapture}
          className={`relative flex min-w-0 w-full items-center gap-1 rounded-xl border py-1.5 pl-2.5 pr-2.5 transition-[border-color,background-color,box-shadow] duration-200 ease-out md:rounded-2xl md:border-2 md:py-2 md:pl-3 md:pr-2 ${cardToneClass}`}
        >
          {/* 드래그 핸들 */}
          <button
            type="button"
            {...dragHandleProps}
            disabled={sortableDisabled}
            title="드래그하여 순서 변경"
            aria-label="드래그하여 순서 변경"
            onPointerDown={stop}
            onClick={stop}
            className={`inline-flex h-6 w-6 shrink-0 items-center justify-center touch-none select-none md:h-8 md:w-8 md:absolute md:-left-10 md:top-1/2 md:-translate-y-1/2 ${
              sortableDisabled
                ? `cursor-not-allowed opacity-40 ${gripColor}`
                : `cursor-grab active:cursor-grabbing ${gripColor} ${gripBorderMd}`
            }`}
          >
            <svg className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="9" cy="6" r="1.2" />
              <circle cx="15" cy="6" r="1.2" />
              <circle cx="9" cy="12" r="1.2" />
              <circle cx="15" cy="12" r="1.2" />
              <circle cx="9" cy="18" r="1.2" />
              <circle cx="15" cy="18" r="1.2" />
            </svg>
          </button>

          {/* 체크박스 + 텍스트 */}
          <label className="flex min-w-0 min-h-0 flex-1 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={on}
              onChange={() => handleToggle(item.id)}
              aria-label={`${item.title ?? '항목'} 완료 표시`}
              className="relative z-10 h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300 accent-amber-600"
            />
            <div className="min-w-0 flex-1 py-1.5">
              {isAiOrigin ? (
                <span className="mb-1 block sm:hidden"><AiRecommendedBadge /></span>
              ) : null}
              <span className="flex items-start justify-between gap-2">
                <span className={`block text-sm font-semibold ${showCheckedStyle ? 'text-gray-900 line-through decoration-amber-700/45' : 'text-gray-900'}`}>
                  {item.title}
                </span>
                {isAiOrigin ? <span className="hidden sm:inline-flex"><AiRecommendedBadge /></span> : null}
              </span>
              {item.description ? (
                <span className={`mt-1 block text-xs leading-relaxed ${showCheckedStyle ? 'text-gray-700' : 'text-gray-600'}`}>
                  {item.description}
                </span>
              ) : null}
              {item.detail ? (
                <span className={`mt-2 block border-l-2 pl-2 text-xs leading-relaxed ${showCheckedStyle ? 'border-amber-300 text-gray-700' : isAiOrigin ? 'border-violet-300/90 text-gray-600' : 'border-cyan-200 text-gray-500'}`}>
                  {item.detail}
                </span>
              ) : null}
            </div>
          </label>

          {/* 데스크톱 전용 액션 버튼 (항상 표시) */}
          <div
            className={`hidden md:flex shrink-0 flex-col items-center justify-center gap-1 border-l pl-2 ${actionRailBorder}`}
            onPointerDown={stop}
            onClick={stop}
          >
            <RowActionIconButton variant={actionVariant} ariaLabel="이 항목 수정" onClick={() => onEditItem?.(item)}>
              <EditIcon />
            </RowActionIconButton>
            <RowActionIconButton variant={actionVariant} tone="danger" ariaLabel="이 항목 삭제" onClick={() => onDeleteItem?.(item)}>
              <DeleteIcon />
            </RowActionIconButton>
          </div>
        </div>
      </div>
    </li>
  )
}
