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

  // Google AdSense 스크립트 로드
  useEffect(() => {
    if (document.querySelector('script[data-adsense]')) return
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9327920427200310'
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-adsense', '1')
    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [])

  // AdSense 광고 초기화
  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // ignore
    }
  }, [])

  return (
    <section className="w-full">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9327920427200310"
        data-ad-slot="4156320707"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </section>
  )
}
