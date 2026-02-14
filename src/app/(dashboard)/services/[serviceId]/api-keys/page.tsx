import type { ApiKeyListItem } from "@/features/api-keys/model";

import { ApiKeysPageWrapper } from "./api-keys-page-wrapper";

export default async function ApiKeysPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  // TODO: Fetch API keys from backend (integrated at merge time)
  const keys: ApiKeyListItem[] = [];

  return (
    <div className="p-6">
      <ApiKeysPageWrapper serviceId={serviceId} initialKeys={keys} />
    </div>
  );
}
