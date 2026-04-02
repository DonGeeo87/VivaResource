"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps): JSX.Element {
  return (
    <div 
      className={`animate-pulse bg-gradient-to-r from-surface-container-high via-surface-container-highest to-surface-container-high bg-[length:200%_100%] rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function BlogHeroSkeleton(): JSX.Element {
  return (
    <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-br from-primary to-primary-container">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <Skeleton className="inline-block px-4 py-1 rounded-full mb-6 w-32 h-6" />
        <Skeleton className="w-80 h-14 mb-8" />
        <Skeleton className="w-96 h-6" />
      </div>
    </section>
  );
}

export function BlogFeaturedSkeleton(): JSX.Element {
  return (
    <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 mb-24">
      <div className="bg-white rounded-xl shadow-ambient-lg overflow-hidden flex flex-col lg:flex-row">
        <div className="lg:w-3/5 h-[400px] lg:h-auto">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center">
          <Skeleton className="w-8 h-8 mb-6" />
          <Skeleton className="w-full h-10 mb-4" />
          <Skeleton className="w-3/4 h-10 mb-6" />
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-2/3 h-4 mb-8" />
          <Skeleton className="w-40 h-12 rounded-full" />
        </div>
      </div>
    </section>
  );
}

export function BlogCardSkeleton(): JSX.Element {
  return (
    <article className="group">
      <div className="aspect-[4/3] mb-6 overflow-hidden rounded-xl">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="px-2">
        <Skeleton className="w-24 h-3 mb-3" />
        <Skeleton className="w-full h-6 mb-4" />
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-3/4 h-4 mb-6" />
        <Skeleton className="w-20 h-4" />
      </div>
    </article>
  );
}

export function BlogGridSkeleton(): JSX.Element {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-24">
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-between border-b-4 border-primary/10 pb-8 mb-16">
        <Skeleton className="w-96 h-12" />
        <div className="flex gap-3">
          <Skeleton className="w-20 h-10 rounded-full" />
          <Skeleton className="w-24 h-10 rounded-full" />
          <Skeleton className="w-20 h-10 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function EventsHeroSkeleton(): JSX.Element {
  return (
    <section className="relative h-[500px] min-h-[500px] flex items-center overflow-hidden bg-primary-container">
      <div className="relative z-20 max-w-7xl mx-auto px-8 w-full">
        <div className="max-w-2xl">
          <Skeleton className="inline-block px-4 py-1 rounded-full mb-6 w-40 h-6" />
          <Skeleton className="w-80 h-16 mb-6" />
          <Skeleton className="w-64 h-6 mb-4" />
          <Skeleton className="w-full h-6" />
        </div>
      </div>
    </section>
  );
}

export function EventsFilterSkeleton(): JSX.Element {
  return (
    <section className="py-12 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-wrap gap-4 items-center">
          <Skeleton className="w-28 h-5 mr-4" />
          <Skeleton className="w-16 h-10 rounded-full" />
          <Skeleton className="w-24 h-10 rounded-full" />
          <Skeleton className="w-32 h-10 rounded-full" />
          <Skeleton className="w-32 h-10 rounded-full" />
        </div>
      </div>
    </section>
  );
}

export function EventsGridSkeleton(): JSX.Element {
  return (
    <section className="pb-24 px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 rounded-xl bg-surface-container-lowest editorial-shadow overflow-hidden">
          <div className="md:flex h-full">
            <div className="md:w-1/2 h-64 md:h-auto">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-between">
              <div>
                <Skeleton className="w-40 h-4 mb-4" />
                <Skeleton className="w-full h-8 mb-3" />
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-3/4 h-4 mb-6" />
                <Skeleton className="w-48 h-4 mb-6" />
              </div>
              <Skeleton className="w-full h-12 rounded-full" />
            </div>
          </div>
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="md:col-span-4 rounded-xl bg-surface-container-lowest editorial-shadow p-6">
            <Skeleton className="h-48 rounded-lg mb-6" />
            <Skeleton className="w-24 h-3 mb-2" />
            <Skeleton className="w-full h-6 mb-3" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-2/3 h-4 mb-6" />
            <Skeleton className="w-full h-10 rounded-full" />
          </div>
        ))}
        <div className="md:col-span-8 rounded-xl bg-surface-container-low editorial-shadow border-l-4 border-secondary p-8">
          <Skeleton className="w-48 h-5 mb-4" />
          <Skeleton className="w-full h-8 mb-3" />
          <Skeleton className="w-full h-4 mb-6" />
          <div className="flex gap-6 mb-6">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-24 h-4" />
          </div>
          <Skeleton className="w-full h-12 rounded-full" />
        </div>
      </div>
    </section>
  );
}
