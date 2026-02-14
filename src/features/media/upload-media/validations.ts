const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
] as const;

export interface FileValidationError {
  field: string;
  message: string;
}

export function validateFile(file: File): FileValidationError | null {
  if (file.size > MAX_FILE_SIZE) {
    return {
      field: "file",
      message: `ファイルサイズが上限（${MAX_FILE_SIZE / 1024 / 1024}MB）を超えています`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      field: "file",
      message: `このファイル形式（${file.type}）はサポートされていません`,
    };
  }

  return null;
}
