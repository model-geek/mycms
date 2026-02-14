import {
  integer,
  pgSchema,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { services } from "@/infrastructure/services/schema/services";

export const mediaSchema = pgSchema("media");

export const media = mediaSchema.table("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  url: text("url").notNull(),
  blobPath: text("blob_path").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
