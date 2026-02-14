import {
  boolean,
  integer,
  jsonb,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { contentHubSchema } from "./api-schemas";
import { apiSchemas } from "./api-schemas";

export const schemaFields = contentHubSchema.table(
  "schema_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    apiSchemaId: uuid("api_schema_id")
      .notNull()
      .references(() => apiSchemas.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    fieldId: text("field_id").notNull(),
    kind: text("kind").notNull(),
    description: text("description"),
    required: boolean("required").default(false),
    position: integer("position").notNull(),
    validationRules: jsonb("validation_rules"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.apiSchemaId, t.fieldId)],
);
