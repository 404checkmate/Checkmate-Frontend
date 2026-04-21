/**
 * HomePage 목데이터
 *
 * 피처 카드, 푸터 링크 등 반복 렌더링에 사용되는 정적 데이터입니다.
 * 추후 CMS 또는 API로 교체 시 이 파일만 수정하면 됩니다.
 */

/* ─────────────────────────────────────────────
   SVG path 상수 (아이콘)
───────────────────────────────────────────── */
const ICON_PATHS = {
  locationSimple:
    'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
  checklist:
    'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
}

/* ─────────────────────────────────────────────
   피처 카드 데이터
   variant: 'light' | 'highlight'
───────────────────────────────────────────── */
export const FEATURE_CARDS = [
  {
    id: 'why-checklist',
    variant: 'light',
    desktopIcon: { bg: 'bg-cyan-50', color: 'text-cyan-500', path: ICON_PATHS.locationSimple },
    kicker: '왜 쓰면 좋을까?',
    title: '조건만 입력하면,\n메이트가 자동 생성해드려요!',
    description:
      '여행 전, 아직도 여기저기 찾아보고 계신가요?',
    /** 대화체 말풍선 — 원형 번호 뱃지 없이 나열 */
    showStepNumbers: false,
    steps: [
      '아직도 여행 가기 전에 블로그, 유튜브, SNS에서 힘들게 찾고 계세요?',
      '간단한 조건 입력만으로 메이트가 필요한 준비물과 주의사항을 \n한 번에 정리해드려요!',
      '이제 메이트가 여러분의 여행 전 부담을 덜어드릴게요!',
    ],
  },
  {
    id: 'how-to-use',
    variant: 'highlight',
    desktopIcon: { bg: 'bg-amber-300', color: 'text-amber-800', path: ICON_PATHS.checklist },
    kicker: '어떻게 이용하지?',
    title: '저장하고, 열고, 체크하면 됩니다',
    description: '복잡한 단계 없이 저장 → 확인 → 체크 흐름만 기억하세요.',
    steps: [
      '여행과 일정을 정한 뒤, 필요한 준비 항목을 찾아 저장합니다.',
      '리스트를 다시 열고, 필요한 항목을 추가, 체크합니다.',
      '체크리스트에서 하나씩 확인하며 출발 전까지 마무리합니다.',
    ],
    progress: { value: '3', label: '단계로 충분합니다' },
  },
]

/* ─────────────────────────────────────────────
   푸터 링크 데이터
───────────────────────────────────────────── */
export const FOOTER_SECTIONS = [
  {
    id: 'platform',
    title: '서비스',
    links: ['요금 안내', '연동·제휴', '기업·단체 문의'],
  },
  {
    id: 'company',
    title: '회사 소개',
    links: ['서비스 소개', '운영 원칙', '문의하기'],
  },
]

export const FOOTER_BOTTOM_LINKS = [
  { label: '문의하기', href: '#' },
  { label: '개인정보 처리방침', href: '#' },
  { label: '서비스 이용약관', href: '#' },
]
