import { Skeleton } from "@/components/ui/skeleton";

export function PlayerCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
      <Skeleton className="h-24 w-full" />
      <div className="p-2 space-y-1.5">
        <Skeleton className="h-3 w-3/4 mx-auto" />
        <Skeleton className="h-3 w-1/2 mx-auto" />
        <Skeleton className="h-5 w-16 mx-auto rounded-full" />
      </div>
    </div>
  );
}

export function PlayerCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
      aria-busy="true"
      aria-label="Cargando jugadores..."
    >
      {Array.from({ length: count }).map((_, i) => (
        <PlayerCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LeagueRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2 px-4">
      <Skeleton className="h-5 w-6 shrink-0" />
      <Skeleton className="h-5 flex-1" />
      <Skeleton className="h-5 w-12 shrink-0" />
    </div>
  );
}

export function LeagueTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Cargando clasificación...">
      {Array.from({ length: rows }).map((_, i) => (
        <LeagueRowSkeleton key={i} />
      ))}
    </div>
  );
}
