import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadSavedItems } from '@/utils/savedTripItems'
import { trackEvent } from '@/utils/analyticsTracker'
import { getChecklistByTrip, toggleChecklistItem } from '@/api/checklists'
import { getMe } from '@/api/auth'
import { notifyTripChange } from '@/lib/tripSyncBus'
import {
  loadEntryChecklistChecks,
  saveEntryChecklistChecks,
  seedEntryChecksFromSavedIfEmpty,
} from '@/utils/guideArchiveEntryChecklistStorage'

// 서버 동기화는 실제 trip(숫자 id)에서만 — 게스트('guest')는 로컬 전용
function isNumericTripId(tripId) {
  return /^\d+$/.test(String(tripId ?? ''))
}

/**
 * 보관함 체크 상태 관리.
 *
 * 체크의 단일 진실 소스는 서버 라이브 체크리스트(ChecklistItem.isChecked)이며
 * localStorage 는 즉시 반응/오프라인용 캐시다. (docs/collab-checklist-plan.md A안)
 * - 토글: 로컬 즉시 반영 + serverId 있는 항목은 toggleChecklistItem 으로 서버 전송
 * - 마운트: 서버 isChecked 를 가져와 로컬 캐시에 덮어씀 (다기기/공동 편집 대비)
 */
export function useGuideArchiveChecks({ tripId, entry, syncTick = 0 }) {
  // 아이템별 마지막 수정자 (본인 제외 — 공동 편집 멤버의 손길만 표시)
  const [actors, setActors] = useState({})
  const [checks, setChecks] = useState(() => {
    const fromStorage = loadEntryChecklistChecks(tripId, entry.id)
    if (Object.keys(fromStorage).length > 0) return fromStorage
    // 서버 snapshot에 저장된 체크 상태로 초기화 (다기기 지원)
    return (entry.checksState && typeof entry.checksState === 'object') ? entry.checksState : {}
  })

  const archiveItemsFingerprint = useMemo(
    () => [...(entry.items ?? []).map((it) => String(it.id))].sort().join('|'),
    [entry.items],
  )

  useEffect(() => {
    seedEntryChecksFromSavedIfEmpty(tripId, entry.id, loadSavedItems(tripId), entry.items ?? [])
    const stored = loadEntryChecklistChecks(tripId, entry.id)
    if (Object.keys(stored).length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecks(stored)
    } else if (entry.checksState && typeof entry.checksState === 'object') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecks(entry.checksState)
    }
  }, [tripId, entry.id, archiveItemsFingerprint, entry.items, entry.checksState])

  // 서버 라이브 체크리스트의 isChecked 로 캐시 동기화 (서버가 진실 소스)
  useEffect(() => {
    if (!isNumericTripId(tripId)) return
    const localIdByServerId = new Map(
      (entry.items ?? [])
        .filter((it) => it.serverId != null && String(it.serverId).trim())
        .map((it) => [String(it.serverId), String(it.id)]),
    )
    if (localIdByServerId.size === 0) return

    let cancelled = false
    ;(async () => {
      try {
        const [data, me] = await Promise.all([
          getChecklistByTrip(tripId),
          getMe().catch(() => null),
        ])
        if (cancelled) return
        const serverItems = data?.items ?? []
        const myNickname = me?.profile?.nickname ?? null

        // 마지막 수정자 매핑 (serverId → localId), 본인 활동은 제외
        const nextActors = {}
        for (const sit of serverItems) {
          const localId = localIdByServerId.get(String(sit.id))
          if (!localId || !sit.lastActor) continue
          if (myNickname && sit.lastActor.nickname === myNickname) continue
          nextActors[localId] = sit.lastActor
        }
        setActors(nextActors)

        setChecks((prev) => {
          let changed = false
          const next = { ...prev }
          for (const sit of serverItems) {
            const localId = localIdByServerId.get(String(sit.id))
            if (!localId) continue
            const serverChecked = Boolean(sit.isChecked)
            if (Boolean(next[localId]) !== serverChecked) {
              next[localId] = serverChecked
              changed = true
            }
          }
          if (!changed) return prev
          try {
            saveEntryChecklistChecks(tripId, entry.id, next)
          } catch { /* storage 실패 무시 */ }
          return next
        })
      } catch {
        // 비로그인/네트워크 실패 — 로컬 캐시 유지
      }
    })()
    return () => { cancelled = true }
    // syncTick: 실시간 핑 수신 시 부모가 증가시켜 서버 체크 상태를 다시 끌어온다 (Phase 3)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, entry.id, archiveItemsFingerprint, syncTick])

  const handleToggle = useCallback((itemId) => {
    const id = String(itemId)
    const checkedAfter = !checks[id]
    const next = { ...checks, [id]: checkedAfter }
    setChecks(next)
    // 토글 즉시 localStorage에 저장 (명시적 저장 버튼 없이도 새로고침 시 유지)
    saveEntryChecklistChecks(tripId, entry.id, next)
    trackEvent('item_checked', { item_id: itemId, checked_after: checkedAfter, trip_id: tripId })

    // 서버 라이브 체크리스트 동기화 (fire-and-forget — 실패해도 로컬 UX 유지)
    const serverId = (entry.items ?? []).find((it) => String(it.id) === id)?.serverId
    if (serverId != null && String(serverId).trim() && isNumericTripId(tripId)) {
      toggleChecklistItem(serverId, checkedAfter ? 'checked' : 'unchecked')
        .then(() => {
          // 공동 편집 멤버에게 "변경됨" 핑 (Phase 3)
          notifyTripChange(tripId, { kind: 'check' })
        })
        .catch((err) => {
          console.warn(`[useGuideArchiveChecks] toggleChecklistItem(${serverId}) 실패:`, err?.message)
        })
    }
  }, [checks, tripId, entry.id, entry.items])

  return { checks, setChecks, handleToggle, actors }
}
