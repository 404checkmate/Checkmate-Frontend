import { useEffect } from 'react'

export default function AdBanner() {
  // Drive: 백그라운드 행동 타겟팅
  useEffect(() => {
    if (document.querySelector('script[data-tp-drive]')) return
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://tpembars.com/NTQwNjcx.js?t=540671'
    script.setAttribute('data-tp-drive', '1')
    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [])

  // 카카오 애드핏 스크립트 로드
  useEffect(() => {
    if (document.querySelector('script[data-kakao-adfit]')) return
    const script = document.createElement('script')
    script.async = true
    script.src = '//t1.kakaocdn.net/kas/static/ba.min.js'
    script.setAttribute('data-kakao-adfit', '1')
    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [])

  return (
    <section className="flex w-full justify-center">
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit="DAN-azP0OdSlBgJvmB5e"
        data-ad-width="728"
        data-ad-height="90"
      />
    </section>
  )
}
