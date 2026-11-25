export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

export function DashboardSkeleton() {
  return (
    <div className="fade-in space-y-6" aria-live="polite" aria-label="Loading weather data">
      <span className="sr-only">Loading live weather data…</span>
      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="panel panel-pad min-h-[300px]">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-8 h-24 w-64" />
          <Skeleton className="mt-5 h-5 w-48" />
          <Skeleton className="mt-10 h-3 w-full" />
        </div>
        <div className="panel panel-pad min-h-[300px]">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mx-auto mt-10 h-32 w-72" />
          <Skeleton className="mx-auto mt-6 h-4 w-48" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="panel panel-pad h-36">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="mt-5 h-3 w-20" />
            <Skeleton className="mt-3 h-6 w-24" />
          </div>
        ))}
      </div>
      <div className="panel panel-pad h-56">
        <Skeleton className="h-4 w-32" />
        <div className="mt-8 flex gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-20 shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel panel-pad h-72"><Skeleton className="h-full w-full rounded-2xl" /></div>
        <div className="panel panel-pad h-72"><Skeleton className="h-full w-full rounded-2xl" /></div>
      </div>
    </div>
  )
}
