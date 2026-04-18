import { formatTripDateLabel } from '@/mocks/tripNewStep4Data'
import Step4SvgIcon from '@/components/trip/step4/Step4SvgIcon'

export default function FlightSummaryCard({ arrival, tripWindow, tripDatesLoading, tripDatesError }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-gray-100 bg-white p-5 shadow-[0_12px_40px_-12px_rgba(15,118,110,0.15)]">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-teal-50/80"
        aria-hidden
      />
      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-50 shadow-inner">
          <Step4SvgIcon name="airplane" className="h-6 w-6 text-teal-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-teal-600">항공편 기준 입국</p>
          <p className="mt-1 text-xl font-extrabold leading-snug text-gray-900">
            {arrival.country} · {arrival.city}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            도착 공항 <span className="font-semibold text-gray-800">{arrival.iata}</span>
          </p>

          {tripDatesLoading && (
            <div className="mt-5 space-y-2 border-t border-gray-100 pt-5">
              <div className="h-5 w-36 animate-pulse rounded-md bg-gray-100" />
              <div className="h-4 max-w-[280px] animate-pulse rounded-md bg-gray-100" />
            </div>
          )}

          {!tripDatesLoading && tripDatesError && (
            <p className="mt-5 border-t border-gray-100 pt-5 text-sm text-red-600">{tripDatesError}</p>
          )}

          {!tripDatesLoading && !tripDatesError && tripWindow && (
            <div className="mt-5 border-t border-gray-100 pt-5">
              <p className="text-[15px] text-gray-900">
                총 여행{' '}
                <span className="text-xl font-extrabold text-teal-600 tabular-nums">{tripWindow.totalDays}일</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {formatTripDateLabel(tripWindow.tripStart)} ~ {formatTripDateLabel(tripWindow.tripEnd)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
