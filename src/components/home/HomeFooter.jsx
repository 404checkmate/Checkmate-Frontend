import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '@/components/common/BrandLogo'
import {
  FOOTER_BOTTOM_LINKS,
  FOOTER_SECTIONS,
  FOOTER_SOCIAL_LINKS,
  HOME_BRAND_TAGLINE,
} from '@/mocks/homeData'

function noopFooterAction() {}

function SocialIcon({ icon, className = 'h-5 w-5' }) {
  if (icon === 'linkedin') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    )
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function LegalFooterLinks({ className = '', nonInteractive = false, onPlaceholderAction }) {
  if (nonInteractive) {
    return (
      <nav className={className} aria-label="법적 안내">
        {FOOTER_BOTTOM_LINKS.map((link, idx) => (
          <span key={link.label} className="inline-flex items-center gap-x-2">
            {idx > 0 && <span className="text-gray-200 select-none" aria-hidden>|</span>}
            <button
              type="button"
              onClick={onPlaceholderAction ?? noopFooterAction}
              className="cursor-pointer border-0 bg-transparent p-0 text-inherit text-gray-500 underline-offset-2 transition-colors hover:text-gray-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1"
            >
              {link.label}
            </button>
          </span>
        ))}
      </nav>
    )
  }
  return (
    <nav className={className} aria-label="법적 안내">
      {FOOTER_BOTTOM_LINKS.map((link, idx) => (
        <span key={link.label} className="inline-flex items-center gap-x-2">
          {idx > 0 && <span className="text-gray-200 select-none" aria-hidden>|</span>}
          {link.href && link.href !== '#' ? (
            <Link
              to={link.href}
              className="transition-colors hover:text-gray-600"
            >
              {link.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onPlaceholderAction ?? noopFooterAction}
              className="cursor-pointer border-0 bg-transparent p-0 text-inherit transition-colors hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1"
            >
              {link.label}
            </button>
          )}
        </span>
      ))}
    </nav>
  )
}

export default function HomeFooter({ showNoticePreparingToast }) {
  const timerRef = useRef(null)
  const [toastVisible, setToastVisible] = useState(false)

  function showToast() {
    if (showNoticePreparingToast) return showNoticePreparingToast()
    if (timerRef.current) clearTimeout(timerRef.current)
    setToastVisible(true)
    timerRef.current = setTimeout(() => {
      setToastVisible(false)
      timerRef.current = null
    }, 2500)
  }

  return (
    <footer className="snap-none bg-transparent pt-8 pb-24 md:pt-12 md:pb-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">

        {/* 브랜드 + 섹션 */}
        <div className="flex flex-col gap-6 md:flex-row md:justify-between md:gap-12">

          {/* 브랜드 */}
          <div className="max-w-xs">
            <BrandLogo className="h-5 w-auto md:h-7" />
            <p className="mt-2 text-[10px] leading-relaxed text-gray-600 md:mt-3 md:text-xs">
              {HOME_BRAND_TAGLINE}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500 md:mt-4 md:text-xs">
              {/* 모바일·태블릿: 모바일 홈(/) / 웹: 서비스 소개(/about) */}
              <Link
                to="/"
                className="text-gray-500 transition-colors hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1 lg:hidden"
              >
                홈
              </Link>
              <Link
                to="/about"
                className="hidden text-gray-500 transition-colors hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1 lg:inline"
              >
                홈
              </Link>
              <Link
                to="/about"
                className="text-gray-500 transition-colors hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1"
              >
                서비스 소개
              </Link>
            </div>
          </div>

          {/* 섹션 그리드 */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 md:gap-10">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.id}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-900 md:mb-3 md:text-xs">
                  {section.title}
                </p>
                <ul className="space-y-1.5 md:space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={showToast}
                        className="w-full cursor-pointer break-words border-0 bg-transparent p-0 text-left text-[11px] text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1 md:text-sm"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 하단: 소셜 + 법적 링크 */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-gray-200/80 pt-5 md:mt-10 md:flex-row md:gap-4 md:pt-8">
          <div className="flex items-center gap-3 text-gray-500 md:gap-4">
            {FOOTER_SOCIAL_LINKS.map((s) =>
              s.href && s.href !== '#' ? (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-gray-500 transition-colors hover:text-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1"
                >
                  <SocialIcon icon={s.icon} className="h-4 w-4 md:h-5 md:w-5" />
                </a>
              ) : (
                <button
                  key={s.label}
                  type="button"
                  onClick={noopFooterAction}
                  aria-label={s.label}
                  className="cursor-pointer border-0 bg-transparent p-0 text-gray-500 transition-colors hover:text-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1"
                >
                  <SocialIcon icon={s.icon} className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              )
            )}
          </div>
          <LegalFooterLinks
            onPlaceholderAction={showToast}
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] text-gray-500 md:gap-y-2 md:text-xs"
          />
        </div>

        <p className="mt-4 text-center text-[10px] text-gray-400 md:mt-6 md:text-right md:text-xs">
          © {new Date().getFullYear()} CHECKMATE. 무단 복제 및 배포를 금합니다.
        </p>
      </div>

      {toastVisible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-gray-900/90 px-4 py-2 text-sm font-semibold text-white shadow-lg"
        >
          준비중입니다
        </div>
      )}
    </footer>
  )
}
