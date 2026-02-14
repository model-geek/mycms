import { Skeleton } from "@/shared/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-24" />
      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}
