import { createPortal } from 'react-dom'

export default function DeleteConfirmModal({ open, count, onConfirm, onClose }) {
  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="삭제 확인 닫기"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[1] w-full max-w-sm rounded-2xl border border-gray-100 bg-white px-5 py-5 shadow-xl"
      >
        <p className="text-center text-base font-semibold text-gray-900">
          선택한 {count}개 항목을 삭제할까요?
        </p>
        <p className="mt-1 text-center text-sm text-gray-500">되돌릴 수 없습니다.</p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            onClick={onConfirm}
          >
            삭제
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
