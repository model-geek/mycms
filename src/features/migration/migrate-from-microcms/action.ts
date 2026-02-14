"use server";

import { db } from "@/db";
import {
  services,
  members,
  apiSchemas,
  schemaFields,
  contents,
  contentVersions,
} from "@/db/schema";
import { requireAuth } from "@/shared/lib/auth-guard";
import type { ActionResult } from "@/shared/types";

import { transformContentData } from "./content-transformer";
import { buildCrewMap, mapMicrocmsField } from "./field-mapper";
import type { MediaRef } from "./media-uploader";
import type {
  ContentBatchParams,
  ContentBatchResult,
  MicrocmsApiResponse,
  MigrationPreview,
  PreviewSchema,
  SchemaMigrationResult,
} from "./types";
import { migrationCredentialsSchema } from "./validations";

export async function fetchMicrocmsSchemas(
  input: unknown,
): Promise<ActionResult<MigrationPreview>> {
  try {
    await requireAuth();
    const parsed = migrationCredentialsSchema.parse(input);

    const schemas: PreviewSchema[] = [];

    for (const endpoint of parsed.endpoints) {
      const url = `https://${parsed.serviceId}.microcms-management.io/api/v1/apis/${endpoint}`;
      const res = await fetch(url, {
        headers: { "X-MICROCMS-API-KEY": parsed.apiKey },
      });

      if (res.status === 401) {
        return {
          success: false,
          error: "APIキーが無効です。microCMS の管理画面で正しいキーを確認してください。",
        };
      }

      if (!res.ok) {
        schemas.push({
          endpoint,
          name: endpoint,
          type: "list",
          fields: [],
          error:
            res.status === 404
              ? `エンドポイント「${endpoint}」が見つかりません`
              : `取得に失敗しました (HTTP ${res.status})`,
        });
        continue;
      }

      const data = (await res.json()) as MicrocmsApiResponse;
      const crewMap = buildCrewMap(data.customFields ?? []);
      const fields = (data.apiFields ?? []).map((f) =>
        mapMicrocmsField(f, crewMap),
      );

      let contentCount: number | undefined;
      if (parsed.includeContent) {
        contentCount = await fetchContentCount(
          parsed.serviceId,
          parsed.apiKey,
          endpoint,
        );
      }

      schemas.push({
        endpoint,
        name: endpoint,
        type: "list",
        fields,
        contentCount,
      });
    }

    return {
      success: true,
      data: {
        serviceName: parsed.serviceName,
        serviceSlug: parsed.serviceSlug,
        schemas,
        includeContent: parsed.includeContent,
        microcmsServiceId: parsed.includeContent
          ? parsed.serviceId
          : undefined,
        microcmsApiKey: parsed.includeContent ? parsed.apiKey : undefined,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "microCMS スキーマの取得に失敗しました",
    };
  }
}

async function fetchContentCount(
  serviceId: string,
  apiKey: string,
  endpoint: string,
): Promise<number> {
  try {
    const url = `https://${serviceId}.microcms.io/api/v1/${endpoint}?limit=0`;
    const res = await fetch(url, {
      headers: { "X-MICROCMS-API-KEY": apiKey },
    });
    if (!res.ok) return 0;
    const data = (await res.json()) as { totalCount?: number };
    return data.totalCount ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Phase 1: スキーマ移行（サービス・API・フィールド作成）
 */
export async function executeMigrationSchemas(
  preview: MigrationPreview,
): Promise<ActionResult<SchemaMigrationResult>> {
  try {
    const session = await requireAuth();

    const validSchemas = preview.schemas.filter((s) => !s.error);
    if (validSchemas.length === 0) {
      return {
        success: false,
        error: "移行可能なスキーマがありません",
      };
    }

    const result = await db.transaction(async (tx) => {
      const [service] = await tx
        .insert(services)
        .values({
          name: preview.serviceName,
          slug: preview.serviceSlug,
          ownerId: session.user.id,
        })
        .returning();

      await tx.insert(members).values({
        serviceId: service.id,
        userId: session.user.id,
        role: "owner",
      });

      const schemaList: SchemaMigrationResult["schemas"] = [];

      for (const schema of validSchemas) {
        const [apiSchema] = await tx
          .insert(apiSchemas)
          .values({
            serviceId: service.id,
            name: schema.name,
            endpoint: schema.endpoint,
            type: schema.type,
          })
          .returning();

        const mappableFields = schema.fields.filter(
          (f) => f.mycmsKind !== null,
        );

        if (mappableFields.length > 0) {
          await tx.insert(schemaFields).values(
            mappableFields.map((field, index) => ({
              apiSchemaId: apiSchema.id,
              name: field.name,
              fieldId: field.fieldId,
              kind: field.mycmsKind!,
              description: field.description,
              required: field.required,
              position: index,
              validationRules: field.validationRules,
            })),
          );
        }

        schemaList.push({
          endpoint: schema.endpoint,
          schemaId: apiSchema.id,
          fields: schema.fields,
          contentCount: schema.contentCount ?? 0,
        });
      }

      return { serviceId: service.id, schemas: schemaList };
    });

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("unique")) {
        return {
          success: false,
          error: "同じスラッグのサービスが既に存在します",
        };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: "スキーマ移行に失敗しました" };
  }
}

/**
 * Phase 2: コンテンツバッチ移行（offset/limit 単位で呼び出し）
 */
export async function migrateContentBatch(
  params: ContentBatchParams,
): Promise<ActionResult<ContentBatchResult>> {
  try {
    await requireAuth();

    const url = `https://${params.microcmsServiceId}.microcms.io/api/v1/${params.endpoint}?limit=${params.limit}&offset=${params.offset}`;
    const res = await fetch(url, {
      headers: { "X-MICROCMS-API-KEY": params.microcmsApiKey },
    });

    if (!res.ok) {
      return {
        success: false,
        error: `Content API エラー (HTTP ${res.status})`,
      };
    }

    const data = (await res.json()) as {
      contents?: unknown[];
      totalCount?: number;
    };
    const items = data.contents ?? [];
    const totalCount = data.totalCount ?? 0;

    const mediaCache = new Map<string, MediaRef>();
    const errors: string[] = [];
    let migrated = 0;

    for (const rawContent of items) {
      const raw = rawContent as Record<string, unknown>;

      const transformedData = await transformContentData(
        params.microcmsServiceId,
        params.dbServiceId,
        params.fields,
        raw,
        mediaCache,
        errors,
      );

      const [inserted] = await db
        .insert(contents)
        .values({
          apiSchemaId: params.schemaId,
          serviceId: params.dbServiceId,
          data: transformedData,
          status: "published",
          publishedAt: new Date(),
        })
        .returning({ id: contents.id });

      await db.insert(contentVersions).values({
        contentId: inserted.id,
        data: transformedData,
        version: 1,
      });

      migrated++;
    }

    const debugParts: string[] = [];
    if (errors.length > 0) {
      debugParts.push(...errors.slice(0, 5));
    }

    return {
      success: true,
      data: {
        migrated,
        mediaCount: mediaCache.size,
        totalCount,
        debugInfo: debugParts.length > 0 ? debugParts.join("\n") : undefined,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "コンテンツ移行バッチに失敗しました" };
  }
}
