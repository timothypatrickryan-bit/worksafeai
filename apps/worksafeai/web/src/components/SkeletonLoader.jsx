// Modern skeleton loaders with glassmorphic design

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-white/10 rounded-lg w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-white/10 rounded-lg w-full"></div>
          <div className="h-3 bg-white/10 rounded-lg w-5/6"></div>
          <div className="h-3 bg-white/10 rounded-lg w-4/6"></div>
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-white/10 rounded-lg w-32"></div>
            <div className="h-8 bg-white/10 rounded-lg w-20"></div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-white/10 rounded-lg w-2/3"></div>
              <div className="h-3 bg-white/10 rounded-lg w-1/2"></div>
            </div>
            <div className="h-6 bg-white/10 rounded-lg w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="card animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-4 bg-white/10 rounded-lg w-24"></div>
        <div className="h-10 bg-white/10 rounded-xl"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-white/10 rounded-lg w-32"></div>
        <div className="h-24 bg-white/10 rounded-xl"></div>
      </div>
      <div className="flex gap-4">
        <div className="h-10 bg-white/10 rounded-lg w-24 flex-1"></div>
        <div className="h-10 bg-white/10 rounded-lg w-20"></div>
      </div>
    </div>
  );
}

// Loading spinner
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

// Full page skeleton
export function PageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-10 bg-white/10 rounded-lg w-1/2"></div>
        <div className="h-4 bg-white/10 rounded-lg w-1/3"></div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Action cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card animate-pulse h-32"></div>
        <div className="card animate-pulse h-32"></div>
      </div>
    </div>
  );
}
