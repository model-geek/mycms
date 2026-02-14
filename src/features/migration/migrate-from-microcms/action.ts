"use server";

import { db } from "@/db";
import { services, members, apiSchemas, schemaFields } from "@/db/schema";
import { requireAuth } from "@/shared/lib/auth-guard";
import type { ActionResult } from "@/shared/types";

import { mapMicrocmsField } from "./field-mapper";
import type {
  MicrocmsApiResponse,
  MigrationPreview,
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
      const fields = (data.apiFields ?? []).map(mapMicrocmsField);

      schemas.push({
        endpoint,
        name: endpoint,
        type: "list",
        fields,
      });
    }

    return {
      success: true,
      data: {
        serviceName: parsed.serviceName,
        serviceSlug: parsed.serviceSlug,
        schemas,
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

export async function executeMigration(
  preview: MigrationPreview,
): Promise<ActionResult<{ serviceId: string }>> {
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
      // 1. サービス作成
      const [service] = await tx
        .insert(services)
        .values({
          name: preview.serviceName,
          slug: preview.serviceSlug,
          ownerId: session.user.id,
        })
        .returning();

      // 2. オーナーをメンバー登録
      await tx.insert(members).values({
        serviceId: service.id,
        userId: session.user.id,
        role: "owner",
      });

      // 3. API スキーマ + フィールド作成
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
      }

      return { serviceId: service.id };
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
    return { success: false, error: "移行の実行に失敗しました" };
  }
}
