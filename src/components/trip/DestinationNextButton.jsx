export default function DestinationNextButton({ visible, navBarVisible, submitting, submitError, onClick }) {
  return (
    <div
      className={`fixed left-0 right-0 z-40 px-6 py-3 transition-all duration-300 ${
        navBarVisible ? 'bottom-16' : 'bottom-0'
      } ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      {submitError && (
        <p className="mb-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-center text-xs font-medium text-red-600">
          {submitError}
        </p>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={submitting}
        className="w-full rounded-2xl bg-gradient-to-r from-amber-300 to-amber-400 py-4 text-base font-bold text-[#6a4a00] shadow-md shadow-amber-900/15 transition hover:from-amber-200 hover:to-amber-300 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? '여행 계획 저장 중…' : '다음'}
      </button>
    </div>
  )
}
