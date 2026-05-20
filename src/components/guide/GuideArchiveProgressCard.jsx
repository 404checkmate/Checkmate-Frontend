import GuideArchiveProgressBar from '@/components/guide/GuideArchiveProgressBar'

export default function GuideArchiveProgressCard({ checkedCount, total, progress }) {
  return (
    <div className="mb-6 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
        <span>
          준비 진행도{' '}
          <span className="tabular-nums text-slate-800">{checkedCount} / {total}</span>
        </span>
        <span className="tabular-nums text-slate-800">{progress}%</span>
      </div>
      <GuideArchiveProgressBar value={progress} />
    </div>
  )
}
