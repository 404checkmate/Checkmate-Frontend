export default function DestinationResetConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xs rounded-2xl bg-white px-6 py-6 shadow-2xl">
        <h3 className="mb-2 text-base font-extrabold text-gray-900">여행지를 변경하시겠어요?</h3>
        <p className="mb-5 text-sm leading-relaxed text-gray-500">
          여행지를 다시 선택하면 지금까지 입력한 날짜, 도시, 동행인, 여행 스타일 정보가 모두 초기화돼요.
        </p>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 active:scale-[0.99]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#3db4dd] py-3 text-sm font-bold text-white transition hover:bg-[#2da0c8] active:scale-[0.99]"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
