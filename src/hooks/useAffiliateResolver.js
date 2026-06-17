import { useCallback, useEffect, useReducer } from 'react'
import { fetchPublicAffiliateLinks } from '@/api/affiliateLinks'
import { resolveAffiliate as resolveStatic } from '@/config/affiliateMap'

/**
 * 항목 제목 → 제휴 정보 resolver.
 * 관리자(DB)에서 설정한 링크를 런타임 1회 fetch해 제목으로 매칭.
 * 아직 못 불러왔거나 매칭 실패 시 정적 맵(affiliateMap)으로 fallback
 * → 백엔드 배포 전/링크 미설정 항목도 데모가 끊기지 않음.
 */

const norm = (s) => String(s ?? '').trim().toLowerCase()
const defaultLabel = (provider) => (provider === 'mrt' ? '예약하러 가기' : '구매하러 가기')

// 모듈 캐시(전 인스턴스 공유) — 50개 항목이 동시에 호출해도 fetch는 1회
let cache = null // Map<normTitle, { provider, url, label }>
let promise = null
const subscribers = new Set()

function load() {
  if (!promise) {
    promise = fetchPublicAffiliateLinks()
      .then((list) => {
        const map = new Map()
        for (const it of list ?? []) {
          map.set(norm(it.title), { provider: it.provider, url: it.url, label: it.label })
        }
        cache = map
      })
      .catch(() => {
        cache = new Map() // 실패 시 빈 캐시 → 정적 fallback만 사용
      })
      .finally(() => subscribers.forEach((fn) => fn()))
  }
  return promise
}

export default function useAffiliateResolver() {
  const [, force] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    if (cache) return undefined
    subscribers.add(force)
    load()
    return () => subscribers.delete(force)
  }, [])

  return useCallback((title) => {
    const fromDb = cache?.get(norm(title))
    if (fromDb) return { ...fromDb, label: fromDb.label || defaultLabel(fromDb.provider) }
    return resolveStatic(title) // fallback
  }, [])
}
