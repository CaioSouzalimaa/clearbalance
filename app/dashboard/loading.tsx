import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-4 border-r border-border bg-surface p-4">
        <Skeleton className="h-8 w-36" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-9 w-64" />
          </div>
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>

        {/* Month selector */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Summary cards */}
        <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-surface p-4 shadow-sm space-y-2"
            >
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </section>

        {/* Top charts: variation + categories */}
        <section className="grid gap-3 sm:gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4 min-h-90 sm:min-h-105">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-52 w-full rounded-lg" />
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4 min-h-90 sm:min-h-105">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Goals progress */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Budget progress */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-72" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>

        {/* Transactions table */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          {/* Table header */}
          <div className="grid grid-cols-4 gap-4 border-b border-border pb-2">
            {["w-20", "w-32", "w-16", "w-20"].map((w, i) => (
              <Skeleton key={i} className={`h-3.5 ${w}`} />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 py-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
