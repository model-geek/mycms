import { Skeleton } from "@/shared/ui/skeleton";

export default function ApiKeysLoading() {
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
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
