/**
 * AiPlannerFab — "메이퀸에게 물어봐!" 화면 고정 버튼 (FAB)
 *
 * - md 이상: 우측 하단 pill + 문구
 * - 모바일: 우측 하단 원형 · 아이콘만 (다른 하단 UI와 겹침 방지)
 * - mobileBottom: 페이지별 하단 고정 UI(탭·CTA) 높이에 맞춤 Tailwind bottom 클래스
 */
const FAB_ICON_SRC = '/ai-planner-fab-icon.png'

export default function AiPlannerFab({
  /** 모바일 전용 `bottom-*` (예: step3은 하단 CTA 위로: bottom-[11rem]) */
  mobileBottomClassName,
  className = '',
}) {
  const mobileBottom =
    mobileBottomClassName?.trim() ||
    'bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))]'

  return (
    <button
      type="button"
      aria-label="메이퀸에게 물어봐"
      className={`
        fixed z-50 right-4 ${mobileBottom}
        md:bottom-8 md:right-8
        flex items-center justify-center
        h-14 w-14 shrink-0 rounded-full border border-orange-200/80
        bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100/90 shadow-xl
        transition-all duration-200 hover:scale-105 hover:shadow-2xl
        hover:from-orange-100/95 hover:via-amber-100/80 hover:to-orange-100
        md:h-auto md:w-auto md:rounded-full md:border-0 md:px-5 md:py-3 md:shadow-xl
        ${className}
      `
        .trim()
        .replace(/\s+/g, ' ')}
    >
      {/* 모바일: 아이콘만 · 원형 버튼 */}
      <span className="flex h-full w-full items-center justify-center md:hidden">
        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-amber-50/90 p-1 ring-1 ring-amber-100/80">
          <img
            src={FAB_ICON_SRC}
            alt=""
            className="h-full w-full object-contain object-center"
            draggable={false}
          />
        </span>
      </span>

      {/* 데스크톱: 기존 pill */}
      <span className="hidden items-center gap-2 md:flex">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-50/90 p-1 ring-1 ring-amber-100/80">
          <img
            src={FAB_ICON_SRC}
            alt=""
            className="h-full w-full object-contain object-center"
            draggable={false}
          />
        </span>
        <span className="whitespace-nowrap text-sm text-gray-800">
          <span className="font-black tracking-tight text-gray-900">메이퀸</span>
          <span className="font-semibold">에게 물어봐!</span>
        </span>
      </span>
    </button>
  )
}
