export default function FeatureSpeechBubble({ text, tone = 'light', tail = 'left' }) {
  const toneClass =
    tone === 'teal'
      ? 'border-teal-500/30 bg-gradient-to-r from-teal-300/58 via-cyan-200/52 to-teal-200/56'
      : 'border-slate-300/70 bg-gradient-to-r from-slate-100/76 to-slate-200/74'
  const textClass = tone === 'teal' ? 'text-[#08414f]' : 'text-[#0e3a45]'
  const bubbleLayoutClass = tone === 'teal' ? 'flex items-center' : 'flex items-center md:block'
  const textLayoutClass = tone === 'teal' ? 'w-full text-center' : 'w-full text-center md:text-left'
  const bubblePaddingClass = tone === 'teal' ? 'px-8 md:px-12' : 'px-8 md:px-12 md:pt-7'
  const tailPositionClass = tail === 'right' ? 'right-10' : 'left-10'
  const tailColorStyle =
    tone === 'teal'
      ? {
          background:
            'linear-gradient(90deg, rgba(94,234,212,0.58) 0%, rgba(165,243,252,0.52) 55%, rgba(153,246,228,0.56) 100%)',
        }
      : {
          background: 'linear-gradient(90deg, rgba(241,245,249,0.76) 0%, rgba(226,232,240,0.74) 100%)',
        }

  return (
    <div
      className={`relative h-[76px] w-full max-w-[520px] rounded-2xl border shadow-[0_10px_24px_rgba(5,46,66,0.10)] backdrop-blur-[3px] md:h-[94px] ${toneClass} ${bubbleLayoutClass} ${bubblePaddingClass}`}
    >
      <span
        className={`absolute -bottom-[14px] h-4 w-8 drop-shadow-[0_4px_6px_rgba(5,46,66,0.08)] ${tailPositionClass}`}
        style={{
          ...tailColorStyle,
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
        }}
        aria-hidden
      />
      <p
        className={`text-base font-bold leading-tight md:text-[2rem] ${textClass} ${textLayoutClass}`}
        style={{ fontFamily: "'SeoulNotice', system-ui, sans-serif" }}
      >
        {text}
      </p>
    </div>
  )
}
