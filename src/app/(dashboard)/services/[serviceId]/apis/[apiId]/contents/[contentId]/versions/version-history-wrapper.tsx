"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { fetchVersionDetail } from "@/features/content-hub/content-versions/action";
import { VersionDiff } from "@/features/content-hub/content-versions/components/version-diff";
import { VersionList } from "@/features/content-hub/content-versions/components/version-list";
import type { VersionDetail, VersionListItem } from "@/features/content-hub/content-versions/model";

interface VersionHistoryWrapperProps {
  contentId: string;
  versions: VersionListItem[];
}

export function VersionHistoryWrapper({
  contentId,
  versions,
}: VersionHistoryWrapperProps) {
  const [selectedVersion, setSelectedVersion] = useState<VersionDetail | null>(null);
  const [, startTransition] = useTransition();

  function handleVersionSelect(versionId: string) {
    startTransition(async () => {
      const result = await fetchVersionDetail(versionId);
      if (result.success) {
        setSelectedVersion(result.data);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <VersionList
        contentId={contentId}
        versions={versions}
        onVersionSelect={handleVersionSelect}
        selectedVersionId={selectedVersion?.id}
      />
      <VersionDiff version={selectedVersion} />
    </div>
  );
}
