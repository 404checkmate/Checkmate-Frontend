export const TRAVEL_STYLE_QUESTIONS = [
  {
    id: 1,
    question: '여행 중 가장 기대되는 순간은?',
    options: [
      { label: '완벽한 인생샷 건지기',        scores: { rook: 3, knight: 0, bishop: 1, queen: 1, king: 0, pawn: 0 } },
      { label: '현지 맛집 탐방',              scores: { rook: 1, knight: 1, bishop: 1, queen: 2, king: 1, pawn: 2 } },
      { label: '짜릿한 액티비티 체험',        scores: { rook: 0, knight: 3, bishop: 0, queen: 1, king: 1, pawn: 0 } },
      { label: '호텔에서 느긋하게 쉬기',      scores: { rook: 0, knight: 0, bishop: 0, queen: 0, king: 0, pawn: 3 } },
    ],
  },
  {
    id: 2,
    question: '여행 계획은 어떻게 짜는 편인가요?',
    options: [
      { label: '분 단위로 빼곡히 짠다',        scores: { rook: 1, knight: 1, bishop: 1, queen: 2, king: 3, pawn: 0 } },
      { label: '큰 틀만 잡고 즉흥으로 간다',  scores: { rook: 2, knight: 2, bishop: 0, queen: 2, king: 0, pawn: 1 } },
      { label: '유명 명소 위주로 정리한다',    scores: { rook: 1, knight: 0, bishop: 2, queen: 1, king: 1, pawn: 1 } },
      { label: '계획 없이 느낌대로 간다',      scores: { rook: 0, knight: 1, bishop: 0, queen: 0, king: 0, pawn: 3 } },
    ],
  },
  {
    id: 3,
    question: '여행지에서 아침을 맞이하는 방법은?',
    options: [
      { label: '일출 명소로 달려가 사진 찍기', scores: { rook: 3, knight: 1, bishop: 0, queen: 1, king: 1, pawn: 0 } },
      { label: '현지 조식 맛집 탐방',          scores: { rook: 1, knight: 0, bishop: 1, queen: 2, king: 1, pawn: 2 } },
      { label: '체크인 전날 액티비티 예약 확인', scores: { rook: 0, knight: 2, bishop: 0, queen: 1, king: 3, pawn: 0 } },
      { label: '늦잠 자고 브런치',             scores: { rook: 0, knight: 0, bishop: 0, queen: 0, king: 0, pawn: 3 } },
    ],
  },
  {
    id: 4,
    question: '여행 중 예상치 못한 상황이 생겼을 때?',
    options: [
      { label: '즉흥적으로 새로운 장소 발견',  scores: { rook: 2, knight: 2, bishop: 1, queen: 2, king: 0, pawn: 1 } },
      { label: '침착하게 대안 계획 수립',      scores: { rook: 0, knight: 0, bishop: 1, queen: 2, king: 3, pawn: 0 } },
      { label: '일행에게 맡기고 따라간다',     scores: { rook: 1, knight: 1, bishop: 1, queen: 0, king: 0, pawn: 2 } },
      { label: '당황하지만 금방 적응',         scores: { rook: 1, knight: 1, bishop: 1, queen: 2, king: 1, pawn: 1 } },
    ],
  },
  {
    id: 5,
    question: '여행 사진은 주로 어떤 것을 찍나요?',
    options: [
      { label: '나와 풍경이 담긴 감성 컷',     scores: { rook: 3, knight: 0, bishop: 1, queen: 1, king: 0, pawn: 1 } },
      { label: '액티비티 현장 역동적인 사진',  scores: { rook: 0, knight: 3, bishop: 0, queen: 1, king: 1, pawn: 0 } },
      { label: '역사·문화 유적지 기록',        scores: { rook: 0, knight: 0, bishop: 3, queen: 1, king: 1, pawn: 0 } },
      { label: '맛있는 음식 위주',             scores: { rook: 1, knight: 0, bishop: 0, queen: 2, king: 0, pawn: 3 } },
    ],
  },
  {
    id: 6,
    question: '현지에서 꼭 하고 싶은 것이 있다면?',
    options: [
      { label: 'SNS에 올릴 핫플레이스 방문',   scores: { rook: 3, knight: 0, bishop: 0, queen: 1, king: 0, pawn: 1 } },
      { label: '번지점프·서핑 등 스포츠',      scores: { rook: 0, knight: 3, bishop: 0, queen: 1, king: 1, pawn: 0 } },
      { label: '박물관·로컬 투어',             scores: { rook: 0, knight: 0, bishop: 3, queen: 1, king: 1, pawn: 1 } },
      { label: '스파·마사지로 몸 회복',        scores: { rook: 1, knight: 0, bishop: 0, queen: 1, king: 0, pawn: 3 } },
    ],
  },
  {
    id: 7,
    question: '여행 일행과의 관계에서 나는?',
    options: [
      { label: '내 취향대로 코스 제안하는 편', scores: { rook: 1, knight: 1, bishop: 1, queen: 2, king: 3, pawn: 0 } },
      { label: '일행을 따라가는 편',           scores: { rook: 1, knight: 1, bishop: 1, queen: 0, king: 0, pawn: 3 } },
      { label: '혼자 다녀오고 나중에 합류',    scores: { rook: 2, knight: 2, bishop: 2, queen: 1, king: 0, pawn: 0 } },
      { label: '상황에 따라 유연하게',         scores: { rook: 1, knight: 1, bishop: 1, queen: 3, king: 1, pawn: 1 } },
    ],
  },
  {
    id: 8,
    question: '여행 후 집에 돌아와서 가장 먼저 하는 것은?',
    options: [
      { label: '사진 정리하고 인스타 업로드',  scores: { rook: 3, knight: 0, bishop: 0, queen: 1, king: 0, pawn: 1 } },
      { label: '다음 여행 계획 바로 구상',     scores: { rook: 0, knight: 2, bishop: 1, queen: 2, king: 3, pawn: 0 } },
      { label: '여행 일지·기록 정리',         scores: { rook: 1, knight: 0, bishop: 3, queen: 1, king: 1, pawn: 0 } },
      { label: '푹 쉬면서 여운 즐기기',       scores: { rook: 0, knight: 0, bishop: 0, queen: 0, king: 0, pawn: 3 } },
    ],
  },
  {
    id: 9,
    question: '이상적인 여행 숙소는?',
    options: [
      { label: '인테리어 예쁜 감성 숙소',      scores: { rook: 3, knight: 0, bishop: 0, queen: 1, king: 0, pawn: 2 } },
      { label: '액티비티 가깝고 교통 편한 곳', scores: { rook: 0, knight: 3, bishop: 1, queen: 1, king: 1, pawn: 0 } },
      { label: '역사지구 중심의 로컬 호스텔',  scores: { rook: 1, knight: 0, bishop: 3, queen: 1, king: 1, pawn: 0 } },
      { label: '풀빌라·리조트에서 올인클루시브', scores: { rook: 1, knight: 1, bishop: 0, queen: 2, king: 1, pawn: 3 } },
    ],
  },
  {
    id: 10,
    question: '여행에서 가장 중요한 것은?',
    options: [
      { label: '남기는 기록과 추억',           scores: { rook: 3, knight: 1, bishop: 2, queen: 1, king: 0, pawn: 1 } },
      { label: '짜릿한 경험과 도전',           scores: { rook: 0, knight: 3, bishop: 1, queen: 1, king: 2, pawn: 0 } },
      { label: '새로운 문화와 배움',           scores: { rook: 0, knight: 0, bishop: 3, queen: 1, king: 1, pawn: 1 } },
      { label: '완전한 휴식과 충전',           scores: { rook: 0, knight: 0, bishop: 0, queen: 1, king: 0, pawn: 3 } },
    ],
  },
]
