import { useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { getMe } from '@/api/auth'
import { subscribeTripChanges } from '@/lib/tripSyncBus'

/**
 * 트립 공동 편집 실시간 동기화 (docs/collab-checklist-plan.md Phase 3).
 *
 * Supabase Realtime **Broadcast** 채널 `cm-trip-{tripId}` 를 구독한다.
 * - 발신: 같은 탭의 변이 지점이 tripSyncBus 로 알리면 "변경됨" 핑을 채널에 발행
 * - 수신: 다른 멤버의 핑을 받으면 onRemoteChange(meta) 호출 → 호출부가 refetch
 *
 * 데이터 자체는 항상 REST 로 다시 읽는다(핑은 트리거일 뿐) — 정합성은 서버 기준.
 * 핑 페이로드는 { kind, by(닉네임) } 만 담는다.
 */
export function useTripRealtimeSync({ tripId, onRemoteChange }) {
  const onRemoteRef = useRef(onRemoteChange)
  onRemoteRef.current = onRemoteChange

  useEffect(() => {
    if (!tripId || !/^\d+$/.test(String(tripId))) return undefined
    const supabase = getSupabaseClient()
    if (!supabase) return undefined // Supabase 미설정 환경 — 실시간 없이 동작

    let nickname = null
    getMe()
      .then((me) => { nickname = me?.profile?.nickname ?? null })
      .catch(() => {})

    const channel = supabase.channel(`cm-trip-${tripId}`, {
      config: { broadcast: { self: false } }, // 내 핑은 내게 안 옴
    })

    channel.on('broadcast', { event: 'trip-change' }, (msg) => {
      onRemoteRef.current?.(msg?.payload ?? {})
    })
    channel.subscribe()

    const unsubscribeBus = subscribeTripChanges((changedTripId, meta) => {
      if (changedTripId !== String(tripId)) return
      try {
        channel.send({
          type: 'broadcast',
          event: 'trip-change',
          payload: { ...meta, by: nickname },
        })
      } catch {
        /* 채널 미연결 등 — 핑 유실은 치명적이지 않음 (다음 진입 시 동기화) */
      }
    })

    return () => {
      unsubscribeBus()
      try {
        supabase.removeChannel(channel)
      } catch {
        /* ignore */
      }
    }
  }, [tripId])
}
