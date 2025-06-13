export function LoadingQuotations() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Search and Filter Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-10 bg-white/5 rounded-md w-full sm:w-64"></div>
        <div className="h-10 bg-white/5 rounded-md w-40"></div>
      </div>

      {/* Quotation Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-white/5 rounded-lg"></div>
        ))}
      </div>
    </div>
  )
}
