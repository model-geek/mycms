import type { Content, SchemaField } from "../model";

import type { SerializedContent } from "./model";

const SYSTEM_FIELDS = ["id", "createdAt", "updatedAt", "publishedAt", "revisedAt"];

/**
 * スキーマフィールド定義に基づいてフィールド値を正規化する。
 * select → 常に配列、file → {url, fileSize} 形式を保証。
 */
function normalizeFieldValue(value: unknown, kind: string): unknown {
  if (value == null) return value;

  if (kind === "select") {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value !== "") return [value];
    return [];
  }

  return value;
}

function applyFieldTransforms(
  data: Record<string, unknown>,
  schemaFields?: SchemaField[],
): Record<string, unknown> {
  if (!schemaFields || schemaFields.length === 0) return data;

  const fieldKindMap = new Map(schemaFields.map((f) => [f.fieldId, f.kind]));
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const kind = fieldKindMap.get(key);
    result[key] = kind ? normalizeFieldValue(value, kind) : value;
  }

  return result;
}

export function serializeContent(
  content: Content,
  fields?: string[],
  schemaFields?: SchemaField[],
): SerializedContent {
  const rawData = (content.data ?? {}) as Record<string, unknown>;
  const data = applyFieldTransforms(rawData, schemaFields);

  const base: SerializedContent = {
    id: content.id,
    createdAt: content.createdAt.toISOString(),
    updatedAt: content.updatedAt.toISOString(),
    publishedAt: content.publishedAt?.toISOString() ?? null,
    revisedAt: content.revisedAt?.toISOString() ?? null,
  };

  if (fields && fields.length > 0) {
    for (const field of fields) {
      if (!SYSTEM_FIELDS.includes(field) && field in data) {
        base[field] = data[field];
      }
    }
  } else {
    Object.assign(base, data);
  }

  return base;
}

export function serializeContentWithDraft(
  content: Content,
  fields?: string[],
  schemaFields?: SchemaField[],
): SerializedContent {
  const rawData = (content.draftData ?? content.data ?? {}) as Record<string, unknown>;
  const data = applyFieldTransforms(rawData, schemaFields);

  const base: SerializedContent = {
    id: content.id,
    createdAt: content.createdAt.toISOString(),
    updatedAt: content.updatedAt.toISOString(),
    publishedAt: content.publishedAt?.toISOString() ?? null,
    revisedAt: content.revisedAt?.toISOString() ?? null,
  };

  if (fields && fields.length > 0) {
    for (const field of fields) {
      if (!SYSTEM_FIELDS.includes(field) && field in data) {
        base[field] = data[field];
      }
    }
  } else {
    Object.assign(base, data);
  }

  return base;
}
