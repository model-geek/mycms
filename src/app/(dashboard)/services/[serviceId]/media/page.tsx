import type { Media } from "@/features/media/model";

import { MediaPageWrapper } from "./media-page-wrapper";

export default async function MediaPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  // TODO: Fetch media from backend (integrated at merge time)
  const mediaItems: Media[] = [];

  return (
    <div className="p-6">
      <MediaPageWrapper serviceId={serviceId} initialMedia={mediaItems} />
    </div>
  );
}
