import type { Content } from "../model";

import type { SerializedContent } from "./model";

const SYSTEM_FIELDS = ["id", "createdAt", "updatedAt", "publishedAt", "revisedAt"];

export function serializeContent(
  content: Content,
  fields?: string[],
): SerializedContent {
  const data = (content.data ?? {}) as Record<string, unknown>;

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
): SerializedContent {
  const data = (content.draftData ?? content.data ?? {}) as Record<string, unknown>;

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
