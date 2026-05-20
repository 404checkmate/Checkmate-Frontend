export default function GuideArchiveBottomBar({ isSaving, tempSaved, navBarVisible, onTempSave, onComplete }) {
  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-40 bg-transparent px-5 py-3 lg:bottom-0 transition-[bottom] duration-300 ease-out [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]"
      style={!navBarVisible ? { bottom: 0 } : undefined}
    >
      <div className="mx-auto flex max-w-3xl gap-3">
        <button
          type="button"
          onClick={onTempSave}
          disabled={isSaving}
          className="min-w-0 flex-1 basis-0 rounded-2xl border-2 border-gray-100 bg-white px-4 py-3.5 text-sm font-bold text-gray-800 shadow-sm transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
        >
          {isSaving ? '저장 중…' : tempSaved ? '저장됨 ✓' : '임시 저장'}
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={isSaving}
          className="min-w-0 flex-1 basis-0 rounded-2xl bg-amber-400 px-4 py-3.5 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          완료
        </button>
      </div>
    </div>
  )
}
