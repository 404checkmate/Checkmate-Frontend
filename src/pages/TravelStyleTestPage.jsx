import { useNavigate } from 'react-router-dom'
import mascotUrl from '@/assets/home-feature-mascot-question.png'

const STYLE_TYPES = [
  {
    key: 'rook',
    label: '룩',
    emoji: '♖',
    name: '감성 기록형',
    desc: '인생샷과 감성 기록이 여행의 전부',
    color: 'bg-pink-50 border-pink-200 text-pink-700',
    chipColor: 'bg-pink-100 text-pink-700',
  },
  {
    key: 'knight',
    label: '나이트',
    emoji: '♘',
    name: '액티비티형',
    desc: '몸으로 느끼는 짜릿한 경험 추구',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    chipColor: 'bg-orange-100 text-orange-700',
  },
  {
    key: 'bishop',
    label: '비숍',
    emoji: '♗',
    name: '문화 탐험형',
    desc: '현지 문화와 역사를 깊이 파고드는 타입',
    color: 'bg-violet-50 border-violet-200 text-violet-700',
    chipColor: 'bg-violet-100 text-violet-700',
  },
  {
    key: 'queen',
    label: '퀸',
    emoji: '♛',
    name: '올라운더형',
    desc: '계획도 즉흥도 완벽하게 소화하는 타입',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    chipColor: 'bg-teal-100 text-teal-700',
  },
  {
    key: 'king',
    label: '킹',
    emoji: '♚',
    name: '리더형',
    desc: '일행을 이끌며 완벽한 여행을 설계',
    color: 'bg-sky-50 border-sky-200 text-sky-700',
    chipColor: 'bg-sky-100 text-sky-700',
  },
  {
    key: 'pawn',
    label: '폰',
    emoji: '♙',
    name: '여유 힐링형',
    desc: '느긋하게 쉬는 것만으로도 충분한 타입',
    color: 'bg-green-50 border-green-200 text-green-700',
    chipColor: 'bg-green-100 text-green-700',
  },
]

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
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{type.emoji}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${type.chipColor}`}>
                    {type.label}
                  </span>
                </div>
                <p className="text-[13px] font-bold leading-snug lg:text-sm">{type.name}</p>
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
