// 여행 스타일 테스트 — 54유형 결과 데이터
// 결과 형식: [B축 테마]하는 [A축 체스말] (예: 액티비티를 즐기는 룩)
// 캐릭터 이미지: /images/travel-style/{theme}_{piece}.webp (54종)

/* ─── A축: 체스말 6종 ─────────────────────────────────────────────────── */
// color 계열은 임시 팔레트 — 디자인팀 히어로 배경색 확정 시 교체 (TODO)

export const PIECE_META = {
  pawn: {
    key: 'pawn',
    label: '폰',
    emoji: '♟️',
    keywords: '즉흥 · 무계획 · 리액션 부자',
    quote: '어디든 좋아~ 나만 믿어!',
    desc: '계획이요? 그게 뭔가요? 당신은 출발 당일 아침에야 캐리어를 꺼내는 타입. 목적지도, 숙소도, 일정도 없지만 어쩐지 여행을 제일 즐기는 사람. 일행이 "오늘 뭐 할까?" 물으면 1초도 안 돼서 "아무거나!"가 나온다. 밥도 걷다가 눈에 띄는 데 들어가면 되고, 숙소도 그날 저녁에 잡으면 되고 — 근데 이상하게 그게 다 잘 풀린다. "거기 어때?" "좋아!" "이쪽 가볼까?" "좋아!" — 리액션은 세계 최고. 무계획이 최고의 계획이라는 걸 몸소 증명하는 여행 메이트.',
    bestMatch: 'queen',
    worstMatch: 'king',
    // TODO(검수): 궁합 이유 초안 — 카피 확정 필요
    bestReason: '뭐든 준비해주는 퀸 옆에서 폰의 리액션이 빛을 발하는 환상의 조합. 퀸이 짜온 계획에 "좋아!"로 화답하면 여행이 술술 풀려요.',
    worstReason: '둘 다 준비를 안 하다 보니 공항에서부터 멘붕이 올 수 있어요. 최소한 숙소만큼은 미리 정하고 떠나세요.',
    color: 'from-green-400 to-emerald-400',
    bgLight: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    chip: 'bg-green-100 text-green-700',
  },
  rook: {
    key: 'rook',
    label: '룩',
    emoji: '🏰',
    keywords: '효율 · 직선 · 핵심만',
    quote: '최단 경로, 핵심만, 군더더기 없이.',
    desc: '숙소·교통·입장권, 필요한 것만 딱딱 예약하고 끝. 네비게이션은 이미 켜놨고, 일행보다 반 발짝 앞에서 걷고 있는 당신. "거길 왜 가?" 한마디로 불필요한 동선을 잘라내는 효율의 신. 쓸데없이 돌아가는 길, 줄 서는 시간, 애매한 식당 — 당신의 여행엔 그런 게 없다. 미리 다 찾아봤고, 이미 다 계산했고, 다들 그냥 따라가면 된다. 여행에서 길 잃을 걱정은 당신이 있는 한 없음. 사실 지도는 당신이 보는 게 아니라 당신이 지도다.',
    bestMatch: 'bishop',
    worstMatch: 'knight',
    bestReason: '비숍이 "뭘 할지"를 정하면 룩이 "어떻게 갈지"를 최적화하는 완벽한 분업. 테마와 효율이 만나 여행의 퀄리티가 올라가요.',
    worstReason: '최단 동선을 짜놨는데 나이트가 자꾸 샛길로 빠져요. 일정에 "자유 탐험 시간"을 미리 넣어두면 평화로워집니다.',
    color: 'from-pink-400 to-rose-400',
    bgLight: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-700',
    chip: 'bg-pink-100 text-pink-700',
  },
  knight: {
    key: 'knight',
    label: '나이트',
    emoji: '🐴',
    keywords: '즉흥 · 탐험 · 한눈팜',
    quote: '잠깐, 저기 뭔가 있어 보이지 않아?',
    desc: '정해진 길은 당신에게 감옥. 골목 안쪽에서 냄새 좋은 식당 발견, 지도에 없는 카페 입장, 갑자기 바뀐 다음 목적지. 일정표 같은 건 애초에 흘려듣고, 버스 타다가 창밖에 뭔가 보이면 다음 정류장에서 내려버리는 당신. 예측 불가능한 루트로 움직이지만 그 덕분에 아무도 모르는 숨은 명소를 제일 많이 찾아내는 사람. 한 눈 파는 게 특기, 의외의 발견이 전문. 당신의 여행 후기엔 항상 "거기 어떻게 알았어?"가 달린다.',
    bestMatch: 'pawn',
    worstMatch: 'bishop',
    bestReason: '나이트가 "저기 가보자!" 하면 폰은 "좋아!" — 망설임 없는 즉흥 듀오. 계획 없이도 매일이 하이라이트인 모험 메이트예요.',
    worstReason: '비숍이 3개월 전에 잡아둔 예약을 나이트의 즉흥이 흔들 수 있어요. 비숍의 필수 일정만큼은 꼭 지켜주세요.',
    color: 'from-orange-400 to-amber-400',
    bgLight: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    chip: 'bg-orange-100 text-orange-700',
  },
  bishop: {
    key: 'bishop',
    label: '비숍',
    emoji: '⛪',
    keywords: '테마 · 취향 확고 · 예약 담당',
    quote: "이번 여행 컨셉은 '로컬 감성 카페 투어'야. 다른 건 없어.",
    desc: '한 방향, 한 테마, 한 취향. 가고 싶은 곳은 이미 3개월 전부터 리스트업 완료, 예약은 당연히 당신 담당. 현지 유명 맛집보다 내 취향에 맞는 조용한 식당이 낫고, 유명 관광지보다 내가 꽂힌 그 미술관 하나가 더 중요하다. 계획이 틀어지는 순간 눈빛이 달라지는 파워 J — "우리 원래 3시에 거기 가기로 했잖아"는 당신의 시그니처 멘트. 그래도 당신 덕분에 여행의 퀄리티가 올라가는 건 모두가 인정. 취향이 확고하면 여행도 선명해진다.',
    bestMatch: 'rook',
    worstMatch: 'knight',
    bestReason: '비숍의 확고한 취향에 룩의 효율적인 동선이 더해지면 깊이와 속도를 모두 잡은 여행이 완성돼요.',
    worstReason: '공들여 짠 테마 일정을 나이트가 즉흥으로 바꾸자고 할 수 있어요. 하루 정도는 나이트에게 맡겨보는 것도 방법이에요.',
    color: 'from-violet-400 to-purple-400',
    bgLight: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    chip: 'bg-violet-100 text-violet-700',
  },
  queen: {
    key: 'queen',
    label: '퀸',
    emoji: '👑',
    keywords: '완벽 준비 · A/B/C안 · 올라운더',
    quote: 'A안, B안, C안 다 준비했어. 비 올 때 플랜도 있어.',
    desc: '당신이 있으면 무조건 든든하다. 맛집 조사, 이동 동선, 날씨 체크, 혹시 모를 플랜 B까지 — 여행 전날 밤 가장 바쁜 사람은 당신. 비행기 탑승구 위치, 공항에서 시내까지 최적 교통편, 현지 유심 어디서 사는지까지 이미 다 꿰고 있다. 일행 중 누가 "혹시 우산 있어?" 하면 당신 가방에서 나온다. 완벽한 사전 준비로 팀 전체의 여행을 책임지는 올라운더. 같이 가는 친구들은 그냥 몸만 오면 된다는 걸 당신도 알고, 다들 알고, 그래서 더 고마운 사람.',
    bestMatch: 'pawn',
    worstMatch: 'king',
    bestReason: '퀸이 다 준비하면 폰은 최고의 리액션으로 보답하는 조합. 계획대로 잘 따라와 주는 폰 덕분에 퀸의 준비가 빛나요.',
    worstReason: '챙겨야 할 게 많은 킹과 함께라면 퀸의 가방이 두 배로 무거워져요. 킹의 지갑 찬스를 적극 활용해 균형을 맞추세요.',
    color: 'from-teal-400 to-[#3db4dd]',
    bgLight: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    chip: 'bg-teal-100 text-teal-700',
  },
  king: {
    key: 'king',
    label: '킹',
    emoji: '🤴',
    keywords: '손 많이 감 · 덤벙 · 돈으로 해결',
    quote: '어, 지갑 어디 갔지? 아 충전기 안 챙겼나?',
    desc: '당신은 존재 자체가 여행의 에너지. 짐은 항상 최소한 — 왜냐면 어차피 필요한 건 현장에서 다 살 수 있으니까. 금방 방전되고, 뭔가 자꾸 잃어버리고, 옆 친구가 "그거 챙겼어?" 할 때쯤에야 준비를 시작하는 당신. 여권은 가방 어딘가에 있을 거고, 환전은 공항에서 하면 되고, 선크림은 현지에서 사면 된다는 마인드. 손이 많이 가는 건 맞는데, 그래도 돈 쓰는 데 망설임 없는 당신 덕분에 업그레이드된 숙소에서 자거나 택시 타게 되는 일이 생기기도 한다. 은근히 없으면 허전한 사람.',
    bestMatch: 'queen',
    worstMatch: 'pawn',
    bestReason: '퀸이 빈틈없이 챙겨주고 킹은 아낌없이 쏘는 상부상조 조합. 퀸의 준비력과 킹의 화력이 만나면 여행이 윤택해져요.',
    worstReason: '챙기는 사람이 아무도 없는 조합이라 여권부터 충전기까지 수난이 이어질 수 있어요. 출발 전 체크리스트는 필수!',
    color: 'from-sky-400 to-blue-400',
    bgLight: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    chip: 'bg-sky-100 text-sky-700',
  },
}

/* ─── B축: 여행 테마 9종 ──────────────────────────────────────────────── */

export const THEME_META = {
  activity:  { key: 'activity',  label: '액티비티',     emoji: '🪂', titlePrefix: '액티비티를 즐기는' },
  culture:   { key: 'culture',   label: '문화예술',     emoji: '🎨', titlePrefix: '문화 예술을 좋아하는' },
  food:      { key: 'food',      label: '맛집탐방',     emoji: '🍜', titlePrefix: '맛집을 탐방하는' },
  healing:   { key: 'healing',   label: '힐링',         emoji: '🌿', titlePrefix: '여유롭게 힐링하는' },
  landmark:  { key: 'landmark',  label: '명소방문',     emoji: '🗼', titlePrefix: '명소를 방문하는' },
  nature:    { key: 'nature',    label: '자연',         emoji: '⛰️', titlePrefix: '자연을 만끽하는' },
  nightlife: { key: 'nightlife', label: '나이트라이프', emoji: '🌃', titlePrefix: '화려한 나이트라이프를 즐기는' },
  photo:     { key: 'photo',     label: '포토스팟',     emoji: '📸', titlePrefix: '포토스팟에서 사진 찍는' },
  shopping:  { key: 'shopping',  label: '쇼핑',         emoji: '🛍️', titlePrefix: '쇼핑을 즐기는' },
}

// 질문 선택지 태그 → 키 매핑 (calcResult에서 사용)
export const PIECE_TAG_TO_KEY = {
  폰: 'pawn', 룩: 'rook', 나이트: 'knight', 비숍: 'bishop', 퀸: 'queen', 킹: 'king',
}
export const THEME_TAG_TO_KEY = {
  자연: 'nature', 맛집탐방: 'food', 문화예술: 'culture', 힐링: 'healing', 포토스팟: 'photo',
  쇼핑: 'shopping', 명소방문: 'landmark', 나이트라이프: 'nightlife', 액티비티: 'activity',
}

/* ─── 추천 여행지 도시 정보 ───────────────────────────────────────────── */
// countryCode/iata는 체크리스트 원클릭 생성(useTestResultChecklistCreate) 연동용
// TODO(검수): tags는 시안 해시태그용 초안

export const CITY_INFO = {
  퀸스타운:       { countryCode: 'NZ', iata: 'ZQN', tags: ['번지점프', '스카이라인', '와카티푸호'] },
  코타키나발루:   { countryCode: 'MY', iata: 'BKI', tags: ['아일랜드호핑', '선셋', '리조트'] },
  푸켓:           { countryCode: 'TH', iata: 'HKT', tags: ['빠통비치', '스노클링', '나이트마켓'] },
  교토:           { countryCode: 'JP', iata: 'KIX', tags: ['기요미즈데라', '료칸', '대나무숲'] },
  바르셀로나:     { countryCode: 'ES', iata: 'BCN', tags: ['가우디', '타파스', '람블라스'] },
  이스탄불:       { countryCode: 'TR', iata: 'IST', tags: ['아야소피아', '그랜드바자르', '보스포루스'] },
  도쿄:           { countryCode: 'JP', iata: 'NRT', tags: ['시부야', '미슐랭', '편의점털기'] },
  방콕:           { countryCode: 'TH', iata: 'BKK', tags: ['왓포', '야시장', '루프탑'] },
  나폴리:         { countryCode: 'IT', iata: 'NAP', tags: ['피자', '항구', '폼페이'] },
  발리:           { countryCode: 'ID', iata: 'DPS', tags: ['우붓', '풀빌라', '일몰'] },
  코사무이:       { countryCode: 'TH', iata: 'USM', tags: ['비치클럽', '스파', '코랄아일랜드'] },
  루앙프라방:     { countryCode: 'LA', iata: 'LPQ', tags: ['탁발', '꽝시폭포', '느린여행'] },
  파리:           { countryCode: 'FR', iata: 'CDG', tags: ['에펠탑', '루브르', '마레지구'] },
  로마:           { countryCode: 'IT', iata: 'FCO', tags: ['콜로세움', '바티칸', '젤라또'] },
  밀포드사운드:   { countryCode: 'NZ', iata: 'ZQN', tags: ['피오르', '크루즈', '폭포'] },
  치앙라이:       { countryCode: 'TH', iata: 'CEI', tags: ['백색사원', '골든트라이앵글', '차밭'] },
  다낭:           { countryCode: 'VN', iata: 'DAD', tags: ['미케비치', '바나힐', '해산물'] },
  마닐라:         { countryCode: 'PH', iata: 'MNL', tags: ['인트라무로스', '루프탑바', '카지노'] },
  '홍콩 도심':    { countryCode: 'HK', iata: 'HKG', tags: ['딤섬', '빅토리아피크', '야경'] },
  산토리니:       { countryCode: 'GR', iata: 'JTR', tags: ['이아마을', '블루돔', '에게해'] },
  호이안:         { countryCode: 'VN', iata: 'DAD', tags: ['올드타운', '등불', '소원배'] },
  오사카:         { countryCode: 'JP', iata: 'KIX', tags: ['도톤보리', '먹방', '돈키호테'] },
  인터라켄:       { countryCode: 'CH', iata: 'ZRH', tags: ['융프라우', '패러글라이딩', '호수'] },
  세부:           { countryCode: 'PH', iata: 'CEB', tags: ['고래상어', '카와산폭포', '호핑투어'] },
  런던:           { countryCode: 'GB', iata: 'LHR', tags: ['대영박물관', '뮤지컬', '테이트모던'] },
  '싱가포르 도심': { countryCode: 'SG', iata: 'SIN', tags: ['호커센터', '마리나베이', '클락키'] },
  후아힌:         { countryCode: 'TH', iata: 'BKK', tags: ['해변휴양', '나이트마켓', '골프'] },
  레이캬비크:     { countryCode: 'IS', iata: 'KEF', tags: ['오로라', '블루라군', '골든서클'] },
  라스베가스:     { countryCode: 'US', iata: 'LAS', tags: ['카지노', '쇼', '스트립'] },
  '마카오 반도':  { countryCode: 'MO', iata: 'MFM', tags: ['세나도광장', '에그타르트', '카지노'] },
  두바이:         { countryCode: 'AE', iata: 'DXB', tags: ['부르즈할리파', '사막투어', '럭셔리'] },
  마리나베이:     { countryCode: 'SG', iata: 'SIN', tags: ['인피니티풀', '가든스바이더베이', '야경'] },
  '싱가포르 오차드': { countryCode: 'SG', iata: 'SIN', tags: ['쇼핑몰', '명품거리', '면세'] },
  밀라노:         { countryCode: 'IT', iata: 'MXP', tags: ['두오모', '명품아울렛', '패션위크'] },
  보라카이:       { countryCode: 'PH', iata: 'KLO', tags: ['화이트비치', '세일링', '비치파티'] },
  하노이:         { countryCode: 'VN', iata: 'HAN', tags: ['구시가지', '에그커피', '기찻길마을'] },
  베를린:         { countryCode: 'DE', iata: 'BER', tags: ['미술관섬', '스트리트아트', '클럽'] },
  치앙마이:       { countryCode: 'TH', iata: 'CNX', tags: ['올드시티', '카페투어', '코끼리'] },
  달랏:           { countryCode: 'VN', iata: 'DLI', tags: ['고원도시', '꽃정원', '캠핑'] },
  카파도키아:     { countryCode: 'TR', iata: 'ASR', tags: ['열기구', '동굴호텔', '기암괴석'] },
  페트라:         { countryCode: 'JO', iata: 'AMM', tags: ['고대도시', '알카즈네', '사막'] },
  롬복:           { countryCode: 'ID', iata: 'LOP', tags: ['린자니화산', '핑크비치', '길리섬'] },
  씨판돈:         { countryCode: 'LA', iata: 'PKZ', tags: ['4천개의섬', '메콩강', '해먹'] },
  코모도:         { countryCode: 'ID', iata: 'LBJ', tags: ['코모도왕도마뱀', '다이빙', '핑크비치'] },
  하롱:           { countryCode: 'VN', iata: 'HAN', tags: ['하롱베이', '크루즈', '석회암섬'] },
  코르푸:         { countryCode: 'GR', iata: 'CFU', tags: ['이오니아해', '올드타운', '비치'] },
  마라케시:       { countryCode: 'MA', iata: 'RAK', tags: ['메디나', '수크시장', '사하라'] },
  피렌체:         { countryCode: 'IT', iata: 'FLR', tags: ['우피치', '두오모', '르네상스'] },
  카이로:         { countryCode: 'EG', iata: 'CAI', tags: ['피라미드', '스핑크스', '나일강'] },
  장가계:         { countryCode: 'CN', iata: 'DYG', tags: ['아바타산', '유리다리', '천문산'] },
  할슈타트:       { countryCode: 'AT', iata: 'VIE', tags: ['호수마을', '동화풍경', '소금광산'] },
  뉴욕:           { countryCode: 'US', iata: 'JFK', tags: ['브로드웨이', 'MoMA', '센트럴파크'] },
  코타이:         { countryCode: 'MO', iata: 'MFM', tags: ['리조트', '스파', '쇼핑몰'] },
  케이프타운:     { countryCode: 'ZA', iata: 'CPT', tags: ['테이블마운틴', '희망봉', '와이너리'] },
}

/* ─── 54개 조합 결과 ──────────────────────────────────────────────────── */
// key: `${theme}_${piece}` / title은 THEME_META.titlePrefix + PIECE_META.label로 조합

export const COMBO_RESULTS = {
  /* ♟️ 폰 — 즉흥·무계획·리액션 부자 */
  activity_pawn:  { oneLiner: '일단 해보고 생각하는 타입', desc: '번지점프 예약? 그런 거 없음. 현장에서 분위기 좋으면 바로 도전. 계획보다 당장의 재미가 더 중요하며, 하고 싶으면 망설임 없이 몸부터 움직이는 액티비티 러버', destinations: ['퀸스타운', '코타키나발루', '푸켓'] },
  culture_pawn:   { oneLiner: '우연히 들어간 곳에서 감동받는 타입', desc: '전시 정보를 미리 찾아보진 않지만, 걷다가 갤러리나 전시관이 눈에 띄면 자연스럽게 들어감. 예상 없이 만난 작품일수록 더 오래 기억에 남는다고 생각하는 스타일', destinations: ['교토', '바르셀로나', '이스탄불'] },
  food_pawn:      { oneLiner: '줄 서 있으면 일단 들어감', desc: '저장해둔 맛집은 없지만 줄이 길면 일단 합류. 어디에서 뭘 먹을지 미리 계획하진 않지만, 갈 때마다 성공함. 여행지 맛집은 발길 닿는 대로 발견하는 편', destinations: ['도쿄', '방콕', '나폴리'] },
  healing_pawn:   { oneLiner: '무계획이 곧 힐링', desc: '계획은 없지만 여유는 넘쳐. 아무 카페나 들어가 멍때리는 게 최고의 여행. 어디든 "좋아~" 한 마디로 따라오는 힐링 바이브의 소유자.', destinations: ['발리', '코사무이', '루앙프라방'] },
  landmark_pawn:  { oneLiner: '계획은 없어도 랜드마크는 다 감', desc: '아무 계획 없이 왔는데 어떻게 유명한 데는 다 감. 본능적 관광 레이더 보유자.', destinations: ['파리', '로마', '도쿄'] },
  nature_pawn:    { oneLiner: '걷다 보면 어느새 절경 앞', desc: '목적지 없이 걷다가 멋진 바다, 숲, 전망대를 만나곤 함. 계획은 없지만 자연과의 우연한 만남을 누구보다 잘 즐기는 자유로운 여행자', destinations: ['밀포드사운드', '치앙라이', '다낭'] },
  nightlife_pawn: { oneLiner: '오늘 밤 계획은 오늘 밤에 정함', desc: '어디 갈지 정해둔 건 없지만 분위기 좋은 음악이나 사람들 소리를 따라가다 보면 어느새 핫플 한가운데. 즉흥적이라 더 도파민 터지는 시간으로 여행의 하루를 마무리하는 타입', destinations: ['방콕', '마닐라', '홍콩 도심'] },
  photo_pawn:     { oneLiner: '우연히 찍었는데 인생샷', desc: '미리 찾아보진 않지만, 계획 없이 걷다 만난 골목이 다 포토스팟. 별 생각 없이 찍었는데 결과물은 의외로 가장 감성적인 스타일', destinations: ['산토리니', '교토', '호이안'] },
  shopping_pawn:  { oneLiner: '안 산다더니 제일 많이 삼', desc: '쇼핑 리스트 같은건 없지만 마음에 들면 바로 구매. 여행 마지막 날 캐리어를 열어보면 본인도 왜 이렇게 많이 샀는지 모름. 충동 구매도 여행의 추억이라고 생각하는 타입', destinations: ['오사카', '방콕', '홍콩 도심'] },

  /* 🏰 룩 — 효율·직선·핵심만 */
  activity_rook:  { oneLiner: '즐기는 것도 계획대로', desc: '액티비티 예약부터 이동 동선, 소요 시간까지 미리 체크 완료. 기다리는 시간 없이 딱 즐기고 다음 일정으로 이동하는 효율형 액티비티 마스터', destinations: ['퀸스타운', '인터라켄', '세부'] },
  culture_rook:   { oneLiner: '전시도 동선부터 체크', desc: '어떤 작품을 먼저 볼지, 어느 구역부터 돌지 이미 정해둠. 핵심 작품은 놓치지 않고 체력 낭비도 최소화하는 계획형 관람러', destinations: ['파리', '런던', '도쿄'] },
  food_rook:      { oneLiner: '맛집도 루트 따라 공략', desc: '저장해둔 맛집 리스트는 기본. 이동 동선과 웨이팅 시간까지 고려해서 가장 효율적으로 식도락 여행을 즐기는 스타일', destinations: ['싱가포르 도심', '도쿄', '홍콩 도심'] },
  healing_rook:   { oneLiner: '휴식도 전략적으로', desc: '쉬는 시간조차 허투루 쓰지 않음. 한적한 시간대의 스파, 좋은 전망의 카페를 미리 찾아두고 가장 만족도 높은 휴식을 만들어냄', destinations: ['발리', '푸켓', '후아힌'] },
  landmark_rook:  { oneLiner: '하루 일정 꽉 채우는 관광러', desc: '관광지 간 이동 시간을 계산해 가장 효율적인 코스를 짬. 남들보다 더 많은 명소를 보고도 시간은 남기는 여행 최적화 전문가', destinations: ['로마', '파리', '바르셀로나'] },
  nature_rook:    { oneLiner: '자연도 계획해야 제대로 즐길 수 있음', desc: '트레킹 난이도, 이동 시간, 일출·일몰 시간까지 미리 체크. 준비된 만큼 더 멋진 풍경을 만날 수 있다고 믿는 타입', destinations: ['인터라켄', '밀포드사운드', '레이캬비크'] },
  nightlife_rook: { oneLiner: '밤에도 효율적으로 놀아야지', desc: '현지 바와 클럽 리뷰 훑고 대기 없는 시간대에 방문. 밤에도 낭비 없이 알짜만 즐기는 효율 지향 나이트 라이퍼', destinations: ['라스베가스', '싱가포르 도심', '마카오 반도'] },
  photo_rook:     { oneLiner: '인생샷도 타이밍이 핵심', desc: '빛이 가장 좋은 시간대와 포토스팟 위치를 미리 확인. 최소한의 시간으로 최고의 결과물을 남기는 계획형 포토그래퍼', destinations: ['산토리니', '두바이', '마리나베이'] },
  shopping_rook:  { oneLiner: '필요한 것만 정확하고 빠르게', desc: '쇼핑 리스트부터 매장 위치까지 미리 파악. 충동구매 없이 원하는 것만 빠르게 구매하고 만족스럽게 돌아오는 실속파', destinations: ['싱가포르 오차드', '도쿄', '밀라노'] },

  /* 🐴 나이트 — 즉흥·탐험·한눈팜 */
  activity_knight:  { oneLiner: '원래 계획엔 없던 게 제일 재밌음', desc: '다른 곳 가는 길에 패러글라이딩 홍보물을 발견. "한 번 해볼까?" 하고 들어갔다가 어느새 하늘 위. 예상 밖의 선택이 여행의 하이라이트가 되는 타입', destinations: ['보라카이', '코사무이', '발리'] },
  culture_knight:   { oneLiner: '지도에 없는 예술을 찾는 사람', desc: '지도에 없는 로컬 갤러리, 우연히 열린 버스킹, 골목 벽화. 예정에 없던 예술이 여행을 채운다고 믿는 낭만러', destinations: ['이스탄불', '하노이', '베를린'] },
  food_knight:      { oneLiner: '진짜 맛집은 샛길에 있는 법', desc: '유명 맛집을 찾아가다 골목 안쪽 작은 식당에 시선이 꽂힘. 간판도 흐릿하고 메뉴도 낯설지만 이상하게 그런 곳에서 가장 맛있는 한 끼를 만남.', destinations: ['치앙마이', '호이안', '오사카'] },
  healing_knight:   { oneLiner: '헤매는 시간마저 여행의 묘미', desc: '목적지로 가다 우연히 발견한 강변 카페나 한적한 공원에 발길이 멈춤. 계획한 휴식보다 우연히 만난 여유에 더 큰 감동을 받는 스타일', destinations: ['루앙프라방', '달랏', '교토'] },
  landmark_knight:  { oneLiner: '내가 가는 곳이 곧 랜드마크', desc: '유명 관광지를 향해 가는 길, 더 멋진 전망대나 골목 풍경을 발견하면 바로 방향을 트는 탐험가형 여행자', destinations: ['이스탄불', '카파도키아', '페트라'] },
  nature_knight:    { oneLiner: '길을 벗어날수록 보이는 절경', desc: '정해진 코스를 따라가기보다 눈에 띄는 오솔길을 선택함. 그러다 우연히 만난 폭포나 전망대에서 누구보다 깊은 감동을 받는 타입', destinations: ['롬복', '씨판돈', '코모도'] },
  nightlife_knight: { oneLiner: '밤에도 발길 닿는 대로', desc: '어디 갈지 정해두지 않았지만 골목에서 들려오는 음악에 이끌려 들어감. 예상치 못한 로컬 바와 파티를 발견하며 현지인들과 하루를 마무리하는 스타일', destinations: ['바르셀로나', '방콕', '베를린'] },
  photo_knight:     { oneLiner: '길 잃고 인생샷 얻음', desc: '길은 잃었지만 어쩌다 보니 아무도 모르는 포토스팟 발견. 우연이 이끌어준 인생샷 장인', destinations: ['카파도키아', '하롱', '코르푸'] },
  shopping_knight:  { oneLiner: '구경만 했을 뿐인데 어느새 양손 가득', desc: '우연히 들어간 빈티지 숍이나 로컬 편집숍에서 눈 돌아가는 타입. 분명히 살 생각은 없었는데 어느새 양손 한가득 들고 있는 즉흥형 쇼퍼', destinations: ['방콕', '홍콩 도심', '마라케시'] },

  /* ⛪ 비숍 — 테마·취향 확고·예약 담당 */
  activity_bishop:  { oneLiner: '이 액티비티 하려고 여기까지 옴', desc: '스쿠버다이빙이 목표면 여행지도 그 기준으로 선택. 예약은 진작 끝냈고 일정도 액티비티 중심으로 설계됨. 취향 하나만 보고 직진하는 스타일', destinations: ['퀸스타운', '인터라켄', '코타키나발루'] },
  culture_bishop:   { oneLiner: '이 전시 보러 여기까지 옴', desc: '보고 싶은 전시가 생기면 항공권부터 검색. 여행 전체가 하나의 전시나 미술관을 중심으로 움직이는 예술 덕후형 여행자', destinations: ['피렌체', '파리', '교토'] },
  food_bishop:      { oneLiner: '맛집 예약 실패는 곧 여행 실패', desc: '가고 싶은 식당은 이미 몇 달 전 예약 완료. 메뉴까지 정해두고 가는 경우도 많으며, 각 여행지의 맛집 리스트 보유자. 여행 중 먹계획이 틀어지는 걸 가장 싫어함', destinations: ['도쿄', '싱가포르 도심', '바르셀로나'] },
  healing_bishop:   { oneLiner: '힐링도 철저히 계획에 따라', desc: '스파, 리조트, 카페 후보를 사전에 비교 분석하고 최적의 힐링 코스를 완성. 예상치 못한 변수보단 철저하게 세팅된 휴식을 선호함', destinations: ['발리', '두바이', '치앙마이'] },
  landmark_bishop:  { oneLiner: '여긴 꼭 가야지', desc: '우선순위까지 매긴 명소 리스트를 들고 여행을 시작. 계획한 장소를 모두 방문해야 비로소 여행이 완성됐다고 느끼는 타입', destinations: ['로마', '이스탄불', '카이로'] },
  nature_bishop:    { oneLiner: '이 풍경 하나 보고 비행기 탐', desc: '대자연의 웅장함을 보기 위해 여행지를 선택함. 항공권부터 날씨, 투어, 이동수단 예약까지 빈틈없이 준비함. 목표하는 장면 하나를 보기 위해 여러번 방문도 감수한 자연 집착형 여행러', destinations: ['레이캬비크', '밀포드사운드', '장가계'] },
  nightlife_bishop: { oneLiner: '오늘 밤은 여기다', desc: '나이트라이프가 곧 여행지 선택의 기준. 취향 범벅의 클럽, 바 리스트업해서 우선순위 정해둠. 에티튜드에 맞는 아웃핏까지 완벽하게', destinations: ['라스베가스', '바르셀로나', '방콕'] },
  photo_bishop:     { oneLiner: '이번 여행의 목표는 인생샷 건지기', desc: '촬영 장소, 시간대, 구도까지 미리 조사. 원하는 결과물을 위해 같은 장소를 다시 방문하는 것도 마다하지 않음', destinations: ['산토리니', '두바이', '하롱'] },
  shopping_bishop:  { oneLiner: '쇼핑 리스트업이 가장 즐거워', desc: '쇼핑 리스트부터 매장 위치까지 정리 완료. 목적 없는 쇼핑보다 원하는 물건을 정확하게 얻는 데 만족감을 느끼는 타입', destinations: ['밀라노', '파리', '싱가포르 오차드'] },

  /* 👑 퀸 — 완벽 준비·A/B/C안·올라운더 */
  activity_queen:  { oneLiner: '플랜 B는 물론 C까지 있음', desc: '날씨와 변수까지 고려해 여러 선택지를 준비. 다치는 경우까지 대비하는건 당연, 어떤 상황이 와도 여행이 꼬이지 않도록 미리 대비하는 준비력 만렙 여행자', destinations: ['퀸스타운', '코타키나발루', '인터라켄'] },
  culture_queen:   { oneLiner: '예약부터 취소 규정까지 완벽 숙지', desc: '전시 예약은 기본, 대체 일정까지 확보. 예상치 못한 상황에도 흔들리지 않는 철저한 문화생활 설계자', destinations: ['런던', '도쿄', '피렌체'] },
  food_queen:      { oneLiner: '웨이팅? 계획대로야', desc: '친구야 나 믿지? 맛집 리스트, 대체 식당, 근처 카페, 소화제까지 준비 완료. 어떤 변수에도 굶을 일은 절대 없는 완벽주의 미식가', destinations: ['도쿄', '싱가포르 도심', '오사카'] },
  healing_queen:   { oneLiner: '완벽한 휴식도 준비가 필요함', desc: '스파 예약, 호텔 수영장, 강변 카페까지. 완벽한 휴식을 위한 완벽한 준비. 쉬러 왔는데 더 바쁜 것 같기도..?', destinations: ['발리', '치앙마이', '할슈타트'] },
  landmark_queen:  { oneLiner: '이번 여행 가이드? 나야나!', desc: '운영 시간, 혼잡도, 입장 방법, 사진 포인트, 심지어 히스토리까지 모두 파악하고 있음. 여행지 가이드북보다 더 자세한 정보를 가진 프로 가이드', destinations: ['파리', '로마', '이스탄불'] },
  nature_queen:    { oneLiner: '변수까지 계산한 자연 여행', desc: '완벽한 풍경을 보기 위한 날씨 앱 여러 개 비교는 기본, 코스별 난이도·소요 시간 정리, 투어 예약과 개인여행을 위한 이동수단까지 완벽 준비', destinations: ['레이캬비크', '퀸스타운', '인터라켄'] },
  nightlife_queen: { oneLiner: '오늘 밤도 완벽하게', desc: '진짜 여행은 밤부터 시작! 핫플 정보부터 귀가 방법까지 모두 준비. 즐기는 순간에도 다음 상황을 대비하는 여행 준비력 끝판왕', destinations: ['라스베가스', '바르셀로나', '방콕'] },
  photo_queen:     { oneLiner: '인생샷 건질 확률 200%', desc: '빛 좋은 시간대는 물론 흐린 날, 비 오는 날을 위한 구도 및 대체 장소까지 준비. 어떤 상황에서도 인생샷을 건지는 프로 포토그래퍼 타입', destinations: ['산토리니', '교토', '두바이'] },
  shopping_queen:  { oneLiner: '캐리어 무게까지 계산 완료', desc: '쇼핑 리스트, 예산, 동선, 면세 한도까지 완벽 정리. 쇼핑 중 어떤 상황에서도 빈틈을 허용하지 않는 프로 쇼퍼', destinations: ['파리', '밀라노', '도쿄'] },

  /* 🤴 킹 — 손 많이 감·덤벙·돈으로 해결 */
  activity_king:  { oneLiner: '예약은 안 했지만 제일 즐기고 있음', desc: '준비는 부족하지만 하고 싶은 건 꼭 함. 현장 예약과 추가 비용도 쿨하게 결제하며 경험에는 돈을 아끼지 않는 스타일', destinations: ['두바이', '퀸스타운', '코타키나발루'] },
  culture_king:   { oneLiner: '예약은 안 했지만 일단 들어감', desc: '예약을 깜빡해도 방법은 있다고 생각함. 현장 티켓이 비싸도 괜찮음. 보고 싶은 건 결국 보고 오는 타입', destinations: ['뉴욕', '런던', '파리'] },
  food_king:      { oneLiner: '비쌀수록 맛있는 법', desc: '메뉴 조사도 안 하고 리뷰도 안 봄. 잘 모르겠으면 추천 메뉴나 제일 비싼 메뉴를 주문하는 호쾌한 스타일', destinations: ['도쿄', '싱가포르 도심', '뉴욕'] },
  healing_king:   { oneLiner: '힐링은 돈으로 사는 것', desc: '여행 중 체력이 떨어지면 바로 마사지 예약. 호텔도 무조건 좋은 곳. 편하게 쉬는 데 필요한 비용은 전혀 아깝지 않다고 생각함. 힐링에 아낌없이 투자하는 스타일', destinations: ['두바이', '발리', '코타이'] },
  landmark_king:  { oneLiner: '기다리는 건 못 참음', desc: '긴 줄을 발견하면 패스트트랙부터 찾음. 시간을 아끼기 위해서라면 추가 비용도 흔쾌히 지불하는 타입', destinations: ['두바이', '로마', '뉴욕'] },
  nature_king:    { oneLiner: '편하게 보는 자연이 최고', desc: '직접 걷기보다 프라이빗 투어나 요트 투어를 선호. 힘은 덜 쓰고 풍경은 더 많이 즐기고 싶어 함', destinations: ['두바이', '코모도', '케이프타운'] },
  nightlife_king: { oneLiner: '오늘 밤은 내가 쏜다', desc: '좋은 자리, 좋은 술, 좋은 분위기라면 가격은 크게 중요하지 않음. 즐거운 밤을 위해 아낌없이 투자하는 타입', destinations: ['라스베가스', '두바이', '마카오 반도'] },
  photo_king:     { oneLiner: '장비빨도 실력이다', desc: '카메라 장비는 꼭 챙기고 필요하면 현지 포토그래퍼도 섭외. 최고의 결과물을 위해 투자하는 데 거리낌이 없음', destinations: ['두바이', '산토리니', '마리나베이'] },
  shopping_king:  { oneLiner: '쇼핑에 한도따위 없어', desc: '쇼핑 리스트도, 정해둔 예산도 없지만 마음에 들면 바로 구매. 캐리어 무게 초과도 여행 경비의 일부라고 생각함', destinations: ['파리', '밀라노', '두바이'] },
}

/* ─── 결과 조회 헬퍼 ──────────────────────────────────────────────────── */

export function getComboImage(themeKey, pieceKey) {
  return `/images/travel-style/${themeKey}_${pieceKey}.webp`
}

export function getComboResult(themeKey, pieceKey) {
  const theme = THEME_META[themeKey]
  const piece = PIECE_META[pieceKey]
  const combo = COMBO_RESULTS[`${themeKey}_${pieceKey}`]
  if (!theme || !piece || !combo) return null
  return {
    theme,
    piece,
    title: `${theme.titlePrefix} ${piece.label}`,
    image: getComboImage(themeKey, pieceKey),
    oneLiner: combo.oneLiner,
    desc: combo.desc,
    destinations: combo.destinations.map((city) => ({
      ...(CITY_INFO[city] ?? {}),
      city,
    })),
  }
}
