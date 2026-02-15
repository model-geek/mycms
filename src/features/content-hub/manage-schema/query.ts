import { db } from "@/db";
import { apiSchemas, schemaFields } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";

import type { ApiSchema, SchemaField } from "../model";
import type { ApiSchemaWithFields } from "./model";

export async function getApiSchema(
  id: string,
): Promise<ApiSchemaWithFields | null> {
  const [schema] = await db
    .select()
    .from(apiSchemas)
    .where(eq(apiSchemas.id, id));

  if (!schema) return null;

  const fields = await db
    .select()
    .from(schemaFields)
    .where(eq(schemaFields.apiSchemaId, id))
    .orderBy(asc(schemaFields.position));

  return {
    ...(schema as ApiSchema),
    fields: fields as SchemaField[],
  };
}

export async function getApiSchemasByService(
  serviceId: string,
): Promise<ApiSchema[]> {
  const result = await db
    .select()
    .from(apiSchemas)
    .where(eq(apiSchemas.serviceId, serviceId))
    .orderBy(asc(apiSchemas.createdAt));

  return result as ApiSchema[];
}

export async function getApiSchemasSummary(
  serviceId: string,
): Promise<
  Array<{
    id: string;
    name: string;
    endpoint: string;
    type: string;
    fieldCount: number;
  }>
> {
  return db
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
}

export async function getSchemaFields(
  apiSchemaId: string,
): Promise<SchemaField[]> {
  const result = await db
    .select()
    .from(schemaFields)
    .where(eq(schemaFields.apiSchemaId, apiSchemaId))
    .orderBy(asc(schemaFields.position));

  return result as SchemaField[];
}
