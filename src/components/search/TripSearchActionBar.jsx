export default function TripSearchActionBar({ mergeToArchive, navBarVisible, selectedCount, onLeave, onSave }) {
  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-40 bg-transparent py-3 transition-[bottom] duration-300 ease-out [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))] lg:bottom-0"
      style={!navBarVisible ? { bottom: 0 } : undefined}
    >
      <div className="mx-auto w-full max-w-7xl px-3 md:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl gap-3">
          <button
            type="button"
            onClick={onLeave}
            className="min-w-0 flex-1 basis-0 rounded-2xl border-2 border-gray-100 bg-white px-4 py-3.5 text-sm font-bold text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
          >
            {mergeToArchive ? '뒤로가기' : '홈으로'}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={selectedCount === 0}
            className="min-w-0 flex-1 basis-0 rounded-2xl bg-amber-400 px-4 py-3.5 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
          >
            {mergeToArchive ? '추가' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
