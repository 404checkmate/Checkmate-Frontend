/**
 * 준비물 탐색(TripSearch) — 시원한 민트·틸 그라데이션(탐색/담기 흐름).
 * 뷰포트 고정으로 스크롤해도 배경이 어색하지 않게 맞춤.
 */
export const TRIP_MINT_PAGE_BACKGROUND_STYLE = {
  backgroundImage: 'linear-gradient(180deg, #E0F7FA 0%, #F0FDFA 45%, #F8FAFC 100%)',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100vw 100vh',
  backgroundPosition: '0 0',
}

/**
 * 준비물 탐색 — 보관함에서 연 「필수품 추가」(`?archiveEntry=` + 유효한 엔트리) 전용 배경.
 * 일반 탐색(민트)·보관함 상세(오렌지)와 구분 — 맑은 스카이·블루 톤.
 */
export const TRIP_SEARCH_MERGE_PAGE_BACKGROUND_STYLE = {
  backgroundImage: 'linear-gradient(180deg, #E0F2FE 0%, #EFF6FF 40%, #F8FAFC 100%)',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100vw 100vh',
  backgroundPosition: '0 0',
}

/**
 * 가이드 보관함 체크리스트 상세(TripGuideArchiveDetailPage) 전용 배경.
 * 탐색(민트)과 구분 — 따뜻한 오렌지·앰버·크림 톤(저장 리스트 정리 맥락), 서비스 앰버 포인트와 조화.
 */
export const TRIP_GUIDE_ARCHIVE_PAGE_BACKGROUND_STYLE = {
  backgroundImage: 'linear-gradient(180deg, #FFEDD5 0%, #FFF7ED 38%, #FFFBEB 72%, #F8FAFC 100%)',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100vw 100vh',
  backgroundPosition: '0 0',
}
