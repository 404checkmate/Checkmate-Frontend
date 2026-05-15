import { useId, useState } from 'react'
import PolicyScrollPanel from '@/components/auth/PolicyScrollPanel'
import { PRIVACY_POLICY_TEXT, TERMS_OF_SERVICE_TEXT } from '@/content/legalConsentCopy'

const SPRING = 'cubic-bezier(0.34,1.36,0.64,1)'
const EASE_IN = 'ease-in'

function RevealSection({ visible, children }) {
  return (
    <div
      className={`grid transition-all duration-500 ${
        visible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
      }`}
      style={{ transitionTimingFunction: visible ? SPRING : EASE_IN }}
    >
      <div className="overflow-hidden">
        <div
          className={`transition-transform duration-500 ${visible ? 'translate-y-0' : 'translate-y-4'}`}
          style={{ transitionTimingFunction: visible ? SPRING : EASE_IN }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * 필수·선택 동의 체크박스 + 본문 패널
 * @param {{ onContinue: (opts?: { marketingOptIn: boolean }) => void, disabled?: boolean }} props
 */
export default function LegalConsentForm({ onContinue, disabled = false }) {
  const formId = useId()
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)

  const canSubmit = agreeTerms && agreePrivacy && !disabled

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onContinue({ marketingOptIn: agreeMarketing })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-4">
        {/* Section 1: always visible */}
        <PolicyScrollPanel title="서비스 이용약관 (필수)">{TERMS_OF_SERVICE_TEXT}</PolicyScrollPanel>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition hover:border-cyan-200/80">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
          />
          <span className="text-sm font-semibold text-gray-800">
            이용약관에 동의합니다.{' '}
            <span className="font-bold text-cyan-700">(필수)</span>
          </span>
        </label>

        {/* Section 2: revealed when terms checked */}
        <RevealSection visible={agreeTerms}>
          <div className="flex flex-col gap-4 pt-1">
            <PolicyScrollPanel title="개인정보 수집·이용 안내 (필수)">{PRIVACY_POLICY_TEXT}</PolicyScrollPanel>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition hover:border-cyan-200/80">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm font-semibold text-gray-800">
                개인정보 수집·이용에 동의합니다.{' '}
                <span className="font-bold text-cyan-700">(필수)</span>
              </span>
            </label>
          </div>
        </RevealSection>

        {/* Section 3: revealed when privacy checked */}
        <RevealSection visible={agreePrivacy}>
          <div className="pt-1">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-dashed border-amber-200/90 bg-amber-50/40 px-4 py-3 transition hover:border-amber-300">
              <input
                type="checkbox"
                checked={agreeMarketing}
                onChange={(e) => setAgreeMarketing(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-800">
                이벤트·혜택 등 마케팅 정보 수신에 동의합니다.{' '}
                <span className="font-semibold text-amber-800">(선택)</span>
              </span>
            </label>
          </div>
        </RevealSection>
      </div>

      {/* Submit button: revealed when privacy checked */}
      <RevealSection visible={agreePrivacy}>
        <div className="pt-1">
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-3.5 text-sm font-bold text-white shadow-md shadow-cyan-600/25 transition hover:from-cyan-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            동의하고 계속하기
          </button>
        </div>
      </RevealSection>
    </form>
  )
}
