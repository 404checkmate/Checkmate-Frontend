import { useEffect } from 'react'
import { createPortal } from 'react-dom'

/** 선택된 도시 삭제 확인 — 삭제/취소만 가능 */
export default function Step4RemoveCityConfirmDialog({ open, onCancel, onConfirm, title = '삭제하시겠습니까?' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="step4-remove-city-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        onClick={onCancel}
        aria-label="닫기"
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl">
        <p id="step4-remove-city-title" className="text-center text-base font-semibold leading-snug text-slate-900">
          {title}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
