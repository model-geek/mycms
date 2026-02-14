import { put } from "@vercel/blob";

import { db } from "@/db";
import { media } from "@/db/schema";

export interface MediaRef {
  id: string;
  url: string;
  fileName: string;
}

/**
 * microCMS CDN の画像を Vercel Blob にアップロードし、media テーブルに登録する。
 * 同じ microCMS URL は重複アップロードしない（mediaCache でキャッシュ）。
 */
export async function uploadMicrocmsMedia(
  serviceId: string,
  dbServiceId: string,
  imageUrl: string,
  mediaCache: Map<string, MediaRef>,
): Promise<MediaRef | null> {
  const cached = mediaCache.get(imageUrl);
  if (cached) return cached;

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";

    // URL からファイル名を取得
    const urlPath = new URL(imageUrl).pathname;
    const fileName = urlPath.split("/").pop() ?? "image";

    const blobPath = `${serviceId}/${fileName}`;
    const blob = await put(blobPath, buffer, {
      access: "public",
      contentType,
    });

    const [inserted] = await db
      .insert(media)
      .values({
        serviceId: dbServiceId,
        fileName,
        url: blob.url,
        blobPath,
        mimeType: contentType,
        size: buffer.length,
      })
      .returning({ id: media.id, url: media.url, fileName: media.fileName });

    const ref: MediaRef = {
      id: inserted.id,
      url: inserted.url,
      fileName: inserted.fileName,
    };
    mediaCache.set(imageUrl, ref);
    return ref;
  } catch {
    return null;
  }
}
