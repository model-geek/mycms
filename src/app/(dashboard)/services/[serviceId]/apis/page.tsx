import {
  ApiSchemaList,
  type ApiSchemaItem,
} from "@/features/content-hub/manage-schema/components/api-schema-list";

export default async function ApisPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  // TODO: Fetch API schemas from backend (integrated at merge time)
  const schemas: ApiSchemaItem[] = [];

  return (
    <div className="p-6">
      <ApiSchemaList serviceId={serviceId} schemas={schemas} />
    </div>
  );
}
