/**
 * TripNewStep2Page 목데이터
 *
 * 항공편 예약 여부 선택 화면에 필요한
 * 옵션 카드, 아이콘 SVG paths 등을 관리합니다.
 */

/* ─────────────────────────────────────────────
   스텝 설정
───────────────────────────────────────────── */
export const STEP2_CONFIG = {
  totalSteps: 5,
  currentStep: 1,
}

/* ─────────────────────────────────────────────
   SVG path 상수 (공통 아이콘 — 옵션 카드는 TripNewStep2Page에서 ○ / X 전용 SVG 사용)
───────────────────────────────────────────── */
export const STEP2_ICON_PATHS = {
  chevronRight:
    'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z',
}

/* ─────────────────────────────────────────────
   선택 옵션 카드 (예매 여부)
───────────────────────────────────────────── */
export const OPTION_CARDS = [
  {
    id: 'booked',
    titleDesktop: '네, 예매했어요',
    titleMobile: '네, 예매했어요',
    descDesktop:
      '다음 화면에서 항공 일정과 편명을 입력하고, 맞춤 여행 준비를 시작해 보세요.',
    descMobile:
      '다음 화면에서 항공 일정과 편명을 입력하고, 맞춤 여행 준비를 시작해 보세요.',
    variant: 'primary',
  },
  {
    id: 'notBooked',
    titleDesktop: '아직 안 했어요',
    titleMobile: '아직 안 했어요',
    descDesktop:
      '예매 전이어도 다음으로 넘어가 둘러볼 수 있어요. 항공 정보는 예매 후 입력하시면 됩니다.',
    descMobile:
      '예매 전이어도 다음으로 넘어가 둘러볼 수 있어요. 항공 정보는 예매 후 입력하시면 됩니다.',
    variant: 'secondary',
  },
]
