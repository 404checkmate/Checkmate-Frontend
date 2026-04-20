import { MOCK_ITEMS, TRIP_SEARCH_CONTEXT } from '@/mocks/searchData'
import { loadGuideArchive, appendGuideArchiveEntry } from '@/utils/guideArchiveStorage'
import { saveItemForTrip } from '@/utils/savedTripItems'
import { buildTripWindowLabelFromRange } from '@/utils/tripDateFormat'

/** 원래 목록용 기본 1건 (중복 삽입 방지) — 검색 스냅샷과 목적지 문자열을 달리해 예시 시드와 충돌하지 않음 */
export const DEFAULT_ARCHIVE_SAMPLE_ID = 'archive-default-sample-1'

function toArchiveItem(i) {
  return {
    id: i.id,
    baggageType: i.baggageType,
    category: i.category,
    categoryLabel: i.categoryLabel,
    title: i.title,
    description: i.description,
    detail: i.detail,
  }
}

/**
 * 보관함에 기본 샘플이 없으면 1건 추가합니다. (체크리스트 항목은 미체크 = 0%)
 * 예시 데모가 쓰는 MOCK id(0~11번)와 겹치지 않게 12~15번 항목을 사용합니다.
 *
 * TripGuideArchivePage에서는 자동 호출하지 않습니다. (검색에서 저장한 스냅샷만 목록에 쌓이게 하기 위함)
 * 데모·로컬 시드가 필요하면 이 함수를 원하는 시점에 직접 호출하세요.
 */
export function ensureDefaultGuideArchiveSample(tripId) {
  if (tripId == null) return
  const list = loadGuideArchive(tripId)
  if (list.some((e) => String(e.id) === DEFAULT_ARCHIVE_SAMPLE_ID)) return

  const sampleItems = MOCK_ITEMS.slice(12, 16)
  if (sampleItems.length < 4) return

  appendGuideArchiveEntry(tripId, {
    id: DEFAULT_ARCHIVE_SAMPLE_ID,
    pageTitle: '여행 준비 체크리스트',
    pageSubtitle: '',
    destination: '나트랑',
    country: '베트남',
    tripStartDate: '2026-06-03',
    tripEndDate: '2026-06-09',
    countryCode: 'VN',
    iata: 'CXR',
    tripWindowLabel: buildTripWindowLabelFromRange('2026-06-03', '2026-06-09'),
    weatherSummary: TRIP_SEARCH_CONTEXT.weatherSummary,
    temperatureRange: TRIP_SEARCH_CONTEXT.temperatureRange,
    rainChance: TRIP_SEARCH_CONTEXT.rainChance,
    environmentTags: TRIP_SEARCH_CONTEXT.environmentTags.map((t) => ({ ...t })),
    phaseHints: TRIP_SEARCH_CONTEXT.phaseHints.map((p) => ({ ...p })),
    items: sampleItems.map(toArchiveItem),
    dailySummaries: [],
    dailyGuidesFull: [],
  })

  sampleItems.forEach((item) => {
    saveItemForTrip(tripId, {
      id: item.id,
      category: item.category,
      title: item.title,
      subtitle: item.detail || item.description || '',
    })
  })
}
