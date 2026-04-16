import { useNavigate } from 'react-router-dom'
import { TripFlowMobileBar } from '@/components/common/TripFlowTopBar'

const MASCOT_SRC = '/404-mascot.png'

/** 끝까지 민트·화이트 톤으로 이어지도록 100% 구간 유지 (하단 흰 띠 방지) */
const PAGE_BG = {
  background: 'linear-gradient(180deg, #E0F7FA 0%, #E8FDF9 35%, #F0FDFA 70%, #F7FEF9 100%)',
}

function NotFoundMascotImage({ className = '' }) {
  return (
    <img
      src={MASCOT_SRC}
      alt=""
      role="presentation"
      className={`object-contain object-center ${className}`}
      loading="eager"
      decoding="async"
    />
  )
}

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-full w-full flex-1 flex-col" style={PAGE_BG}>
      <TripFlowMobileBar showBack={false} />

      {/* 모바일 */}
      <div className="flex min-h-0 flex-1 flex-col items-center px-5 pb-28 pt-6 md:hidden">
        <span className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600">
          Page not found
        </span>
        <div className="mb-5 flex w-full max-w-[240px] items-center justify-center">
          <NotFoundMascotImage className="max-h-[200px] w-full object-contain" />
        </div>
        <h1 className="mb-2 text-center text-2xl font-extrabold leading-snug text-gray-900">
          길을 잃으셨나요?
        </h1>
        <p className="mb-1 max-w-sm text-center text-sm leading-relaxed text-gray-600">
          주소가 바뀌었거나, 존재하지 않는 페이지예요.
          <br />
          홈에서 다시 여행 준비를 시작해 보세요.
        </p>
        <p className="mb-8 text-center text-xs text-gray-400">404</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full max-w-sm rounded-2xl bg-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-teal-800"
        >
          홈으로 돌아가기
        </button>
      </div>

      {/* 웹 (md 이상) — 좌 일러스트 / 우 카피 */}
      <div className="mx-auto hidden min-h-0 w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-8 py-12 md:flex md:flex-row md:items-center md:gap-14 md:py-16 lg:px-10">
        <div className="flex flex-1 items-center justify-center md:justify-end">
          <NotFoundMascotImage className="w-full max-w-md max-h-72 object-contain lg:max-h-80" />
        </div>
        <div className="flex max-w-lg flex-1 flex-col justify-center text-left">
          <span className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">
            Page not found · 404
          </span>
          <h1 className="mb-3 text-3xl font-extrabold leading-tight text-gray-900 lg:text-4xl">
            요청하신 페이지를
            <br />
            찾을 수 없습니다
          </h1>
          <p className="mb-8 text-base leading-relaxed text-gray-600">
            링크가 잘못되었거나 페이지가 이동·삭제되었을 수 있어요. CHECKMATE 홈에서 여행 준비를 이어가거나,
            새 여행 플랜을 만들어 보세요.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center rounded-2xl bg-teal-700 px-8 py-3.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-teal-800"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
