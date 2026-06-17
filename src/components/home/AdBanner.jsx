import { useEffect } from 'react'

export default function AdBanner() {
  useEffect(() => {
    if (document.querySelector('script[data-tp-drive]')) return

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://tpembars.com/NTQwNjcx.js?t=540671'
    script.setAttribute('data-tp-drive', '1')
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const isDev = import.meta.env.DEV

  return (
    <section className="w-full min-h-[120px] lg:min-h-[160px]">
      {isDev && (
        <div className="flex h-[120px] w-full items-center justify-center rounded-2xl bg-[#d9d9d9] lg:h-[160px]">
          <span className="text-xl font-bold text-[#9ca3af]">배너 광고</span>
        </div>
      )}
    </section>
  )
}
