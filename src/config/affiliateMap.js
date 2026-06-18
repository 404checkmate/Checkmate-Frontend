/**
 * 항목 → 제휴(쿠팡 파트너스 / 마이리얼트립) 매핑.
 *
 * 쿠팡 간편링크(link.coupang.com/a/...)와 마리트 단축링크(myrealt.rip/...)는
 * 추적코드가 코드 안에 내장돼 있어 키워드로 동적 생성이 불가능하다.
 * → 상품별로 대시보드에서 링크를 1번 만들어 항목 키워드에 매핑한다.
 *
 * 매칭은 항목 제목 부분포함(includes) 기준 — 실제 항목명이
 * "이심 / 유심 / 로밍 / 포켓 와이파이"처럼 길 수 있으므로 키워드로 잡는다.
 * 매핑이 없는 항목은 구매 버튼을 노출하지 않는다.
 *
 * ⚠️ 현재 url 값은 시드(샘플 링크)다. 운영 전 각 항목에 맞는 상품 링크로 교체할 것.
 *    (예: 캐리어 항목 → 캐리어 상품 간편링크)
 */

const COUPANG_SEED = 'https://link.coupang.com/a/eEnObLEG84'
const MRT_SEED = 'https://myrealt.rip/c07Y57'

const c = (url = COUPANG_SEED) => ({ provider: 'coupang', label: '구매하러 가기', url })
const m = (label, url = MRT_SEED) => ({ provider: 'mrt', label, url })

// 키워드 → 제휴정보. 위에서부터 먼저 매칭되는 항목이 우선.
const RULES = [
  // 액티비티 / 예약 (마이리얼트립) — 예약하러 가기
  ['투어', m('예약하러 가기')],
  ['액티비티', m('예약하러 가기')],
  ['입장권', m('예약하러 가기')],
  ['마사지', m('예약하러 가기')],
  ['스파', m('예약하러 가기')],
  ['호핑', m('예약하러 가기')],
  // 통신 (마이리얼트립 이심) — 신청하러 가기
  ['이심', m('신청하러 가기')],
  ['esim', m('신청하러 가기')],
  ['유심', m('신청하러 가기')],
  ['와이파이', m('신청하러 가기')],
  ['로밍', m('신청하러 가기')],
  // 물리적 준비물 (쿠팡) — 구매하러 가기
  ['어댑터', c()],
  ['멀티탭', c()],
  ['캐리어', c()],
  ['목베개', c()],
  ['보조배터리', c()],
  ['충전기', c()],
  ['자외선', c()],
  ['선크림', c()],
  ['세안', c()],
  ['샤워', c()],
  ['파우치', c()],
  ['지퍼백', c()],
  ['비닐봉투', c()],
]

/** 항목 제목으로 제휴정보를 찾는다. 없으면 null. */
export function resolveAffiliate(title) {
  if (!title) return null
  const t = String(title).toLowerCase()
  for (const [keyword, info] of RULES) {
    if (t.includes(keyword.toLowerCase())) return info
  }
  return null
}
