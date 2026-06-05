import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { PIECE_META, getComboResult, getComboImage } from '@/data/travelStyleResults'
import TravelStyleStoryCard from '@/components/travelStyle/TravelStyleStoryCard'
import { useTestResultChecklistCreate } from '@/hooks/useTestResultChecklistCreate'

/* ─── 서브 컴포넌트 ─────────────────────────────────────────────────── */

function HeroSection({ result }) {
  const { theme } = result
  return (
    <section className="mb-4">
      {/* TODO: 히어로 배경색 — 디자인팀 확정 시 교체 (임시: 파스텔 민트 톤) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E3F9EC] to-[#d2f0f7] px-6 py-10 shadow-sm">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/60 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-6 left-1/4 h-24 w-24 rounded-full bg-teal-100/60 blur-xl" aria-hidden />
        <div className="relative z-10 flex flex-col items-center text-center">
          <img
            src={result.image}
            alt={result.title}
            className="mb-5 w-44 lg:w-52 drop-shadow-lg"
            draggable={false}
          />
          <h1 className="text-xl font-extrabold tracking-tight text-[#04384a] lg:text-2xl">
            {result.title} {theme.emoji}
          </h1>
          <p className="mt-3 text-sm font-semibold text-[#04384a]/70 lg:text-base">“{result.oneLiner}”</p>
        </div>
      </div>
    </section>
  )
}

function PieceDescSection({ result }) {
  const { piece } = result
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-base font-extrabold text-[#04384a] lg:text-lg">여행 준비 스타일</h2>
      <div className={`rounded-2xl border ${piece.border} ${piece.bgLight} px-5 py-5`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{piece.emoji}</span>
          <span className={`text-base font-extrabold ${piece.text}`}>{piece.label}</span>
          <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${piece.chip}`}>
            {piece.keywords}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 lg:text-base">{result.desc}</p>
        <div className={`my-4 border-t ${piece.border}`} />
        <p className={`text-sm font-extrabold ${piece.text}`}>“{piece.quote}”</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 lg:text-base">{piece.desc}</p>
      </div>
    </section>
  )
}

function CompatibilityCard({ matchPiece, themeKey, badge, badgeColor, reason }) {
  return (
    <div className={`overflow-hidden rounded-2xl border ${matchPiece.border} bg-white shadow-sm`}>
      <div className={`flex items-center justify-center bg-gradient-to-r ${badgeColor} py-1.5`}>
        <span className="text-[11px] font-extrabold text-white tracking-wide">{badge}</span>
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-extrabold ${matchPiece.text}`}>
            {matchPiece.emoji} {matchPiece.label}
          </p>
          <p className="mt-1.5 text-[11px] leading-snug text-gray-500">{reason}</p>
        </div>
        <img
          src={getComboImage(themeKey, matchPiece.key)}
          alt={matchPiece.label}
          className="w-16 shrink-0 lg:w-20"
          draggable={false}
        />
      </div>
    </div>
  )
}

function CompatibilitySection({ piece, theme }) {
  const bestMeta = PIECE_META[piece.bestMatch]
  const worstMeta = PIECE_META[piece.worstMatch]
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-base font-extrabold text-[#04384a] lg:text-lg">여행 궁합</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CompatibilityCard
          matchPiece={bestMeta}
          themeKey={theme.key}
          badge="🍀 찰떡궁합"
          badgeColor="from-emerald-400 to-teal-400"
          reason={piece.bestReason}
        />
        <CompatibilityCard
          matchPiece={worstMeta}
          themeKey={theme.key}
          badge="💦 조심조심"
          badgeColor="from-orange-400 to-amber-400"
          reason={piece.worstReason}
        />
      </div>
    </section>
  )
}

function DestinationsSection({ result, onChecklist, creatingCity, createError }) {
  const { piece } = result
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-base font-extrabold text-[#04384a] lg:text-lg">추천 여행지</h2>
      <div className="flex flex-col gap-3">
        {result.destinations.map((dest) => {
          const isCreating = creatingCity === dest.city
          return (
            <div
              key={dest.city}
              className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm"
            >
              <div>
                <p className="text-sm font-extrabold text-[#04384a] lg:text-base">{dest.city}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(dest.tags ?? []).map((tag) => (
                    <span key={tag} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${piece.chip}`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChecklist(dest)}
                disabled={Boolean(creatingCity)}
                className="ml-3 shrink-0 rounded-xl bg-amber-400 px-3 py-2 text-[11px] font-bold text-amber-900 shadow-sm transition-all hover:bg-amber-500 active:scale-95 disabled:opacity-60 lg:px-4 lg:text-xs"
              >
                {isCreating ? '만드는 중...' : '체크리스트 만들기'}
              </button>
            </div>
          )
        })}
      </div>
      {createError && (
        <p className="mt-2 text-center text-xs font-semibold text-red-400">{createError}</p>
      )}
    </section>
  )
}

function ShareSection({ result }) {
  const [notice, setNotice] = useState(null)
  const [saving, setSaving] = useState(false)
  const storyRef = useRef(null)

  const comboKey = `${result.theme.key}_${result.piece.key}`
  const shareUrl = `${window.location.origin}/travel-style-test/result?r=${comboKey}`

  const showNotice = (message) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 2500)
  }

  const handleCopyLink = async () => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    try {
      if (isTouch && navigator.share) {
        await navigator.share({
          title: `나의 여행 유형은 ${result.title}!`,
          text: `“${result.oneLiner}” — 너도 테스트하고 우리 여행 궁합 확인해봐 ✈️`,
          url: shareUrl,
        })
        return
      }
      await navigator.clipboard.writeText(shareUrl)
      showNotice('링크를 복사했어요! 친구에게 공유해보세요 🙌')
    } catch (err) {
      if (err?.name === 'AbortError') return // 공유 시트 닫음
      showNotice('복사에 실패했어요. 주소창의 URL을 직접 복사해주세요')
    }
  }

  const handleSaveImage = async () => {
    if (saving || !storyRef.current) return
    setSaving(true)
    try {
      const { toPng } = await import('html-to-image') // 저장 시점에만 로드
      await document.fonts.ready
      const options = { pixelRatio: 3, cacheBust: true }
      // iOS Safari에서 첫 캡처에 이미지가 누락되는 경우가 있어 두 번 캡처
      await toPng(storyRef.current, options)
      const dataUrl = await toPng(storyRef.current, options)

      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `checkmate-travel-style-${comboKey}.png`, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `나의 여행 유형은 ${result.title}!` })
      } else {
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = file.name
        link.click()
        showNotice('이미지를 저장했어요! 스토리에 공유해보세요 📸')
      }
    } catch (err) {
      if (err?.name !== 'AbortError') showNotice('이미지 저장에 실패했어요. 잠시 후 다시 시도해주세요')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mb-8">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-1 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
        >
          <span className="text-xl">🔗</span>
          <span className="text-xs font-bold text-[#04384a]">링크 복사</span>
          <span className="text-[10px] text-gray-400">친구와 여행 궁합 보기</span>
        </button>
        <button
          type="button"
          onClick={handleSaveImage}
          disabled={saving}
          className="flex flex-col items-center gap-1 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-60"
        >
          <span className="text-xl">{saving ? '⏳' : '📥'}</span>
          <span className="text-xs font-bold text-[#04384a]">{saving ? '만드는 중...' : '이미지 저장'}</span>
          <span className="text-[10px] text-gray-400">스토리에 공유하기</span>
        </button>
      </div>
      {notice && (
        <p className="mt-2 text-center text-xs font-semibold text-gray-400">{notice}</p>
      )}

      {/* 캡처용 오프스크린 스토리 카드 */}
      <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0">
        <TravelStyleStoryCard ref={storyRef} result={result} />
      </div>
    </section>
  )
}

function SharedViewCta({ onStart }) {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div>
          <p className="text-sm font-extrabold text-[#04384a]">친구의 여행 유형이에요!</p>
          <p className="mt-0.5 text-xs text-gray-500">나도 테스트하고 친구와 여행 궁합을 확인해보세요</p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="shrink-0 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-amber-900 shadow-sm transition-all hover:bg-amber-500 active:scale-95"
        >
          나도 테스트하기
        </button>
      </div>
    </section>
  )
}

/* ─── 메인 페이지 ────────────────────────────────────────────────────── */

export default function TravelStyleResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { createChecklist, creatingCity, createError } = useTestResultChecklistCreate()
  const rawResult = location.state?.result

  // 1순위: 테스트 직후 state / 2순위: 공유 링크·새로고침 시 쿼리(?r=theme_piece)
  let themeKey = rawResult?.theme
  let pieceKey = rawResult?.piece
  if (!themeKey || !pieceKey) {
    const r = searchParams.get('r') ?? ''
    ;[themeKey, pieceKey] = r.split('_')
  }

  const result = themeKey && pieceKey ? getComboResult(themeKey, pieceKey) : null
  const isSharedView = !rawResult && !!result // 공유 링크로 진입 (테스트를 거치지 않음)

  useEffect(() => {
    if (!result) navigate('/travel-style-test', { replace: true })
  }, [result, navigate])

  if (!result) return null

  // 디폴트 값(한 달 뒤 출발 6박 7일 / 혼자 / 테스트 테마)으로 트립 생성 → 로딩 페이지 직행
  const handleChecklist = (dest) => createChecklist(dest, result.theme.key)

  return (
    <div
      className="min-h-screen flex-1"
      style={{
        backgroundImage: `
          radial-gradient(circle at 8% 8%, rgba(61, 180, 221, 0.15) 0%, transparent 35%),
          radial-gradient(circle at 90% 10%, rgba(251, 191, 36, 0.18) 0%, transparent 32%),
          linear-gradient(160deg, #f0fdfa 0%, #fffbeb 55%, #f0fdfa 100%)
        `,
      }}
    >
      <div className="mx-auto max-w-lg px-4 pb-14 pt-8 lg:max-w-2xl lg:px-6 lg:pt-12">

        <HeroSection result={result} />
        {isSharedView && <SharedViewCta onStart={() => navigate('/travel-style-test')} />}
        <PieceDescSection result={result} />
        <CompatibilitySection piece={result.piece} theme={result.theme} />
        <DestinationsSection
          result={result}
          onChecklist={handleChecklist}
          creatingCity={creatingCity}
          createError={createError}
        />
        <ShareSection result={result} />

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/travel-style-test')}
            className="text-sm font-semibold text-gray-400 underline underline-offset-2 hover:text-gray-600"
          >
            {isSharedView ? '나도 테스트하러 가기' : '다시 테스트하기'}
          </button>
        </div>

      </div>
    </div>
  )
}
