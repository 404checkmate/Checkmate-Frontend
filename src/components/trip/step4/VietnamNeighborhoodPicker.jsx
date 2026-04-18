import { useCallback, useMemo, useRef, useState } from 'react'
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
import { VIETNAM_STAY_OPTIONS } from '@/mocks/tripNewStep4Data'
import Step4RemoveCityConfirmDialog from '@/components/trip/step4/Step4RemoveCityConfirmDialog'
import Step4SvgIcon from '@/components/trip/step4/Step4SvgIcon'
import SortableVietnamRow from '@/components/trip/step4/SortableVietnamRow'

export default function VietnamNeighborhoodPicker({
  selectedIds,
  onToggle,
  customStops,
  onAddCustom,
  onRemoveCustom,
  onClearAll,
  visitStopOrder,
  onReorderStopOrder,
  searchQuery,
}) {
  const [manual, setManual] = useState('')
  const manualInputRef = useRef(null)
  const [visitListRef] = useAutoAnimate({ duration: 280, easing: 'ease-out' })
  const [removeConfirm, setRemoveConfirm] = useState(null)
  const [removeAllOpen, setRemoveAllOpen] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 400, tolerance: 12 },
    }),
  )

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return VIETNAM_STAY_OPTIONS
    return VIETNAM_STAY_OPTIONS.filter(
      (opt) =>
        opt.city.toLowerCase().includes(q) ||
        opt.area.toLowerCase().includes(q) ||
        opt.hint.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const orderedRows = useMemo(() => {
    return visitStopOrder
      .map((key) => {
        if (key.startsWith('p-')) {
          const id = key.slice(2)
          const opt = VIETNAM_STAY_OPTIONS.find((o) => o.id === id)
          if (!opt || !selectedIds.includes(id)) return null
          return { kind: 'preset', key, id, opt }
        }
        if (key.startsWith('c-')) {
          const id = key.slice(2)
          const c = customStops.find((x) => x.id === id)
          if (!c) return null
          return { kind: 'custom', key, id, custom: c }
        }
        return null
      })
      .filter(Boolean)
  }, [visitStopOrder, selectedIds, customStops])

  const handleAddManual = useCallback(() => {
    const t = manual.trim()
    if (t.length < 2) return
    onAddCustom(t)
    setManual('')
    manualInputRef.current?.blur()
  }, [manual, onAddCustom])

  const totalCount = orderedRows.length

  const sortableKeys = useMemo(() => orderedRows.map((r) => r.key), [orderedRows])

  const handleVisitDragEnd = useCallback(
    (event) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = orderedRows.findIndex((r) => r.key === active.id)
      const newIndex = orderedRows.findIndex((r) => r.key === over.id)
      if (oldIndex < 0 || newIndex < 0) return
      onReorderStopOrder(oldIndex, newIndex)
    },
    [orderedRows, onReorderStopOrder],
  )

  const handleRemoveRequest = useCallback((row) => {
    setRemoveConfirm({ kind: row.kind === 'preset' ? 'preset' : 'custom', id: row.id })
  }, [])

  const handleConfirmVietnamRemove = useCallback(() => {
    if (!removeConfirm) return
    if (removeConfirm.kind === 'preset') onToggle(removeConfirm.id)
    else onRemoveCustom(removeConfirm.id)
    setRemoveConfirm(null)
  }, [removeConfirm, onToggle, onRemoveCustom])

  const handleConfirmClearAll = useCallback(() => {
    onClearAll()
    setRemoveAllOpen(false)
  }, [onClearAll])

  return (
    <>
      <div className="space-y-5">
        {/* 입력창 바로 아래: 선택된 도시 */}
        <section className="rounded-2xl bg-sky-50/60 px-1 py-1 sm:px-2">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <p className="text-[15px] font-bold text-slate-900">선택된 도시</p>
            {totalCount > 0 ? (
              <button
                type="button"
                onClick={() => setRemoveAllOpen(true)}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                전체 삭제
              </button>
            ) : null}
          </div>

          {totalCount > 0 ? (
            <p className="mb-3 flex items-center gap-2 px-1 text-[11px] leading-snug text-slate-500">
              <Step4SvgIcon name="grip" className="h-3.5 w-3.5 shrink-0 text-sky-500/80" aria-hidden />
              <span>카드를 드래그해 순서를 바꿀 수 있어요</span>
            </p>
          ) : null}

          {totalCount === 0 ? (
            <p className="px-1 text-sm text-slate-400">위에서 검색하거나 아래 추천·직접 추가로 도시를 골라 주세요.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleVisitDragEnd}>
              <SortableContext items={sortableKeys} strategy={verticalListSortingStrategy}>
                <ul ref={visitListRef} className="space-y-3">
                  {orderedRows.map((row, index) => (
                    <SortableVietnamRow
                      key={row.key}
                      row={row}
                      index={index}
                      onRemoveRequest={handleRemoveRequest}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </section>

        {searchQuery.trim() && filteredOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filteredOptions.map((opt) => {
              const on = selectedIds.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onToggle(opt.id)}
                  className={`max-w-[220px] rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all ${
                    on
                      ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                      : 'border-sky-200 bg-white/95 text-slate-700 hover:border-teal-300'
                  }`}
                >
                  <span className="block text-[10px] opacity-80">{opt.city}</span>
                  <span className="block">{opt.area}</span>
                  <span className={`mt-0.5 block text-[10px] ${on ? 'text-white/90' : 'text-slate-400'}`}>{opt.hint}</span>
                </button>
              )
            })}
          </div>
        )}

        {searchQuery.trim() && filteredOptions.length === 0 && (
          <p className="text-xs text-slate-400">검색 결과가 없습니다. 아래에서 직접 추가해 보세요.</p>
        )}

        <div className="border-t border-sky-100 pt-4">
          <p className="mb-2 text-xs font-semibold text-slate-600">목록에 없으면 직접 추가</p>
          <div className="flex gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 transition-colors duration-200 focus-within:border-white/50 focus-within:bg-[#D9F2FF]">
              <input
                ref={manualInputRef}
                type="text"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  if (e.nativeEvent.isComposing) return
                  e.preventDefault()
                  handleAddManual()
                }}
                placeholder="예: 무이네, 달랏, 사파..."
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-sky-700/45 outline-none"
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              onClick={handleAddManual}
              className="flex-shrink-0 rounded-2xl px-4 py-2.5 text-sm font-bold bg-teal-600 text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              추가
            </button>
          </div>
        </div>
      </div>
      <Step4RemoveCityConfirmDialog
        open={removeConfirm !== null}
        onCancel={() => setRemoveConfirm(null)}
        onConfirm={handleConfirmVietnamRemove}
      />
      <Step4RemoveCityConfirmDialog
        open={removeAllOpen}
        title="선택된 도시를 모두 삭제하시겠습니까?"
        onCancel={() => setRemoveAllOpen(false)}
        onConfirm={handleConfirmClearAll}
      />
    </>
  )
}
