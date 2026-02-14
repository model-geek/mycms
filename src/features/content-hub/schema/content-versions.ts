import {
  integer,
  jsonb,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { contentHubSchema } from "./api-schemas";
import { contents } from "./contents";

export const contentVersions = contentHubSchema.table("content_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentId: uuid("content_id")
    .notNull()
    .references(() => contents.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull(),
  version: integer("version").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
