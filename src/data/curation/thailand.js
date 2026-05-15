const thailand = {
  code: 'thailand',
  flag: '🇹🇭',
  name: '태국',
  cities: ['방콕', '치앙마이', '푸켓', '파타야', '코사무이'],

  photos: {
    hero: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1400&q=85&fit=crop',
    sections: [
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=900&q=85',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&q=85',
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&q=85',
      'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=900&q=85',
    ],
  },

  hero: {
    title: '태국 여행 완벽 준비 가이드 🐘',
    subtitle: '방콕·푸켓·치앙마이 공통 필수 준비물부터 환전·문화 주의사항까지 한 번에',
    readTime: 4,
    checklistCount: 22,
  },

  sections: [
    {
      id: 'packing',
      relatedCats: ['의류'],
      icon: '🧳',
      title: '짐 싸기 & 복장 — 무엇을 입고 갈까',
      body: `태국은 연중 덥고 습한 날씨가 이어집니다. 린넨이나 기능성 소재처럼 통기성이 좋고 땀 흡수가 빠른 옷을 위주로 챙기세요. 한 가지 중요한 포인트: 사원 방문 시 어깨와 무릎을 가려야 입장이 가능합니다. 얇은 긴소매 한 장이나 스카프를 꼭 가방에 넣어두세요.\n\n슬리퍼는 현지에서 저렴하게 구할 수 있어요. 반면 선크림과 모기 기피제는 한국에서 챙기는 편이 낫습니다. 태국 현지 제품보다 익숙한 브랜드를 쓰는 것이 피부 트러블을 줄이는 방법이에요.`,
      photo: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=900&q=85',
      photoCaption: '왓포 사원. 어깨와 무릎을 가린 복장이 입장 필수 조건입니다.',
      tip: {
        icon: '🛕',
        title: '복장 주의',
        body: '태국 사원은 어깨와 무릎이 드러난 복장으로 입장 불가. 얇은 스카프 하나면 해결됩니다.',
      },
    },
    {
      id: 'money',
      relatedCats: ['환전'],
      icon: '💵',
      title: '환전 — 공항보다 시내가 유리',
      body: `태국 화폐는 밧(THB)입니다. 수완나품 공항 환전소는 환율이 좋지 않아요. 도착 즉시 쓸 소액(교통비·식사비)만 공항에서 환전하고, 나머지는 방콕 시내의 슈퍼리치(SuperRich) 환전소를 이용하면 훨씬 유리한 환율을 얻을 수 있습니다.\n\n팁 문화가 있어 식당·마사지 가게에서 20~50밧 소액 팁이 필요합니다. 시장이나 로컬 식당은 현금만 받는 경우가 많으니 소액 현금을 항상 지니고 다니세요.`,
      photo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&q=85',
      photoCaption: '방콕 시내 슈퍼리치 환전소. 공항보다 10~15% 유리한 환율을 제공합니다.',
      tip: {
        icon: '💡',
        title: '환전 팁',
        body: '공항 도착 즉시 1,000밧 정도만 환전하고, 나머지는 슈퍼리치(SuperRich) 활용!',
      },
    },
    {
      id: 'apps',
      relatedCats: ['앱', '전자기기'],
      icon: '📱',
      title: '필수 앱 — 방콕에서 살아남기',
      body: `방콕 택시는 미터기 작동을 거부하는 경우가 많아요. Grab을 사용하면 출발 전에 요금을 확인하고 이동할 수 있어 안전하고 편리합니다. 치앙마이나 푸켓에서도 Grab이 잘 운행되고 있어요.\n\nLINE MAN은 태국 현지인이 즐겨 쓰는 배달 앱입니다. 로컬 맛집 음식을 숙소로 배달시킬 때 유용해요. Google Maps는 방콕처럼 복잡한 도시에서 BTS·MRT 노선 안내까지 정확하게 해줍니다.`,
      photo: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&q=85',
      photoCaption: '방콕 BTS 스카이트레인. Google Maps로 노선·환승을 미리 확인하세요.',
    },
    {
      id: 'culture',
      relatedCats: ['건강', '기타'],
      icon: '🙏',
      title: '음식 & 문화 주의사항',
      body: `태국에서는 수돗물을 마시면 안 됩니다. 생수를 구매해서 마시고, 과일 주스나 아이스 음료도 믿을 만한 가게에서 구입하세요. 사원 방문 시 승려에게 여성이 직접 물건을 건네는 행위는 금지되어 있습니다.\n\n왕실 모독 발언은 태국 형법으로 처벌받을 수 있어요. 왕실 관련 비판적 발언이나 행동은 절대 삼가세요. 불상이나 왕족 사진에 올라타거나 무례한 행동을 하면 심각한 법적 문제가 생길 수 있습니다.`,
      photo: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=900&q=85',
      photoCaption: '태국 불상. 손가락으로 가리키거나 불경스러운 행동은 삼가세요.',
      tip: {
        icon: '⚠️',
        title: '중요 주의사항',
        body: '태국 왕실 모독은 법적 처벌 대상입니다. 왕실 관련 부정적 발언이나 행동을 절대 삼가세요.',
      },
    },
  ],

  apps: [
    { emoji: '🚗', iconUrl: 'https://www.google.com/s2/favicons?domain=grab.com&sz=128', name: 'Grab', badge: '필수', desc: '방콕 택시 미터기 거부 많음. Grab으로 요금을 미리 확인하고 이동하세요.' },
    { emoji: '🛵', iconUrl: 'https://www.google.com/s2/favicons?domain=linemanwongnai.com&sz=128', name: 'LINE MAN', desc: '태국 현지 배달·맛집 앱. 로컬 식당 음식을 숙소로 배달 가능.' },
    { emoji: '🗺️', iconUrl: 'https://www.google.com/s2/favicons?domain=maps.google.com&sz=128', name: 'Google Maps', desc: 'BTS·MRT 노선 안내까지. 방콕 복잡한 대중교통 필수 앱.' },
    { emoji: '🎡', iconUrl: 'https://www.google.com/s2/favicons?domain=klook.com&sz=128', name: 'Klook', desc: '투어·액티비티·입장권 현지 최저가. 코끼리 트레킹, 시내 투어 예약.' },
  ],

  checklist: [
    {
      cat: '서류',
      items: [
        '여권 (유효기간 6개월 이상)',
        '무비자 30일 입국 확인',
        '귀국편 항공권 (입국 심사 시 필요)',
      ],
    },
    {
      cat: '환전',
      items: [
        '태국 밧(THB) 환전',
        '슈퍼리치 환전소 위치 미리 확인',
        '소액 팁용 현금 (20~50밧)',
      ],
    },
    {
      cat: '의류',
      items: [
        '얇은 반팔 다수 (린넨·기능성 소재)',
        '사원 방문용 긴 바지·스카프',
        '슬리퍼 (현지 구매 가능)',
        '자외선차단제 SPF50+',
      ],
    },
    {
      cat: '건강',
      items: [
        '모기 기피제 (DEET 성분)',
        '설사약·지사제',
        '생수 별도 구매 (수돗물 금지)',
        '상처 밴드·소독제',
      ],
    },
    {
      cat: '전자기기',
      items: [
        '보조배터리',
        '멀티어댑터 (B타입)',
        '방수팩 (우기·해변)',
      ],
    },
    {
      cat: '앱',
      items: [
        'Grab 설치 & 카드 등록',
        'LINE MAN 설치',
        '오프라인 Google Maps 다운로드',
      ],
    },
    {
      cat: '기타',
      items: [
        '소형 우비 (우기 대비)',
        '물티슈 다수',
        '에코백 (보조 가방)',
      ],
    },
  ],

  footerCta: {
    title: '나만의 태국 여행 체크리스트, 지금 바로 만들어보세요 🐘',
    subtitle: 'AI가 여행 날짜·동행·스타일을 분석해 딱 맞는 준비물을 추천해드려요',
  },
}

export default thailand
