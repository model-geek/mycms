"use server";

import { randomBytes, createHash } from "crypto";

import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import type { ActionResult } from "@/shared/types";

import type { CreateApiKeyResult } from "../model";

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `mycms_${randomBytes(32).toString("hex")}`;
  const hash = createHash("sha256").update(key).digest("hex");
  const prefix = key.substring(0, 14);
  return { key, hash, prefix };
}

export async function createApiKey(
  serviceId: string,
  name: string,
  permission: string = "read",
): Promise<ActionResult<CreateApiKeyResult>> {
  try {
    if (!name.trim()) {
      return { success: false, error: "キー名を入力してください" };
    }

    const { key, hash, prefix } = generateApiKey();

    const [row] = await db
      .insert(apiKeys)
      .values({
        serviceId,
        name: name.trim(),
        keyHash: hash,
        keyPrefix: prefix,
        permission,
      })
      .returning();

    return {
      success: true,
      data: {
        id: row.id,
        name: row.name,
        key,
        keyPrefix: prefix,
        permission: row.permission,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "APIキーの作成に失敗しました" };
  }
}
