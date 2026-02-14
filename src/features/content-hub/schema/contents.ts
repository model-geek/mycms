import {
  jsonb,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { services } from "@/infrastructure/services/schema/services";

import { apiSchemas, contentHubSchema } from "./api-schemas";

export const contents = contentHubSchema.table("contents", {
  id: uuid("id").primaryKey().defaultRandom(),
  apiSchemaId: uuid("api_schema_id")
    .notNull()
    .references(() => apiSchemas.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  data: jsonb("data"),
  draftData: jsonb("draft_data"),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  revisedAt: timestamp("revised_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
