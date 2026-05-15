const usa = {
  code: 'usa',
  flag: '🇺🇸',
  name: '미국',
  cities: ['뉴욕', '로스앤젤레스', '샌프란시스코', '라스베가스', '하와이'],

  photos: {
    hero: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1400&q=85&fit=crop',
    sections: [
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=85',
      'https://images.unsplash.com/photo-1551316679-9c6ae9dec224?w=900&q=85',
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&q=85',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=85',
    ],
  },

  hero: {
    title: '미국 여행 완벽 준비 가이드 🗽',
    subtitle: '뉴욕·LA·하와이 공통 필수 준비물부터 ESTA·팁 문화까지 한 번에',
    readTime: 5,
    checklistCount: 24,
  },

  sections: [
    {
      id: 'packing',
      relatedCats: ['의류'],
      icon: '🧳',
      title: '짐 싸기 — 도시마다 기후가 다르다',
      body: `미국은 실내 냉방이 극단적으로 강합니다. 한여름 뉴욕이나 LA에서도 레스토랑·쇼핑몰·극장 안은 한겨울처럼 춥게 느껴질 수 있어요. 얇은 긴소매나 가디건은 계절에 상관없이 필수 아이템입니다. 도시 간 기후 차이도 크니 여러 도시를 이동할 계획이라면 레이어드를 기본 원칙으로 삼으세요.\n\n걷는 거리가 매우 길고, 대중교통보다 도보 이동이 많은 편이에요. 편안한 운동화는 필수이고, 뒤꿈치가 없는 슬리퍼나 무거운 신발은 피하세요. 여행 내내 발이 편해야 즐길 수 있습니다.`,
      photo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=85',
      photoCaption: '뉴욕 JFK 공항. 도착 후 Uber로 맨해튼까지 약 60달러 거리입니다.',
      tip: {
        icon: '🧥',
        title: '냉방 주의',
        body: '미국 실내는 여름에도 에어컨이 매우 강합니다. 얇은 긴소매 하나는 항상 가방에 넣어두세요.',
      },
    },
    {
      id: 'esta',
      relatedCats: ['결제', '서류'],
      icon: '🛂',
      title: 'ESTA & 환전 — 카드 사회지만 팁은 현금',
      body: `한국 여권 소지자는 미국에 90일 무비자(ESTA)로 입국할 수 있습니다. ESTA는 출발 72시간 전까지 공식 사이트(esta.cbp.dhs.gov)에서 반드시 신청해야 해요. 사기 사이트가 많으니 공식 사이트에서만 신청하고 영수증을 저장해 두세요.\n\n미국은 카드 사회라 대부분의 결제는 신용카드로 해결됩니다. 해외 결제 수수료가 없는 카드를 챙기세요. 단, 팁은 현금으로 주는 것이 매너예요. 식당 18~22%, 택시 15~20%, 호텔 하우스키핑 1~2달러 정도가 일반적인 팁 기준입니다.`,
      photo: 'https://images.unsplash.com/photo-1551316679-9c6ae9dec224?w=900&q=85',
      photoCaption: 'ESTA 신청은 공식 CBP 사이트에서. 유사 사기 사이트 주의!',
      tip: {
        icon: '⚠️',
        title: 'ESTA 주의',
        body: 'ESTA 사기 사이트 주의! 반드시 esta.cbp.dhs.gov 공식 사이트에서 신청하세요. 비용은 21달러입니다.',
      },
    },
    {
      id: 'apps',
      relatedCats: ['앱', '전자기기'],
      icon: '📱',
      title: '필수 앱 & 교통 — Uber 없으면 불편',
      body: `미국은 대중교통이 불편한 지역이 많아요. 뉴욕 지하철은 그나마 편리하지만, LA·라스베가스·하와이는 차 없이 이동하기 어렵습니다. Uber 또는 Lyft를 미리 설치하고 결제 카드를 등록해 두세요.\n\nYelp는 미국판 맛집 앱으로 리뷰 신뢰도가 높습니다. 맛집 검색·예약·배달까지 가능해요. OpenTable은 고급 레스토랑 예약 전용 앱으로, 인기 식당은 수일~수주 전 예약이 필요합니다. Google Maps는 대중교통 정보까지 정확하게 안내해줍니다.`,
      photo: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&q=85',
      photoCaption: '시애틀 다운타운. Uber로 공항에서 시내까지 30~40달러 선입니다.',
    },
    {
      id: 'tips',
      relatedCats: ['건강', '기타'],
      icon: '🤝',
      title: '팁 문화 & 주의사항 — 알아야 실례 안 한다',
      body: `미국에서 팁을 안 주면 큰 실례입니다. 레스토랑에서 18~22%, 택시·Uber에서 15~20%, 바에서 음료당 1달러가 기본이에요. 영수증에 세금(Tax)이 별도 표기되므로 세금 포함 금액을 기준으로 팁을 계산하세요.\n\n미국 의료비는 매우 비쌉니다. 여행자 보험은 선택이 아닌 필수예요. 처방전이 필요한 약은 현지에서 조제받기 어려우니 충분히 챙겨가야 합니다. 공공장소 음주는 대부분의 주에서 금지되어 있으며, 편의점 구매 시 신분증 제시를 요구하는 경우가 있습니다.`,
      photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=85',
      photoCaption: '뉴욕 레스토랑. 영수증에 세금이 별도 표기되니 합산 금액 기준으로 팁 계산.',
      tip: {
        icon: '💳',
        title: '팁 기준',
        body: '식당 18~22%, 택시 15~20%, 바 음료당 $1. 카드 결제 시 영수증에 팁 란이 따로 있어요.',
      },
    },
  ],

  apps: [
    { emoji: '🚗', iconUrl: 'https://www.google.com/s2/favicons?domain=uber.com&sz=128', name: 'Uber / Lyft', badge: '필수', desc: '대중교통 불편 지역 필수. 미리 설치하고 결제 카드 등록해 두세요.' },
    { emoji: '🗺️', iconUrl: 'https://www.google.com/s2/favicons?domain=maps.google.com&sz=128', name: 'Google Maps', badge: '필수', desc: '대중교통·도보·자동차 길찾기 모두 정확. 오프라인 지도도 다운로드하세요.' },
    { emoji: '⭐', iconUrl: 'https://www.google.com/s2/favicons?domain=yelp.com&sz=128', name: 'Yelp', desc: '미국 최대 맛집·서비스 앱. 별점 4.0 이상이면 믿을 만한 수준.' },
    { emoji: '🍽️', iconUrl: 'https://www.google.com/s2/favicons?domain=opentable.com&sz=128', name: 'OpenTable', desc: '인기 레스토랑 사전 예약 전용. 고급 식당은 수주 전 예약 필수.' },
  ],

  checklist: [
    {
      cat: '서류',
      items: [
        '여권 (유효기간 6개월 이상)',
        'ESTA 전자여행허가 신청 (출발 72시간 전)',
        '귀국편 항공권 확인서',
      ],
    },
    {
      cat: '결제',
      items: [
        '해외 수수료 없는 신용카드',
        '소액 현금 달러 (팁 전용)',
        '트래블카드 또는 국제 체크카드',
      ],
    },
    {
      cat: '의류',
      items: [
        '레이어드 가능한 얇은 겉옷 (냉방 대비)',
        '편한 운동화 (도보 이동 많음)',
        '실내 냉방 대비 긴소매',
      ],
    },
    {
      cat: '건강',
      items: [
        '여행자 보험 가입 (미국 의료비 매우 비쌈)',
        '상비약 (처방약 포함, 충분히 챙길 것)',
        '선글라스·자외선차단제',
      ],
    },
    {
      cat: '전자기기',
      items: [
        '보조배터리',
        '미국 어댑터 (A타입, 대부분 한국과 동일)',
        '충전기·케이블 여분',
      ],
    },
    {
      cat: '앱',
      items: [
        'Uber/Lyft 설치 & 카드 등록',
        'Google Maps 오프라인 다운로드',
        'Yelp 맛집 검색',
        '숙소 예약 확인서 저장',
      ],
    },
    {
      cat: '기타',
      items: [
        '선글라스 (미국 햇빛 강함)',
        '에코백 (비닐봉투 유료)',
        '영문 여행자 보험증서 출력',
      ],
    },
  ],

  footerCta: {
    title: '나만의 미국 여행 체크리스트, 지금 바로 만들어보세요 🗽',
    subtitle: 'AI가 여행 날짜·동행·스타일을 분석해 딱 맞는 준비물을 추천해드려요',
  },
}

export default usa
