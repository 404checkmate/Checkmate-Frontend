import { useNavigate } from 'react-router-dom'
import { TERMS_OF_SERVICE_TEXT } from '@/content/legalConsentCopy'

export default function TermsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 pb-16">

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition hover:text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          뒤로가기
        </button>

        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">CHECKMATE</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
            서비스 이용약관
          </h1>
          <p className="mt-2 text-sm text-gray-500">최종 수정일: 2025년 5월</p>
        </header>

        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {TERMS_OF_SERVICE_TEXT}
          </p>
        </div>

      </div>
    </div>
  )
}
