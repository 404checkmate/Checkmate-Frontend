export default function GuideChecklistDirectAddModal({
  open,
  draft,
  onDraftChange,
  onSubmit,
  onClose,
  sectionLabel,
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-archive-direct-add-title"
        className="max-h-[min(90dvh,640px)] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-h-[85vh] sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="guide-archive-direct-add-title" className="mb-4 text-lg font-extrabold text-[#0a3d3d]">
          직접 추가
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          제목은 필수입니다. 항목은 <strong className="font-semibold text-gray-800">기내 반입</strong>으로
          저장되며, 체크리스트 본문 맨 아래 「{sectionLabel}」 블록에 붙습니다.
        </p>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-semibold text-gray-600">제목 (필수)</span>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => onDraftChange((d) => ({ ...d, title: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
            placeholder="예: 보조배터리"
          />
        </label>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-semibold text-gray-600">설명</span>
          <textarea
            value={draft.description}
            onChange={(e) => onDraftChange((d) => ({ ...d, description: e.target.value }))}
            rows={2}
            className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
          />
        </label>
        <label className="mb-6 block">
          <span className="mb-1 block text-xs font-semibold text-gray-600">추가 메모</span>
          <textarea
            value={draft.detail}
            onChange={(e) => onDraftChange((d) => ({ ...d, detail: e.target.value }))}
            rows={2}
            className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
          />
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onSubmit}
            className="min-h-12 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-teal-700 sm:min-h-0 sm:px-5"
          >
            추가
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
