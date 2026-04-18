import { VIETNAM_STAY_OPTIONS } from '@/mocks/tripNewStep4Data'
import Step4SvgIcon from '@/components/trip/step4/Step4SvgIcon'

export default function NeighborhoodVisitSchedule({
  tripStart,
  tripEnd,
  selectedIds,
  visitByPresetId,
  onPresetVisitChange,
  customStops,
  onCustomVisitChange,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
        <Step4SvgIcon name="calendar" className="w-4 h-4 text-teal-600" />
        동네별 방문 일정
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed">
        선택한 각 동네에 <strong className="text-gray-600">실제로 머무는 날짜</strong>를 적어 주세요. (위 카드의 항공·예약 기준 여행 기간 안에서만 선택 가능)
      </p>

      <div className="space-y-3">
        {selectedIds.map((id) => {
          const opt = VIETNAM_STAY_OPTIONS.find((o) => o.id === id)
          if (!opt) return null
          const v = visitByPresetId[id] || { start: '', end: '' }
          return (
            <div key={id} className="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm">
              <p className="text-xs font-bold text-gray-800 mb-2">
                {opt.city} · {opt.area}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[10px] font-bold text-gray-400">방문 시작일</span>
                  <input
                    type="date"
                    min={tripStart}
                    max={tripEnd}
                    value={v.start}
                    onChange={(e) => onPresetVisitChange(id, { start: e.target.value })}
                    className="mt-1 w-full rounded-lg px-2 py-2 text-xs text-gray-800 border border-gray-200 outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold text-gray-400">방문 종료일</span>
                  <input
                    type="date"
                    min={v.start || tripStart}
                    max={tripEnd}
                    value={v.end}
                    onChange={(e) => onPresetVisitChange(id, { end: e.target.value })}
                    className="mt-1 w-full rounded-lg px-2 py-2 text-xs text-gray-800 border border-gray-200 outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </label>
              </div>
            </div>
          )
        })}

        {customStops.map((c) => (
          <div key={c.id} className="rounded-xl border border-teal-100 bg-teal-50/40 px-3 py-3 shadow-sm">
            <p className="text-xs font-bold text-gray-800 mb-2">직접 추가 · {c.label}</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[10px] font-bold text-gray-400">방문 시작일</span>
                <input
                  type="date"
                  min={tripStart}
                  max={tripEnd}
                  value={c.visitStart}
                  onChange={(e) => onCustomVisitChange(c.id, { visitStart: e.target.value })}
                  className="mt-1 w-full rounded-lg px-2 py-2 text-xs text-gray-800 border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold text-gray-400">방문 종료일</span>
                <input
                  type="date"
                  min={c.visitStart || tripStart}
                  max={tripEnd}
                  value={c.visitEnd}
                  onChange={(e) => onCustomVisitChange(c.id, { visitEnd: e.target.value })}
                  className="mt-1 w-full rounded-lg px-2 py-2 text-xs text-gray-800 border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
