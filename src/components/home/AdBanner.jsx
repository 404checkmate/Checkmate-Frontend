import { useEffect, useState } from 'react'

// 카카오 애드핏 유닛 — 사이즈별로 유닛 ID가 다르다.
const PC_AD_UNIT = 'DAN-azP0OdSlBgJvmB5e' // 728x90 (PC)
// TODO: 애드핏 콘솔에서 모바일 유닛(320x100 권장) 등록 후 ID 입력하면 모바일에도 광고 노출.
const MOBILE_AD_UNIT = ''

const MOBILE_QUERY = '(max-width: 767px)'

export default function AdBanner() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  )

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia(MOBILE_QUERY)
    const onChange = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Drive: 백그라운드 행동 타겟팅 (보이는 배너 아님 — 항상 로드)
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

  // 모바일인데 모바일 유닛 미등록 → 728 광고를 띄우면 화면을 넘쳐 레이아웃이 깨지므로 미표시.
  if (isMobile && !MOBILE_AD_UNIT) return null

  const unit = isMobile ? MOBILE_AD_UNIT : PC_AD_UNIT
  const width = isMobile ? '320' : '728'
  const height = isMobile ? '100' : '90'

  return (
    <section className="flex w-full max-w-full justify-center overflow-hidden">
      <ins
        key={unit}
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={unit}
        data-ad-width={width}
        data-ad-height={height}
      />
    </section>
  )
}
