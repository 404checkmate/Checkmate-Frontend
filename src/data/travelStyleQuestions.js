// 참고: src/data/travelStyleGuide.md

export const TRAVEL_STYLE_QUESTIONS = [
  // ── Q1 (A축 — 여행 준비 스타일) ────────────────────────────────────
  {
    id: 1,
    axis: 'A',
    question: '✈️ 여행 출발 2주 전! 친구들 단톡방에 "이제 슬슬 준비할까?" 라고 올라왔어. 너의 반응은?',
    questionDesktop: '✈️ 여행 출발 2주 전!\n친구들 단톡방에 "이제 슬슬 준비할까?" 라고 올라왔어. 너의 반응은?',
    options: [
      { label: '오 그래? 난 다 좋으니까 너네 정해줘~ 정해지면 따라갈게! 🙌',              tag: '폰',   point: '의견 없이 신나게 따라감',      scores: { rook: 0, knight: 1, bishop: 0, queen: 1, king: 0, pawn: 3 } },
      { label: '숙소랑 교통편만 잡으면 끝! 나머지 자잘한 건 굳이 미리 안 정해도 돼',    tag: '룩',   point: '핵심만, 군더더기 거부',          scores: { rook: 3, knight: 0, bishop: 1, queen: 1, king: 0, pawn: 1 } },
      { label: '일정 너무 빡빡하게 짜지 말자~ 가서 꽂히는 데 들르는 게 진짜 재밌잖아',   tag: '나이트', point: '즉흥 탐험 여지 확보',           scores: { rook: 0, knight: 3, bishop: 0, queen: 1, king: 0, pawn: 1 } },
      { label: '내가 일정표 공유한 지 일주일 됐는데?? 다들 확인 좀...\n2일차 동선 의견 줘', tag: '비숍', point: '이미 짠 계획 사수(파워J)',        scores: { rook: 1, knight: 0, bishop: 3, queen: 1, king: 2, pawn: 0 } },
    ],
  },

  // ── Q2 (B축 — 선호 여행 스타일) ────────────────────────────────────
  {
    id: 2,
    axis: 'B',
    question: '🗺️ 여행지 도착 첫날 오후, 갑자기 자유 시간 3시간이 생겼어. 뭘 할 거야?',
    options: [
      { label: '근처에 전망 좋은 산이나 바다 있나 검색해서 일단 달려간다',    tag: '자연',     scores: { rook: 1, knight: 3, bishop: 0, queen: 1, king: 1, pawn: 0 } },
      { label: '"이 동네 1등 맛집"부터 찾아서 웨이팅 걸어둔다',              tag: '맛집탐방', scores: { rook: 2, knight: 1, bishop: 0, queen: 2, king: 0, pawn: 2 } },
      { label: '도보 거리 미술관·고궁·박물관 중 하나 골라 천천히 둘러본다',   tag: '문화예술', scores: { rook: 1, knight: 0, bishop: 3, queen: 1, king: 1, pawn: 0 } },
      { label: '숙소로 돌아가 침대에 눕는다. 첫날은 체력 비축이지',           tag: '힐링',     scores: { rook: 0, knight: 0, bishop: 0, queen: 0, king: 0, pawn: 3 } },
    ],
  },

  // ── Q3 (A축 — 여행 준비 스타일) ────────────────────────────────────
  {
    id: 3,
    axis: 'A',
    question: '🧳 출국 전날 밤, 짐 싸는 너의 모습은?',
    options: [
      { label: '스마트폰·여권만 챙기고 끝. "모자라면 현지서 사면 되지, 돈 쓰는 게 짐 드는 것보단 나아"', tag: '킹',   point: '최소 짐 + 돈으로 해결',      scores: { rook: 0, knight: 1, bishop: 0, queen: 1, king: 3, pawn: 0 } },
      { label: '옷 3벌, 세면도구, 보조배터리. 딱 필요한 것만. "짐 무거우면 이동이 힘들어"',               tag: '룩',   point: '계산된 최소 효율',            scores: { rook: 3, knight: 0, bishop: 1, queen: 1, king: 0, pawn: 0 } },
      { label: '우산·상비약·멀티탭·여벌옷... "혹시 몰라"를 외치다 캐리어가 두 개째',                    tag: '퀸',   point: '모든 변수 대비',              scores: { rook: 0, knight: 0, bishop: 1, queen: 3, king: 1, pawn: 0 } },
      { label: '"어? 나 충전기 챙겼나...? 뭔가 빠뜨린 것 같은데 가서 알게 되겠지 뭐~"',                  tag: '나이트', point: '즉흥(나이트)',               scores: { rook: 0, knight: 3, bishop: 0, queen: 0, king: 0, pawn: 2 } },
    ],
  },

  // ── Q4 (B축 — 선호 여행 스타일) ────────────────────────────────────
  {
    id: 4,
    axis: 'B',
    question: '📸 여행지에서 너의 카메라 롤을 가득 채우는 사진은?',
    options: [
      { label: '빛 예쁜 골목, 색감 좋은 벽, 분위기 있는 창문 — 인물 없이도 감성 폭발하는 컷', tag: '포토스팟', scores: { rook: 3, knight: 0, bishop: 1, queen: 1, king: 0, pawn: 1 } },
      { label: '음식 나오면 식기 전에 위에서 한 컷, 단면 한 컷, 맛있으면 한 컷 더',            tag: '맛집탐방', scores: { rook: 1, knight: 1, bishop: 0, queen: 2, king: 0, pawn: 2 } },
      { label: '쇼핑백 잔뜩 든 손, 새로 산 아이템, 매장 디스플레이',                           tag: '쇼핑',     scores: { rook: 0, knight: 1, bishop: 0, queen: 1, king: 2, pawn: 2 } },
      { label: '랜드마크 정중앙에 딱 서서 "나 여기 왔다" 인증샷',                               tag: '명소방문', scores: { rook: 1, knight: 0, bishop: 2, queen: 1, king: 1, pawn: 1 } },
    ],
  },

  // ── Q5 (A축 — 여행 준비 스타일) ────────────────────────────────────
  {
    id: 5,
    axis: 'A',
    question: '🗓️ 여행 당일 이동 중, 친구가 "오늘 일정 어떻게 돼?"라고 물었어. 너의 대답은?',
    options: [
      { label: '"오늘? 글쎄~ 다들 가고 싶은 데로 가자! 난 진짜 어디든 좋아"',               tag: '폰',   point: '의견 없이 따라감',            scores: { rook: 0, knight: 1, bishop: 0, queen: 1, king: 0, pawn: 3 } },
      { label: '"동선 정리해놨어. 이 순서로 돌면 안 겹치고 제일 빨라"',                      tag: '룩',   point: '효율·길잡이',                 scores: { rook: 3, knight: 0, bishop: 1, queen: 1, king: 1, pawn: 0 } },
      { label: '"일단 나가서 분위기 보고~ 괜찮은 데 보이면 바로 그쪽으로 틀자!"',            tag: '나이트', point: '즉흥 한눈팜',                scores: { rook: 0, knight: 3, bishop: 0, queen: 1, king: 0, pawn: 1 } },
      { label: '"내가 보낸 일정표 봐봐. 오후 2시 ○○는 예약해뒀으니까 꼭 가야 해"',          tag: '비숍', point: '예약 담당·계획 사수',           scores: { rook: 1, knight: 0, bishop: 3, queen: 1, king: 2, pawn: 0 } },
    ],
  },

  // ── Q6 (B축 — 선호 여행 스타일) ────────────────────────────────────
  {
    id: 6,
    axis: 'B',
    question: '🌃 여행 마지막 밤, 딱 2시간 남았어. 어떻게 보낼래?',
    options: [
      { label: '루프탑 바나 클럽 가서 현지 음악에 몸 맡기고 신나게 논다',        tag: ['나이트라이프', '액티비티'], scores: { rook: 0, knight: 2, bishop: 0, queen: 1, king: 2, pawn: 0 } },
      { label: '호텔 수영장·스파에서 조용히 몸 풀며 하루 피로를 푼다',           tag: '힐링',         scores: { rook: 0, knight: 0, bishop: 0, queen: 1, king: 0, pawn: 3 } },
      { label: '유명 야경 명소를 찾아가 "여기 와봤다" 인증샷을 남긴다',          tag: '명소방문',     scores: { rook: 2, knight: 0, bishop: 2, queen: 1, king: 1, pawn: 0 } },
      { label: '공항 가기 전 쇼핑몰 들러 마지막 기념품을 쓸어 담는다',           tag: '쇼핑',         scores: { rook: 0, knight: 1, bishop: 0, queen: 1, king: 2, pawn: 2 } },
    ],
  },

  // ── Q7 (A축 — 여행 준비 스타일) ────────────────────────────────────
  {
    id: 7,
    axis: 'A',
    question: '😱 여행 도중 예약했던 곳이 갑자기 취소됐어! 너의 첫 반응은?',
    options: [
      { label: '"아 그래? 뭐 어떻게든 되겠지~ 난 어디든 좋아!"',                             tag: '폰',   point: '동요 없이 따라감',            scores: { rook: 0, knight: 1, bishop: 0, queen: 1, king: 0, pawn: 3 } },
      { label: '"당황할 시간 없어. 평점 높은 대체지 바로 찾아서 예약 완료. 자, 가자"',       tag: '룩',   point: '신속·효율적 해결',            scores: { rook: 3, knight: 1, bishop: 0, queen: 1, king: 1, pawn: 0 } },
      { label: '"오 오히려 잘됐다! 거기 좀 뻔했잖아, 이참에 안 가본 데 뚫어보자!"',        tag: '나이트', point: '돌발을 기회로',              scores: { rook: 0, knight: 3, bishop: 0, queen: 1, king: 0, pawn: 1 } },
      { label: '"이럴 줄 알고 플랜 B 준비해놨지. ...근데 일정 틀어진 건 진짜 화나네"',     tag: '퀸',   point: '대안 준비(퀸) + 틀어짐 못 참음(비숍)', scores: { rook: 0, knight: 0, bishop: 2, queen: 3, king: 1, pawn: 0 } },
    ],
  },

  // ── Q8 (B축 — 선호 여행 스타일) ────────────────────────────────────
  {
    id: 8,
    axis: 'B',
    question: '🎡 "오늘 하루는 완전 자유!" 라면, 어떤 하루를 보내고 싶어?',
    options: [
      { label: '래프팅·번지점프·스쿠버 중 하나! 심장 쫄깃한 야외 액티비티에 도전', tag: '액티비티', scores: { rook: 0, knight: 3, bishop: 0, queen: 1, king: 1, pawn: 0 } },
      { label: '로컬 카페와 골목을 발길 닿는 대로 여유롭게 어슬렁거린다',         tag: '힐링',     scores: { rook: 1, knight: 0, bishop: 1, queen: 1, king: 0, pawn: 3 } },
      { label: '전통 공연을 보거나 국립박물관·미술관을 진득하게 한 바퀴 돈다',    tag: '문화예술', scores: { rook: 0, knight: 0, bishop: 3, queen: 1, king: 1, pawn: 1 } },
      { label: '국립공원·트레킹 코스를 걸으며 풍경을 눈에 담는다',               tag: '자연',     scores: { rook: 1, knight: 2, bishop: 1, queen: 1, king: 0, pawn: 1 } },
    ],
  },

  // ── Q9 (A축 — 여행 준비 스타일) ────────────────────────────────────
  {
    id: 9,
    axis: 'A',
    question: '💸 여행 경비, 너는 어떻게 관리해?',
    options: [
      { label: '"돈은 쓰라고 있는 거지~ 아끼다 못 즐기고 오는 게 제일 손해야" (한도 신경 안 씀)', tag: '킹',        point: '돈으로 해결, 아낌없음',        scores: { rook: 0, knight: 1, bishop: 0, queen: 0, king: 3, pawn: 1 } },
      { label: '"식비·교통·쇼핑 카테고리별로 예산 딱 정해두고 필요한 것만 사"',                   tag: '퀸',        point: '항목별 예산 사수 + 꼼꼼한 설계', scores: { rook: 1, knight: 0, bishop: 2, queen: 3, king: 0, pawn: 0 } },
      { label: '"얼마 썼는지 잘 모르겠는데... 어 카드값이 왜 이래? 뭐 즐거웠으면 됐지~"',        tag: '폰',        point: '무계획(폰) + 덤벙·펑펑 씀(킹)',  scores: { rook: 0, knight: 1, bishop: 0, queen: 0, king: 2, pawn: 3 } },
      { label: '"예상 지출 A안, 환율 오를 때 대비 B안, 비상금까지 세 겹으로 준비했어"',           tag: '비숍',      point: '시나리오별 대비',              scores: { rook: 1, knight: 0, bishop: 3, queen: 2, king: 0, pawn: 0 } },
    ],
  },

  // ── Q10 (B축 — 선호 여행 스타일) ───────────────────────────────────
  {
    id: 10,
    axis: 'B',
    question: '🍽️ 저녁시간, 어디로 갈지 고민 중. 너의 선택은?',
    options: [
      { label: '현지인·미식 블로거가 인정한 진짜 맛집. 웨이팅 길어도 무조건 줄 선다',     tag: '맛집탐방',       scores: { rook: 1, knight: 1, bishop: 0, queen: 2, king: 0, pawn: 2 } },
      { label: '아무데나. 이따 밤에 나오려면 빨리 먹고 숙소 들려서 준비해야해',           tag: '나이트라이프',   scores: { rook: 0, knight: 2, bishop: 0, queen: 1, king: 1, pawn: 1 } },
      { label: '유명 관광지 바로 옆, 전망 끝내주는 뷰 맛집에서 인증샷 겸 식사',          tag: '명소방문',       scores: { rook: 2, knight: 0, bishop: 2, queen: 1, king: 1, pawn: 0 } },
      { label: 'SNS에서 핫한 팝업 카페&레스토랑 굿즈도 사고 한정 메뉴도 인증',           tag: ['쇼핑', '포토스팟'], scores: { rook: 2, knight: 0, bishop: 0, queen: 1, king: 1, pawn: 1 } },
    ],
  },
]
