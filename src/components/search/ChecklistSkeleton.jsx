export default function ChecklistSkeleton({ count = 6 }) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  )
}
