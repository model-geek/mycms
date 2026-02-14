import { Skeleton } from "@/shared/ui/skeleton";

export default function MembersLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
      <div className="rounded-lg border">
        <div className="border-b p-4">
          <Skeleton className="h-5 w-full" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-b p-4 last:border-b-0">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
