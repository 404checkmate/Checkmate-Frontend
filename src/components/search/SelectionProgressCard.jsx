import GuideArchiveProgressBar from '@/components/guide/GuideArchiveProgressBar'

export default function SelectionProgressCard({ mergeToArchive, selectedCount, totalCount, progressPercent }) {
  return (
    <div className="mb-6 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
        <span>
          {mergeToArchive ? '추가 선택' : '선택한 항목'}{' '}
          <span className="tabular-nums text-slate-800">{selectedCount}</span>
          {' / '}
          <span className="tabular-nums text-slate-800">{totalCount}</span>
        </span>
        <span className="tabular-nums text-slate-800">{progressPercent}%</span>
      </div>
      <GuideArchiveProgressBar value={progressPercent} />
    </div>
  )
}
