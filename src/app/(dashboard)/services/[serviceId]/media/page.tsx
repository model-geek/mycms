import { listMedia } from "@/features/media/browse-media/query";

import { MediaPageWrapper } from "./media-page-wrapper";

export default async function MediaPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  const result = await listMedia({ serviceId });

  return (
    <div className="p-6">
      <MediaPageWrapper serviceId={serviceId} initialMedia={result.media} />
    </div>
  );
}
