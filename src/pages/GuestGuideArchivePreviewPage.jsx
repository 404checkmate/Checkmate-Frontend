import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { loadPendingGuestSearch, savePendingGuestSearch } from '@/utils/pendingGuestSearch'
import { loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import GuideArchiveChecklistView from '@/components/guide/GuideArchiveChecklistView'
import LoginGateModal from '@/components/search/LoginGateModal'

const PAGE_BG = {
  background: 'linear-gradient(180deg, #E0F7FA 0%, #F8FAFC 55%, #F1F5F9 100%)',
}

export default function GuestGuideArchivePreviewPage() {
  const navigate = useNavigate()
  const [loginGateOpen, setLoginGateOpen] = useState(false)

  const pending = loadPendingGuestSearch()
  const plan = loadActiveTripPlan()

  if (!pending?.selectedItems?.length) {
    return <Navigate to="/trips/guest/search" replace />
  }

  const mockEntry = {
    id: 'preview',
    items: pending.selectedItems,
    via: null,
    pageTitle: plan?.destination?.city ? `${plan.destination.city} 여행` : '여행 준비',
    destination: plan?.destination ?? null,
    tripStart: plan?.tripStartDate ?? null,
    tripEnd: plan?.tripEndDate ?? null,
  }

  const handleItemsChange = (newItems) => {
    const current = loadPendingGuestSearch()
    if (current) savePendingGuestSearch({ ...current, editedItems: newItems })
  }

  const handleLoginRedirect = () => {
    setLoginGateOpen(false)
    navigate('/login', { state: { from: { pathname: '/trips/guest/guide-archive/preview' } } })
  }

  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 pt-4 md:px-6 md:pt-8 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
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
        onSaveIntent={() => setLoginGateOpen(true)}
      />

      <LoginGateModal
        open={loginGateOpen}
        onLoginRedirect={handleLoginRedirect}
        onClose={() => setLoginGateOpen(false)}
      />
    </div>
  )
}
