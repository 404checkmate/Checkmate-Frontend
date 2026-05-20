import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTrip } from '@/api/trips'
import { upsertChecklistItems } from '@/api/checklists'
import { createGuideArchive } from '@/api/guideArchives'
import { loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { buildCreateTripPayload } from '@/utils/tripPlanToCreatePayload'
import { buildArchiveSnapshot } from '@/utils/tripSearchUtils'
import { loadPendingGuestSearch, clearPendingGuestSearch } from '@/utils/pendingGuestSearch'
import { saveActiveTripId } from '@/utils/activeTripIdStorage'
import { getSupabaseClient } from '@/lib/supabase'

/**
 * 비로그인(guest) 상태로 진입 후 로그인된 세션이 감지되면
 * 임시 플랜을 실제 trip으로 업그레이드하고 체크리스트를 저장한다.
 */
export function useGuestTripUpgrade({ tripId, setLoadState }) {
  const navigate = useNavigate()
  const ranRef = useRef(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (tripId !== 'guest') return
    cancelledRef.current = false
    if (ranRef.current) return
    ranRef.current = true

    ;(async () => {
      const supabase = getSupabaseClient()
      if (!supabase) return
      const { data } = await supabase.auth.getSession()
      if (!data?.session?.access_token) return
      if (cancelledRef.current) return

      const pending = loadPendingGuestSearch()
      if (!pending?.companionId || !pending?.travelStyleIds?.length) return

      const plan = loadActiveTripPlan()
      const hasPet = pending.companionId === 'pets' || pending.companionId === 'withPet'
      const payload = buildCreateTripPayload(plan, {
        companionId: pending.companionId,
        hasPet,
        travelStyleIds: pending.travelStyleIds,
      })
      if (!payload) {
        setLoadState({ status: 'fallback', fromApi: false, errorMessage: '여행 정보가 부족합니다. 처음부터 다시 시도해 주세요.' })
        return
      }

      try {
        const created = await createTrip(payload)
        if (cancelledRef.current) return
        const rawId = created?.id ?? created?.tripId
        const realId = rawId != null ? String(rawId) : null
        if (!realId) return

        const selectedItems = pending.selectedItems ?? []
        clearPendingGuestSearch()
        saveActiveTripId(realId)

        if (selectedItems.length > 0) {
          const upsertPayload = selectedItems
            .filter((i) => i.title)
            .map((item, idx) => ({
              title: item.title,
              ...(item.description ? { description: item.description } : {}),
              categoryCode: item.subCategory || 'ai_recommend',
              prepType: item.prepType || 'item',
              baggageType: item.baggageType || 'none',
              source: item.source || 'template',
              orderIndex: idx,
            }))
          if (upsertPayload.length > 0) {
            await upsertChecklistItems(realId, upsertPayload).catch((err) => {
              console.error('[useGuestTripUpgrade] upsertChecklistItems 실패:', err)
            })
          }
          const snapshot = buildArchiveSnapshot(loadActiveTripPlan(), selectedItems)
          const archiveCreated = await createGuideArchive(realId, { name: snapshot.pageTitle, snapshot })
          if (cancelledRef.current) return
          if (archiveCreated?.id) sessionStorage.setItem('lastSavedArchiveId', String(archiveCreated.id))
          navigate('/guide-archives', { replace: true })
          return
        }

        navigate(`/trips/${realId}/search`, { replace: true })
      } catch (err) {
        if (cancelledRef.current) return
        setLoadState({
          status: 'fallback',
          fromApi: false,
          errorMessage: err?.response?.data?.message || err?.message || '여행 계획 저장에 실패했습니다. 다시 시도해 주세요.',
        })
      }
    })()

    return () => { cancelledRef.current = true }
  }, [tripId]) // eslint-disable-line react-hooks/exhaustive-deps
}
