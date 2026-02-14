import type { ApiSchema, SchemaField } from "../model";

/** スキーマとフィールドを含む型 */
export interface ApiSchemaWithFields extends ApiSchema {
  fields: SchemaField[];
}
