import { createPortal } from 'react-dom'

/**
 * 남이 만든 여행은 삭제할 수 없으므로(소유자 전용), "함께 준비에서 나가기"를 제안하는 모달.
 * - joinedCount: 내가 멤버로 합류한(=삭제 불가) 선택 항목 수
 * - mineCount: 내가 만들어서 같이 삭제될 선택 항목 수 (혼합 선택 시)
 * - ownerNickname: 대표로 보여줄 소유자 닉네임
 */
export default function LeaveTripConfirmModal({
  open,
  joinedCount,
  mineCount = 0,
  ownerNickname,
  onConfirm,
  onClose,
}) {
  if (!open || typeof document === 'undefined') return null

  const owner = ownerNickname || '다른 사람'
  const title =
    joinedCount > 1
      ? '다른 사람이 만든 여행이에요'
      : `${owner}님이 만든 여행이에요`

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="나가기 확인 닫기"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[1] w-full max-w-sm rounded-2xl border border-gray-100 bg-white px-5 py-5 shadow-xl"
      >
        <p className="text-center text-base font-semibold text-gray-900">{title}</p>
        <p className="mt-2 text-center text-sm leading-relaxed text-gray-500">
          내가 만든 여행이 아니라 삭제할 수 없어요.
          <br />
          대신 <span className="font-semibold text-gray-700">함께 준비</span>에서 나갈까요?
          나가면 내 목록에서 사라져요.
          {mineCount > 0 ? (
            <>
              <br />
              <span className="text-gray-400">
                (내가 만든 {mineCount}개는 함께 삭제돼요)
              </span>
            </>
          ) : null}
        </p>
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
            className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            onClick={onConfirm}
          >
            나가기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
