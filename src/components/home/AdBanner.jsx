import { useEffect, useRef } from 'react'

export default function AdBanner() {
  const hasPushed = useRef(false)

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

  // AdSense 광고 초기화 — ref로 인스턴스 단위 중복 push 방지
  useEffect(() => {
    if (hasPushed.current) return
    hasPushed.current = true
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
