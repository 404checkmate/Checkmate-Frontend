import { useState } from 'react'
import { createPortal } from 'react-dom'

const ACK_KEY = 'cm_affiliate_disclosure_ack'

/** 사용자가 "다시 보지 않기"로 고지를 확인했는지 */
export function hasAckedDisclosure() {
  try {
    return localStorage.getItem(ACK_KEY) === '1'
  } catch {
    return false
  }
}

const PROVIDER_LABEL = {
  coupang: '쿠팡 파트너스',
  mrt: '마이리얼트립',
}

/**
 * 제휴 링크 이동 전 1회 고지 모달.
 * "다시 보지 않기" 체크 시 이후로는 모달 없이 바로 이동(hasAckedDisclosure).
 */
export default function AffiliateDisclosureModal({ provider, onConfirm, onCancel }) {
  const [dontShow, setDontShow] = useState(false)
  const label = PROVIDER_LABEL[provider] ?? '제휴'

  const confirm = () => {
    if (dontShow) {
      try {
        localStorage.setItem(ACK_KEY, '1')
      } catch {}
    }
    onConfirm()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="제휴 링크 안내"
      >
        <h3 className="text-base font-extrabold text-gray-900">제휴 링크 안내</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          이 링크는 <span className="font-bold text-gray-800">{label}</span> 제휴 링크예요.
          구매·예약이 발생하면 체크메이트가 일정 수수료를 받습니다. 이동할까요?
        </p>
        <label className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <input
            type="checkbox"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          다시 보지 않기
        </label>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={confirm}
            className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-700"
          >
            이동하기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
