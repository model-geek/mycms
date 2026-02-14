import { jsonb, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { contentHubSchema } from "./api-schemas";
import { apiSchemas } from "./api-schemas";

export const customFields = contentHubSchema.table(
  "custom_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    apiSchemaId: uuid("api_schema_id")
      .notNull()
      .references(() => apiSchemas.id, { onDelete: "cascade" }),
    fieldId: text("field_id").notNull(),
    name: text("name").notNull(),
    fields: jsonb("fields").notNull(),
    position: jsonb("position"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique().on(t.apiSchemaId, t.fieldId)],
);
