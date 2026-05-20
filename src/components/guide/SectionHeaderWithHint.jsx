export default function SectionHeaderWithHint({ title, showHint }) {
  return (
    <div className="flex flex-col gap-2 border-b border-teal-100/90 pb-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <h2 className="flex min-w-0 items-center gap-2 text-base font-extrabold tracking-tight text-[#0a3d3d]">
        {title}
      </h2>
      {showHint ? (
        <p className="max-w-md shrink-0 text-left text-xs font-medium leading-relaxed text-slate-500 sm:text-right sm:text-[13px]" role="note">
          <span className="sm:hidden">왼쪽 드래그 아이콘을 잡고 길게 누른 뒤 끌어 옮겨 주세요.</span>
          <span className="hidden sm:inline">준비 항목을 드래그하여 순서를 변경할 수 있어요!</span>
        </p>
      ) : null}
    </div>
  )
}
