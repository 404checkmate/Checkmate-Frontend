export default function GuideArchiveChecklistHeader({ title, dateLine, companions = [], travelStyles = [] }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-extrabold leading-snug tracking-tight text-gray-900 md:text-3xl">{title}</h1>
      <p className="mt-2 flex items-center gap-2 text-base font-semibold text-gray-700 md:text-lg">
        <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-teal-600 md:h-2.5 md:w-2.5" aria-hidden />
        {dateLine}
      </p>
      {(companions.length > 0 || travelStyles.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {companions.map((label) => (
            <span key={label} className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20">
              {label}
            </span>
          ))}
          {travelStyles.map((label) => (
            <span key={label} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {label}
            </span>
          ))}
        </div>
      )}
      <p className="mt-4 text-sm leading-relaxed text-gray-600">
        저장한 체크리스트를 확인하고 빠짐없이 준비해보세요
      </p>
    </header>
  )
}
