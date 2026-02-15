import { supabaseAdmin } from "@/infrastructure/supabase/client";

const BUCKET = "media";

export async function uploadToStorage(
  file: File | Buffer,
  path: string,
  contentType: string,
): Promise<{ url: string; pathname: string }> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, { contentType, upsert: false });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(data.path);

  return { url: publicUrl, pathname: data.path };
}

export async function deleteFromStorage(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove(paths);
  if (error) throw error;
}

export function getPublicUrl(path: string): string {
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}
