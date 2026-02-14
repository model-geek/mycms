import { put, del } from "@vercel/blob";

export async function uploadToBlob(
  file: File,
  serviceId: string,
): Promise<{ url: string; pathname: string }> {
  const blob = await put(`${serviceId}/${file.name}`, file, {
    access: "public",
  });
  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteFromBlob(url: string): Promise<void> {
  await del(url);
}
