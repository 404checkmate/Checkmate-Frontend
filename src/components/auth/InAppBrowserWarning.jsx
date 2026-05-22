import { isInAppBrowser, isIOS, isAndroid, openInExternalBrowser } from '@/utils/browserUtils'

export default function InAppBrowserWarning() {
  if (!isInAppBrowser()) return null

  return (
    <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
      <p className="font-semibold mb-2">
        ⚠️ 원활한 이용을 위해 기본 브라우저에서 열어주세요.
      </p>

      {isAndroid() ? (
        <button
          onClick={openInExternalBrowser}
          className="w-full rounded-lg bg-yellow-400 py-2 text-sm font-semibold text-white"
        >
          Chrome으로 열기
        </button>
      ) : isIOS() ? (
        <div className="space-y-2">
          <p className="text-yellow-700 text-xs">
            하단 공유 버튼(<span className="font-bold">⎋</span>) →{' '}
            <strong>Safari로 열기</strong> 를 탭해주세요.
          </p>
          <button
            onClick={openInExternalBrowser}
            className="w-full rounded-lg border border-yellow-400 py-2 text-sm font-semibold text-yellow-800"
          >
            주소 복사하기
          </button>
        </div>
      ) : (
        <p className="text-yellow-700 text-xs">Chrome 또는 Safari에서 접속해주세요.</p>
      )}
    </div>
  )
}
