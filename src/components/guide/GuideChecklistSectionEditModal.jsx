export default function GuideChecklistSectionEditModal({ open, draft, onDraftChange, onSave, onClose }) {
  if (!open || !draft) return null

  const updateRow = (rowIdx, field, value) => {
    onDraftChange((d) => {
      if (!d) return d
      const rows = d.rows.map((r, i) => (i === rowIdx ? { ...r, [field]: value } : r))
      return { ...d, rows }
    })
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-archive-section-edit-title"
        className="max-h-[min(90dvh,720px)] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-h-[85vh] sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="guide-archive-section-edit-title" className="mb-4 text-lg font-extrabold text-[#0a3d3d]">
          {draft.rows.length === 1 ? '항목 수정' : '섹션 수정'}
        </h2>
        <div className="mb-4">
          <p id="guide-archive-section-name-label" className="mb-1 text-xs font-bold text-gray-600">
            {draft.rows.length === 1 ? '항목 유형(카테고리)' : '섹션 이름'}
          </p>
          <p
            aria-labelledby="guide-archive-section-name-label"
            className="rounded-xl border border-gray-100 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-gray-900"
          >
            {draft.categoryLabel || '—'}
          </p>
        </div>
        <div className="space-y-4">
          {draft.rows.map((row, rowIdx) => (
            <div key={String(row.id)} className="rounded-xl border border-gray-100 bg-slate-50/80 p-3 shadow-sm">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                항목 {rowIdx + 1}
              </p>
              <label className="mb-2 block">
                <span className="mb-0.5 block text-xs font-semibold text-gray-600">제목</span>
                <input
                  type="text"
                  value={row.title}
                  onChange={(e) => updateRow(rowIdx, 'title', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                />
              </label>
              <label className="mb-2 block">
                <span className="mb-0.5 block text-xs font-semibold text-gray-600">설명</span>
                <textarea
                  value={row.description}
                  onChange={(e) => updateRow(rowIdx, 'description', e.target.value)}
                  rows={2}
                  className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                />
              </label>
              <label className="block">
                <span className="mb-0.5 block text-xs font-semibold text-gray-600">추가 메모</span>
                <textarea
                  value={row.detail}
                  onChange={(e) => updateRow(rowIdx, 'detail', e.target.value)}
                  rows={2}
                  className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                />
              </label>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onSave}
            className="min-h-12 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-sky-700 sm:min-h-0 sm:px-5"
          >
            {draft.rows.length === 1 ? '저장' : '이 섹션 저장'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-50 sm:min-h-0 sm:px-5"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
