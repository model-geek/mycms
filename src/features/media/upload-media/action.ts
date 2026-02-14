"use server";

import { db } from "@/db";
import { media } from "@/db/schema";
import type { ActionResult } from "@/shared/types";

import { uploadToBlob } from "../blob-client";
import type { Media } from "../model";

import { validateFile } from "./validations";

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

    const { url, pathname } = await uploadToBlob(file, serviceId);

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
