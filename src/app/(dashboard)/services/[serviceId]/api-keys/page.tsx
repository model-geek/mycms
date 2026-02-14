import { listApiKeys } from "@/features/api-keys/manage-keys/query";

import { ApiKeysPageWrapper } from "./api-keys-page-wrapper";

export default async function ApiKeysPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  const keys = await listApiKeys(serviceId);

  return (
    <div className="p-6">
      <ApiKeysPageWrapper serviceId={serviceId} initialKeys={keys} />
    </div>
  );
}
