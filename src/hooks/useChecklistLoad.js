import { useState, useEffect } from 'react'
import {
  generateChecklist,
  generateChecklistFromContext,
  getGlobalTemplates,
  listChecklistCandidates,
} from '@/api/checklists'
import { adaptGeneratedChecklist } from '@/utils/checklistAdapter'
import { loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { buildContextInputFromPlan } from '@/utils/tripSearchUtils'
import { trackEvent } from '@/utils/analyticsTracker'

export function useChecklistLoad(tripId, retryTick) {
  const [loadState, setLoadState] = useState({ status: 'loading', fromApi: false })
  const [apiItems, setApiItems] = useState([])
  const [apiSummary, setApiSummary] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoadState({ status: 'loading', fromApi: false })

    const applyAdapted = (data, via) => {
      if (cancelled) return
      const adapted = adaptGeneratedChecklist(data)
      setApiItems(adapted.items)
      setApiSummary(adapted.summary)
      setLoadState({ status: 'ready', fromApi: true, via })
      trackEvent('search_items_loaded', {
        trip_id: tripId,
        via,
        total: adapted.items.length,
        from_template: adapted.summary?.fromTemplate ?? 0,
        from_llm: adapted.summary?.fromLlm ?? 0,
        llm_tokens: adapted.summary?.llmTokensUsed ?? 0,
        model: adapted.summary?.model ?? null,
      })
    }

    const applyFallback = (errorMessage) => {
      if (cancelled) return
      setApiItems([])
      setApiSummary(null)
      setLoadState({ status: 'fallback', fromApi: false, errorMessage: errorMessage || '알 수 없는 오류' })
    }

    ;(async () => {
      const plan = loadActiveTripPlan()
      const contextInput = buildContextInputFromPlan(plan)

      if (tripId === 'guest') {
        // 큐레이션 페이지에서 넘어온 경우: sessionStorage에 저장된 체크 항목 + 공통 템플릿으로 체크리스트 구성
        const rawCuration = sessionStorage.getItem('curationSave')
        if (rawCuration) {
          try {
            const { items: curationItems, countryName } = JSON.parse(rawCuration)
            const templateGroups = await getGlobalTemplates()

            const builtItems = [
              // 큐레이션에서 체크한 항목 — AI 추천 탭에 pre-selected 상태로 표시
              ...curationItems.map((item, i) => ({
                id: `curation-${i}`,
                title: item.label,
                categoryCode: 'ai_recommend',
                categoryLabel: item.cat,
                prepType: 'item',
                baggageType: 'none',
                source: 'curation',
                isEssential: false,
                isSelected: true,
                isChecked: false,
              })),
              // 공통 기본 템플릿 항목 — 추가 선택 가능 상태로 표시
              ...templateGroups.flatMap((group) =>
                group.items.map((item) => ({
                  title: item.title,
                  categoryCode: group.categoryCode,
                  categoryLabel: group.categoryLabel,
                  prepType: item.prepType,
                  baggageType: item.baggageType,
                  source: 'template',
                  isEssential: item.isEssential,
                  isSelected: false,
                  isChecked: false,
                }))
              ),
            ]

            applyAdapted(
              {
                items: builtItems,
                sections: [],
                summary: {
                  total: builtItems.length,
                  fromTemplate: templateGroups.reduce((s, g) => s + g.items.length, 0),
                  fromLlm: 0,
                  duplicatesRemoved: 0,
                  llmTokensUsed: 0,
                  model: null,
                  cacheStatus: 'fresh',
                },
                context: { destination: countryName ?? '' },
              },
              'curation',
            )
            return
          } catch (e) {
            // 파싱 또는 API 실패 시 sessionStorage 제거 후 기존 플로우로 계속
            sessionStorage.removeItem('curationSave')
            console.warn('[useChecklistLoad] curation 플로우 실패, 기존 흐름으로 폴백:', e?.message ?? e)
          }
        }

        if (contextInput) {
          try {
            const data = await generateChecklistFromContext(contextInput)
            applyAdapted(data, 'context')
          } catch (err) {
            if (cancelled) return
            console.warn('[useChecklistLoad] guest generateFromContext 실패:', err?.message ?? err)
            applyFallback(err?.response?.data?.message || err?.message)
          }
        } else {
          applyFallback('여행 정보가 없습니다. 처음부터 다시 시작해 주세요.')
        }
        return
      }

      try {
        const cachedData = await listChecklistCandidates(tripId)
        if (cachedData?.items?.length > 0) {
          applyAdapted(cachedData, 'db-cached')
          return
        }
      } catch (candidateErr) {
        if (candidateErr?.response?.status !== 404) {
          console.warn('[useChecklistLoad] listCandidates 실패, generate로 폴백:', candidateErr?.message ?? candidateErr)
        }
      }

      try {
        const data = await generateChecklist(tripId)
        if (Array.isArray(data?.items) && data.items.length > 0) {
          applyAdapted(data, 'trip')
          return
        }
        if (contextInput) {
          if (import.meta.env.DEV) {
            console.warn('[useChecklistLoad] generateChecklist items 비어 있음 — context로 재시도')
          }
          const data2 = await generateChecklistFromContext(contextInput)
          if (cancelled) return
          applyAdapted(data2, 'context')
          return
        }
        applyAdapted(data, 'trip')
      } catch (err1) {
        const status = err1?.response?.status
        if (cancelled) return
        if (status === 404 || status === 400) {
          if (contextInput) {
            try {
              const data2 = await generateChecklistFromContext(contextInput)
              applyAdapted(data2, 'context')
              return
            } catch (err2) {
              if (cancelled) return
              console.warn('[useChecklistLoad] generateFromContext 실패:', err2?.message ?? err2)
            }
          } else {
            console.warn('[useChecklistLoad] trip 없음 + 로컬 플랜도 없어 context 재시도 불가')
          }
        } else {
          console.warn('[useChecklistLoad] generateChecklist 실패:', err1?.message ?? err1)
        }
        applyFallback(err1?.response?.data?.message || err1?.message)
      }
    })()

    return () => { cancelled = true }
  }, [tripId, retryTick])

  return { loadState, setLoadState, apiItems, apiSummary }
}
