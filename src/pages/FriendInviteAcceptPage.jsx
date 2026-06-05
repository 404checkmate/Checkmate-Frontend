import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { previewFriendInvite, acceptFriendInvite } from '@/api/friends'
import { savePendingFriendInvite, clearPendingFriendInvite } from '@/utils/pendingFriendInvite'
import defaultProfileImg from '@/assets/default-profile.png'

const PAGE_BG = {
  background: 'linear-gradient(180deg, #E0F7FA 0%, #F8FAFC 55%, #F0FDFA 100%)',
}

/**
 * /friends/invite/:token — 친구 초대 수락 랜딩.
 * - 비로그인: 초대자 미리보기 + 로그인 유도 (토큰은 sessionStorage에 보관, 로그인 후 복귀)
 * - 로그인: 수락 버튼 → 친구 맺기 → /mypage/friends 이동
 */
export default function FriendInviteAcceptPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, loading: authLoading } = useAuth()

  const [preview, setPreview] = useState(null)
  const [previewError, setPreviewError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState('')
  const [done, setDone] = useState(null) // { alreadyFriends, friend }

  // 초대 미리보기 (비로그인 허용)
  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await previewFriendInvite(token)
        if (!cancelled) setPreview(data)
      } catch {
        if (!cancelled) setPreviewError('유효하지 않거나 만료된 초대 링크예요.')
      }
    })()
    return () => { cancelled = true }
  }, [token])

  const handleAccept = async () => {
    if (accepting) return
    setAccepting(true)
    setAcceptError('')
    try {
      const result = await acceptFriendInvite(token)
      clearPendingFriendInvite()
      setDone(result)
    } catch (err) {
      const msg = err?.response?.data?.error?.message
      setAcceptError(msg || '초대 수락에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setAccepting(false)
    }
  }

  const handleGoLogin = () => {
    savePendingFriendInvite(token)
    navigate('/login')
  }

  const creator = preview?.creator

  return (
    <div className="flex min-h-screen w-full flex-1 items-center justify-center px-5 py-12" style={PAGE_BG}>
      <div className="w-full max-w-md rounded-3xl border border-teal-100 bg-white p-8 text-center shadow-lg">
        {previewError ? (
          <>
            <p className="text-4xl">😢</p>
            <h1 className="mt-3 text-lg font-extrabold text-gray-900">{previewError}</h1>
            <p className="mt-2 text-sm text-gray-500">친구에게 새 초대 링크를 요청해 주세요.</p>
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className="mt-6 w-full rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
            >
              홈으로
            </button>
          </>
        ) : !preview ? (
          <p className="py-8 text-sm text-gray-400">초대 정보를 확인하는 중…</p>
        ) : done ? (
          <>
            <p className="text-4xl">🎉</p>
            <h1 className="mt-3 text-lg font-extrabold text-gray-900">
              {done.alreadyFriends
                ? `${done.friend?.nickname}님과는 이미 친구예요!`
                : `${done.friend?.nickname}님과 친구가 됐어요!`}
            </h1>
            <p className="mt-2 text-sm text-gray-500">곧 친구와 함께 여행 체크리스트를 준비할 수 있어요 ✈️</p>
            <button
              type="button"
              onClick={() => navigate('/mypage/friends', { replace: true })}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-3 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-600 hover:to-teal-600"
            >
              친구 목록 보기
            </button>
          </>
        ) : (
          <>
            <img
              src={creator?.profileImageUrl || defaultProfileImg}
              alt={creator?.nickname}
              referrerPolicy="no-referrer"
              className="mx-auto h-20 w-20 rounded-full border-2 border-teal-100 object-cover"
              onError={(e) => { e.currentTarget.src = defaultProfileImg }}
            />
            <h1 className="mt-4 text-lg font-extrabold text-gray-900">
              {creator?.nickname}님이 친구 초대를 보냈어요
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              수락하면 서로 친구가 되고,
              <br />
              함께 여행 체크리스트를 준비할 수 있어요
            </p>

            {!preview.valid ? (
              <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                만료된 초대 링크예요. 친구에게 새 링크를 요청해 주세요.
              </p>
            ) : authLoading ? (
              <p className="mt-6 text-sm text-gray-400">로그인 상태 확인 중…</p>
            ) : isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={accepting}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-3 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-600 hover:to-teal-600 disabled:opacity-60"
                >
                  {accepting ? '수락하는 중…' : '🤝 친구 수락하기'}
                </button>
                {acceptError && <p className="mt-2 text-xs font-semibold text-red-500">{acceptError}</p>}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleGoLogin}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-3 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-600 hover:to-teal-600"
                >
                  로그인하고 수락하기
                </button>
                <p className="mt-2 text-xs text-gray-400">로그인하면 이 페이지로 다시 돌아와요</p>
              </>
            )}

            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className="mt-3 text-xs font-semibold text-gray-400 underline underline-offset-2 hover:text-gray-600"
            >
              다음에 할게요
            </button>
          </>
        )}
      </div>
    </div>
  )
}
