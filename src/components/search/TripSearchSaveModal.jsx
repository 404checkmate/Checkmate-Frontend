export default function TripSearchSaveModal({ open, onConfirm, onClose, mergeToArchive }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-checklist-modal-title"
        className={`relative w-full rounded-2xl bg-white p-6 shadow-xl ${mergeToArchive ? 'max-w-md' : 'max-w-sm'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="save-checklist-modal-title"
          className={`text-center font-bold leading-snug text-gray-900 ${mergeToArchive ? 'mb-6 text-sm md:text-base' : 'mb-8 text-base'}`}
        >
          {mergeToArchive ? (
            '선택한 항목을 이 체크리스트에 추가합니다. 확인 시 해당 체크리스트 화면으로 돌아갑니다.'
          ) : (
            <>
              저장하시겠습니까?
              <br />
              확인 버튼을 클릭하면 체크리스트로 전환됩니다
            </>
          )}
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-12 flex-1 rounded-2xl bg-amber-400 py-3 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md"
          >
            확인
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 flex-1 rounded-2xl border-2 border-gray-200 bg-white py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
