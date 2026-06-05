import { useCallback, useEffect, useMemo, useState } from 'react'
import { createTripInvite, listTripMembers, removeTripMember, addTripMember, buildTripInviteUrl } from '@/api/tripMembers'
import { listFriends } from '@/api/friends'
import { getMe } from '@/api/auth'
import defaultProfileImg from '@/assets/default-profile.png'

function MemberAvatar({ src, name, size = 'h-9 w-9' }) {
  return (
    <img
      src={src || defaultProfileImg}
      alt={name}
      referrerPolicy="no-referrer"
      className={`${size} shrink-0 rounded-full border border-gray-100 object-cover`}
      onError={(e) => { e.currentTarget.src = defaultProfileImg }}
    />
  )
}

/**
 * "함께 준비하기" 시트 — 트립 멤버 목록 + 초대 링크 생성/공유 + 내보내기/나가기.
 * 보관함 상세 헤더에서 열린다.
 */
export default function TripMembersSheet({ tripId, open, onClose }) {
  const [members, setMembers] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [myUserId, setMyUserId] = useState(null)
  const [inviting, setInviting] = useState(false)
  const [notice, setNotice] = useState('')
  const [removingId, setRemovingId] = useState(null)
  const [addingId, setAddingId] = useState(null)

  const showNotice = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 2500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [rows, me, friendRows] = await Promise.all([
        listTripMembers(tripId),
        getMe().catch(() => null),
        listFriends().catch(() => []),
      ])
      setMembers(Array.isArray(rows) ? rows : [])
      setFriends(Array.isArray(friendRows) ? friendRows : [])
      setMyUserId(me?.profile?.id ? String(me.profile.id) : null)
    } catch {
      setError('멤버 목록을 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleInvite = async () => {
    if (inviting) return
    setInviting(true)
    try {
      const { token } = await createTripInvite(tripId)
      const url = buildTripInviteUrl(token)
      const isTouch = window.matchMedia('(pointer: coarse)').matches
      if (isTouch && navigator.share) {
        try {
          await navigator.share({
            title: 'Checkmate 여행 준비 초대',
            text: '우리 여행 체크리스트, 같이 준비해요! ✈️',
            url,
          })
          return
        } catch (err) {
          if (err?.name === 'AbortError') return
        }
      }
      await navigator.clipboard.writeText(url)
      showNotice('초대 링크를 복사했어요! (7일간 유효)')
    } catch {
      showNotice('초대 링크 생성에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setInviting(false)
    }
  }

  const handleAddFriend = async (friend) => {
    if (addingId) return
    setAddingId(friend.userId)
    try {
      await addTripMember(tripId, friend.userId)
      showNotice(`${friend.nickname}님을 멤버로 추가했어요 🎉`)
      // 멤버 목록 갱신
      const rows = await listTripMembers(tripId).catch(() => null)
      if (rows) setMembers(rows)
    } catch (err) {
      const msg = err?.response?.data?.error?.message
      showNotice(msg || '추가에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setAddingId(null)
    }
  }

  const handleRemove = async (member) => {
    if (removingId) return
    const isSelf = member.userId === myUserId
    setRemovingId(member.userId)
    try {
      await removeTripMember(tripId, member.userId)
      if (isSelf) {
        // 나가기 — 더 이상 접근 불가하므로 보관함 목록으로
        window.location.href = '/guide-archives'
        return
      }
      setMembers((prev) => prev.filter((m) => m.userId !== member.userId))
      showNotice(`${member.nickname}님을 내보냈어요`)
    } catch {
      showNotice('처리에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setRemovingId(null)
    }
  }

  if (!open) return null

  const me = members.find((m) => m.userId === myUserId)
  const amOwner = me?.role === 'owner'
  const memberIds = new Set(members.map((m) => m.userId))
  const addableFriends = friends.filter((f) => !memberIds.has(f.userId))

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-teal-950/40 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="함께 준비하기"
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900">👥 함께 준비하기</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg px-2 py-1 text-sm font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          멤버는 이 체크리스트를 함께 보고 편집할 수 있어요
        </p>

        {/* 초대 */}
        <button
          type="button"
          onClick={handleInvite}
          disabled={inviting}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-3 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-600 hover:to-teal-600 disabled:opacity-60"
        >
          {inviting ? '링크 만드는 중…' : '🔗 초대 링크 만들기'}
        </button>
        {notice && <p className="mt-2 text-center text-xs font-semibold text-teal-700">{notice}</p>}

        {/* 친구 바로 추가 — 링크 없이 한 번에 */}
        {!loading && addableFriends.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-2 text-xs font-extrabold text-gray-500">친구 바로 추가</h3>
            <ul className="flex max-h-40 flex-col gap-2 overflow-y-auto">
              {addableFriends.map((f) => (
                <li key={f.userId} className="flex items-center justify-between gap-3 rounded-xl border border-cyan-100 bg-cyan-50/40 px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <MemberAvatar src={f.profileImageUrl} name={f.nickname} />
                    <p className="truncate text-sm font-bold text-gray-900">{f.nickname}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddFriend(f)}
                    disabled={addingId === f.userId}
                    className="shrink-0 rounded-lg bg-teal-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
                  >
                    {addingId === f.userId ? '추가 중…' : '+ 추가'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 멤버 목록 */}
        <div className="mt-5">
          <h3 className="mb-2 text-xs font-extrabold text-gray-500">
            멤버 {members.length > 0 ? `(${members.length})` : ''}
          </h3>
          {loading ? (
            <p className="py-4 text-center text-sm text-gray-400">불러오는 중…</p>
          ) : error ? (
            <p className="py-4 text-center text-sm text-red-500">{error}</p>
          ) : (
            <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {members.map((m) => {
                const isSelf = m.userId === myUserId
                const canRemove = isSelf ? m.role !== 'owner' : amOwner
                return (
                  <li key={m.userId} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <MemberAvatar src={m.profileImageUrl} name={m.nickname} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {m.nickname}
                          {isSelf && <span className="ml-1 text-[10px] font-semibold text-gray-400">(나)</span>}
                        </p>
                        <p className="text-[10px] font-semibold text-gray-400">
                          {m.role === 'owner' ? '👑 소유자' : '편집 멤버'}
                        </p>
                      </div>
                    </div>
                    {canRemove && (
                      <button
                        type="button"
                        onClick={() => handleRemove(m)}
                        disabled={removingId === m.userId}
                        className="shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-400 transition hover:border-red-200 hover:text-red-500 disabled:opacity-50"
                      >
                        {removingId === m.userId ? '처리 중…' : isSelf ? '나가기' : '내보내기'}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
