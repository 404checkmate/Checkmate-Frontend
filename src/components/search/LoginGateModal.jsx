export default function LoginGateModal({ open, onLoginRedirect, onClose }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-gate-modal-title"
        className="relative z-[1] mx-4 w-full max-w-sm rounded-2xl border border-gray-100 bg-white px-6 py-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="login-gate-modal-title"
          className="mb-1.5 text-center text-base font-semibold text-gray-900"
        >
          로그인이 필요한 서비스입니다
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          로그인 후 체크리스트를 저장할 수 있어요
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 py-2.5 text-sm font-semibold text-white transition-colors hover:from-cyan-400 hover:to-teal-500"
            onClick={onLoginRedirect}
          >
            로그인 또는 회원가입 하러가기
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}
