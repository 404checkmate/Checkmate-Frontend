/**
 * AiConciergeTip — AI 팁 공용 컴포넌트 (제목: 꿀 Tip!)
 *
 * Props:
 *   description  {string}  팁 설명 (<strong> / <br> 태그만 허용)
 *   className    {string}  추가 클래스
 */

/**
 * description 문자열에서 <strong>과 <br> 만 React 엘리먼트로 변환한다.
 * 그 외 태그는 모두 텍스트로 이스케이프되어 XSS를 방지한다.
 */
function SafeDescription({ text }) {
  if (!text) return null
  const parts = text.split(/(<strong>[\s\S]*?<\/strong>|<br\s*\/?>)/g)
  return (
    <>
      {parts.map((part, i) => {
        const strongMatch = part.match(/^<strong>([\s\S]*?)<\/strong>$/)
        if (strongMatch) return <strong key={i}>{strongMatch[1]}</strong>
        if (/^<br\s*\/?>$/.test(part)) return <br key={i} />
        return part
      })}
    </>
  )
}
export const AI_CONCIERGE_TIP_ICON_SRC = '/ai-concierge-tip-icon.png'

/** AI 팁용 캐리어 일러스트 (데스크톱 카드·모바일 팁 카드 공통) */
export function AiConciergeTipIcon({ className = '' }) {
  return (
    <img
      src={AI_CONCIERGE_TIP_ICON_SRC}
      alt=""
      role="presentation"
      draggable={false}
      className={`object-contain object-center ${className}`}
    />
  )
}

/**
 * 「꿀 Tip!」 데코레이션 라벨
 * @param {'onDark'|'onLight'} variant  onDark: 틸 카드용 / onLight: 흰 카드용
 */
export function AiConciergeTipHeading({ className = '', variant = 'onDark' }) {
  const onLight = variant === 'onLight'
  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      aria-label="꿀 Tip"
    >
      <span
        className={
          onLight
            ? 'rounded-lg bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 px-2 py-0.5 text-[13px] font-black leading-none text-amber-950 shadow-sm shadow-amber-900/15 ring-1 ring-amber-500/30'
            : 'rounded-lg bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 px-2 py-0.5 text-[13px] font-black leading-none text-amber-950 shadow-md shadow-amber-950/25 ring-1 ring-white/20'
        }
      >
        꿀
      </span>
      <span
        className={`text-[15px] font-extrabold tracking-tight ${
          onLight ? 'text-teal-800' : 'text-white drop-shadow-sm'
        }`}
      >
        Tip
        <span className={onLight ? 'text-amber-600' : 'text-amber-200'}>!</span>
      </span>
    </span>
  )
}

export default function AiConciergeTip({ description, className = '' }) {
  return (
    <div className={`flex items-center gap-6 rounded-2xl bg-teal-800 px-8 py-6 ${className}`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-700/60 p-1.5">
        <AiConciergeTipIcon className="h-full w-full max-h-9 max-w-9" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="mb-1">
          <AiConciergeTipHeading variant="onDark" />
        </h4>
        <p className="text-sm leading-relaxed text-teal-200">
          <SafeDescription text={description} />
        </p>
      </div>
    </div>
  )
}
