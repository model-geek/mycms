import { getApiSchemasSummary } from "@/features/content-hub/manage-schema/query";
import { ApiSchemaList } from "@/features/content-hub/manage-schema/components/api-schema-list";

export default async function ApisPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const schemas = await getApiSchemasSummary(serviceId);

  return (
    <div className="p-6">
      <ApiSchemaList serviceId={serviceId} schemas={schemas} />
    </div>
  );
}
