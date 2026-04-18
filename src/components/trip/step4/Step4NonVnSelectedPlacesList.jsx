import { useCallback, useMemo, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Step4RemoveCityConfirmDialog from '@/components/trip/step4/Step4RemoveCityConfirmDialog'
import Step4SvgIcon from '@/components/trip/step4/Step4SvgIcon'
import SortableNonVnItem from '@/components/trip/step4/SortableNonVnItem'

/** 비베트남: 확정된 방문지 목록(무한 추가·순서 변경·삭제) — @dnd-kit, 카드 전체 드래그(터치는 길게 누르기) */
export default function Step4NonVnSelectedPlacesList({ items, onRemove, onReorder, onRemoveAll }) {
  const n = items.length
  const [removeConfirmId, setRemoveConfirmId] = useState(null)
  const [removeAllOpen, setRemoveAllOpen] = useState(false)
  const [listRef] = useAutoAnimate({ duration: 280, easing: 'ease-out' })
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 400, tolerance: 12 },
    }),
  )

  const sortableIds = useMemo(() => items.map((i) => i.id), [items])

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      if (oldIndex < 0 || newIndex < 0) return
      onReorder(oldIndex, newIndex)
    },
    [items, onReorder],
  )

  const handleConfirmRemove = useCallback(() => {
    if (removeConfirmId != null) onRemove(removeConfirmId)
    setRemoveConfirmId(null)
  }, [removeConfirmId, onRemove])

  const handleConfirmRemoveAll = useCallback(() => {
    onRemoveAll()
    setRemoveAllOpen(false)
  }, [onRemoveAll])

  return (
    <>
      <section className="rounded-2xl bg-sky-50/60 px-1 py-1 sm:px-2">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <p className="text-[15px] font-bold text-slate-900">선택된 도시</p>
          {n > 0 ? (
            <button
              type="button"
              onClick={() => setRemoveAllOpen(true)}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              전체 삭제
            </button>
          ) : null}
        </div>

        {n > 0 ? (
          <p className="mb-3 flex items-center gap-2 px-1 text-[11px] leading-snug text-slate-500">
            <Step4SvgIcon name="grip" className="h-3.5 w-3.5 shrink-0 text-sky-500/80" aria-hidden />
            <span>카드를 드래그해 순서를 바꿀 수 있어요</span>
          </p>
        ) : null}

        {n === 0 ? (
          <p className="px-1 text-center text-sm text-slate-500">선택된 곳이 없습니다</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              <ul ref={listRef} className="space-y-3">
                {items.map((item, index) => (
                  <SortableNonVnItem
                    key={item.id}
                    item={item}
                    index={index}
                    onRemoveRequest={setRemoveConfirmId}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </section>
      <Step4RemoveCityConfirmDialog
        open={removeConfirmId !== null}
        onCancel={() => setRemoveConfirmId(null)}
        onConfirm={handleConfirmRemove}
      />
      <Step4RemoveCityConfirmDialog
        open={removeAllOpen}
        title="선택된 도시를 모두 삭제하시겠습니까?"
        onCancel={() => setRemoveAllOpen(false)}
        onConfirm={handleConfirmRemoveAll}
      />
    </>
  )
}
