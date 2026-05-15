const japan = {
  code: 'japan',
  flag: '🇯🇵',
  name: '일본',
  cities: ['도쿄', '오사카', '교토', '후쿠오카', '삿포로'],

  photos: {
    hero: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1400&q=85&fit=crop',
    sections: [
      'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=900&q=85',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=85',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=85',
      'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=900&q=85',
    ],
  },

  hero: {
    title: '일본 여행 완벽 준비 가이드 🗼',
    subtitle: '도쿄·오사카·교토 공통 필수 준비물부터 교통카드·현금 팁까지 한 번에',
    readTime: 5,
    checklistCount: 25,
  },

  sections: [
    {
      id: 'packing',
      relatedCats: ['의류'],
      icon: '🧳',
      title: '짐 싸기 — 하루 1~2만 보를 위한 준비',
      body: `일본 여행에서 가장 많이 후회하는 것은 신발이에요. 하루 1~2만 보는 기본이라 쿠션이 좋은 운동화가 필수입니다. 계절마다 준비물이 크게 달라지는데, 여름에는 손수건과 부채가 필수 아이템이고, 겨울에는 내복과 핫팩을 충분히 챙겨야 합니다. 일본 약은 성분 기준이 달라 국내 상비약을 미리 챙기는 편이 훨씬 안전해요.\n\n짐을 줄이는 팁 하나: 일본 편의점(콘비니)에서 대부분의 생필품을 구할 수 있어요. 샴푸·린스·면봉처럼 부피 큰 제품은 현지 조달을 추천합니다. 대신 선크림과 상비약은 국내에서 익숙한 제품으로 챙기세요.`,
      photo: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=900&q=85',
      photoCaption: '교토 거리. 자갈길이 많아 쿠션 좋은 운동화가 필수입니다.',
      tip: {
        icon: '👟',
        title: '신발 체크',
        body: '하루 평균 1만 5천 보 이상 걷게 됩니다. 새 신발보다 길들여진 운동화를 꼭 챙기세요.',
      },
    },
    {
      id: 'money',
      relatedCats: ['환전'],
      icon: '💴',
      title: '환전 & 현금 — 일본은 여전히 현금 사회',
      body: `일본은 아직 현금을 많이 사용하는 나라예요. 오래된 라멘집이나 전통 공예품 상점은 현금 전용인 경우가 많고, 신사·절 입장료도 현금 결제가 기본입니다. 소액 동전도 자주 쓰게 되니 지갑을 비워두지 마세요.\n\n환전은 국내 은행 앱에서 미리 신청하고 공항에서 수령하는 방식이 가장 편리하고 환율도 좋아요. 트래블카드(트래블로그, 하나머니 등)는 ATM 인출 수수료가 저렴해 현지에서 추가 환전할 때 유용합니다. 세븐일레븐·이온 ATM은 외국 카드 이용이 가능해 비상 시 요긴합니다.`,
      photo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=85',
      photoCaption: '일본 동전. 100엔·500엔 동전이 일상에서 자주 쓰입니다.',
      tip: {
        icon: '💡',
        title: '환전 팁',
        body: '세븐일레븐 ATM은 365일 24시간 외국 카드 이용 가능. 비상 현금 인출에 가장 편리해요.',
      },
    },
    {
      id: 'apps',
      relatedCats: ['앱', '교통', '전자기기'],
      icon: '📱',
      title: '필수 앱 & 교통카드 — 이것만 있으면 완벽',
      body: `Suica 또는 PASMO는 일본 대중교통의 핵심입니다. 요즘은 애플페이·구글페이에 등록하면 실물 카드 없이도 사용할 수 있어 훨씬 편리해요. JR패스는 도쿄·오사카 왕복 신칸센이 포함된 장거리 일정일 때만 경제적입니다.\n\nTabelog(타베로그)는 일본판 맛집 앱으로 3.5 이상이면 믿을 만한 수준이에요. 팀랩, 지브리 박물관, 인기 스시 오마카세 같은 핫플은 수개월 전 사전 예약이 필수입니다. 구글 번역 앱도 카메라 번역 기능으로 메뉴판 읽는 데 유용합니다.`,
      photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=85',
      photoCaption: '도쿄 야경. Suica 하나면 전철·버스·편의점까지 해결됩니다.',
    },
    {
      id: 'food',
      relatedCats: ['건강'],
      icon: '🍜',
      title: '음식 & 예약 — 줄 서기 전략',
      body: `인기 라멘집이나 스시 오마카세는 오픈 전부터 줄이 생기는 경우가 많아요. 아침 일찍 방문하거나 타베로그로 미리 예약하는 것이 현명합니다. 타베로그 평점 3.5 이상은 믿을 수 있는 맛집 기준이에요.\n\n일본 편의점 음식은 여행자들이 가장 만족하는 로컬 경험 중 하나입니다. 특히 세븐일레븐의 온기 음식과 로손의 디저트는 꼭 한번 맛보세요. 식당 예약이 어려울 때는 백화점 지하 식품관(데파치카)도 훌륭한 대안입니다.`,
      photo: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=900&q=85',
      photoCaption: '일본 라멘. 인기 가게는 오픈 30분 전부터 줄을 서야 합니다.',
      tip: {
        icon: '🍣',
        title: '예약 팁',
        body: '팀랩·지브리 박물관은 수개월 전 예약 필수. 공식 사이트에서 직접 예약하세요.',
      },
    },
  ],

  apps: [
    { emoji: '🚇', iconUrl: 'https://www.google.com/s2/favicons?domain=jreast.co.jp&sz=128', name: 'Suica / PASMO', badge: '필수', desc: '전철·버스·편의점 결제까지. 애플페이·구글페이로 등록하면 실물 카드 불필요.' },
    { emoji: '🗺️', iconUrl: 'https://www.google.com/s2/favicons?domain=maps.google.com&sz=128', name: 'Google Maps', badge: '필수', desc: '오프라인 지도 다운로드 필수. 전철 환승·도보 길찾기 모두 정확해요.' },
    { emoji: '🍽️', iconUrl: 'https://www.google.com/s2/favicons?domain=tabelog.com&sz=128', name: 'Tabelog', desc: '일본 최대 맛집 앱. 3.5 이상이면 믿을 만한 수준.' },
    { emoji: '🌐', iconUrl: 'https://www.google.com/s2/favicons?domain=translate.google.com&sz=128', name: 'Google Translate', desc: '카메라 번역으로 메뉴판·간판을 실시간으로 읽어줍니다.' },
  ],

  checklist: [
    {
      cat: '서류',
      items: [
        '여권 (유효기간 6개월 이상)',
        '비자 확인 (무비자 90일)',
      ],
    },
    {
      cat: '환전',
      items: [
        '엔화 환전 (국내 은행 앱 신청 후 공항 수령)',
        '환율우대 체크카드 (트래블로그 등)',
        '소액 동전 대비 지갑 준비',
      ],
    },
    {
      cat: '의류',
      items: [
        '편한 운동화 (필수, 하루 1만 보 이상)',
        '계절별 레이어드 아우터',
        '손수건 (여름 필수)',
        '접이식 우산',
      ],
    },
    {
      cat: '건강',
      items: [
        '감기약·소화제 (국내 제품으로)',
        '상처 밴드',
        '멀미약 (신칸센 대비)',
      ],
    },
    {
      cat: '전자기기',
      items: [
        '보조배터리',
        '충전기·케이블',
        '카메라 (메모리 여유분)',
      ],
    },
    {
      cat: '교통',
      items: [
        'Suica/PASMO IC카드 (또는 모바일 등록)',
        'JR패스 (장거리 신칸센 포함 일정)',
      ],
    },
    {
      cat: '앱',
      items: [
        'Google Maps 오프라인 다운로드',
        'Tabelog 앱 설치',
        '숙소 예약 확인서 저장',
        '인기 관광지 사전 예약 확인',
      ],
    },
  ],

  footerCta: {
    title: '나만의 일본 여행 체크리스트, 지금 바로 만들어보세요 🗼',
    subtitle: 'AI가 여행 날짜·동행·스타일을 분석해 딱 맞는 준비물을 추천해드려요',
  },
}

export default japan
