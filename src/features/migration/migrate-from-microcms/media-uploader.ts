import { uploadToStorage, getPublicUrl } from "@/features/media/storage-client";

import { db } from "@/db";
import { media } from "@/db/schema";

export interface MediaRef {
  id: string;
  url: string;
  fileName: string;
}

export interface MediaUploadResult {
  ref: MediaRef | null;
  error?: string;
}

/**
 * microCMS CDN の画像を Supabase Storage にアップロードし、media テーブルに登録する。
 * 同じ microCMS URL は重複アップロードしない（mediaCache でキャッシュ）。
 */
export async function uploadMicrocmsMedia(
  serviceId: string,
  dbServiceId: string,
  imageUrl: string,
  mediaCache: Map<string, MediaRef>,
): Promise<MediaUploadResult> {
  const cached = mediaCache.get(imageUrl);
  if (cached) return { ref: cached };

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return { ref: null, error: `fetch ${res.status} ${res.statusText}` };

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";

    // URL からファイル名と UUID を取得（重複回避）
    const urlPath = new URL(imageUrl).pathname;
    const segments = urlPath.split("/").filter(Boolean);
    const fileName = segments.pop() ?? "image";
    // microCMS URL: /assets/{projectId}/{assetUuid}/{fileName}
    const assetUuid = segments.pop() ?? crypto.randomUUID();

    const storagePath = `${serviceId}/${assetUuid}-${fileName}`;
    const { pathname } = await uploadToStorage(buffer, storagePath, contentType);
    const publicUrl = getPublicUrl(pathname);

    const [inserted] = await db
      .insert(media)
      .values({
        serviceId: dbServiceId,
        fileName,
        url: publicUrl,
        blobPath: pathname,
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
    return { ref };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ref: null, error: msg };
  }
}
