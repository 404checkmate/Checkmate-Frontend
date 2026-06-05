import mascotUrl from '@/assets/trip-progress-mascot.png'
import { useTravelStyleLoading } from '@/hooks/useTravelStyleLoading'

const STEPS = [
  '답변을 분석하고 있어요',
  '여행 성향을 계산 중이에요',
  '추천 여행지를 찾고 있어요',
  '체크리스트를 준비하고 있어요',
]

export default function TravelStyleLoadingPage() {
  const { stepIndex, progress } = useTravelStyleLoading(STEPS.length)

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.18) 0%, transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(61, 180, 221, 0.15) 0%, transparent 35%),
          linear-gradient(160deg, #fffbeb 0%, #f0fdfa 100%)
        `,
      }}
    >
      <img
        src={mascotUrl}
        alt="분석 중인 메이트"
        className="mb-6 h-28 w-28 animate-bounce object-contain drop-shadow-lg lg:h-36 lg:w-36"
      />

      <p className="mb-1 text-xs font-bold text-amber-500 tracking-wide">MATE 분석중</p>
      <h2 className="mb-6 text-xl font-extrabold text-[#04384a] lg:text-2xl">
        나만의 여행 스타일 찾는 중…
      </h2>

      {/* 진행률 바 */}
      <div className="mb-6 w-64 lg:w-80">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-teal-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-xs font-semibold text-teal-600">{progress}%</p>
      </div>

      {/* 단계 메시지 */}
      <ul className="flex flex-col gap-2">
        {STEPS.map((step, idx) => (
          <li
            key={idx}
            className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 lg:text-base
              ${idx <= stepIndex ? 'text-teal-700' : 'text-gray-300'}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-300
              ${idx <= stepIndex ? 'bg-teal-400' : 'bg-gray-200'}`}
            />
            {step}
          </li>
        ))}
      </ul>
    </div>
  )
}
