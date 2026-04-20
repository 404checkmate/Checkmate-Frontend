/** 가이드 보관함 체크리스트 — 수하물 구간 (체크리스트 상세 UI) */

export const BAGGAGE_CARRY_ON = 'carry_on'
export const BAGGAGE_CHECKED = 'checked'

export const BAGGAGE_SECTION_ORDER = [BAGGAGE_CARRY_ON, BAGGAGE_CHECKED]

export const BAGGAGE_SECTION_LABEL = {
  [BAGGAGE_CARRY_ON]: '기내 반입',
  [BAGGAGE_CHECKED]: '위탁 수하물',
}

/** 가이드 보관함 체크리스트에서 「직접 추가」로 만든 항목 묶음 (UI에서 카테고리 블록 하단 정렬) */
export const GUIDE_USER_DIRECT_CATEGORY = '__guide_user_direct__'
export const GUIDE_USER_DIRECT_SECTION_LABEL = '직접 추가'

/** 저장 항목에 `baggageType`이 없으면 기내로 간주 (기존 로컬 데이터 호환) */
export function resolveBaggageSection(item) {
  const t = item?.baggageType
  if (t === BAGGAGE_CHECKED) return BAGGAGE_CHECKED
  return BAGGAGE_CARRY_ON
}
