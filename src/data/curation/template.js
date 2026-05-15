export default {
  code: 'country-code',       // 라우트 식별자 예) 'france'
  flag: '🏳️',                 // 국가 이모지
  name: '국가명',              // 예) '프랑스'
  cities: ['도시1', '도시2', '도시3'],  // 히어로 칩 목록

  photos: {
    hero: 'https://images.unsplash.com/photo-XXXX?w=1400&q=85&fit=crop',
    sections: [
      'https://images.unsplash.com/photo-XXXX?w=900&q=85',  // 섹션1 이미지
      'https://images.unsplash.com/photo-XXXX?w=900&q=85',  // 섹션2 이미지
      'https://images.unsplash.com/photo-XXXX?w=900&q=85',  // 섹션3 이미지
      'https://images.unsplash.com/photo-XXXX?w=900&q=85',  // 섹션4 이미지
      'https://images.unsplash.com/photo-XXXX?w=900&q=85',  // CTA 배너 배경
    ],
  },

  hero: {
    title: '국가명 여행 완벽 준비 가이드',
    subtitle: '도시1·도시2 공통 필수 준비물부터 환전·앱까지 한 번에',
  },

  sections: [
    {
      id: 'packing',          // 앵커 ID (영문 소문자)
      icon: '🧳',
      title: '섹션 제목',
      body: '본문 단락1\n\n본문 단락2',  // \n\n으로 단락 구분
      photo: 'https://images.unsplash.com/photo-XXXX?w=900&q=85',
      relatedCats: ['의류', '짐'],       // checklist의 cat 값과 일치
      tip: {
        icon: '💡',
        body: '팁 내용',                 // null이면 TipBox 미표시
      },
    },
    {
      id: 'money',
      icon: '💰',
      title: '환전 & 결제',
      body: '본문',
      photo: 'https://images.unsplash.com/photo-XXXX?w=900&q=85',
      relatedCats: ['환전'],
      tip: null,
    },
    {
      id: 'apps',
      icon: '📱',
      title: '필수 앱',
      body: '본문',
      photo: 'https://images.unsplash.com/photo-XXXX?w=900&q=85',
      relatedCats: ['앱', '전자기기'],
      tip: null,
    },
    {
      id: 'health',
      icon: '🏥',
      title: '건강 & 안전',
      body: '본문',
      photo: 'https://images.unsplash.com/photo-XXXX?w=900&q=85',
      relatedCats: ['건강'],
      tip: {
        icon: '⚠️',
        body: '주의사항',
      },
    },
  ],

  apps: [
    {
      name: '앱이름',
      iconUrl: 'https://www.google.com/s2/favicons?domain=앱도메인.com&sz=128',
      emoji: '📱',   // 아이콘 로드 실패 시 폴백
      desc: '앱 설명',
    },
  ],

  checklist: [
    { cat: '📄 서류', items: ['항목1', '항목2'] },
    { cat: '💴 환전', items: ['항목1', '항목2'] },
    { cat: '👕 의류', items: ['항목1', '항목2'] },
    { cat: '🌿 건강', items: ['항목1', '항목2'] },
    { cat: '🔌 전자기기', items: ['항목1', '항목2'] },
    { cat: '📱 앱', items: ['항목1', '항목2'] },
    { cat: '🎒 짐', items: ['항목1', '항목2'] },
  ],

  footerCta: {
    title: '나만의 국가명 여행 체크리스트,\n지금 바로 만들어보세요 🗺️',
    subtitle: 'AI가 여행 날짜·동행·스타일을 분석해 딱 맞는 준비물을 추천해드려요',
  },
}
