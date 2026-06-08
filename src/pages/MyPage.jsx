import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { getMe, signOut } from '@/api/auth'
import { updateMyProfile, deleteMyAccount } from '@/api/users'
import { fetchMyGuideArchives } from '@/api/guideArchives'
import { listFriends } from '@/api/friends'
import { loadTravelStyleResult } from '@/utils/travelStyleResultStorage'
import { getComboResult } from '@/data/travelStyleResults'
import defaultProfileImg from '@/assets/default-profile.png'

const NICKNAME_MIN = 2
const NICKNAME_MAX = 12

const PAGE_BG = {
  background: 'linear-gradient(180deg, #E0F7FA 0%, #F8FAFC 55%, #F0FDFA 100%)',
}

/**
 * /mypage — 내 여행의 허브.
 * 프로필 + 다가오는 여행 + 내 여행 유형 + 친구 + 바로가기.
 * 로그인 판정은 Supabase 세션(getSession + onAuthStateChange) 기준.
 */

/** @typedef {'loading'|'signed_in'|'signed_out'|'unconfigured'} AuthUiState */

function MyPage() {
  const navigate = useNavigate()
  /** @type {[AuthUiState, (v: AuthUiState) => void]} */
  const [state, setState] = useState(isSupabaseConfigured() ? 'loading' : 'unconfigured')
  const [session, setSession] = useState(null)
  const [signingOut, setSigningOut] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [archives, setArchives] = useState([])
  const [friends, setFriends] = useState([])

  // 백엔드 프로필(닉네임 등) + 관리자 여부 + 카드 데이터 로드
  useEffect(() => {
    if (state !== 'signed_in') {
      setIsAdmin(false)
      setProfile(null)
      return undefined
    }
    let cancelled = false
    setProfileLoading(true)
    ;(async () => {
      const [me, archiveRows, friendRows] = await Promise.all([
        getMe().catch(() => null),
        fetchMyGuideArchives().catch(() => []),
        listFriends().catch(() => []),
      ])
      if (cancelled) return
      setIsAdmin(Boolean(me?.isAdmin))
      setProfile(me?.profile ?? null)
      setProfileLoading(false)
      setArchives(Array.isArray(archiveRows) ? archiveRows : [])
      setFriends(Array.isArray(friendRows) ? friendRows : [])
    })()
    return () => { cancelled = true }
  }, [state])

  useEffect(() => {
    if (!isSupabaseConfigured()) return undefined
    const supabase = getSupabaseClient()
    if (!supabase) return undefined

    let cancelled = false
    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (cancelled) return
        const s = data?.session ?? null
        setSession(s)
        setState(s?.access_token ? 'signed_in' : 'signed_out')
      } catch {
        if (!cancelled) setState('signed_out')
      }
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setState(nextSession?.access_token ? 'signed_in' : 'signed_out')
    })

    return () => {
      cancelled = true
      try {
        sub?.subscription?.unsubscribe?.()
      } catch {
        /* ignore */
      }
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }, [signingOut])

  if (state === 'loading') {
    return (
      <div className="flex min-h-full w-full flex-1 items-center justify-center" style={PAGE_BG}>
        <p className="text-sm font-semibold text-gray-500">불러오는 중…</p>
      </div>
    )
  }

  if (state === 'unconfigured') {
    return (
      <div className="flex min-h-full w-full flex-1 items-center justify-center px-5" style={PAGE_BG}>
        <section className="w-full max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm leading-relaxed text-amber-900">
            `.env` 의 <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_URL</code> /
            <code className="ml-1 rounded bg-amber-100 px-1">VITE_SUPABASE_ANON_KEY</code> 가 비어 있어
            로그인 상태를 확인할 수 없습니다.
          </p>
        </section>
      </div>
    )
  }

  if (state === 'signed_out') {
    return (
      <div className="flex min-h-full w-full flex-1 flex-col items-center justify-center gap-4 px-5" style={PAGE_BG}>
        <p className="text-3xl">🔒</p>
        <p className="text-sm font-bold text-gray-700">마이페이지는 로그인 후 이용할 수 있어요</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-600 hover:to-teal-600"
        >
          로그인하러 가기
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-full w-full flex-1 flex-col" style={PAGE_BG}>
      <div className="mx-auto w-full max-w-4xl px-5 pb-14 pt-6 md:px-8 md:pt-10">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600">My page</p>
        <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">마이페이지</h1>

        <ProfileHeader
          session={session}
          profile={profile}
          profileLoading={profileLoading}
          onProfileChange={setProfile}
        />

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <UpcomingTripCard archives={archives} />
          <div className="flex flex-col gap-4">
            <TravelStyleCard />
            <FriendsCard friends={friends} />
          </div>
        </div>

        <QuickLinks archiveCount={archives.length} isAdmin={isAdmin} />

        {/* 하단 — 약관/로그아웃/탈퇴 */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <Link to="/terms" className="hover:text-gray-600">이용약관</Link>
            <span aria-hidden>·</span>
            <Link to="/privacy" className="hover:text-gray-600">개인정보처리방침</Link>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-gray-400 transition hover:border-red-200 hover:text-red-500 disabled:opacity-60"
          >
            {signingOut ? '로그아웃 중…' : '로그아웃'}
          </button>
          <DeleteAccountSection onSignedOut={() => navigate('/', { replace: true })} />
        </div>
      </div>
    </div>
  )
}

/* ─── 프로필 헤더 (닉네임 인라인 수정) ─────────────────────────────── */

function ProfileHeader({ session, profile, profileLoading, onProfileChange }) {
  const user = session?.user
  const provider = pickProvider(user)
  const email = user?.email || user?.user_metadata?.email || ''
  const socialName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.preferred_username || ''
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''
  const displayName = profile?.nickname || socialName || email || '여행자'

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const draftTrimmed = draft.trim()
  const draftOk = draftTrimmed.length >= NICKNAME_MIN && draftTrimmed.length <= NICKNAME_MAX

  const startEdit = () => {
    setDraft(profile?.nickname ?? displayName)
    setError('')
    setEditing(true)
  }

  const save = async () => {
    if (!draftOk || saving) return
    if (draftTrimmed === (profile?.nickname ?? '')) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateMyProfile({ nickname: draftTrimmed })
      onProfileChange?.({ ...(profile ?? {}), nickname: draftTrimmed })
      setEditing(false)
    } catch {
      setError('닉네임 저장에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} name={displayName} />
        <div className="min-w-0 flex-1">
          {editing ? (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draft}
                  maxLength={NICKNAME_MAX}
                  autoFocus
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') save()
                    if (e.key === 'Escape') setEditing(false)
                  }}
                  className="min-w-0 flex-1 rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-900 outline-none focus:border-teal-400"
                />
                <button
                  type="button"
                  onClick={save}
                  disabled={!draftOk || saving}
                  className="shrink-0 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
                >
                  {saving ? '저장 중…' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
              <p className="mt-1 text-[10px] text-gray-400">
                {NICKNAME_MIN}~{NICKNAME_MAX}자 · 친구에게 보여질 이름이에요
              </p>
              {error ? <p className="mt-1 text-xs font-semibold text-red-500">{error}</p> : null}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                {/* 닉네임 로드 전에 소셜 이름이 잠깐 보였다 바뀌는 깜빡임 방지 — 로딩 중엔 스켈레톤 */}
                {profileLoading ? (
                  <div className="h-6 w-28 animate-pulse rounded-lg bg-gray-100 md:h-7" aria-hidden />
                ) : (
                  <>
                    <p className="truncate text-lg font-extrabold text-gray-900 md:text-xl">{displayName}</p>
                    <button
                      type="button"
                      onClick={startEdit}
                      aria-label="닉네임 수정"
                      className="shrink-0 rounded-lg p-1 text-gray-300 transition hover:bg-gray-50 hover:text-teal-600"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                {email ? <p className="truncate text-xs text-gray-500">{email}</p> : null}
                {provider ? (
                  <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-500">
                    {provider}
                  </span>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

/* ─── ① 다가오는 여행 ─────────────────────────────────────────────── */

function UpcomingTripCard({ archives }) {
  const upcoming = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const withStart = archives
      .filter((a) => a?.trip?.tripStart)
      .map((a) => ({ ...a, startDate: new Date(a.trip.tripStart) }))
      .filter((a) => !isNaN(a.startDate.getTime()) && a.startDate >= today)
      .sort((a, b) => a.startDate - b.startDate)
    return withStart[0] ?? null
  }, [archives])

  if (!upcoming) {
    return (
      <section className="flex flex-col justify-between rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-500 to-[#3db4dd] p-5 text-white shadow-md">
        <div>
          <p className="text-xs font-bold opacity-80">다가오는 여행</p>
          <p className="mt-2 text-lg font-extrabold">아직 예정된 여행이 없어요 ✈️</p>
          <p className="mt-1 text-xs opacity-80">새 여행을 준비하고 체크리스트를 만들어 보세요</p>
        </div>
        <Link
          to="/"
          className="mt-4 inline-flex w-fit items-center rounded-xl bg-white px-4 py-2 text-xs font-bold text-teal-700 shadow-sm transition hover:bg-teal-50"
        >
          새 여행 준비하기 →
        </Link>
      </section>
    )
  }

  const dday = Math.round((upcoming.startDate - new Date(new Date().setHours(0, 0, 0, 0))) / 86_400_000)
  const rate = Math.round(Number(upcoming.completionRate) || 0)

  return (
    <section className="flex flex-col justify-between rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-500 to-[#3db4dd] p-5 text-white shadow-md">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold opacity-80">다가오는 여행</p>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-extrabold">
            {dday === 0 ? 'D-DAY' : `D-${dday}`}
          </span>
        </div>
        <p className="mt-2 truncate text-lg font-extrabold">✈️ {upcoming.trip?.title || upcoming.name}</p>
        <p className="mt-0.5 text-xs opacity-80">
          {String(upcoming.trip?.tripStart ?? '').slice(0, 10)} ~ {String(upcoming.trip?.tripEnd ?? '').slice(0, 10)}
        </p>
        {/* 준비율 */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="opacity-80">준비율</span>
            <span>{rate}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${rate}%` }} />
          </div>
        </div>
      </div>
      <Link
        to={`/trips/${upcoming.trip?.id}/guide-archive/${upcoming.id}`}
        className="mt-4 inline-flex w-fit items-center rounded-xl bg-white px-4 py-2 text-xs font-bold text-teal-700 shadow-sm transition hover:bg-teal-50"
      >
        준비 계속하기 →
      </Link>
    </section>
  )
}

/* ─── ② 내 여행 유형 ──────────────────────────────────────────────── */

function TravelStyleCard() {
  const saved = loadTravelStyleResult()
  const result = saved ? getComboResult(saved.theme, saved.piece) : null

  if (!result) {
    return (
      <section className="flex flex-1 items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-5 shadow-sm">
        <div>
          <p className="text-sm font-extrabold text-amber-950">나는 어떤 여행자일까? 🃏</p>
          <p className="mt-0.5 text-xs text-amber-800/70">1분 테스트로 내 여행 유형을 알아보세요</p>
        </div>
        <Link
          to="/travel-style-test"
          className="shrink-0 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-500"
        >
          테스트 하기
        </Link>
      </section>
    )
  }

  return (
    <section className="flex flex-1 items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <img src={result.image} alt={result.title} className="h-16 w-16 shrink-0 object-contain" draggable={false} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-gray-400">내 여행 유형</p>
        <p className="truncate text-sm font-extrabold text-gray-900">
          {result.title} {result.theme.emoji}
        </p>
        <div className="mt-1 flex gap-2 text-[11px] font-bold">
          <Link
            to={`/travel-style-test/result?r=${saved.theme}_${saved.piece}`}
            className="text-teal-600 hover:text-teal-800"
          >
            결과 보기
          </Link>
          <Link to="/travel-style-test" className="text-gray-400 hover:text-gray-600">
            다시 테스트
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── ③ 친구 ──────────────────────────────────────────────────────── */

function FriendsCard({ friends }) {
  return (
    <section className="flex flex-1 items-center justify-between gap-3 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        {friends.length > 0 ? (
          <div className="flex -space-x-2.5">
            {friends.slice(0, 4).map((f) => (
              <img
                key={f.userId}
                src={f.profileImageUrl || defaultProfileImg}
                alt={f.nickname}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full border-2 border-white object-cover"
                onError={(e) => { e.currentTarget.src = defaultProfileImg }}
              />
            ))}
          </div>
        ) : (
          <span className="text-xl">🤝</span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-gray-900">친구 {friends.length}명</p>
          <p className="text-[11px] text-gray-400">
            {friends.length > 0 ? '함께 체크리스트를 준비해 보세요' : '친구를 초대해 함께 준비해 보세요'}
          </p>
        </div>
      </div>
      <Link
        to="/mypage/friends"
        className="shrink-0 rounded-xl border border-cyan-200 bg-cyan-50/60 px-3.5 py-2 text-xs font-bold text-cyan-800 transition hover:bg-cyan-50"
      >
        관리 →
      </Link>
    </section>
  )
}

/* ─── 바로가기 ────────────────────────────────────────────────────── */

function QuickLinks({ archiveCount, isAdmin }) {
  const navigate = useNavigate()

  const goNewTrip = () => {
    const isDesktop = window.innerWidth >= 1024
    navigate(isDesktop ? '/' : '/trips/new/destination')
  }

  const rowClass =
    'flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm transition hover:bg-gray-50'

  return (
    <section className="mt-6">
      <h2 className="mb-2.5 text-sm font-extrabold text-gray-900">바로가기</h2>
      <div className="flex flex-col gap-2">
        <Link to="/guide-archives" className={rowClass}>
          <span className="flex items-center gap-2.5 text-sm font-bold text-gray-800">
            📋 나의 체크리스트
            {archiveCount > 0 && (
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-extrabold text-teal-700">
                {archiveCount}
              </span>
            )}
          </span>
          <span className="text-xs font-semibold text-gray-300">→</span>
        </Link>
        <button type="button" onClick={goNewTrip} className={rowClass}>
          <span className="flex items-center gap-2.5 text-sm font-bold text-gray-800">➕ 새 여행 준비하기</span>
          <span className="text-xs font-semibold text-gray-300">→</span>
        </button>
        <Link to="/travel-style-test" className={rowClass}>
          <span className="flex items-center gap-2.5 text-sm font-bold text-gray-800">🃏 여행 스타일 테스트</span>
          <span className="text-xs font-semibold text-gray-300">→</span>
        </Link>
        {isAdmin && (
          <Link to="/admin/dashboard" className={`${rowClass} border-indigo-100 bg-indigo-50/60 hover:bg-indigo-50`}>
            <span className="flex items-center gap-2.5 text-sm font-bold text-indigo-900">
              <span className="rounded-md bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Admin</span>
              스크럼 대시보드
            </span>
            <span className="text-xs font-semibold text-indigo-400">→</span>
          </Link>
        )}
      </div>
    </section>
  )
}

/* ─── 회원탈퇴 ───────────────────────────────────────────────────── */

function DeleteAccountSection({ onSignedOut }) {
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!confirmed || deleting) return
    setDeleting(true)
    setError('')
    try {
      await deleteMyAccount()
      await signOut()
      onSignedOut?.()
    } catch {
      setError('탈퇴 처리에 실패했어요. 잠시 후 다시 시도해 주세요.')
      setDeleting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setConfirmed(false); setError('') }}
        className="text-[11px] font-medium text-gray-300 underline underline-offset-2 transition hover:text-red-400"
      >
        회원탈퇴
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-teal-950/40 p-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={() => !deleting && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="회원탈퇴"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-2xl">😢</p>
            <h2 className="mt-2 text-center text-base font-extrabold text-gray-900">정말 탈퇴하시겠어요?</h2>
            <ul className="mt-4 flex flex-col gap-1.5 rounded-xl bg-red-50/70 p-4 text-xs leading-relaxed text-red-800">
              <li>· 내 여행과 체크리스트가 모두 삭제돼요</li>
              <li>· 함께 준비 중인 친구들도 더 이상 볼 수 없어요</li>
              <li>· 친구 관계가 모두 삭제돼요</li>
              <li>· <b>삭제된 정보는 복구할 수 없어요</b></li>
            </ul>
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-600">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="h-4 w-4 accent-red-500"
              />
              위 내용을 확인했어요
            </label>
            {error ? <p className="mt-2 text-xs font-semibold text-red-500">{error}</p> : null}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                돌아가기
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!confirmed || deleting}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? '탈퇴 처리 중…' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ─── 공용 ───────────────────────────────────────────────────────── */

function Avatar({ src, name }) {
  return (
    <img
      src={src || defaultProfileImg}
      alt={name}
      referrerPolicy="no-referrer"
      className="h-14 w-14 shrink-0 rounded-full border border-gray-100 object-cover md:h-16 md:w-16"
      onError={(e) => { e.currentTarget.src = defaultProfileImg }}
    />
  )
}

function pickProvider(user) {
  const p = user?.app_metadata?.provider
  if (typeof p === 'string' && p) return p
  const providers = user?.app_metadata?.providers
  if (Array.isArray(providers) && providers.length > 0) return providers[0]
  return null
}

export default MyPage
