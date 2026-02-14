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
  MicrocmsApiResponse,
  MigrationPreview,
  MigrationResult,
  PreviewSchema,
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

export async function executeMigration(
  preview: MigrationPreview,
): Promise<ActionResult<MigrationResult>> {
  try {
    const session = await requireAuth();

    const validSchemas = preview.schemas.filter((s) => !s.error);
    if (validSchemas.length === 0) {
      return {
        success: false,
        error: "移行可能なスキーマがありません",
      };
    }

    // 1. スキーマ移行（トランザクション内）
    const schemaResult = await db.transaction(async (tx) => {
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

      const schemaMap: Map<string, { schemaId: string; fields: typeof validSchemas[0]["fields"] }> = new Map();

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

        schemaMap.set(schema.endpoint, {
          schemaId: apiSchema.id,
          fields: schema.fields,
        });
      }

      return { serviceId: service.id, schemaMap };
    });

    // 2. コンテンツ移行（トランザクション外 - メディアアップロードはロールバック不可）
    let contentCount = 0;
    const mediaCache = new Map<string, MediaRef>();
    const debugLogs: string[] = [];

    if (
      preview.includeContent &&
      preview.microcmsServiceId &&
      preview.microcmsApiKey
    ) {
      for (const schema of validSchemas) {
        const schemaInfo = schemaResult.schemaMap.get(schema.endpoint);
        if (!schemaInfo) continue;

        const allContents = await fetchAllContents(
          preview.microcmsServiceId,
          preview.microcmsApiKey,
          schema.endpoint,
        );

        debugLogs.push(`fields: ${schemaInfo.fields.map(f => `${f.fieldId}(mycmsKind=${f.mycmsKind})`).join(', ')}`);

        for (const rawContent of allContents) {
          const raw = rawContent as Record<string, unknown>;
          if (contentCount === 0) {
            debugLogs.push(`1st content keys: ${Object.keys(raw).join(', ')}`);
            const imageVal = raw.image;
            debugLogs.push(`1st image value: ${JSON.stringify(imageVal)?.slice(0, 200)}`);
          }

          const transformedData = await transformContentData(
            preview.microcmsServiceId,
            schemaResult.serviceId,
            schemaInfo.fields,
            raw,
            mediaCache,
          );

          if (contentCount === 0) {
            const transformedImage = transformedData.image;
            debugLogs.push(`1st transformed image: ${JSON.stringify(transformedImage)?.slice(0, 200)}`);
          }

          const [inserted] = await db
            .insert(contents)
            .values({
              apiSchemaId: schemaInfo.schemaId,
              serviceId: schemaResult.serviceId,
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

          contentCount++;
        }
      }
    }

    return {
      success: true,
      data: {
        serviceId: schemaResult.serviceId,
        contentCount,
        mediaCount: mediaCache.size,
        debugInfo: debugLogs.join('\n'),
      },
    };
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
    return { success: false, error: "移行の実行に失敗しました" };
  }
}

async function fetchAllContents(
  serviceId: string,
  apiKey: string,
  endpoint: string,
): Promise<unknown[]> {
  const allContents: unknown[] = [];
  const limit = 100;
  let offset = 0;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const url = `https://${serviceId}.microcms.io/api/v1/${endpoint}?limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { "X-MICROCMS-API-KEY": apiKey },
    });

    if (!res.ok) break;

    const data = (await res.json()) as {
      contents?: unknown[];
      totalCount?: number;
    };
    const items = data.contents ?? [];
    allContents.push(...items);

    if (allContents.length >= (data.totalCount ?? 0)) break;
    offset += limit;
  }

  return allContents;
}
