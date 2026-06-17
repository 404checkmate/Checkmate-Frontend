import { useState } from 'react'
import { trackEvent } from '@/utils/analyticsTracker'
import AffiliateDisclosureModal, { hasAckedDisclosure } from './AffiliateDisclosureModal'

/**
 * 항목 박스용 제휴 구매/예약 버튼.
 * - 매핑된 항목에만 렌더(부모가 affiliate 유무로 제어).
 * - 첫 클릭 시 고지 모달 → 이동. "다시 보지 않기" 이후엔 바로 이동.
 * - 광고임을 명확히(AD 칩) + 외부 이동(↗) + rel="sponsored nofollow noopener".
 */
export default function AffiliateBuyButton({ itemTitle, affiliate, className = '' }) {
  const [modalOpen, setModalOpen] = useState(false)

  const go = () => {
    trackEvent('affiliate_click', { provider: affiliate.provider, item: itemTitle })
    window.open(affiliate.url, '_blank', 'noopener,noreferrer')
  }

  const handleClick = (e) => {
    // 항목 박스(선택 토글)로 클릭이 전파되지 않도록
    e.stopPropagation()
    if (hasAckedDisclosure()) {
      // 고지 확인 완료 → 앵커 기본동작(target=_blank)으로 이동 + 계측
      trackEvent('affiliate_click', { provider: affiliate.provider, item: itemTitle })
      return
    }
    // 첫 이동 → 기본동작 막고 고지 모달
    e.preventDefault()
    setModalOpen(true)
  }

  return (
    <>
      <a
        href={affiliate.url}
        target="_blank"
        rel="sponsored nofollow noopener"
        onClick={handleClick}
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700 ${className}`.trim()}
      >
        {affiliate.label}
        <span aria-hidden>↗</span>
      </a>
      {modalOpen && (
        <AffiliateDisclosureModal
          provider={affiliate.provider}
          onConfirm={() => {
            setModalOpen(false)
            go()
          }}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
