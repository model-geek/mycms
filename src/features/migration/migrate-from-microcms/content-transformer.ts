import type { MediaRef, MediaUploadResult } from "./media-uploader";
import { uploadMicrocmsMedia } from "./media-uploader";
import type { PreviewField } from "./types";

/**
 * microCMS Content API のデータを mycms の data 形式に変換する。
 * errors 配列にメディアアップロード等のエラーが蓄積される。
 */
export async function transformContentData(
  serviceId: string,
  dbServiceId: string,
  fields: PreviewField[],
  rawData: Record<string, unknown>,
  mediaCache: Map<string, MediaRef>,
  errors: string[],
): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {};

  for (const field of fields) {
    if (field.mycmsKind === null) continue;

    const value = rawData[field.fieldId];
    if (value === undefined) continue;

    result[field.fieldId] = await transformField(
      serviceId,
      dbServiceId,
      field,
      value,
      mediaCache,
      errors,
    );
  }

  return result;
}

async function transformField(
  serviceId: string,
  dbServiceId: string,
  field: PreviewField,
  value: unknown,
  mediaCache: Map<string, MediaRef>,
  errors: string[],
): Promise<unknown> {
  switch (field.mycmsKind) {
    case "text":
    case "textArea":
    case "richEditor":
    case "number":
    case "boolean":
    case "date":
      return value;

    case "select":
      return transformSelect(field, value);

    case "media":
      return transformMedia(serviceId, dbServiceId, value, mediaCache, errors);

    case "mediaList":
      return transformMediaList(serviceId, dbServiceId, value, mediaCache, errors);

    case "repeater":
      return transformRepeater(serviceId, dbServiceId, field, value, mediaCache, errors);

    case "relation":
    case "relationList":
      return field.mycmsKind === "relation" ? null : [];

    default:
      return value;
  }
}

function transformSelect(field: PreviewField, value: unknown): unknown {
  const isMultiple =
    (field.validationRules as { multipleSelect?: boolean } | null)
      ?.multipleSelect === true;

  if (Array.isArray(value)) {
    return isMultiple ? value : (value[0] ?? "");
  }
  return value;
}

async function transformMedia(
  serviceId: string,
  dbServiceId: string,
  value: unknown,
  mediaCache: Map<string, MediaRef>,
  errors: string[],
): Promise<MediaRef | null> {
  if (!value || typeof value !== "object") {
    errors.push(`not object: ${JSON.stringify(value)?.slice(0, 80)}`);
    return null;
  }

  const mediaObj = value as { url?: string };
  if (!mediaObj.url) {
    errors.push(`no url: ${JSON.stringify(value)?.slice(0, 80)}`);
    return null;
  }

  const result: MediaUploadResult = await uploadMicrocmsMedia(serviceId, dbServiceId, mediaObj.url, mediaCache);
  if (result.error) {
    errors.push(`upload: ${result.error} (${mediaObj.url.slice(0, 60)})`);
  }
  return result.ref;
}

async function transformMediaList(
  serviceId: string,
  dbServiceId: string,
  value: unknown,
  mediaCache: Map<string, MediaRef>,
  errors: string[],
): Promise<MediaRef[]> {
  if (!Array.isArray(value)) return [];

  const results: MediaRef[] = [];
  for (const item of value) {
    const ref = await transformMedia(serviceId, dbServiceId, item, mediaCache, errors);
    if (ref) results.push(ref);
  }
  return results;
}

async function transformRepeater(
  serviceId: string,
  dbServiceId: string,
  field: PreviewField,
  value: unknown,
  mediaCache: Map<string, MediaRef>,
  errors: string[],
): Promise<Record<string, unknown>[]> {
  if (!Array.isArray(value)) return [];

  const subFieldDefs =
    (field.validationRules as { subFields?: PreviewField[] } | null)
      ?.subFields ?? [];

  if (subFieldDefs.length === 0) return value as Record<string, unknown>[];

  const results: Record<string, unknown>[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const transformed = await transformContentData(
      serviceId,
      dbServiceId,
      subFieldDefs,
      raw,
      mediaCache,
      errors,
    );
    results.push(transformed);
  }
  return results;
}
