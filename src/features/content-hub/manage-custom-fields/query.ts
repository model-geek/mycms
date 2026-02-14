import { db } from "@/db";
import { customFields } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

import type { CustomField } from "../model";

export async function getCustomFields(
  apiSchemaId: string,
): Promise<CustomField[]> {
  const result = await db
    .select()
    .from(customFields)
    .where(eq(customFields.apiSchemaId, apiSchemaId))
    .orderBy(asc(customFields.createdAt));
  return result as unknown as CustomField[];
}

export async function getCustomField(
  id: string,
): Promise<CustomField | null> {
  const [result] = await db
    .select()
    .from(customFields)
    .where(eq(customFields.id, id));
  return (result as unknown as CustomField) ?? null;
}
