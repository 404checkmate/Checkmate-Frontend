import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createFriendInvite, listFriends, removeFriend, buildFriendInviteUrl } from '@/api/friends'
import { trackEvent } from '@/utils/analyticsTracker'
import defaultProfileImg from '@/assets/default-profile.png'

const PAGE_BG = {
  background: 'linear-gradient(180deg, #E0F7FA 0%, #F8FAFC 55%, #F0FDFA 100%)',
}

function FriendAvatar({ src, name }) {
  return (
    <img
      src={src || defaultProfileImg}
      alt={name}
      referrerPolicy="no-referrer"
      className="h-10 w-10 shrink-0 rounded-full border border-gray-100 object-cover"
      onError={(e) => { e.currentTarget.src = defaultProfileImg }}
    />
  )
}

/** /mypage/friends — 친구 목록 + 초대 링크 생성/공유 */
export default function FriendsPage() {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inviting, setInviting] = useState(false)
  const [notice, setNotice] = useState('')
  const [removingId, setRemovingId] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null) // friend object

  const showNotice = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 2500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await listFriends()
      setFriends(Array.isArray(rows) ? rows : [])
    } catch {
      setError('친구 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleInvite = async () => {
    if (inviting) return
    setInviting(true)
    try {
      const { token } = await createFriendInvite()
      trackEvent('friend_invite_created', { button: 'friend_invite' })
      const url = buildFriendInviteUrl(token)
      const isTouch = window.matchMedia('(pointer: coarse)').matches
      if (isTouch && navigator.share) {
        try {
          await navigator.share({
            title: 'Checkmate 친구 초대',
            text: '체크메이트에서 함께 여행 준비해요! ✈️',
            url,
          })
          return
        } catch (err) {
          if (err?.name === 'AbortError') return
        }
      }
      await navigator.clipboard.writeText(url)
      showNotice('초대 링크를 복사했어요! 친구에게 공유해 주세요 🙌 (7일간 유효)')
    } catch {
      showNotice('초대 링크 생성에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (friend) => {
    if (removingId) return
    setRemovingId(friend.userId)
    try {
      await removeFriend(friend.userId)
      setFriends((prev) => prev.filter((f) => f.userId !== friend.userId))
      showNotice(`${friend.nickname}님을 친구에서 삭제했어요`)
    } catch {
      showNotice('친구 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setRemovingId(null)
      setConfirmRemove(null)
    }
  }

  return (
    <div className="flex min-h-full w-full flex-1 flex-col" style={PAGE_BG}>
      <div className="mx-auto w-full max-w-lg px-5 pb-12 pt-6 md:px-8 md:pt-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600">Friends</p>
            <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">친구 관리</h1>
          </div>
          <Link to="/mypage" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
            ← 마이페이지
          </Link>
        </div>

        {/* 초대 카드 */}
        <section className="mt-6 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-extrabold text-gray-900">친구를 초대해 보세요</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            초대 링크를 친구에게 보내면, 친구가 링크를 열고 수락하는 순간 서로 친구가 돼요.
            곧 친구와 함께 체크리스트를 같이 준비할 수 있어요!
          </p>
          <button
            type="button"
            onClick={handleInvite}
            disabled={inviting}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-3 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-600 hover:to-teal-600 disabled:opacity-60"
          >
            {inviting ? '링크 만드는 중…' : '🔗 초대 링크 만들기'}
          </button>
          {notice && <p className="mt-2 text-center text-xs font-semibold text-teal-700">{notice}</p>}
        </section>

        {/* 친구 목록 */}
        <section className="mt-5">
          <h2 className="mb-3 text-sm font-extrabold text-gray-900">
            내 친구 {friends.length > 0 ? `(${friends.length})` : ''}
          </h2>

          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center text-sm text-gray-400 shadow-sm">
              불러오는 중…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center text-sm text-red-600">
              {error}
            </div>
          ) : friends.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
              <p className="text-3xl">👋</p>
              <p className="mt-2 text-sm font-bold text-gray-700">아직 친구가 없어요</p>
              <p className="mt-1 text-xs text-gray-400">위에서 초대 링크를 만들어 친구를 초대해 보세요</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {friends.map((f) => (
                <li
                  key={f.userId}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FriendAvatar src={f.profileImageUrl} name={f.nickname} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-gray-900">{f.nickname}</p>
                      <p className="text-[11px] text-gray-400">
                        {f.since ? `${f.since.slice(0, 10)}부터 친구` : '친구'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(f)}
                    disabled={removingId === f.userId}
                    className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-400 transition hover:border-red-200 hover:text-red-500 disabled:opacity-50"
                  >
                    {removingId === f.userId ? '삭제 중…' : '삭제'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* 삭제 확인 모달 */}
      {confirmRemove && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-teal-950/40 p-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={() => setConfirmRemove(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-sm font-extrabold text-gray-900">
              {confirmRemove.nickname}님을 친구에서 삭제할까요?
            </p>
            <p className="mt-1 text-center text-xs text-gray-500">상대방 목록에서도 함께 삭제돼요.</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => handleRemove(confirmRemove)}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
              >
                삭제
              </button>
              <button
                type="button"
                onClick={() => setConfirmRemove(null)}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
