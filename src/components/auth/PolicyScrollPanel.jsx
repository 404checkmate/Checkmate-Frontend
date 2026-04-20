/**
 * 약관·개인정보 본문 — 스크롤 영역 + 체크메이트 톤 카드
 */
export default function PolicyScrollPanel({ title, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-cyan-100/80 bg-white/90 shadow-sm shadow-cyan-900/5 ${className}`.trim()}
    >
      <h2 className="border-b border-cyan-100/70 px-4 py-3 text-sm font-bold text-gray-900 sm:px-5">{title}</h2>
      <div
        className="max-h-40 overflow-y-auto px-4 py-3 text-xs leading-relaxed text-gray-600 sm:max-h-48 sm:px-5 sm:text-[13px] sm:leading-relaxed"
        tabIndex={0}
      >
        <div className="whitespace-pre-wrap">{children}</div>
      </div>
    </section>
  )
}
