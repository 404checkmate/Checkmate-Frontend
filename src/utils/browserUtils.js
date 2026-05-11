export const isInAppBrowser = () => {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /NAVER|KAKAOTALK|Instagram|FB_IAB|FBAN|FBIOS|Line|Twitter|Snapchat/i.test(ua)
}

export const isIOS = () =>
  typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)

export const isAndroid = () =>
  typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)

export const openInExternalBrowser = () => {
  const url = window.location.href

  if (isAndroid()) {
    window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;package=com.android.chrome;end`
    return
  }

  if (isIOS()) {
    navigator.clipboard?.writeText(url).then(() => {
      alert('주소가 복사되었어요. Safari에서 붙여넣기 해주세요!')
    }).catch(() => {})
  }
}
