"use server";

import { db } from "@/db";
import { media } from "@/db/schema";
import type { ActionResult } from "@/shared/types";

import { uploadToStorage } from "../storage-client";
import type { Media } from "../model";

import { validateFile } from "./validations";

/**
 * コンテンツフィールド用の軽量アップロード。media テーブルには挿入しない。
 */
export async function uploadFile(
  formData: FormData,
): Promise<{ url: string } | null> {
  const file = formData.get("file") as File | null;
  if (!file) return null;
  const storagePath = `uploads/${crypto.randomUUID()}-${file.name}`;
  const { url } = await uploadToStorage(file, storagePath, file.type);
  return { url };
}

/**
 * メディアライブラリ用アップロード。ストレージ + media テーブルに保存。
 */
export async function uploadMedia(
  serviceId: string,
  formData: FormData,
): Promise<ActionResult<Media>> {
  try {
    const file = formData.get("file") as File | null;

    if (!file) {
      return { success: false, error: "ファイルが選択されていません" };
    }

    const validationError = validateFile(file);
    if (validationError) {
      return { success: false, error: validationError.message };
    }

    const storagePath = `${serviceId}/${crypto.randomUUID()}-${file.name}`;
    const { url, pathname } = await uploadToStorage(file, storagePath, file.type);

    const [row] = await db
      .insert(media)
      .values({
        serviceId,
        fileName: file.name,
        url,
        blobPath: pathname,
        mimeType: file.type,
        size: file.size,
      })
      .returning();

    return { success: true, data: row as Media };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "メディアのアップロードに失敗しました" };
  }
}
