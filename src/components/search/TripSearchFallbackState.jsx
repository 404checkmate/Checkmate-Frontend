export default function TripSearchFallbackState({ errorMessage, onRetry }) {
  return (
    <div className="mt-6 rounded-3xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm">
      <p className="mb-2 text-sm font-semibold text-red-500">체크리스트를 불러오지 못했습니다.</p>
      {errorMessage ? (
        <p className="mb-6 text-xs text-gray-500">{errorMessage}</p>
      ) : null}
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-teal-800"
      >
        다시 시도
      </button>
    </div>
  )
}
