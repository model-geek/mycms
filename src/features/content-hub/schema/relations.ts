import { relations } from "drizzle-orm";

import { services } from "@/infrastructure/services/schema/services";

import { apiSchemas } from "./api-schemas";
import { contentVersions } from "./content-versions";
import { contents } from "./contents";
import { customFields } from "./custom-fields";
import { schemaFields } from "./schema-fields";

export const servicesRelations = relations(services, ({ many }) => ({
  apiSchemas: many(apiSchemas),
  contents: many(contents),
}));

export const apiSchemasRelations = relations(apiSchemas, ({ one, many }) => ({
  service: one(services, {
    fields: [apiSchemas.serviceId],
    references: [services.id],
  }),
  fields: many(schemaFields),
  contents: many(contents),
  customFields: many(customFields),
}));

export const schemaFieldsRelations = relations(schemaFields, ({ one }) => ({
  apiSchema: one(apiSchemas, {
    fields: [schemaFields.apiSchemaId],
    references: [apiSchemas.id],
  }),
}));

export const contentsRelations = relations(contents, ({ one, many }) => ({
  apiSchema: one(apiSchemas, {
    fields: [contents.apiSchemaId],
    references: [apiSchemas.id],
  }),
  service: one(services, {
    fields: [contents.serviceId],
    references: [services.id],
  }),
  versions: many(contentVersions),
}));

export const contentVersionsRelations = relations(contentVersions, ({ one }) => ({
  content: one(contents, {
    fields: [contentVersions.contentId],
    references: [contents.id],
  }),
}));

export const customFieldsRelations = relations(customFields, ({ one }) => ({
  apiSchema: one(apiSchemas, {
    fields: [customFields.apiSchemaId],
    references: [apiSchemas.id],
  }),
}));
