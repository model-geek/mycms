import { getVersionHistory } from "@/features/content-hub/content-versions/query";

import { VersionHistoryWrapper } from "./version-history-wrapper";

export default async function VersionHistoryPage({
  params,
}: {
  params: Promise<{ serviceId: string; apiId: string; contentId: string }>;
}) {
  const { contentId } = await params;
  const versions = await getVersionHistory(contentId);

  return (
    <div className="p-6">
      <VersionHistoryWrapper contentId={contentId} versions={versions} />
    </div>
  );
}
