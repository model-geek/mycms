import { db } from "@/db";
import { apiSchemas, schemaFields } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { ApiSchemaList } from "@/features/content-hub/manage-schema/components/api-schema-list";

export default async function ApisPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  const schemas = await db
    .select({
      id: apiSchemas.id,
      name: apiSchemas.name,
      endpoint: apiSchemas.endpoint,
      type: apiSchemas.type,
      fieldCount: sql<number>`cast(count(${schemaFields.id}) as int)`,
    })
    .from(apiSchemas)
    .leftJoin(schemaFields, eq(schemaFields.apiSchemaId, apiSchemas.id))
    .where(eq(apiSchemas.serviceId, serviceId))
    .groupBy(apiSchemas.id)
    .orderBy(asc(apiSchemas.createdAt));

  return (
    <div className="p-6">
      <ApiSchemaList serviceId={serviceId} schemas={schemas} />
    </div>
  );
}
