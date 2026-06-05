import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { loadPendingGuestSearch, savePendingGuestSearch } from '@/utils/pendingGuestSearch'
import { trackEvent } from '@/utils/analyticsTracker'
import { loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import GuideArchiveChecklistView from '@/components/guide/GuideArchiveChecklistView'
import LoginGateModal from '@/components/search/LoginGateModal'

const PAGE_BG = {
  background: 'linear-gradient(180deg, #E0F7FA 0%, #F8FAFC 55%, #F1F5F9 100%)',
}

/** 프리뷰 이탈 경고 — 로그인하지 않고 나가면 편집 내용이 사라진다고 알리고 로그인을 유도한다 */
function LeaveGuardModal({ open, onLogin, onLeave, onStay }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" onClick={onStay}>
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-guard-modal-title"
        className="relative z-[1] mx-4 w-full max-w-sm rounded-2xl border border-gray-100 bg-white px-6 py-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="leave-guard-modal-title"
          className="mb-1.5 text-center text-base font-semibold text-gray-900"
        >
          지금 나가면 작업한 내용이 사라져요
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          로그인하면 편집한 체크리스트가 안전하게 저장돼요
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 py-2.5 text-sm font-semibold text-white transition-colors hover:from-cyan-400 hover:to-teal-500"
            onClick={onLogin}
          >
            로그인하고 저장하기
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            onClick={onStay}
          >
            계속 편집하기
          </button>
          <button
            type="button"
            className="w-full py-1 text-center text-xs font-medium text-gray-400 transition-colors hover:text-gray-600"
            onClick={onLeave}
          >
            저장하지 않고 나가기
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GuestGuideArchivePreviewPage() {
  const navigate = useNavigate()
  const [loginGateOpen, setLoginGateOpen] = useState(false)
  const [leaveGuardOpen, setLeaveGuardOpen] = useState(false)
  const allowLeaveRef = useRef(false)
  const openedTrackedRef = useRef(false)

  const pending = loadPendingGuestSearch()
  const plan = loadActiveTripPlan()
  const hasPending = Boolean(pending?.selectedItems?.length)

  /**
   * 이탈 가드 — BrowserRouter라 useBlocker를 못 쓰므로 센티널 history 엔트리로 우회.
   * 마운트 시 같은 URL을 한 번 push해 두고, 브라우저 뒤로가기(popstate)가 오면
   * 다시 push해 페이지에 머물게 한 뒤 경고 모달을 띄운다.
   * 새로고침·탭 닫기는 beforeunload로 브라우저 기본 경고만 가능(문구 커스텀 불가).
   */
  useEffect(() => {
    if (!hasPending) return undefined
    // StrictMode 이중 실행·재방문에도 진입 이벤트는 마운트당 1회만
    if (!openedTrackedRef.current) {
      openedTrackedRef.current = true
      trackEvent('guest_preview_opened', { item_count: pending?.selectedItems?.length ?? 0 })
    }
    // 센티널 중복 push 방지 — 이미 가드 상태면 건너뛴다 (StrictMode 이중 실행 시 navigate(-2) 오작동 방지)
    if (!window.history.state?.previewLeaveGuard) {
      window.history.pushState({ previewLeaveGuard: true }, '')
    }
    const handlePopState = () => {
      if (allowLeaveRef.current) return
      window.history.pushState({ previewLeaveGuard: true }, '')
      trackEvent('guest_preview_leave_guard_shown', { trigger: 'browser_back' })
      setLeaveGuardOpen(true)
    }
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasPending])

  if (!hasPending) {
    return <Navigate to="/trips/guest/search" replace />
  }

  /** 경고를 확인하고 나가기를 선택 — 센티널까지 두 단계 되돌아간다 */
  const handleLeaveAnyway = () => {
    trackEvent('guest_preview_leave_anyway', {})
    allowLeaveRef.current = true
    setLeaveGuardOpen(false)
    navigate(-2)
  }

  const mockEntry = {
    id: 'preview',
    items: pending.selectedItems,
    via: null,
    pageTitle: plan?.destination?.city ? `${plan.destination.city} 여행` : '여행 준비',
    country: plan?.destination?.country ?? '',
    destination: plan?.destination?.city ?? '',
    tripStartDate: plan?.tripStartDate ?? null,
    tripEndDate: plan?.tripEndDate ?? null,
  }

  const handleItemsChange = (newItems) => {
    const current = loadPendingGuestSearch()
    if (current) savePendingGuestSearch({ ...current, editedItems: newItems })
  }

  const handleLoginRedirect = (source = 'save_gate') => {
    trackEvent('guest_preview_login_redirect', { source })
    setLoginGateOpen(false)
    navigate('/login', { state: { from: { pathname: '/trips/guest/guide-archive/preview' } } })
  }

  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 pt-4 md:px-6 md:pt-8 lg:px-8">
        <button
          type="button"
          onClick={() => {
            trackEvent('guest_preview_leave_guard_shown', { trigger: 'back_button' })
            setLeaveGuardOpen(true)
          }}
          className="flex w-fit items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          돌아가기
        </button>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          선택한 준비물을 미리 확인하고 편집할 수 있어요. <span className="font-semibold">완료</span>를 누르면 로그인 후 저장됩니다.
        </div>
      </div>

      <GuideArchiveChecklistView
        tripId="guest"
        entry={mockEntry}
        isPreview
        onItemsChange={handleItemsChange}
        onSaveIntent={() => {
          const current = loadPendingGuestSearch()
          trackEvent('guest_preview_complete_clicked', {
            item_count: (current?.editedItems ?? current?.selectedItems)?.length ?? 0,
          })
          setLoginGateOpen(true)
        }}
      />

      <LoginGateModal
        open={loginGateOpen}
        onLoginRedirect={() => handleLoginRedirect('save_gate')}
        onClose={() => setLoginGateOpen(false)}
      />

      <LeaveGuardModal
        open={leaveGuardOpen}
        onLogin={() => {
          setLeaveGuardOpen(false)
          handleLoginRedirect('leave_guard')
        }}
        onLeave={handleLeaveAnyway}
        onStay={() => setLeaveGuardOpen(false)}
      />
    </div>
  )
}
