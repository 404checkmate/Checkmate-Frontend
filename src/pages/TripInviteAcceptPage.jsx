import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { previewTripInvite, acceptTripInvite } from '@/api/tripMembers'
import { savePendingTripInvite, clearPendingTripInvite } from '@/utils/pendingTripInvite'
import defaultProfileImg from '@/assets/default-profile.png'

const PAGE_BG = {
  background: 'linear-gradient(180deg, #E0F7FA 0%, #F8FAFC 55%, #F0FDFA 100%)',
}

function formatRange(start, end) {
  const s = String(start ?? '').slice(0, 10)
  const e = String(end ?? '').slice(0, 10)
  return s && e ? `${s} ~ ${e}` : ''
}

/**
 * /trips/invite/:token — 트립 합류(공동 편집) 초대 랜딩.
 * 친구 초대(FriendInviteAcceptPage)와 동일한 패턴:
 * 비로그인이면 토큰을 sessionStorage에 보관 후 로그인 → 복귀.
 */
export default function TripInviteAcceptPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, loading: authLoading } = useAuth()

  const [preview, setPreview] = useState(null)
  const [previewError, setPreviewError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState('')

  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await previewTripInvite(token)
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
      const result = await acceptTripInvite(token)
      clearPendingTripInvite()
      // 합류한 체크리스트로 바로 이동 (보관함 엔트리가 없으면 탐색 화면)
      if (result.archiveId) {
        navigate(`/trips/${result.tripId}/guide-archive/${result.archiveId}`, { replace: true })
      } else {
        navigate(`/trips/${result.tripId}/search`, { replace: true })
      }
    } catch (err) {
      const msg = err?.response?.data?.error?.message
      setAcceptError(msg || '합류에 실패했어요. 잠시 후 다시 시도해 주세요.')
      setAccepting(false)
    }
  }

  const handleGoLogin = () => {
    savePendingTripInvite(token)
    navigate('/login')
  }

  const inviter = preview?.inviter
  const trip = preview?.trip

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
        ) : (
          <>
            <img
              src={inviter?.profileImageUrl || defaultProfileImg}
              alt={inviter?.nickname}
              referrerPolicy="no-referrer"
              className="mx-auto h-20 w-20 rounded-full border-2 border-teal-100 object-cover"
              onError={(e) => { e.currentTarget.src = defaultProfileImg }}
            />
            <h1 className="mt-4 text-lg font-extrabold text-gray-900">
              {inviter?.nickname}님이 함께 여행 준비하자고 해요
            </h1>

            {/* 트립 요약 카드 */}
            <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/50 px-4 py-3">
              <p className="text-sm font-extrabold text-teal-900">✈️ {trip?.title}</p>
              {formatRange(trip?.tripStart, trip?.tripEnd) && (
                <p className="mt-0.5 text-xs text-teal-700/70">{formatRange(trip?.tripStart, trip?.tripEnd)}</p>
              )}
              <p className="mt-0.5 text-[11px] text-teal-700/60">현재 멤버 {trip?.memberCount ?? 1}명</p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              합류하면 이 여행의 체크리스트를 함께 보고 편집할 수 있어요
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
                  {accepting ? '합류하는 중…' : '🧳 함께 준비하기'}
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
                  로그인하고 합류하기
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
