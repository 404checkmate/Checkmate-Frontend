import { Link } from 'react-router-dom'

export default function GuideArchivePageHeader() {
  return (
    <>
      <div className="px-4 pb-2 pt-4 md:hidden">
        <Link
          to="/"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          ← 내 여행으로
        </Link>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-900/90">MY ARCHIVE</p>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-[#0a3d3d]">나의 체크리스트</h1>
      </div>

      <div className="mx-auto hidden max-w-5xl px-8 pb-2 pt-10 md:block">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">MY ARCHIVE</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 lg:text-4xl">
              나의 체크리스트
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              계획 중인 모험과 소중한 추억이 담긴 모든 체크리스트를 한곳에서 관리하세요.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center" />
        </div>
      </div>
    </>
  )
}
