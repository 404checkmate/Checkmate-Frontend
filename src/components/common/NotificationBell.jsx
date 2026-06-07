import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchNotifications, markNotificationsRead } from '@/api/notifications'
import { getMe } from '@/api/auth'
import { getSupabaseClient } from '@/lib/supabase'
import { trackEvent } from '@/utils/analyticsTracker'
import defaultProfileImg from '@/assets/default-profile.png'

const POLL_MS = 60_000

/** 알림 타입별 메시지/이동 경로 */
function describe(n) {
  const who = n.actor?.nickname ?? '누군가'
  const title = n.payload?.tripTitle ? `'${n.payload.tripTitle}'` : '여행'
  switch (n.type) {
    case 'trip_invite':
      return { icon: '💌', text: `${who}님이 ${title} 여행에 초대했어요`, to: '/guide-archives' }
    case 'trip_invite_accepted':
      return {
        icon: '🎉',
        text: `${who}님이 ${title} 초대를 수락했어요`,
        to: n.payload?.archiveId && n.tripId
          ? `/trips/${n.tripId}/guide-archive/${n.payload.archiveId}`
          : '/guide-archives',
      }
    case 'trip_member_joined':
      return { icon: '🧳', text: `${who}님이 ${title}에 합류했어요`, to: '/guide-archives' }
    case 'friend_accepted':
      return { icon: '🤝', text: `${who}님과 친구가 됐어요`, to: '/mypage/friends' }
    case 'item_assigned':
      return {
        icon: '🎒',
        text: `${who}님이 ${title}의 '${n.payload?.itemTitle ?? '준비물'}' 담당으로 지정했어요`,
        to: '/guide-archives',
      }
    default:
      return { icon: '🔔', text: '새 알림', to: '/mypage' }
  }
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return '방금'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

/** 헤더 알림 벨 — 60초 폴링 + 포커스 시 갱신, 드롭다운 열면 전체 읽음 처리 */
export default function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const wrapRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchNotifications()
      setItems(Array.isArray(data?.items) ? data.items : [])
      setUnreadCount(Number(data?.unreadCount) || 0)
    } catch {
      /* 미로그인/네트워크 실패 — 조용히 무시 */
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, POLL_MS)
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [load])

  // 실시간 푸시 — 백엔드가 알림 생성 시 개인 채널(cm-user-{id})에 핑 발행 → 즉시 refetch
  // (폴링은 채널 실패 대비 폴백으로 유지)
  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) return undefined
    let channel = null
    let cancelled = false
    ;(async () => {
      try {
        const me = await getMe()
        const uid = me?.profile?.id
        if (!uid || cancelled) return
        channel = supabase.channel(`cm-user-${uid}`)
        channel.on('broadcast', { event: 'notification' }, () => load())
        channel.subscribe()
      } catch {
        /* 미로그인 등 — 폴링으로 폴백 */
      }
    })()
    return () => {
      cancelled = true
      if (channel) {
        try {
          supabase.removeChannel(channel)
        } catch {
          /* ignore */
        }
      }
    }
  }, [load])

  // 바깥 클릭으로 닫기
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) {
      trackEvent('notification_opened', { button: 'notification_bell', unread: unreadCount })
    }
    if (next && unreadCount > 0) {
      // 열람 = 읽음 처리
      markNotificationsRead().catch(() => {})
      setUnreadCount(0)
    }
  }

  const handleItemClick = (n) => {
    setOpen(false)
    navigate(describe(n).to)
  }

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={toggle}
        aria-label={`알림${unreadCount > 0 ? ` ${unreadCount}개 안 읽음` : ''}`}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-teal-200 hover:bg-teal-50/50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[70] mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="border-b border-gray-50 px-4 py-3">
            <p className="text-sm font-extrabold text-gray-900">알림</p>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-gray-400">아직 알림이 없어요</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((n) => {
                const d = describe(n)
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className={`flex w-full items-start gap-2.5 px-4 py-3 text-left transition hover:bg-teal-50/60 ${
                        n.readAt ? '' : 'bg-cyan-50/40'
                      }`}
                    >
                      {n.actor?.profileImageUrl ? (
                        <img
                          src={n.actor.profileImageUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="mt-0.5 h-8 w-8 shrink-0 rounded-full border border-gray-100 object-cover"
                          onError={(e) => { e.currentTarget.src = defaultProfileImg }}
                        />
                      ) : (
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-base">
                          {d.icon}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold leading-snug text-gray-800">
                          {d.icon} {d.text}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-gray-400">{timeAgo(n.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
