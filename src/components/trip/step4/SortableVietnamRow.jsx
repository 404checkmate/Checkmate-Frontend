import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Step4SvgIcon from '@/components/trip/step4/Step4SvgIcon'

/** 베트남 선택 도시 행 — 비베트남 SortableNonVnItem과 동일 UX */
export default function SortableVietnamRow({ row, index, onRemoveRequest }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.key })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 40 : undefined,
  }

  const title = row.kind === 'preset' ? row.opt.city : row.custom.label
  const sub =
    row.kind === 'preset' ? `베트남, ${row.opt.hint}` : '직접 입력, 추가 지역'

  const cardBase =
    'flex min-h-[64px] min-w-0 flex-1 cursor-grab touch-manipulation items-center gap-3 rounded-[1.25rem] border border-slate-100 bg-white px-4 py-3 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.12)] transition-all duration-300 ease-out active:cursor-grabbing'

  const draggingRing = isDragging
    ? 'border-sky-300 ring-2 ring-sky-200/80 ring-offset-2 ring-offset-sky-50/50'
    : ''

  const inner = (
    <>
      <div className="min-w-0 flex-1 pr-1">
        <p className="truncate text-base font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 truncate text-sm text-slate-500">{sub}</p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemoveRequest(row)
          }}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          aria-label="제거"
        >
          <Step4SvgIcon name="close" className="h-4 w-4" />
        </button>
      </div>
    </>
  )

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`relative flex items-stretch gap-3 ${isDragging ? 'opacity-70' : ''}`}
    >
      <div
        className="hidden size-9 shrink-0 select-none items-center justify-center self-center rounded-full border border-sky-200/90 bg-sky-100 text-sm font-medium tabular-nums text-sky-800 md:flex"
        aria-hidden
      >
        {index + 1}
      </div>
      <div
        className={`${cardBase} ${draggingRing}`}
        {...listeners}
        {...attributes}
        aria-label="드래그하여 순서 변경"
      >
        {inner}
      </div>
    </li>
  )
}
