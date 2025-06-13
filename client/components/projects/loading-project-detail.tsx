export function LoadingQuotationDetail() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-white/5 rounded-full"></div>
          <div>
            <div className="h-8 bg-white/5 rounded-md w-40 mb-2"></div>
            <div className="h-4 bg-white/5 rounded-md w-60"></div>
          </div>
        </div>
        <div className="flex space-x-3">
          <div className="h-10 bg-white/5 rounded-md w-32"></div>
          <div className="h-10 bg-white/5 rounded-md w-24"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-96 bg-white/5 rounded-lg"></div>
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-white/5 rounded-lg"></div>
          <div className="h-48 bg-white/5 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
