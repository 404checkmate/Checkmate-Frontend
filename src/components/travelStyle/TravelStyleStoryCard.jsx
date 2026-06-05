import { forwardRef } from 'react'

/**
 * 인스타 스토리 공유용 9:16 카드 (360×640 → pixelRatio 3 캡처 시 1080×1920)
 * 화면 밖(off-screen)에 렌더해두고 html-to-image로 캡처한다.
 */
const TravelStyleStoryCard = forwardRef(function TravelStyleStoryCard({ result }, ref) {
  const { piece, theme } = result
  // 제목이 길어도 한 줄에 들어가도록 글자 수 기반으로 폰트 크기 조정 (가용 폭 ~330px)
  const titleText = `${result.title} ${theme.emoji}`
  const titleFontSize = Math.min(22, Math.floor(330 / titleText.length))
  return (
    <div
      ref={ref}
      style={{
        width: 360,
        height: 640,
        background: 'linear-gradient(160deg, #E3F9EC 0%, #d2f0f7 100%)',
      }}
      className="flex flex-col items-center justify-between px-8 py-12"
    >
      {/* 상단 라벨 */}
      <div className="flex flex-col items-center gap-1">
        <img src="/logo-checkmate.png" alt="Checkmate" className="h-7" />
        <p className="text-[11px] font-bold tracking-widest text-[#04384a]/50">여행 스타일 테스트</p>
      </div>

      {/* 중앙: 캐릭터 + 유형 */}
      <div className="flex flex-col items-center text-center">
        <img src={result.image} alt={result.title} className="mb-6 w-52" />
        <p className="mb-1 whitespace-nowrap text-xs font-bold text-[#04384a]/60">나의 여행 유형은</p>
        <h1
          style={{ fontSize: titleFontSize }}
          className="whitespace-nowrap font-extrabold leading-tight tracking-tight text-[#04384a]"
        >
          {titleText}
        </h1>
        <p className="mt-3 whitespace-nowrap text-[13px] font-semibold text-[#04384a]/70">“{result.oneLiner}”</p>
        <div className="mt-4 flex gap-1.5">
          <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${piece.chip}`}>
            {piece.emoji} {piece.label}
          </span>
          <span className="whitespace-nowrap rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold text-[#04384a]/70">
            #{theme.label}
          </span>
        </div>
      </div>

      {/* 하단: 유도 문구 */}
      <div className="flex flex-col items-center gap-1">
        <p className="whitespace-nowrap text-[11px] font-bold text-[#04384a]/60">나의 여행 유형이 궁금하다면?</p>
        <p className="whitespace-nowrap text-[11px] font-extrabold text-[#04384a]">checkmate에서 테스트 해보기 ✈️</p>
      </div>
    </div>
  )
})

export default TravelStyleStoryCard
