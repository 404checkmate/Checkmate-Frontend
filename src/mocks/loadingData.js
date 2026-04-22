/**
 * TripLoadingPage 목데이터
 *
 * 로딩 화면 문구는 페이지 진입 시 한 번만 골라 고정됩니다(진행률·시간과 무관).
 */

/* ─────────────────────────────────────────────
   로딩 화면 변형 (방문 1회당 1개만 랜덤 선택)
───────────────────────────────────────────── */
export const LOADING_VARIANTS = [
  {
    headlineDesktop: '캐리어 챙기기 전, 이미 기분은 여행 모드!',
    headlineMobile: '여행 모드 ON! 체크리스트 만드는 중',
    subDesktop: 'Your trip, your checklist — almost ready ✈️',
    highlight: '날씨·일정·스타일',
    subMobileSuffix: '을 반영해\n딱 맞는 준비 리스트를 짜고 있어요.',
    cardLabel: '맞춤 체크리스트 조립 중',
    barLabel: 'PACK YOUR VIBE',
    descDesktop:
      'CHECKMATE가 여행지와 일정에 맞춰 필수품부터 꿀팁까지 한 번에 모아두고 있어요. 곧 가방에 넣을 리스트가 쫙!',
    descMobile:
      '목적지와 일정을 바탕으로 필수 준비물과 꿀팁을 한곳에 모으는 중이에요. 잠시만요!',
  },
  {
    headlineDesktop: '설렘은 100%, 빠진 건 이제 체크리스트뿐!',
    headlineMobile: '설렘 풀충전! 준비 리스트 완성 중',
    subDesktop: 'Curating your smart travel prep list 🧳',
    highlight: '여행 취향',
    subMobileSuffix: '을 담아\n놓치기 싫은 준비만 골라 담아요.',
    cardLabel: '스마트 준비 큐레이션',
    barLabel: 'CHECK & GO',
    descDesktop:
      '짐은 가볍게, 준비는 꽉 차게! 여행 스타일에 맞는 아이템만 골라 CHECKMATE가 정리해 드릴게요.',
    descMobile:
      '가볍게 짐 싸고, 빠짐없이 챙기기! 취향에 맞는 준비만 골라 정리하고 있어요.',
  },
  {
    headlineDesktop: '티켓은 준비됐고, 이제 체크만 하면 돼요',
    headlineMobile: '티켓 OK! 체크리스트 채우는 중',
    subDesktop: 'Turning your plans into a ready-to-go list 🎫',
    highlight: '일정과 동선',
    subMobileSuffix: '를 읽고\n현지에서 통하는 준비를 추천해요.',
    cardLabel: '플랜 → 준비 리스트 변환',
    barLabel: 'TRIP READY MODE',
    descDesktop:
      '예약·일정 정보를 바탕으로 현지에서 진짜 쓸 준비만 쏙 담았어요. 여행 첫날부터 탄탄하게!',
    descMobile:
      '일정과 동선을 보고 현지에서 바로 쓸 준비만 추천 중이에요. 곧 완성!',
  },
  {
    headlineDesktop: '공항 가기 전, CHECKMATE가 먼저 출발!',
    headlineMobile: '출발 전 체크! 리스트 완성 중',
    subDesktop: 'Building your checklist before you board 🌏',
    highlight: '목적지 정보',
    subMobileSuffix: '를 바탕으로\n놓치기 쉬운 준비까지 챙겨요.',
    cardLabel: '여행지 맞춤 체크리스트',
    barLabel: 'READY TO FLY',
    descDesktop:
      '목적지와 일정을 반영해 비자·날씨·현지 정보까지 한곳에 모읍니다. 빠지기 쉬운 준비를 미리 짚어 드릴게요.',
    descMobile:
      '목적지에 맞춰 비자·날씨·유용한 정보를 체크리스트로 정리하고 있어요.',
  },
  {
    headlineDesktop: '완벽한 여행은 꼼꼼한 준비에서 시작돼요',
    headlineMobile: '준비는 든든하게, 체크리스트 완성 중',
    subDesktop: 'Smart prep today, a smooth trip tomorrow 💫',
    highlight: '당신만의 여행',
    subMobileSuffix: '에 맞춰\n필요한 준비만 체크리스트에 담고 있어요.',
    cardLabel: '맞춤 체크리스트 구성',
    barLabel: 'LET\'S CHECK IT',
    descDesktop:
      'CHECKMATE가 여행 스타일과 일정을 읽고, 꼭 필요한 항목만 골라 저장하기 좋은 리스트로 정리하고 있어요.',
    descMobile:
      '필요한 준비만 담은 맞춤 체크리스트를 거의 다 만들었어요. 잠시만 기다려 주세요.',
  },
]

/* ─────────────────────────────────────────────
   TIP (방문 1회당 1개만 랜덤 선택, 순환 없음)
───────────────────────────────────────────── */
export const TIPS = [
  'TIP: 짐은 가볍게, 준비는 든든하게 — CHECKMATE가 대신 기억해 드릴게요!',
  'TIP: 현지 날씨 한번 보면 짐 리스트가 반은 정해져요 ☀️',
  'TIP: 여권·e티켓 스크린샷은 오프라인으로도 저장해 두면 안심!',
  'TIP: 어댑터·보조배터리는 공항 가기 전날 챙기면 스트레스 제로!',
  'TIP: 체크리스트 완료하면 마음만 여행지에 두고 출발하세요 ✈️',
]

/* ─────────────────────────────────────────────
   아이콘 SVG path 데이터
───────────────────────────────────────────── */
export const LOADING_ICON_PATHS = {
  diamond:
    'M12 2L2 9l10 13 10-13L12 2zm0 3.5l6.5 4.5L12 19 5.5 10 12 5.5z',
  sparkles:
    'M12 1L9.5 8.5 2 11l7.5 2.5L12 21l2.5-7.5L22 11l-7.5-2.5L12 1zM5 5l-1 3-3 1 3 1 1 3 1-3 3-1-3-1L5 5zm14 12l-1 2-2 1 2 1 1 2 1-2 2-1-2-1-1-2z',
  trendUp:
    'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  bulb:
    'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z',
  thermometer:
    'M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-2V5c0-.55.45-1 1-1s1 .45 1 1v6h-2z',
}

/* ─────────────────────────────────────────────
   배경 블러 오브 데이터
───────────────────────────────────────────── */
export const BLUR_ORBS = [
  {
    id: 'orb-top-right',
    width: '60vw',
    height: '60vw',
    top: '-10vw',
    right: '-10vw',
    color: 'rgba(6,182,212,0.18)',
    blur: '60px',
  },
  {
    id: 'orb-bottom-left',
    width: '50vw',
    height: '50vw',
    bottom: '-10vw',
    left: '5vw',
    color: 'rgba(14,165,233,0.12)',
    blur: '80px',
  },
]

/* ─────────────────────────────────────────────
   하단 브랜딩 도트 데이터
───────────────────────────────────────────── */
export const BRAND_DOTS = [
  { id: 'dot-1', color: 'bg-cyan-400' },
  { id: 'dot-2', color: 'bg-cyan-300' },
  { id: 'dot-3', color: 'bg-cyan-200', desktopOnly: true },
]
