import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const SORTABLE_TRANSITION = {
  duration: 260,
  easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
}

/**
 * DragOverlay용 — 목록 카드와 동일 레이아웃(포인터 이벤트 없음)
 */
export function GuideArchiveChecklistDragPreview({ item, checks }) {
  const id = String(item.id)
  const on = Boolean(checks[id])
  const showCheckedStyle = on

  return (
    <div
      className="w-full cursor-grabbing touch-manipulation drop-shadow-[0_14px_36px_-8px_rgba(15,23,42,0.28)]"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className={`flex min-w-0 w-full gap-3 rounded-2xl border-2 px-4 py-3.5 ${
          on
            ? 'border-amber-400 bg-amber-200/95 shadow-sm ring-1 ring-amber-300/70'
            : 'border-gray-100 bg-white shadow-sm'
        }`}
      >
        <input
          type="checkbox"
          checked={on}
          readOnly
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none mt-1 h-5 w-5 shrink-0 rounded border-gray-300 accent-amber-600"
        />
        <span className="min-w-0 flex-1">
          <span
            className={`block text-sm font-extrabold ${
              showCheckedStyle
                ? 'text-gray-900 line-through decoration-amber-700/45'
                : 'text-gray-900'
            }`}
          >
            {item.title}
          </span>
          {item.description ? (
            <span
              className={`mt-1 block text-xs leading-relaxed ${showCheckedStyle ? 'text-gray-700' : 'text-gray-600'}`}
            >
              {item.description}
            </span>
          ) : null}
          {item.detail ? (
            <span
              className={`mt-2 block border-l-2 pl-2 text-xs leading-relaxed ${
                showCheckedStyle
                  ? 'border-amber-300 text-gray-700'
                  : 'border-cyan-200 text-gray-500'
              }`}
            >
              {item.detail}
            </span>
          ) : null}
        </span>
      </div>
    </div>
  )
}

/**
 * 보관함 체크리스트 행 — 카드 전체에서 드래그(체크박스는 탭만 체크, 드래그와 분리)
 */
export default function GuideArchiveSortableChecklistItem({
  item,
  sortableDisabled,
  checks,
  deleteSelectMode,
  selectedItemIdsForDelete,
  handleToggle,
  toggleItemSelectForDelete,
}) {
  const id = String(item.id)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: sortableDisabled,
    transition: SORTABLE_TRANSITION,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
  }

  const on = Boolean(checks[id])
  const showCheckedStyle = !deleteSelectMode && on
  const isDelSelected = selectedItemIdsForDelete.includes(id)

  const dragProps = !sortableDisabled ? { ...listeners, ...attributes } : {}

  const stopDragChain = (e) => {
    e.stopPropagation()
  }

  return (
    <li
      ref={setNodeRef}
      data-guide-archive-dnd-item={id}
      style={style}
      className={`list-none transition-[opacity,filter] duration-200 ease-out ${
        isDragging ? 'opacity-[0.38] saturate-75' : ''
      }`}
    >
      <label
        {...dragProps}
        className={`flex min-w-0 w-full touch-manipulation gap-3 rounded-2xl border-2 px-4 py-3.5 transition-all duration-200 ease-out ${
          sortableDisabled ? 'cursor-pointer' : 'cursor-grab select-none active:cursor-grabbing'
        } ${
          deleteSelectMode
            ? isDelSelected
              ? 'border-teal-400 bg-cyan-50/95 shadow-sm ring-2 ring-teal-500 ring-offset-2'
              : 'border-gray-100 bg-white shadow-sm hover:bg-gray-50'
            : on
              ? 'border-amber-400 bg-amber-200/95 shadow-sm ring-1 ring-amber-300/70'
              : 'border-gray-100 bg-white shadow-sm hover:bg-gray-50'
        }`}
      >
        <input
          type="checkbox"
          checked={deleteSelectMode ? isDelSelected : on}
          onChange={() =>
            deleteSelectMode ? toggleItemSelectForDelete(item.id) : handleToggle(item.id)
          }
          onPointerDown={stopDragChain}
          onTouchStart={stopDragChain}
          aria-label={
            deleteSelectMode ? `삭제 대상 ${isDelSelected ? '해제' : '선택'}` : undefined
          }
          className={`relative z-10 mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300 ${deleteSelectMode ? 'accent-teal-600' : 'accent-amber-600'}`}
        />
        <span className="min-w-0 flex-1">
          <span
            className={`block text-sm font-extrabold ${
              showCheckedStyle
                ? 'text-gray-900 line-through decoration-amber-700/45'
                : 'text-gray-900'
            }`}
          >
            {item.title}
          </span>
          {item.description ? (
            <span
              className={`mt-1 block text-xs leading-relaxed ${showCheckedStyle ? 'text-gray-700' : 'text-gray-600'}`}
            >
              {item.description}
            </span>
          ) : null}
          {item.detail ? (
            <span
              className={`mt-2 block border-l-2 pl-2 text-xs leading-relaxed ${
                showCheckedStyle
                  ? 'border-amber-300 text-gray-700'
                  : 'border-cyan-200 text-gray-500'
              }`}
            >
              {item.detail}
            </span>
          ) : null}
        </span>
      </label>
    </li>
  )
}
