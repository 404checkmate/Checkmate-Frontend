import { useNavigate } from 'react-router-dom'
import mascotUrl from '@/assets/home-feature-mascot-question.png'
import { STYLE_TYPES } from '@/data/travelStyleMeta'

export default function TravelStyleTestPage() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex-1"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 12%, rgba(251, 191, 36, 0.2) 0%, transparent 38%),
          radial-gradient(circle at 90% 8%, rgba(61, 180, 221, 0.15) 0%, transparent 32%),
          radial-gradient(circle at 15% 80%, rgba(251, 146, 60, 0.12) 0%, transparent 30%),
          linear-gradient(160deg, #fffbeb 0%, #f0fdfa 55%, #fef3c7 100%)
        `,
      }}
    >
      <div className="mx-auto max-w-2xl px-4 pb-12 pt-8 lg:px-6 lg:pt-12 xl:max-w-3xl">

        {/* 섹션 1 — 타이틀 */}
        <section className="flex flex-col items-center text-center">
          <img
            src={mascotUrl}
            alt="고민하는 메이트 마스코트"
            className="mb-4 h-24 w-24 object-contain drop-shadow-md lg:h-32 lg:w-32"
          />
          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-700">
            ✨ 여행 스타일 테스트
          </span>
          <h1 className="text-2xl font-extrabold leading-tight text-[#04384a] lg:text-3xl xl:text-4xl">
            나는 여행에서<br />어떤 유형일까?
          </h1>
          <p className="mt-2 text-sm text-gray-500 lg:text-base">
            10개의 질문으로 나에게 딱 맞는 여행 스타일을 알아보세요
          </p>
        </section>

        {/* 섹션 2 — 스타일 유형 카드 */}
        <section className="mt-8 lg:mt-10">
          <p className="mb-3 text-center text-xs font-semibold text-gray-400 tracking-wide uppercase lg:text-sm">
            6가지 여행 유형
          </p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
            {STYLE_TYPES.map((type) => (
              <div
                key={type.key}
                className={`rounded-2xl border px-4 py-4 ${type.color}`}
              >
                <img
                  src={type.imgSrc}
                  alt={type.label}
                  className="h-16 w-16 object-contain lg:h-20 lg:w-20"
                />
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${type.chipColor}`}>
                    {type.label}
                  </span>
                </div>
                <p className="mt-1 text-[13px] font-bold leading-snug lg:text-sm">{type.name}</p>
                <p className="mt-0.5 text-[11px] leading-snug opacity-80 lg:text-xs">{type.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-8 flex flex-col items-center gap-3 lg:mt-10">
          <button
            type="button"
            onClick={() => navigate('/travel-style-test/questions')}
            className="w-full max-w-sm rounded-2xl bg-amber-400 py-4 text-base font-extrabold text-amber-900 shadow-md shadow-amber-200 transition-all hover:bg-amber-500 active:scale-95 lg:text-lg"
          >
            테스트 시작하기 →
          </button>
          <p className="text-xs text-gray-400">약 1분 소요 · 로그인 불필요</p>
        </section>

      </div>
    </div>
  )
}
