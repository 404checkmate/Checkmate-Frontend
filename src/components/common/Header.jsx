import { Link, useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from '@/components/common/BrandLogo'

const NAV_ITEMS = [
  { label: '홈', path: '/', match: (p) => p === '/' },
  { label: '여행 준비', path: '/trips/new/step2', match: (p) => p.startsWith('/trips/new') },
  {
    label: '체크리스트',
    path: '/trips/1/guide-archive',
    match: (p) => p.includes('/guide-archive') || p.includes('/checklist'),
  },
]

function Header() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <header className="z-50 w-full bg-white border-b border-gray-100">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">

        <Link
          to="/"
          className="flex shrink-0 items-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40"
        >
          <BrandLogo className="h-7 w-auto md:h-8" />
        </Link>

        {/* 오른쪽: 데스크탑 네비 + 프로필 (네비는 프로필 바로 왼쪽) */}
        <div className="flex items-center gap-5 md:gap-6">
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`text-sm transition-colors pb-0.5 ${
                  item.match(location.pathname)
                    ? 'text-cyan-500 font-semibold border-b-2 border-cyan-500'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => navigate('/mypage')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            aria-label="마이페이지"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </button>
        </div>

      </div>
    </header>
  )
}

export default Header
