import { notFound } from "next/navigation";
import { getApiSchema } from "@/features/content-hub/manage-schema/query";
import { getCustomFields } from "@/features/content-hub/manage-custom-fields/query";

import { CustomFieldList } from "@/features/content-hub/manage-custom-fields/components/custom-field-list";

export default async function CustomFieldsPage({
  params,
}: {
  params: Promise<{ serviceId: string; apiId: string }>;
}) {
  const { apiId } = await params;

  const schema = await getApiSchema(apiId);

  if (!schema) {
    notFound();
  }

  const fields = await getCustomFields(apiId);

  return (
    <div className="p-6">
      <CustomFieldList apiSchemaId={apiId} customFields={fields} />
    </div>
  );
}
