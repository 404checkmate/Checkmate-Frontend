import mascotUrl from '@/assets/trip-progress-mascot.png'

/**
 * 여행 플로우 스텝 진행 바 + 마스코트(채움 끝 지점에 배치, 달리는 느낌)
 *
 * @param {number} percent 0–100 (현재 스텝 / 전체 스텝 × 100)
 * @param {React.CSSProperties} [fillStyle] — 채움에 그라데이션 등이 필요할 때 (지정 시 fillClassName은 테일만 보조)
 */
export default function StepProgressBarMascot({
  percent,
  className = '',
  trackClassName = 'bg-gray-200',
  fillClassName = 'bg-cyan-500',
  fillStyle,
  barHeightClass = 'h-1.5',
  fillTransitionClassName = 'transition-all duration-500 ease-out',
  mascotTransitionClassName = 'transition-[left] duration-500 ease-out',
}) {
  const pct = Math.min(100, Math.max(0, Math.round(Number(percent) || 0)))

  return (
    <div className={`relative min-w-0 flex-1 pt-7 ${className}`}>
      <div className={`relative w-full ${barHeightClass} overflow-visible rounded-full ${trackClassName}`}>
        <div
          className={`${barHeightClass} rounded-full ${fillClassName} ${fillTransitionClassName}`}
          style={{ width: `${pct}%`, ...fillStyle }}
        />
        <img
          src={mascotUrl}
          alt=""
          aria-hidden
          draggable={false}
          className={`pointer-events-none absolute bottom-full left-0 z-10 h-11 w-auto max-w-[3.75rem] -translate-x-1/2 translate-y-1 object-contain drop-shadow-md select-none ${mascotTransitionClassName}`}
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  )
}
