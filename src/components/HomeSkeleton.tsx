export function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <div className="min-h-[600px] bg-gradient-to-br from-primary/80 to-primary-container/80 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-3xl space-y-6">
            <div className="h-6 w-48 bg-white/20 rounded-full" />
            <div className="h-16 w-3/4 bg-white/20 rounded-xl" />
            <div className="h-12 w-1/2 bg-white/20 rounded-xl" />
            <div className="h-6 w-full bg-white/10 rounded-lg" />
            <div className="flex gap-4">
              <div className="h-14 w-40 bg-white/20 rounded-full" />
              <div className="h-14 w-40 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Get Help Skeleton */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="h-6 w-32 bg-gray-200 rounded-full" />
            <div className="h-12 w-3/4 bg-gray-200 rounded-xl" />
            <div className="h-6 w-full bg-gray-200 rounded-lg" />
            <div className="h-6 w-5/6 bg-gray-200 rounded-lg" />
            <div className="h-14 w-44 bg-gray-200 rounded-full" />
          </div>
          <div className="h-80 bg-gray-200 rounded-3xl" />
        </div>
      </div>

      {/* Pillars Skeleton */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-48 bg-gray-200 rounded-xl mx-auto mb-12" />
          <div className="grid md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-4 p-6 bg-white rounded-2xl">
                <div className="h-16 w-16 bg-gray-200 rounded-full" />
                <div className="h-6 w-3/4 bg-gray-200 rounded-lg" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
