import { Link } from 'react-router-dom'

export default function TripSearchBackNav({ archiveEntryId }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl items-center px-3 pt-4 md:px-6 md:pt-8 lg:px-8">
      {archiveEntryId ? (
        <Link to="/guide-archives" className="text-sm font-medium text-teal-700 hover:text-teal-900">
          ← 나의 체크리스트로
        </Link>
      ) : (
        <Link to="/" className="text-sm font-medium text-teal-700 hover:text-teal-900">
          ← 내 여행으로
        </Link>
      )}
    </div>
  )
}
