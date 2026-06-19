import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GUIDE_ARCHIVE_LEGACY_AI_CATEGORY } from '@/utils/guideArchiveChecklistReorder'
import aiSparklesImg from '@/assets/ai-sparkles.png'
import AiSparkleMaskIcon from '@/components/search/AiSparkleMaskIcon'
import defaultProfileImg from '@/assets/default-profile.png'
import AffiliateBuyButton from '@/components/ads/AffiliateBuyButton'
import useAffiliateResolver from '@/hooks/useAffiliateResolver'

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

function DirectAddBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50/90 px-2 py-0.5 text-[10px] font-bold leading-none tracking-wide text-teal-700">
      <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
      </svg>
      직접 추가
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
  const isUserAdded = item?.source === 'user_added' || String(item?.id ?? '').startsWith('ga-direct-')

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
          ) : isUserAdded ? (
            <span className="mb-1 inline-flex sm:hidden"><DirectAddBadge /></span>
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
            ) : isUserAdded ? (
              <span className="hidden sm:inline-flex"><DirectAddBadge /></span>
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

/**
 * 개인/공동 짐 협업 행 — scope 배지(클릭 시 전환) + 개인 짐 "n/m명" 집계 + 공동 짐 담당자 피커.
 * 공동 작업 중인 여행(멤버 2명 이상) + 서버 영속화된 항목에서만 표시된다.
 * label 내부에 있으므로 클릭 시 preventDefault 로 체크박스 토글을 막는다.
 */
function CollabRow({ item, meta, tripMembers, myUserId, onScopeToggle, onAssign }) {
  const [assignOpen, setAssignOpen] = useState(false)

  useEffect(() => {
    if (!assignOpen) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setAssignOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [assignOpen])

  const isShared = meta.scope === 'shared'
  const summary = meta.personalSummary
  const assignee = meta.assignee
  const isMeAssigned = assignee && myUserId != null && String(assignee.userId) === String(myUserId)

  const guard = (e, fn) => {
    e.preventDefault()
    e.stopPropagation()
    fn?.()
  }

  return (
    <span className="relative mt-1.5 flex flex-wrap items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
      {/* scope 칩 — 가벼운 고스트 버튼 + ⇄ 아이콘으로 전환 가능함만 살짝 암시 */}
      <button
        type="button"
        title={isShared ? '공동 짐 — 한 명만 준비하면 돼요. 클릭하면 개인 짐으로' : '개인 짐 — 각자 체크해요. 클릭하면 공동 짐으로'}
        onClick={(e) => guard(e, () => onScopeToggle(item))}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold leading-none ring-1 transition-colors ${
          isShared
            ? 'bg-cyan-50 text-cyan-700 ring-cyan-200 hover:bg-cyan-100'
            : 'bg-gray-100 text-gray-500 ring-gray-200 hover:bg-gray-200 hover:text-gray-700'
        }`}
      >
        {isShared ? '👥 공동' : '🧍 개인'}
        {/* ⇄ 전환 아이콘 — 위/아래 화살표는 정렬로 오해돼 좌우 교환 형태로 변경 */}
        <svg className="h-2.5 w-2.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 3l4 4-4 4M20 7H8m0 14-4-4 4-4M4 17h12" />
        </svg>
      </button>

      {/* 개인 짐: 멤버 진척 집계 */}
      {!isShared && summary && summary.memberCount > 1 ? (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold leading-none ring-1 ${
          summary.checkedCount >= summary.memberCount
            ? 'bg-emerald-100 text-emerald-700 ring-emerald-300'
            : 'bg-teal-100 text-teal-800 ring-teal-300'
        }`}>
          {summary.checkedCount >= summary.memberCount ? '✅ ' : ''}{summary.checkedCount}/{summary.memberCount}명 준비 완료
        </span>
      ) : null}

      {/* 공동 짐: 담당자 칩 + 피커 */}
      {isShared ? (
        <>
          <button
            type="button"
            onClick={(e) => guard(e, () => setAssignOpen(true))}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold leading-none transition-colors ${
              assignee
                ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                : 'border-dashed border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {assignee ? (
              <>
                <img
                  src={assignee.profileImageUrl || defaultProfileImg}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-3.5 w-3.5 rounded-full object-cover"
                  onError={(e) => { e.currentTarget.src = defaultProfileImg }}
                />
                {isMeAssigned ? '내가 챙겨요' : `${assignee.nickname} 담당`}
              </>
            ) : (
              <>＋ 담당자 지정</>
            )}
          </button>

          {/* 카드의 overflow-hidden(모바일 스와이프 클리핑)에 잘리지 않도록 portal 로 띄운다
              — 모바일: 바텀시트 / 데스크톱(sm+): 중앙 카드 */}
          {assignOpen && typeof document !== 'undefined'
            ? createPortal(
                <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-4">
                  <button
                    type="button"
                    aria-label="담당자 지정 닫기"
                    className="absolute inset-0 bg-black/30"
                    onClick={(e) => guard(e, () => setAssignOpen(false))}
                  />
                  <div className="relative z-[1] w-full rounded-t-2xl bg-white px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-4 shadow-xl sm:w-80 sm:rounded-2xl sm:pb-4">
                    <p className="mb-1 truncate text-sm font-extrabold text-gray-900">{item.title}</p>
                    <p className="mb-3 text-[11px] text-gray-400">이 공동 짐을 챙길 담당자를 골라 주세요</p>
                    <div className="flex flex-col">
                      {!isMeAssigned && myUserId != null ? (
                        <button
                          type="button"
                          onClick={(e) => guard(e, () => { onAssign(item, myUserId); setAssignOpen(false) })}
                          className="rounded-xl px-3 py-3 text-left text-sm font-bold text-teal-700 hover:bg-teal-50"
                        >
                          🙋 내가 맡을게요
                        </button>
                      ) : null}
                      {tripMembers
                        .filter((m) => String(m.userId) !== String(myUserId ?? ''))
                        .map((m) => (
                          <button
                            key={m.userId}
                            type="button"
                            onClick={(e) => guard(e, () => { onAssign(item, m.userId); setAssignOpen(false) })}
                            className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-gray-50 ${
                              assignee && String(assignee.userId) === String(m.userId) ? 'text-amber-700' : 'text-gray-800'
                            }`}
                          >
                            <img
                              src={m.profileImageUrl || defaultProfileImg}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="h-6 w-6 rounded-full object-cover"
                              onError={(e) => { e.currentTarget.src = defaultProfileImg }}
                            />
                            {m.nickname}
                            {assignee && String(assignee.userId) === String(m.userId) ? (
                              <span className="ml-auto text-[10px] font-bold text-amber-600">현재 담당</span>
                            ) : null}
                          </button>
                        ))}
                      {assignee ? (
                        <button
                          type="button"
                          onClick={(e) => guard(e, () => { onAssign(item, null); setAssignOpen(false) })}
                          className="mt-1 rounded-xl border-t border-gray-50 px-3 py-3 text-left text-sm font-semibold text-gray-400 hover:bg-gray-50"
                        >
                          담당 해제
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>,
                document.body,
              )
            : null}
        </>
      ) : null}
    </span>
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
  lastActor = null,
  handleToggle,
  onEditItem,
  onDeleteItem,
  actionVariant = 'default',
  meta = null,
  tripMembers = [],
  myUserId = null,
  onScopeToggle,
  onAssign,
}) {
  const id = String(item.id)
  const resolveAffiliate = useAffiliateResolver()
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
  const isUserAdded = item?.source === 'user_added' || String(item?.id ?? '').startsWith('ga-direct-')
  // 제휴 구매/예약 버튼 — 템플릿(시드) 항목만. AI추천·직접추가 항목은 제외.
  const affiliate = !isAiOrigin && !isUserAdded ? resolveAffiliate(item.title) : null

  const dragHandleProps = !sortableDisabled ? { ...listeners, ...attributes } : {}
  const stop = (e) => e.stopPropagation()

  const gripColor = isAi ? 'text-violet-400' : 'text-slate-400'
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
              ) : isUserAdded ? (
                <span className="mb-1 block sm:hidden"><DirectAddBadge /></span>
              ) : null}
              <span className="flex items-start justify-between gap-2">
                <span className={`block text-sm font-semibold ${showCheckedStyle ? 'text-gray-900 line-through decoration-amber-700/45' : 'text-gray-900'}`}>
                  {item.title}
                </span>
                {isAiOrigin ? (
                  <span className="hidden sm:inline-flex"><AiRecommendedBadge /></span>
                ) : isUserAdded ? (
                  <span className="hidden sm:inline-flex"><DirectAddBadge /></span>
                ) : null}
              </span>
              {item.description ? (
                <span className={`mt-1 block text-xs leading-relaxed ${showCheckedStyle ? 'text-gray-700' : 'text-gray-600'}`}>
                  {item.description}
                </span>
              ) : null}
              {/* 개인/공동 짐 — 공동 작업 여행(멤버 2+) + 서버 영속 항목에서만.
                  서버 메타 로딩 전에는 기본값(개인)으로 즉시 표시 후 로드되면 갱신 */}
              {onScopeToggle && tripMembers.length > 1 && item.serverId != null && String(item.serverId).trim() ? (
                <CollabRow
                  item={item}
                  meta={meta ?? { scope: 'personal', personalSummary: null, assignee: null }}
                  tripMembers={tripMembers}
                  myUserId={myUserId}
                  onScopeToggle={onScopeToggle}
                  onAssign={onAssign}
                />
              ) : null}
              {/* 수정자 — 준비 상태 칩과 색이 겹쳐 가려지지 않도록 중립 gray 보조 텍스트로 약화 */}
              {lastActor ? (
                <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-gray-400">
                  {lastActor.profileImageUrl ? (
                    <img
                      src={lastActor.profileImageUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-3 w-3 rounded-full object-cover opacity-80"
                    />
                  ) : (
                    <span aria-hidden className="opacity-70">👤</span>
                  )}
                  {lastActor.nickname}님이 수정
                </span>
              ) : null}
              {item.detail ? (
                <span className={`mt-2 block border-l-2 pl-2 text-xs leading-relaxed ${showCheckedStyle ? 'border-amber-300 text-gray-700' : isAiOrigin ? 'border-violet-300/90 text-gray-600' : 'border-cyan-200 text-gray-500'}`}>
                  {item.detail}
                </span>
              ) : null}
            </div>
          </label>

          {/* 제휴 버튼 — 항목명과 수정/삭제 액션 사이, 우측 정렬(수직 중앙) */}
          {affiliate ? (
            <div
              className="flex shrink-0 items-center pr-1"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <AffiliateBuyButton itemTitle={item.title} affiliate={affiliate} surface="guide_archive" />
            </div>
          ) : null}

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
