/**
 * 가이드 보관함 목록·상세에서 동일한 진행도 막대 색 규칙을 씁니다.
 * (0%: 슬레이트 · 1~99%: 스카이 채움 · 100%: 틸)
 */
export default function GuideArchiveProgressBar({ value }) {
  const v = Number(value)
  const done = v >= 100
  const draft = v <= 0
  const track = done ? 'bg-teal-900/10' : draft ? 'bg-slate-200/90' : 'bg-sky-900/10'
  const fill = done ? 'bg-teal-700' : draft ? 'bg-slate-300' : 'bg-sky-400'

  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full ${track}`}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ${fill}`}
        style={{ width: `${Math.min(100, Math.max(0, v))}%` }}
      />
    </div>
  )
}
